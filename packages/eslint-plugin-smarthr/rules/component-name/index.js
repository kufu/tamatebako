const { generateTagFormatter } = require('../../libs/format_styled_components')

const EXPECTED_NAMES = {
  '(B|b)utton$': 'Button$',
  '(Date|Wareki)Picker$': '(Date|Wareki)Picker$',
  '(F|f)orm$': 'Form$',
  '(I|i)nput$': 'Input$',
  '(Ordered(.*)List|^ol)$': 'Ordered(.*)List$',
  '(S|s)elect$': 'Select$',
  '(T|t)extarea$': 'Textarea$',
  'AccordionPanel$': 'AccordionPanel$',
  'ActionDialogWithTrigger$': 'ActionDialogWithTrigger$',
  'Anchor$': 'Anchor$',
  'Check(B|b)ox$': 'Checkbox$',
  'Combo(B|b)ox$': 'Combobox$',
  'DropZone$': 'DropZone$',
  'FieldSet$': 'FieldSet$',
  'Fieldset$': 'Fieldset$',
  'FilterDropdown$': 'FilterDropdown$',
  'FormControl$': 'FormControl$',
  'FormDialog$': 'FormDialog$',
  'FormGroup$': 'FormGroup$',
  'InputFile$': 'InputFile$',
  'Link$': 'Link$',
  'Message$': 'Message$',
  'Pagination$': 'Pagination$',
  'RadioButton$': 'RadioButton$',
  'RadioButtonPanel$': 'RadioButtonPanel$',
  'RemoteDialogTrigger$': 'RemoteDialogTrigger$',
  'RemoteTrigger(.+)Dialog$': 'RemoteTrigger(.+)Dialog$',
  'RightFixedNote$': 'RightFixedNote$',
  'SegmentedControl$': 'SegmentedControl$',
  'SideNav$': 'SideNav$',
  'SmartHRLogo$': 'SmartHRLogo$',
  'Switch$': 'Switch$',
  'TabItem$': 'TabItem$',
  'Text$': 'Text$',
  'TimePicker$': 'TimePicker$',
  '^a$': '(Anchor|Link)$',
}
const UNEXPECTED_NAMES = {
  '(Ordered(.*)List|^ol)$': '(Ordered(.*)List)$',
  '(S|s)elect$': '(Select)$',
  '(Anchor|^a)$': '(Anchor)$',
  '(Link|^a)$': '(Link)$',
  '(B|^b)utton$': '(Button)$',
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
