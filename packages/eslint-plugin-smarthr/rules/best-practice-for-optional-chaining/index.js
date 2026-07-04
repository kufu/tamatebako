const SCHEMA = []

// IfStatement[alternate=null]: else句がないif文
// :not([parent.type='IfStatement']): else ifではない
// test.type: 条件部分がIdentifierまたはMemberExpression
const SELECTOR = `IfStatement[alternate=null]:not([parent.type='IfStatement'])[test.type=/^(Identifier|MemberExpression)$/]`


/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    schema: SCHEMA,
  },
  create(context) {
    return {
      [SELECTOR]: (node) => {
        // consequentからexpressionを取得
        let expression
        if (node.consequent.type === 'BlockStatement') {
          // if (x) { func() } の形式
          if (node.consequent.body.length !== 1) {
            return // 複数のステートメントがある場合は対象外
          }
          const stmt = node.consequent.body[0]
          if (stmt.type === 'ReturnStatement') {
            return // return文がある場合は対象外
          }
          if (stmt.type !== 'ExpressionStatement') {
            return
          }
          expression = stmt.expression
        } else if (node.consequent.type === 'ExpressionStatement') {
          // if (x) func() の形式
          expression = node.consequent.expression
        } else {
          return
        }

        // ChainExpressionの場合、その中のexpressionを取得
        if (expression.type === 'ChainExpression') {
          expression = expression.expression
        }

        // CallExpressionであることを確認
        if (expression.type !== 'CallExpression') {
          return
        }

        const testText = context.sourceCode.getText(node.test)

        // expressionのテキストを取得
        // node全体から抽出する
        const fullText = context.sourceCode.getText(node)
        // if (test) { expression } または if (test) expression の形式
        // if (test) の後ろから expression を抽出
        let expressionText
        if (node.consequent.type === 'BlockStatement') {
          // if (test) { expression } の形式
          // { と } を除いた中身を取得
          const bodyText = context.sourceCode.getText(node.consequent)
          expressionText = bodyText.slice(1, -1).trim() // { } を削除
        } else {
          // if (test) expression の形式
          expressionText = context.sourceCode.getText(node.consequent)
        }

        // calleeのテキストを取得
        let calleName
        if (expression.callee.type === 'ChainExpression') {
          // optional chainingが含まれている場合
          // ChainExpression全体ではなく、その中のexpressionのテキストを取得する必要はない
          // 代わりに、expressionTextを使ってパターンマッチする
          calleName = null
        } else {
          calleName = context.sourceCode.getText(expression.callee)
        }

        // パターン1: 条件部分と実行部分のcalleeが完全一致
        if (calleName && testText === calleName) {
          context.report({
            node,
            message: `optional chaining(xxx?.yyyy記法)を利用してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-optional-chaining`,
            fix: (fixer) => fixer.replaceText(
              node,
              expressionText.replace(new RegExp(`^${calleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\(`), `${calleName}\?\.(`),
            ),
          })
          return
        }

        // パターン2: 条件部分が実行部分の中で既に `?.` 付きで使われている
        // 例: if (A.B) { A.B?.C.d() } → A.B?.C.d()
        const escapedTest = testText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const pattern = new RegExp(`^${escapedTest}\\?\\.`)
        if (pattern.test(expressionText)) {
          context.report({
            node,
            message: `optional chaining(xxx?.yyyy記法)を利用してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-optional-chaining`,
            fix: (fixer) => fixer.replaceText(node, expressionText),
          })
        }
      },
    }
  },
}
module.exports.schema = SCHEMA

