const TARGETS = [
  { component: 'ActionDialog', prop: 'actionButton', mainKey: 'text' },
  { component: 'ActionDialog', prop: 'closeButton', mainKey: 'text' },
  { component: 'ActionDialog', prop: 'heading', mainKey: 'text' },
  { component: 'AnchorButton', prop: 'inactiveReason', mainKey: 'message' },
  { component: 'Button', prop: 'disabledReason', mainKey: 'message' },
  { component: 'DefinitionListItem', prop: 'term', mainKey: 'text' },
  { component: 'DropdownMenuButton', prop: 'trigger', mainKey: 'children' },
  { component: 'Fieldset', prop: 'legend', mainKey: 'text' },
  { component: 'FilterDropdown', prop: 'trigger', mainKey: 'text' },
  { component: 'FormControl', prop: 'label', mainKey: 'text' },
  // HINT: StepFormDialogと誤ってマッチしないよう(?<!Step)で除外する
  { component: '(?<!Step)FormDialog', prop: 'actionButton', mainKey: 'text' },
  { component: '(?<!Step)FormDialog', prop: 'closeButton', mainKey: 'text' },
  { component: '(?<!Step)FormDialog', prop: 'heading', mainKey: 'text' },
  { component: 'InformationPanel', prop: 'heading', mainKey: 'text' },
  { component: 'MessageDialog', prop: 'heading', mainKey: 'text' },
  { component: 'StepFormDialog', prop: 'backButton', mainKey: 'text' },
  { component: 'StepFormDialog', prop: 'closeButton', mainKey: 'text' },
  { component: 'StepFormDialog', prop: 'heading', mainKey: 'text' },
  { component: 'StepFormDialog', prop: 'submitButton', mainKey: 'text' },
  { component: 'Text', prop: 'icon', mainKey: 'prefix' },
  { component: 'Text', prop: 'maxLines', mainKey: 'max' },
]

const SCHEMA = []

const findMainKeyOnlyProperty = (objectExpression, mainKey) => {
  if (objectExpression.properties.length !== 1) {
    return null
  }

  const [property] = objectExpression.properties

  if (property.type !== 'Property' || property.computed || property.key.name !== mainKey) {
    return null
  }

  return property
}

module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    schema: SCHEMA,
  },
  create(context) {
    const visitor = {}

    for (const { component, prop, mainKey } of TARGETS) {
      const selector = `JSXOpeningElement[name.name=/${component}$/] > JSXAttribute[name.name="${prop}"] > JSXExpressionContainer > ObjectExpression`

      visitor[selector] = (node) => {
        const mainKeyOnlyProperty = findMainKeyOnlyProperty(node, mainKey)

        if (!mainKeyOnlyProperty) {
          return
        }

        context.report({
          node,
          message: `"${prop}"に{ ${mainKey}: ... }のみを指定する場合はobject形式ではなく値を直接指定してください（例: ${prop}="値"）。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-object-props
 - 詳細な設定が必要な場合のみobject形式を使用してください`,
          fix(fixer) {
            const sourceCode = context.sourceCode || context.getSourceCode()

            return fixer.replaceText(node, sourceCode.getText(mainKeyOnlyProperty.value))
          },
        })
      }
    }

    return visitor
  },
}
module.exports.schema = SCHEMA
