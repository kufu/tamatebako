const rule = require('../rules/component-name')
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

const messageProperName = ({ extended, matcher, suffix, base }) => {
  const isComponent = base[0].toUpperCase() === base[0]
  const sampleSuffix = `styled${isComponent ? `(${base})` : `.${base}`}`

  return `${extended} は ${matcher} にmatchする名前のコンポーネントを拡張することを期待している名称になっています
 - ${extended} の名称の末尾が"${suffix}" という文字列ではない状態にしつつ、"${base}"を継承していることをわかる名称に変更してください
 - もしくは"${base}"を"${extended}"の継承元であることがわかるような${isComponent ? '名称に変更するか、適切な別コンポーネントに差し替えてください' : '適切なタグや別コンポーネントに差し替えてください'}
   - 修正例1: const HogeXxxx = ${sampleSuffix}
   - 修正例2: const Hoge${suffix}Xxxx = ${sampleSuffix}
   - 修正例3: const Hoge${suffix} = styled(Xxxx${suffix})`
}
const messageInheritance = ({ extended, matcher }) => `${extended}を正規表現 "${matcher}" がmatchする名称に変更してください。`
const messageImportAs = ({ extended, matcher, base }) => `${extended}を正規表現 "${matcher}" がmatchする名称に変更してください。
 - ${base}が型の場合、'import type { ${base} as ${extended} }' もしくは 'import { type ${base} as ${extended} }' のように明示的に型であることを宣言してください。名称変更が不要になります`

ruleTester.run('component-name', rule, {
  valid: [
    { code: `import styled from 'styled-components'` },
    { code: `import styled, { css } from 'styled-components'` },
    { code: `import { css } from 'styled-components'` },

    { code: `const HogeOrderedFugaList = styled.ol` },
    { code: `const HogeOrderedFugaList = styled(HogeOrderedList)` },
    { code: `import { HogeOrderedFugaList } from 'hoge'` },
    { code: `import { OrderedFugaList as HogeOrderedPiyoList } from 'hoge'` },

    { code: `const HogeSelect = styled(FugaSelect)` },

    { code: `const HogeAnchor = styled.a` },
    { code: `const HogeLink = styled.a` },

    { code: 'const HogeButton = styled.button``' },
    { code: 'const HogeButton = styled(Button)``' },
    { code: 'const FugaSmartHRLogo = styled(SmartHRLogo)``' },
    { code: 'const FugaText = styled(HogeText)(() => ``)' },
    { code: 'const FugaMessage = styled(HogeMessage)(() => ``)' },

    { code: `const HogeInput = styled.input` },
    { code: `const HogeTextarea = styled(Textarea)` },
    { code: `import { InputFile as HogeInputFile } from 'hoge'` },
    { code: `const HogeRadioButton = styled(RadioButton)` },
    { code: `import { HogeRadioButtonPanel } from 'hoge'` },
    { code: `const HogeCheckbox = styled(Checkbox)` },
    { code: `import { HogeCombobox as FugaCombobox } from 'hoge'` },

    { code: `const FugaRightFixedNote = styled(HogeRightFixedNote)` },
    { code: `import { HogeFieldset as FugaFieldset } from 'hoge'` },
    { code: `const FugaFormControl = styled(HogeFormControl)` },
    { code: `import { HogeTabItem as TabItem } from 'hoge'` },
    { code: `const Form = styled(HogeForm)` },
    { code: `import { ActionDialogWithTrigger as FugaActionDialogWithTrigger } from 'hoge'` },
    { code: `const FugaRemoteDialogTrigger = styled(RemoteDialogTrigger)` },
    { code: `import { HogeRemoteTriggerActionDialog as FugaRemoteTriggerAnyDialog } from 'hoge'` },

    { code: `const HogeFieldset = styled.fieldset` },
    { code: `const HogeFieldsets = styled(FugaFieldsets)` },
    { code: `import { HogeFormControls as FugaFormControls } from 'hoge'` },
    { code: `const RemoteTriggerFormDialog = styled(RemoteTriggerAnyFormDialog)` },
  ],
  invalid: [
    { code: `import hoge from 'styled-components'`, errors: [ { message: `styled-components をimportする際は、名称が"styled" となるようにしてください。例: "import styled from 'styled-components'"` } ] },

    { code: `const HogeOrderedFugaList = styled.ul`, errors: [ { message: messageProperName({ extended: 'HogeOrderedFugaList', matcher: '/(Ordered(.*)List|^ol)$/', suffix: 'OrderedFugaList', base: 'ul' }) } ] },
    { code: `const HogeOrderedFugaList = styled(Hoge)`, errors: [ { message: messageProperName({ extended: 'HogeOrderedFugaList', matcher: '/(Ordered(.*)List|^ol)$/', suffix: 'OrderedFugaList', base: 'Hoge' }) } ] },
    { code: `const Hoge = styled.ol`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/Ordered(.*)List$/' }) } ] },
    { code: `import { HogeOrderedFugaList as Fuga } from 'hoge'`, errors: [ { message: messageImportAs({ extended: 'Fuga', matcher: '/Ordered(.*)List$/', base: 'HogeOrderedFugaList' }) } ] },

    { code: `const HogeSelect = styled.div`, errors: [ { message: messageProperName({ extended: 'HogeSelect', matcher: '/(S|s)elect$/', suffix: 'Select', base: 'div' }) } ] },

    { code: `const HogeAnchor = styled.div`, errors: [ { message: messageProperName({ extended: 'HogeAnchor', matcher: '/(Anchor|^a)$/', suffix: 'Anchor', base: 'div' }) } ] },
    { code: `const HogeLink = styled.div`, errors: [ { message: messageProperName({ extended: 'HogeLink', matcher: '/(Link|^a)$/', suffix: 'Link', base: 'div' }) } ] },
    { code: `const HogeAnchor = styled(Hoge)`, errors: [ { message: messageProperName({ extended: 'HogeAnchor', matcher: '/(Anchor|^a)$/', suffix: 'Anchor', base: 'Hoge' }) } ] },
    { code: `const HogeLink = styled(Hoge)`, errors: [ { message: messageProperName({ extended: 'HogeLink', matcher: '/(Link|^a)$/', suffix: 'Link', base: 'Hoge' }) } ] },
    { code: `const Hoge = styled.a`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/(Anchor|Link)$/' }) } ] },
    { code: `import { HogeAnchor as Fuga } from 'hoge'`, errors: [ { message: messageImportAs({ extended: 'Fuga', matcher: '/Anchor$/', base: 'HogeAnchor' }) } ] },
    { code: `import { HogeLink as Fuga } from 'hoge'`, errors: [ { message: messageImportAs({ extended: 'Fuga', matcher: '/Link$/', base: 'HogeLink' }) } ] },

    { code: `import { SmartHRLogo as SmartHRLogoHoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'SmartHRLogoHoge', matcher: '/SmartHRLogo$/', base: 'SmartHRLogo' }) } ] },
    { code: `import { FugaMessage as FugaMessageFuga } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'FugaMessageFuga', matcher: '/Message$/', base: 'FugaMessage' }) } ] },
    { code: 'const Hoge = styled.button``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/Button$/' }) } ]  },
    { code: 'const Fuga = styled(SmartHRLogo)``', errors: [ { message: messageInheritance({ extended: 'Fuga', matcher: '/SmartHRLogo$/' }) } ]  },
    { code: 'const Hoge = styled(HogeMessage)``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/Message$/' }) } ]  },
    { code: 'const HogeButton = styled.div``', errors: [ { message: messageProperName({ extended: 'HogeButton', matcher: '/(B|^b)utton$/', suffix: 'Button', base: 'div' }) } ]  },

    { code: `import { DatePicker as DatePickerHoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'DatePickerHoge', matcher: '/(Date|Wareki)Picker$/', base: 'DatePicker' }) } ] },
    { code: 'const Fuga = styled(WarekiPicker)``', errors: [ { message: messageInheritance({ extended: 'Fuga', matcher: '/(Date|Wareki)Picker$/' }) } ]  },
    { code: `import { TimePicker as Hoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'Hoge', matcher: '/TimePicker$/', base: 'TimePicker' }) } ] },
    { code: 'const Hoge = styled(DropZone)``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/DropZone$/' }) } ]  },
    { code: `import { Switch as Hoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'Hoge', matcher: '/Switch$/', base: 'Switch' }) } ] },
    { code: 'const SegmentedControlHoge = styled(FugaSegmentedControl)``', errors: [ { message: messageInheritance({ extended: 'SegmentedControlHoge', matcher: '/SegmentedControl$/' }) } ]  },
    { code: `import { FormDialog as HogeDialog } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'HogeDialog', matcher: '/FormDialog$/', base: 'FormDialog' }) } ] },
    { code: 'const PaginationFuga = styled(FugaPagination)``', errors: [ { message: messageInheritance({ extended: 'PaginationFuga', matcher: '/Pagination$/' }) } ]  },
    { code: `import { HogeSideNav as Hoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'Hoge', matcher: '/SideNav$/', base: 'HogeSideNav' }) } ] },
    { code: 'const AccordionPanelAny = styled(FugaAccordionPanel)``', errors: [ { message: messageInheritance({ extended: 'AccordionPanelAny', matcher: '/AccordionPanel$/' }) } ]  },
    { code: `import { HogeFilterDropdown as Hoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'Hoge', matcher: '/FilterDropdown$/', base: 'HogeFilterDropdown' }) } ] },
    { code: `const Hoge = styled.fieldset`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/Fieldset$/' }) } ] },
    { code: `const Hoge = styled(Fieldsets)`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/Fieldsets$/' }) } ] },
    { code: `const Hoge = styled(FormControls)`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/FormControls$/' }) } ] },
    { code: `const Hoge = styled(FilterDropdown)`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/FilterDropdown$/' }) } ] },
  ]
})
