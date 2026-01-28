const rule = require('../rules/best-practice-for-interactive-element')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})

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

const interactiveError = (name) => `${name}にrole属性は指定しないでください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-interactive-element`
const uninteractiveError = (name) => `${name}にデフォルトで用意されているonXxx形式の属性は設定しないでください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-interactive-element
 - 対応方法1: 対象の属性がコンポーネント内の特定のインタラクティブな要素に設定される場合、名称を具体的なものに変更してください
   - 属性名を"${INTERACTIVE_ON_REGEX}"に一致しないものに変更してください
   - 例: 対象コンポーネント内に '追加ボタン' が存在する場合、'onClick' という属性名を 'onClickAddButton' に変更する
 - 対応方法2: 対象の属性が設定されているコンポーネントがインタラクティブなコンポーネントの場合、名称を調整してください
   - "${new RegExp(`(${INTERACTIVE_COMPONENT_NAMES})`)}" の正規表現にmatchするコンポーネントに変更、もしくは名称を調整してください
 - 対応方法3: インタラクティブな親要素、もしくは子要素が存在する場合、onXxx属性を移動して設定することを検討してください`

ruleTester.run('best-practice-for-interactive-element', rule, {
  valid: [
    { code: `<button>...</button>` },
    { code: `<InteractiveComponent>...</InteractiveComponent>`, options: [{ additionalInteractiveComponentRegex: ['^InteractiveComponent%'] }] },
    { code: `<CrewDetail onChangeName={onChange} />` },
  ],
  invalid: [
    { code: `<button role="presentation">...</button>`, errors: [{ message: interactiveError('button') }] },
    { code: `<Hoge as="form" role="menu" />`, errors: [{ message: interactiveError('Hoge') }] },
    { code: `<FormControl role="menu" />`, errors: [{ message: interactiveError('FormControl') }] },
    { code: `<InteractiveComponent role="group">...</InteractiveComponent>`, options: [{ additionalInteractiveComponentRegex: ['^Interactive'] }], errors: [{ message: interactiveError('InteractiveComponent') }] },
    { code: `<CrewDetail onChange={onChange} />`, errors: [{ message: uninteractiveError('CrewDetail') }] },
  ]
})

