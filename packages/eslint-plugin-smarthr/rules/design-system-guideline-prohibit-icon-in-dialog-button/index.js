const SCHEMA = []

const ERROR_MESSAGE = `Dialogのボタンテキストにアイコンコンポーネントを含めることはできません。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-prohibit-icon-in-dialog-button
 - デザインシステムのガイドラインでは、Dialogのボタンはテキストのみとすることが推奨されています
 - アイコンを使用する場合は、ボタンの外側に配置してください`

// セレクタの共通部分
const ICON_COMPONENT = 'JSXExpressionContainer JSXOpeningElement[name.name=/Icon$/]'
const DIALOG_COMPONENT = 'JSXOpeningElement[name.name=/Dialog$/]'

// セレクタ定義（事前計算）
const SELECTOR = `${DIALOG_COMPONENT} JSXAttribute[name.name=/^(actionText|submitLabel|(submit|close|back)Button)$/] ${ICON_COMPONENT}`

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
      [SELECTOR]: (node) => {
        context.report({
          node,
          message: ERROR_MESSAGE,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
