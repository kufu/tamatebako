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
        // consequentからexpressionとexpressionTextを取得
        let expression
        let expressionText

        switch (node.consequent.type) {
          case 'BlockStatement': {
            // if (x) { func() } の形式
            if (
              // 複数のステートメントがある場合は対象外
              node.consequent.body.length !== 1 ||
              // ExpressionStatement以外は対象外
              node.consequent.body[0].type !== 'ExpressionStatement'
            ) {
              return
            }

            const bodyText = context.sourceCode.getText(node.consequent)
            expressionText = bodyText.slice(1, -1).trim() // { } を削除
            expression = node.consequent.body[0].expression

            break
          }
          case 'ExpressionStatement':
            // if (x) func() の形式
            expressionText = context.sourceCode.getText(node.consequent)
            expression = node.consequent.expression
            break
          default:
            return
        }

        switch (expression.type) {
          case 'ChainExpression':
            // ChainExpressionの場合、その中のexpressionを取得
            expression = expression.expression
            break
          case 'CallExpression':
            break
          default:
            return
        }

        const testText = context.sourceCode.getText(node.test)

        // 条件部分が実行部分の先頭にマッチするパターン
        // 例: if (A.B) { A.B.C.d() } → A.B?.C.d()
        const pattern = new RegExp(`^${testText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.`)

        if (pattern.test(expressionText)) {
          context.report({
            node,
            message: `optional chaining(xxx?.yyyy記法)を利用してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-optional-chaining`,
            fix: (fixer) => fixer.replaceText(node, expressionText.replace(pattern, `${testText}?.`)),
          })
        }
        // calleeのテキストを取得
        // optional chainingが含まれている場合
        // ChainExpression全体ではなく、その中のexpressionのテキストを取得する必要はない
        // 代わりに、expressionTextを使ってパターンマッチする
        else if (expression.callee.type !== 'ChainExpression') {
          const calleName = context.sourceCode.getText(expression.callee)

          // 条件部分と実行部分のcalleeが完全一致のパターン
          if (testText === calleName) {
            context.report({
              node,
              message: `optional chaining(xxx?.yyyy記法)を利用してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-optional-chaining`,
              fix: (fixer) => fixer.replaceText(
                node,
                expressionText.replace(new RegExp(`^${calleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\(`), `${calleName}\?\.(`),
              ),
            })
          }
        }
      },
    }
  },
}
module.exports.schema = SCHEMA

