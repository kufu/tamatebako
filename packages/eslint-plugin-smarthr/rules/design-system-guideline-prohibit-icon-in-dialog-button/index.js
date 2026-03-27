const SCHEMA = []

const ERROR_MESSAGE = `Dialogのボタンテキストにアイコン（JSX要素）を含めることはできません。
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
    const checkJSXElement = (node) => {
      // JSXExpressionContainerの直下のJSX要素のみをチェック（ネストした要素は除外）
      if (node.parent.type === 'JSXExpressionContainer' ||
          (node.parent.type === 'Property' && node.parent.parent.type === 'ObjectExpression')) {
        context.report({
          node,
          message: ERROR_MESSAGE,
        })
      }
    }

    return {
      // actionText属性にJSX要素が含まれている場合
      'JSXOpeningElement[name.name=/^(ActionDialog|FormDialog|RemoteTrigger(Action|Form)Dialog)$/] JSXAttribute[name.name="actionText"] JSXExpressionContainer > :matches(JSXElement, JSXFragment)': checkJSXElement,

      // submitLabel属性にJSX要素が含まれている場合（StepFormDialog旧API）
      'JSXOpeningElement[name.name="StepFormDialog"] JSXAttribute[name.name="submitLabel"] JSXExpressionContainer > :matches(JSXElement, JSXFragment)': checkJSXElement,

      // submitButton.text, closeButton.text, backButton.textにJSX要素が含まれている場合（StepFormDialog新API）
      'JSXOpeningElement[name.name="StepFormDialog"] JSXAttribute[name.name=/^(submit|close|back)Button$/] JSXExpressionContainer ObjectExpression Property[key.name="text"] > :matches(JSXElement, JSXFragment)': checkJSXElement,
    }
  },
}
module.exports.schema = SCHEMA
