const TARGETS = [
  { component: 'DropdownMenuButton', prop: 'trigger', mainKey: 'children' },
  { component: 'FilterDropdown', prop: 'trigger', mainKey: 'text' },
  { component: 'FormControl', prop: 'label', mainKey: 'text' },
  { component: 'Fieldset', prop: 'legend', mainKey: 'text' },
  { component: 'DefinitionListItem', prop: 'term', mainKey: 'text' },
  { component: 'InformationPanel', prop: 'heading', mainKey: 'text' },
  { component: 'Text', prop: 'maxLines', mainKey: 'max' },
  { component: 'Text', prop: 'icon', mainKey: 'prefix' },
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
