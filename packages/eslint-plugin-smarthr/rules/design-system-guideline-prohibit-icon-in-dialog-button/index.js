const SCHEMA = []

const ERROR_MESSAGE = `Dialogのボタンテキストにアイコンコンポーネントを含めることはできません。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-prohibit-icon-in-dialog-button
 - デザインシステムのガイドラインでは、Dialogのボタンはテキストのみとすることが推奨されています
 - アイコンを使用する場合は、ボタンの外側に配置してください`

// セレクタの共通部分
const STEP_FORM_DIALOG = 'JSXOpeningElement[name.name="StepFormDialog"]'
const ICON_COMPONENT = 'JSXExpressionContainer JSXOpeningElement[name.name=/Icon$/]'

// セレクタ定義（事前計算）
const ACTION_TEXT_SELECTOR = `JSXOpeningElement[name.name=/^(ActionDialog|FormDialog|RemoteTrigger(Action|Form)Dialog)$/] JSXAttribute[name.name="actionText"] ${ICON_COMPONENT}`
const STEP_FORM_DIALOG_SELECTOR = `${STEP_FORM_DIALOG} JSXAttribute[name.name=/^(submitLabel|(submit|close|back)Button)$/] ${ICON_COMPONENT}`

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
  },
  create(context) {
    const reportIcon = (node) => {
      context.report({
        node,
        message: ERROR_MESSAGE,
      })
    }

    return {
      // actionText属性にIconコンポーネントが含まれている場合
      [ACTION_TEXT_SELECTOR]: reportIcon,

      // StepFormDialogのボタン属性にIconコンポーネントが含まれている場合
      [STEP_FORM_DIALOG_SELECTOR]: reportIcon,
    }
  },
}
module.exports.schema = SCHEMA
