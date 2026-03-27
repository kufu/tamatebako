const SCHEMA = []

const ERROR_MESSAGE = `Dialogのボタンテキストにアイコンコンポーネントを含めることはできません。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-prohibit-icon-in-dialog-button
 - デザインシステムのガイドラインでは、Dialogのボタンはテキストのみとすることが推奨されています
 - アイコンを使用する場合は、ボタンの外側に配置してください`

// セレクタの共通部分
const STEP_FORM_DIALOG = 'JSXOpeningElement[name.name="StepFormDialog"]'
const ICON_COMPONENT = 'JSXOpeningElement[name.name=/Icon$/]'

// セレクタ定義（事前計算）
const ACTION_TEXT_SELECTOR = `JSXOpeningElement[name.name=/^(ActionDialog|FormDialog|RemoteTrigger(Action|Form)Dialog)$/] JSXAttribute[name.name="actionText"] JSXExpressionContainer ${ICON_COMPONENT}`
const SUBMIT_LABEL_SELECTOR = `${STEP_FORM_DIALOG} JSXAttribute[name.name="submitLabel"] JSXExpressionContainer ${ICON_COMPONENT}`
const BUTTON_TEXT_SELECTOR = `${STEP_FORM_DIALOG} JSXAttribute[name.name=/^(submit|close|back)Button$/] JSXExpressionContainer ObjectExpression Property[key.name="text"] ${ICON_COMPONENT}`

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

      // submitLabel属性にIconコンポーネントが含まれている場合（StepFormDialog旧API）
      [SUBMIT_LABEL_SELECTOR]: reportIcon,

      // submitButton.text, closeButton.text, backButton.textにIconコンポーネントが含まれている場合（StepFormDialog新API）
      [BUTTON_TEXT_SELECTOR]: reportIcon,
    }
  },
}
module.exports.schema = SCHEMA
