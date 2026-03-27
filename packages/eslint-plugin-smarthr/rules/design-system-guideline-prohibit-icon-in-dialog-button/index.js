const SCHEMA = []

const ERROR_MESSAGE = `Dialogのボタンテキストにアイコンコンポーネントを含めることはできません。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-prohibit-icon-in-dialog-button
 - デザインシステムのガイドラインでは、Dialogのボタンはテキストのみとすることが推奨されています
 - アイコンを使用する場合は、ボタンの外側に配置してください`

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
      // actionText属性にIconコンポーネントが含まれている場合
      'JSXOpeningElement[name.name=/^(ActionDialog|FormDialog|RemoteTrigger(Action|Form)Dialog)$/] JSXAttribute[name.name="actionText"] JSXExpressionContainer JSXOpeningElement[name.name=/Icon$/]': (node) => {
        context.report({
          node,
          message: ERROR_MESSAGE,
        })
      },

      // submitLabel属性にIconコンポーネントが含まれている場合（StepFormDialog旧API）
      'JSXOpeningElement[name.name="StepFormDialog"] JSXAttribute[name.name="submitLabel"] JSXExpressionContainer JSXOpeningElement[name.name=/Icon$/]': (node) => {
        context.report({
          node,
          message: ERROR_MESSAGE,
        })
      },

      // submitButton.text, closeButton.text, backButton.textにIconコンポーネントが含まれている場合（StepFormDialog新API）
      'JSXOpeningElement[name.name="StepFormDialog"] JSXAttribute[name.name=/^(submit|close|back)Button$/] JSXExpressionContainer ObjectExpression Property[key.name="text"] JSXOpeningElement[name.name=/Icon$/]': (node) => {
        context.report({
          node,
          message: ERROR_MESSAGE,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
