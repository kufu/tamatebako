const { generateTagFormatter } = require('../../libs/format_styled_components')

const EXPECTED_NAMES = {
  '(B|^b)utton$': 'Button$',
  '(Date|Wareki)Picker$': '(Date|Wareki)Picker$',
  '(F|^f)ieldset$': 'Fieldset$',
  '(F|^f)orm$': 'Form$',
  '(Heading|^h(2|3|4|5|6))$': 'Heading$',
  '(I|^i)nput$': 'Input$',
  '(Ordered(.*)List|^ol)$': 'Ordered(.*)List$',
  '(PageHeading|^h1)$': 'PageHeading$',
  '(S|^s)elect$': 'Select$',
  '(T|^t)extarea$': 'Textarea$',
  'AccordionPanel$': 'AccordionPanel$',
  'ActionDialogWithTrigger$': 'ActionDialogWithTrigger$',
  'Anchor$': 'Anchor$',
  'Article$': 'Article$',
  'Aside$': 'Aside$',
  'Base$': 'Base$',
  'BaseColumn$': 'BaseColumn$',
  'Center$': 'Center$',
  'Check(B|b)ox$': 'Checkbox$',
  'Cluster$': 'Cluster$',
  'Combo(B|b)ox$': 'Combobox$',
  'DropZone$': 'DropZone$',
  'FieldSet$': 'FieldSet$',
  'Fieldsets$': 'Fieldsets$',
  'FilterDropdown$': 'FilterDropdown$',
  'FormControl$': 'FormControl$',
  'FormControls$': 'FormControls$',
  'FormDialog$': 'FormDialog$',
  'FormGroup$': 'FormGroup$',
  'InputFile$': 'InputFile$',
  'Link$': 'Link$',
  'Message$': 'Message$',
  'ModelessDialog$': 'ModelessDialog$',
  'Nav$': 'Nav$',
  'Pagination$': 'Pagination$',
  'RadioButton$': 'RadioButton$',
  'RadioButtonPanel$': 'RadioButtonPanel$',
  'Reel$': 'Reel$',
  'RemoteDialogTrigger$': 'RemoteDialogTrigger$',
  'RemoteTrigger(.*)FormDialog$': 'RemoteTrigger(.*)FormDialog$',
  'RemoteTrigger(.+)Dialog$': 'RemoteTrigger(.+)Dialog$',
  'RightFixedNote$': 'RightFixedNote$',
  'Section$': 'Section$',
  'SegmentedControl$': 'SegmentedControl$',
  'SideNav$': 'SideNav$',
  'Sidebar$': 'Sidebar$',
  'SmartHRLogo$': 'SmartHRLogo$',
  'Stack$': 'Stack$',
  'Switch$': 'Switch$',
  'TabItem$': 'TabItem$',
  'Text$': 'Text$',
  'TimePicker$': 'TimePicker$',
  '^a$': '(Anchor|Link)$',
}

const unexpectedMessageTemplate = `{{extended}} は smarthr-ui/{{expected}} をextendすることを期待する名称になっています
 - childrenにHeadingを含まない場合、コンポーネントの名称から"{{expected}}"を取り除いてください
 - childrenにHeadingを含み、アウトラインの範囲を指定するためのコンポーネントならば、smarthr-ui/{{expected}}をexendしてください
   - "styled(Xxxx)" 形式の場合、拡張元であるXxxxコンポーネントの名称の末尾に"{{expected}}"を設定し、そのコンポーネント内でsmarthr-ui/{{expected}}を利用してください`
const UNEXPECTED_NAMES = {
  '(Anchor|^a)$': '(Anchor)$',
  '(A|^a)rticle$': ['(Article)$', unexpectedMessageTemplate ],
  '(A|^a)side$': ['(Aside)$', unexpectedMessageTemplate ],
  '(B|^b)utton$': '(Button)$',
  '(F|^f)ieldset$': '(Fieldset)$',
  '(F|^f)orm$': '(Form)$',
  '(Heading|^h(1|2|3|4|5|6))$': '(Heading)$',
  '(Link|^a)$': '(Link)$',
  '(N|^n)av$': ['(Nav)$', unexpectedMessageTemplate ],
  '(Ordered(.*)List|^ol)$': '(Ordered(.*)List)$',
  '(S|^s)ection$': ['(Section)$', unexpectedMessageTemplate ],
  '(S|^s)elect$': '(Select)$',
  'Base$': '(Base)$',
  'BaseColumn$': '(BaseColumn)$',
  'Center$': '(Center)$',
  'Cluster$': '(Cluster)$',
  'Fieldsets$': '(Fieldsets)$',
  'FilterDropdown$': '(FilterDropdown)$',
  'FormControl$': '(FormControl)$',
  'FormControls$': '(FormControls)$',
  'FormDialog$': '(FormDialog)$',
  'FormGroup$': '(FormGroup)$',
  'Reel$': '(Reel)$',
  'RemoteTrigger(.*)FormDialog$': '(RemoteTrigger(.*)FormDialog)$',
  'Sidebar$': '(Sidebar)$',
  'Stack$': '(Stack)$',
}


const SCHEMA = []

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
  },
  create(context) {
    return generateTagFormatter({ context, EXPECTED_NAMES, UNEXPECTED_NAMES })
  },
}
module.exports.schema = SCHEMA
