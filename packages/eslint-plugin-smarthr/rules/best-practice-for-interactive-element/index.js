const INTERACTIVE_COMPONENT_NAMES = `(${[
  '(ActionDialogWith|RemoteDialog)Trigger(s)?',
  '(B|b)utton(s)?',
  '(Check|Combo)(B|b)ox(es|s)?',
  '(Date(timeLocal)?|Time|Month|Wareki)Picker(s)?',
  '(F|f)orm(Control|Group|Dialog)?(s)?',
  '(I|i)nput(File)?(s)?',
  '(L|l)egend(s)$',
  '(S|s)elect(s)?',
  '(T|t)extarea(s)?',
  'AccordionPanel(s)?',
  'Anchor',
  'DisclosureTrigger?',
  'DropZone(s)?',
  'Field(S|s)et(s)?',
  'FilterDropdown(s)?',
  'Link(s)?',
  'Pagination(s)?',
  'RadioButton(Panel)?(s)?',
  'RemoteTrigger(.+)Dialog(s)?',
  'RightFixedNote(s)?',
  'SegmentedControl(s)?',
  'SideNav(s)?',
  'Switch(s)?',
  'TabItem(s)?',
  '^a',
  '^details',
  '^dialog',
  '^option',
  '^summary',
].join('|')})$`
const INTERACTIVE_ON_REGEX = /^on(Change|Input|Focus|Blur|(Double)?Click|Key(Down|Up|Press)|Mouse(Enter|Over|Down|Up|Leave)|Select|Submit)$/
const DELEGATE_REGEX = /(d|D)elegate/

const ARROW_ROLES = {
  '((^i|I)nput|(^c|C)heck(b|B)ox)$': 'switch',
  '(^i|I)nput$': 'combobox',
  '(^b|B)utton$': 'option',
}
const NOT_ARROW_ROLE_ATTRIBUTES = Object.entries(ARROW_ROLES).reduce((prev, [key, value]) => `${prev}:not([parent.name.name=/${key}/][value.value="${value}"])`, '')

const ELEMENT_HAS_ROLE_ATTRIBUTE = 'JSXOpeningElement:has(JSXAttribute[name.name="role"])'
const AS_FORM_PART_ATTRIBUTE = 'JSXAttribute[name.name=/^(as|forwardedAs)$/][value.value=/^f(orm|ieldset)$/]'

const SCHEMA = [
  {
    type: 'object',
    properties: {
      additionalInteractiveComponentRegex: { type: 'array', items: { type: 'string' } },
    },
    additionalProperties: false,
  }
]

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
  },
  create(context) {
    const options = context.options[0]
    const interactiveComponentRegex = new RegExp(`(${INTERACTIVE_COMPONENT_NAMES}${options?.additionalInteractiveComponentRegex ? `|${options.additionalInteractiveComponentRegex.join('|')}` : ''})`)
    const targetNameProp = `[name.name=${interactiveComponentRegex}]`

    return {
      [`JSXOpeningElement${targetNameProp}>JSXAttribute[name.name="role"]${NOT_ARROW_ROLE_ATTRIBUTES}`]: (node) => {
        context.report({
          node: node.parent,
          message: `${node.parent.name.name}にrole属性は指定しないでください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-interactive-element`,
        });
      },
      [`JSXOpeningElement>${AS_FORM_PART_ATTRIBUTE}`]: (node) => {
        if (node.parent.attributes.some((a) => a.type === 'JSXAttribute' && a.name?.name === 'role')) {
          context.report({
            node: node.parent,
            message: `<${node.parent.name.name} ${context.sourceCode.getText(node)}>にrole属性は指定しないでください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-interactive-element`,
          });
        }
      },
      [`JSXOpeningElement:not(${targetNameProp}):not(:has(${AS_FORM_PART_ATTRIBUTE}))>JSXAttribute[name.name=${INTERACTIVE_ON_REGEX}]:not([value.expression.name=${DELEGATE_REGEX}])`]: (node) => {
        switch (node.value.expression.type) {
          case 'MemberExpression':
            if (DELEGATE_REGEX.test(context.sourceCode.getText(node.expression))) {
              return
            }
            break
          case 'ArrowFunctionExpression':
            if (node.value.expression.params.some((p) => DELEGATE_REGEX.test(p.name))) {
              return
            }

            break
        }

        context.report({
          node: node.parent,
          message: `${node.parent.name.name}にデフォルトで用意されているonXxx形式の属性は設定しないでください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-interactive-element
 - 対応方法1: 対象の属性がコンポーネント内の特定のインタラクティブな要素に設定される場合、名称を具体的なものに変更してください
   - 属性名を"${INTERACTIVE_ON_REGEX}"に一致しないものに変更してください
   - 例: 対象コンポーネント内に '追加ボタン' が存在する場合、'onClick' という属性名を 'onClickAddButton' に変更する
 - 対応方法2: 子要素で発生したイベントを受け取ること(delegate)が目的でonXxx属性を設定している場合、イベントハンドラがdelegateを目的としている事がわかるように修正してください
   - 修正例1: "onClick={onClick}" を設定している場合、 "onClick={onDelegateClick}" のようにDelegate, もしくはdelegateを含む名称に変更する
   - 修正例2: "onClick={(e) => { ... }}" を設定している場合、 "onClick={(delegateEvent) => { ... }}" のように引数をdelegate, もしくはDelegateを含む名称に変更する
 - 対応方法3: 対象の属性が設定されているコンポーネントがインタラクティブなコンポーネントの場合、名称を調整してください
   - "${interactiveComponentRegex}" の正規表現にmatchするコンポーネントに変更、もしくは名称を調整してください
 - 対応方法4: インタラクティブな親要素、もしくは子要素が存在する場合、onXxx属性を移動して設定することを検討してください`,
        });
      }
    };
  },
};
module.exports.schema = SCHEMA;
