const SCHEMA = []

const ERROR_MESSAGE = `Dialogのボタンテキストにアイコンコンポーネントを含めることはできません。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-prohibit-icon-in-dialog-button
 - デザインシステムのガイドラインでは、Dialogのボタンはテキストのみとすることが推奨されています
 - アイコンを使用する場合は、ボタンの外側に配置してください`

// セレクタの共通部分
const DIALOG_NAMES = /^(ActionDialog|FormDialog|RemoteTrigger(Action|Form)Dialog)$/
const STEP_FORM_DIALOG = 'JSXOpeningElement[name.name="StepFormDialog"]'
const ICON_COMPONENT = 'JSXExpressionContainer JSXOpeningElement[name.name=/Icon$/]'

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
      [`JSXOpeningElement[name.name=${DIALOG_NAMES}] JSXAttribute[name.name="actionText"] ${ICON_COMPONENT}`]: reportIcon,

      // submitLabel属性にIconコンポーネントが含まれている場合（StepFormDialog旧API）
      [`${STEP_FORM_DIALOG} JSXAttribute[name.name="submitLabel"] ${ICON_COMPONENT}`]: reportIcon,

      // submitButton.text, closeButton.text, backButton.textにIconコンポーネントが含まれている場合（StepFormDialog新API）
      [`${STEP_FORM_DIALOG} JSXAttribute[name.name=/^(submit|close|back)Button$/] JSXExpressionContainer ObjectExpression Property[key.name="text"] JSXOpeningElement[name.name=/Icon$/]`]: reportIcon,
    }
  },
}
module.exports.schema = SCHEMA
