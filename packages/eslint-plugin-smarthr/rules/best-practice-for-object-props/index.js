const TARGETS = [
  { component: 'ActionDialog', prop: 'actionButton', mainKey: 'text' },
  { component: 'ActionDialog', prop: 'closeButton', mainKey: 'text' },
  { component: 'ActionDialog', prop: 'heading', mainKey: 'text' },
  { component: 'AnchorButton', prop: 'inactiveReason', mainKey: 'message' },
  { component: 'Button', prop: 'disabledReason', mainKey: 'message' },
  { component: 'DefinitionListItem', prop: 'term', mainKey: 'text' },
  { component: 'DropdownMenuButton', prop: 'trigger', mainKey: 'children' },
  // HINT: smarthr-ui側でtriggerのmainKeyをchildrenからtextへリネーム予定のため先行対応
  { component: 'DropdownMenuButton', prop: 'trigger', mainKey: 'text' },
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

// HINT: 同じcomponent+propに複数のmainKeyを許容できるよう、selectorごとにグルーピングする
const GROUPED_TARGETS = TARGETS.reduce((groups, { component, prop, mainKey }) => {
  const selector = `JSXOpeningElement[name.name=/${component}$/] > JSXAttribute[name.name="${prop}"] > JSXExpressionContainer > ObjectExpression`

  if (!groups[selector]) {
    groups[selector] = { prop, mainKeys: [] }
  }
  groups[selector].mainKeys.push(mainKey)

  return groups
}, {})

const findMainKeyOnlyProperty = (objectExpression, mainKeys) => {
  if (objectExpression.properties.length !== 1) {
    return null
  }

  const [property] = objectExpression.properties

  if (property.type !== 'Property' || property.computed || !mainKeys.includes(property.key.name)) {
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

    for (const [selector, { prop, mainKeys }] of Object.entries(GROUPED_TARGETS)) {
      visitor[selector] = (node) => {
        const mainKeyOnlyProperty = findMainKeyOnlyProperty(node, mainKeys)

        if (!mainKeyOnlyProperty) {
          return
        }

        context.report({
          node,
          message: `"${prop}"に{ ${mainKeyOnlyProperty.key.name}: ... }のみを指定する場合はobject形式ではなく値を直接指定してください（例: ${prop}="値"）。
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
