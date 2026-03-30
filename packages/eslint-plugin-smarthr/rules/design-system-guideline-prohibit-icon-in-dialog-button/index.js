const SCHEMA = []

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
  },
  create(context) {
    return {
      'JSXOpeningElement[name.name=/Dialog$/] JSXAttribute[name.name=/^(actionText|submitLabel|(submit|close|back)Button)$/] JSXExpressionContainer JSXOpeningElement[name.name=/Icon$/]': (node) => {
        context.report({
          node,
          message: `Dialogのボタンテキストにアイコンコンポーネントを含めることはできません。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-prohibit-icon-in-dialog-button
 - デザインシステムのガイドラインでは、Dialogのボタンはテキストのみとすることが推奨されています
 - アイコンを使用する場合は、ボタンの外側に配置してください`,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
