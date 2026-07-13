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
            // 既にoptional chainingを使っている場合は対象外
            return
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
          // replace第2引数の$をエスケープ（$$は特殊文字として扱われるため）
          const replacement = `${testText}?.`.replace(/\$/g, '$$$$')
          context.report({
            node,
            message: `optional chaining(xxx?.yyyy記法)を利用してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-optional-chaining`,
            fix: (fixer) => fixer.replaceText(node, expressionText.replace(pattern, replacement)),
          })
        }
        // CallExpressionの場合のみcalleeにアクセス
        else if (expression.type === 'CallExpression') {
          const calleName = context.sourceCode.getText(expression.callee)

          // 条件部分と実行部分のcalleeが完全一致のパターン
          if (testText === calleName) {
            // replace第2引数の$をエスケープ
            const replacement = `${calleName}?.(`.replace(/\$/g, '$$$$')
            context.report({
              node,
              message: `optional chaining(xxx?.yyyy記法)を利用してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-optional-chaining`,
              fix: (fixer) => fixer.replaceText(
                node,
                expressionText.replace(new RegExp(`^${calleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\(`), replacement),
              ),
            })
          }
        }
      },
    }
  },
}
module.exports.schema = SCHEMA

