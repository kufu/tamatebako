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

const messageProperName = ({ extended, matcher, sampleMatcher, suffix, base }) => {
  const isComponent = base[0].toUpperCase() === base[0]
  const sampleSuffix = `styled${isComponent ? `(${base})` : `.${base}`}`
  const actualPrefix = sampleMatcher ? extended.replace(sampleMatcher, '') : (base[0] === base[0].toUpperCase() ? base.replace(matcher, '') : 'Hoge')

  return `${extended} は ${matcher} にmatchする名前のコンポーネントを拡張することを期待している名称になっています
 - ${extended} の名称の末尾が"${suffix}" という文字列ではない状態にしつつ、"${base}"を継承していることをわかる名称に変更してください
 - もしくは"${base}"を"${extended}"の継承元であることがわかるような${isComponent ? '名称に変更するか、適切な別コンポーネントに差し替えてください' : '適切なタグや別コンポーネントに差し替えてください'}
   - 修正例1: const ${actualPrefix}Xxxx = ${sampleSuffix}
   - 修正例2: const ${actualPrefix}${suffix}Xxxx = ${sampleSuffix}
   - 修正例3: const ${actualPrefix}${suffix} = styled(Xxxx${suffix})`
}
const messageInheritance = ({ extended, matcher }) => `${extended}を正規表現 "${matcher}" がmatchする名称に変更してください。`
const messageImportAs = ({ extended, matcher, base }) => `${messageInheritance({ extended, matcher })}
 - ${base}が型の場合、'import type { ${base} as ${extended} }' もしくは 'import { type ${base} as ${extended} }' のように明示的に型であることを宣言してください。名称変更が不要になります`
const messageExtendSectioningContent = ({ extended, expected }) => `${extended} は smarthr-ui/${expected} をextendすることを期待する名称になっています
 - childrenにHeadingを含まない場合、コンポーネントの名称から"${expected}"を取り除いてください
 - childrenにHeadingを含み、アウトラインの範囲を指定するためのコンポーネントならば、smarthr-ui/${expected}をexendしてください
   - "styled(Xxxx)" 形式の場合、拡張元であるXxxxコンポーネントの名称の末尾に"${expected}"を設定し、そのコンポーネント内でsmarthr-ui/${expected}を利用してください`

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

    { code: `import { PageHeading as HogePageHeading } from './hoge'` },
    { code: `import { HogeHeading as FugaHeading } from './hoge'` },
    { code: `import { HogeArticle as FugaArticle } from './hoge'` },
    { code: `import { HogeAside as FugaAside } from './hoge'` },
    { code: `import { HogeNav as FugaNav } from './hoge'` },
    { code: `import { HogeSection as FugaSection } from './hoge'` },
    { code: `import { ModelessDialog as FugaModelessDialog } from './hoge'` },
    { code: 'const HogePageHeading = styled.h1``' },
    { code: 'const HogeHeading = styled.h2``' },
    { code: 'const HogeHeading = styled.h3``' },
    { code: 'const HogeHeading = styled.h4``' },
    { code: 'const HogeHeading = styled.h5``' },
    { code: 'const HogeHeading = styled.h6``' },
    { code: 'const FugaHeading = styled(Heading)``' },
    { code: 'const FugaHeading = styled(HogeHeading)``' },
    { code: 'const FugaArticle = styled(HogeArticle)``' },
    { code: 'const FugaAside = styled(HogeAside)``' },
    { code: 'const FugaNav = styled(HogeNav)``' },
    { code: 'const FugaSection = styled(HogeSection)``' },
    { code: "const FugaHeading = styled(Heading).attrs(() => ({ type: 'blockTitle' }))``" },
    { code: 'const FugaCenter = styled(HogeCenter)``' },
    { code: 'const FugaReel = styled(HogeReel)``' },
    { code: 'const FugaSidebar = styled(HogeSidebar)``' },
    { code: 'const FugaStack = styled(HogeStack)``' },

    { code: `import { HogeImg as FugaImg } from './hoge'` },
    { code: `import { HogeImage as FugaImage } from './hoge'` },
    { code: `import { HogeIcon as FugaIcon } from './hoge'` },
    { code: 'const HogeImg = styled.img``' },
    { code: 'const HogeImage = styled.img``' },
    { code: 'const HogeIcon = styled.img``' },
    { code: 'const HogeImg = styled.svg``' },
    { code: 'const HogeImage = styled.svg``' },
    { code: 'const HogeIcon = styled.svg``' },
    { code: 'const HogeImg = styled(Img)``' },
    { code: 'const HogeImage = styled(Image)``' },
    { code: 'const HogeIcon = styled(Icon)``' },

    { code: 'const HogeRadioButton = styled(FugaRadioButton)``' },
    { code: 'const HogeRadioButtonPanel = styled(FugaRadioButtonPanel)``' },
    { code: 'const HogeCheckbox = styled(FugaCheckBox)``' },

    { code: `import { HogeSearchInput as FugaSearchInput } from './hoge'` },

    { code: 'const IndexNav = styled(HogeIndexNav)``' },

    { code: `import { DropdownTrigger as HogeDropdownTrigger } from './hoge'` },
    { code: `import { FugaDialogTrigger as HogeDialogTrigger } from './hoge'` },
    { code: `import { AbcButton as HogeAbcButton } from './hoge'` },
    { code: `import { AnchorButton as FugaAnchorButton } from './hoge'` },
    { code: `import { HogeAnchor as HogeFugaAnchor } from './hoge'` },
    { code: `import { FugaLink as HogeLink } from './hoge'` },
    { code: 'const HogeAnchor = styled.a``' },
    { code: 'const HogeLink = styled.a``' },
    { code: 'const HogeButtonAnchor = styled(ButtonAnchor)``' },
    { code: 'const HogeAnchorButton = styled(AnchorButton)``' },
    { code: 'const HogeLink = styled(FugaLink)``' },
    { code: 'const HogeAnchor = styled(FugaAnchor)``' },
    { code: 'const HogeDialogTrigger = styled(DialogTrigger)``' },
    { code: 'const HogeDropdownTrigger = styled(DropdownTrigger)``' },

    { code: 'const RemoteTriggerHogeDialog = styled(RemoteTriggerActionDialog)``' },
  ],
  invalid: [
    { code: `import hoge from 'styled-components'`, errors: [ { message: `styled-components をimportする際は、名称が"styled" となるようにしてください。例: "import styled from 'styled-components'"` } ] },

    { code: `const HogeOrderedFugaList = styled.ul`, errors: [ { message: messageProperName({ extended: 'HogeOrderedFugaList', matcher: /(Ordered(.*)List|^ol)$/, suffix: 'OrderedFugaList', base: 'ul' }) } ] },
    { code: `const HogeOrderedFugaList = styled(Hoge)`, errors: [ { message: messageProperName({ extended: 'HogeOrderedFugaList', matcher: /(Ordered(.*)List|^ol)$/, suffix: 'OrderedFugaList', base: 'Hoge' }) } ] },
    { code: `const Hoge = styled.ol`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /Ordered(.*)List$/ }) } ] },
    { code: `import { HogeOrderedFugaList as Fuga } from 'hoge'`, errors: [ { message: messageImportAs({ extended: 'Fuga', matcher: /Ordered(.*)List$/, base: 'HogeOrderedFugaList' }) } ] },

    { code: `const HogeSelect = styled.div`, errors: [ { message: messageProperName({ extended: 'HogeSelect', matcher: /(S|^s)elect$/, suffix: 'Select', base: 'div' }) } ] },

    { code: `const HogeAnchor = styled.div`, errors: [ { message: messageProperName({ extended: 'HogeAnchor', matcher: /(Anchor|^a)$/, suffix: 'Anchor', base: 'div' }) } ] },
    { code: `const HogeLink = styled.div`, errors: [ { message: messageProperName({ extended: 'HogeLink', matcher: /(Link|^a)$/, suffix: 'Link', base: 'div' }) } ] },
    { code: `const HogeAnchor = styled(Hoge)`, errors: [ { message: messageProperName({ extended: 'HogeAnchor', matcher: /(Anchor|^a)$/, suffix: 'Anchor', base: 'Hoge' }) } ] },
    { code: `const HogeLink = styled(Hoge)`, errors: [ { message: messageProperName({ extended: 'HogeLink', matcher: /(Link|^a)$/, suffix: 'Link', base: 'Hoge' }) } ] },
    { code: `const Hoge = styled.a`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /(Anchor|Link)$/ }) } ] },
    { code: `import { HogeAnchor as Fuga } from 'hoge'`, errors: [ { message: messageImportAs({ extended: 'Fuga', matcher: /Anchor$/, base: 'HogeAnchor' }) } ] },
    { code: `import { HogeLink as Fuga } from 'hoge'`, errors: [ { message: messageImportAs({ extended: 'Fuga', matcher: /Link$/, base: 'HogeLink' }) } ] },

    { code: `import { SmartHRLogo as SmartHRLogoHoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'SmartHRLogoHoge', matcher: /SmartHRLogo$/, base: 'SmartHRLogo' }) } ] },
    { code: `import { FugaMessage as FugaMessageFuga } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'FugaMessageFuga', matcher: /Message$/, base: 'FugaMessage' }) } ] },
    { code: 'const Hoge = styled.button``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /Button$/ }) } ]  },
    { code: 'const Fuga = styled(SmartHRLogo)``', errors: [ { message: messageInheritance({ extended: 'Fuga', matcher: /SmartHRLogo$/ }) } ]  },
    { code: 'const Hoge = styled(HogeMessage)``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /Message$/ }) } ]  },
    { code: 'const HogeButton = styled.div``', errors: [ { message: messageProperName({ extended: 'HogeButton', matcher: /(B|^b)utton$/, suffix: 'Button', base: 'div' }) } ]  },

    { code: `import { DatePicker as DatePickerHoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'DatePickerHoge', matcher: /(Date|Wareki)Picker$/, base: 'DatePicker' }) } ] },
    { code: 'const Fuga = styled(WarekiPicker)``', errors: [ { message: messageInheritance({ extended: 'Fuga', matcher: /(Date|Wareki)Picker$/ }) } ]  },
    { code: `import { TimePicker as Hoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'Hoge', matcher: /TimePicker$/, base: 'TimePicker' }) } ] },
    { code: 'const Hoge = styled(DropZone)``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /DropZone$/ }) } ]  },
    { code: `import { Switch as Hoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'Hoge', matcher: /Switch$/, base: 'Switch' }) } ] },
    { code: 'const SegmentedControlHoge = styled(FugaSegmentedControl)``', errors: [ { message: messageInheritance({ extended: 'SegmentedControlHoge', matcher: '/SegmentedControl$/' }) } ]  },
    { code: `import { FormDialog as HogeDialog } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'HogeDialog', matcher: /FormDialog$/, base: 'FormDialog' }) } ] },
    { code: 'const PaginationFuga = styled(FugaPagination)``', errors: [ { message: messageInheritance({ extended: 'PaginationFuga', matcher: /Pagination$/ }) } ]  },
    { code: `import { HogeSideNav as Hoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'Hoge', matcher: /Nav$/, base: 'HogeSideNav' }) }, { message: messageImportAs({ extended: 'Hoge', matcher: /SideNav$/, base: 'HogeSideNav' }) } ] },
    { code: 'const AccordionPanelAny = styled(FugaAccordionPanel)``', errors: [ { message: messageInheritance({ extended: 'AccordionPanelAny', matcher: /AccordionPanel$/ }) } ]  },
    { code: `import { HogeFilterDropdown as Hoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'Hoge', matcher: /FilterDropdown$/, base: 'HogeFilterDropdown' }) } ] },
    { code: `const Hoge = styled.fieldset`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /Fieldset$/ }) } ] },
    { code: `const Hoge = styled(Fieldsets)`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /Fieldsets$/ }) } ] },
    { code: `const Hoge = styled(FormControls)`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /FormControls$/ }) } ] },
    { code: `const Hoge = styled(FilterDropdown)`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /FilterDropdown$/ }) } ] },

    { code: `import { HogePageHeading as PageHeadingAbc } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'PageHeadingAbc', matcher: /Heading$/, base: 'HogePageHeading' }) }, { message: messageImportAs({ extended: 'PageHeadingAbc', matcher: /PageHeading$/, base: 'HogePageHeading' }) } ] },
    { code: `import { Heading as HeadingHoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'HeadingHoge', matcher: /Heading$/, base: 'Heading' }) } ] },
    { code: `import { HogeArticle as HogeArticleFuga } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'HogeArticleFuga', matcher: /Article$/, base: 'HogeArticle' }) } ] },
    { code: `import { HogeAside as HogeAsideFuga } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'HogeAsideFuga', matcher: /Aside$/, base: 'HogeAside' }) } ] },
    { code: `import { HogeNav as HogeNavFuga } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'HogeNavFuga', matcher: /Nav$/, base: 'HogeNav' }) } ] },
    { code: `import { HogeSection as HogeSectionFuga } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'HogeSectionFuga', matcher: /Section$/, base: 'HogeSection' }) } ] },
    { code: `import { HogeModelessDialog as HogeModelessDialogFuga } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'HogeModelessDialogFuga', matcher: /ModelessDialog$/, base: 'HogeModelessDialog' }) } ] },
    { code: 'const Hoge = styled.h1``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /PageHeading$/ }) } ] },
    { code: 'const Hoge = styled.h2``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /Heading$/ }) } ] },
    { code: 'const Hoge = styled.h3``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /Heading$/ }) } ] },
    { code: 'const Hoge = styled.h4``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /Heading$/ }) } ] },
    { code: 'const Hoge = styled.h5``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /Heading$/ }) } ] },
    { code: 'const Hoge = styled.h6``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /Heading$/ }) } ] },
    { code: 'const Fuga = styled(Heading)``', errors: [ { message: messageInheritance({ extended: 'Fuga', matcher: /Heading$/ }) } ] },
    { code: 'const Fuga = styled(HogeHeading)``', errors: [ { message: messageInheritance({ extended: 'Fuga', matcher: /Heading$/ }) } ] },
    { code: 'const Fuga = styled(HogeHeading).attrs(() => ({ type: "blockTitle" }))``', errors: [ { message: messageInheritance({ extended: 'Fuga', matcher: /Heading$/ }) } ] },
    { code: 'const Fuga = styled(HogeArticle)``', errors: [ { message: messageInheritance({ extended: 'Fuga', matcher: /Article$/ }) } ] },
    { code: 'const Fuga = styled(HogeAside)``', errors: [ { message: messageInheritance({ extended: 'Fuga', matcher: /Aside$/ }) } ] },
    { code: 'const Fuga = styled(HogeNav)``', errors: [ { message: messageInheritance({ extended: 'Fuga', matcher: /Nav$/ }) } ] },
    { code: 'const Fuga = styled(HogeSection)``', errors: [ { message: messageInheritance({ extended: 'Fuga', matcher: /Section$/ }) } ] },
    { code: 'const Fuga = styled(HogeCenter)``', errors: [ { message: messageInheritance({ extended: 'Fuga', matcher: /Center$/ }) } ] },
    { code: 'const Fuga = styled(HogeReel)``', errors: [ { message: messageInheritance({ extended: 'Fuga', matcher: /Reel$/ }) } ] },
    { code: 'const Fuga = styled(HogeSidebar)``', errors: [ { message: messageInheritance({ extended: 'Fuga', matcher: /Sidebar$/ }) } ] },
    { code: 'const Fuga = styled(HogeStack)``', errors: [ { message: messageInheritance({ extended: 'Fuga', matcher: /Stack$/ }) } ] },
    { code: 'const StyledSection = styled.div``', errors: [ { message: messageExtendSectioningContent({ extended: 'StyledSection', expected: 'Section' }) } ] },
    { code: 'const StyledArticle = styled(Hoge)``', errors: [ { message:messageExtendSectioningContent({ extended: 'StyledArticle', expected: 'Article' }) } ] },
    { code: 'const StyledAside = styled(AsideXxxx)``', errors: [ { message: messageExtendSectioningContent({ extended: 'StyledAside', expected: 'Aside' }) } ] },
    { code: 'const HogeHeading = styled(Hoge)``', errors: [ { message: messageProperName({ extended: 'HogeHeading', matcher: /(Heading|^h(1|2|3|4|5|6))$/, suffix: 'Heading', base: 'Hoge' }) } ] },
    { code: 'const HogeHeading = styled.div``', errors: [ { message: messageProperName({ extended: 'HogeHeading', matcher: /(Heading|^h(1|2|3|4|5|6))$/, suffix: 'Heading', base: 'div' }) } ] },
    { code: `import { HogeImg as ImgFuga } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'ImgFuga', matcher: /Img$/, base: 'HogeImg' }) } ] },
    { code: `import { HogeImage as HogeImageFuga } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'HogeImageFuga', matcher: /Image$/, base: 'HogeImage' }) } ] },
    { code: `import { Icon as Hoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'Hoge', matcher: /Icon$/, base: 'Icon' }) } ] },
    { code: 'const Hoge = styled.img``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /(Img|Image|Icon)$/ }) } ] },
    { code: 'const Hoge = styled.svg``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /(Img|Image|Icon)$/ }) } ] },
    { code: 'const Hoge = styled(Icon)``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /Icon$/ }) } ] },
    { code: 'const Hoge = styled(Img)``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /Img$/ }) } ] },
    { code: 'const Hoge = styled(Image)``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /Image$/ }) } ] },
    { code: 'const HogeImage = styled.span``', errors: [ { message: messageProperName({ extended: 'HogeImage', matcher: /(Image|^(img|svg))$/, suffix: 'Image', base: 'span' }) } ] },
    { code: 'const HogeImg = styled(Hoge)``', errors: [ { message: messageProperName({ extended: 'HogeImg', matcher: /(Img|^(img|svg))$/, suffix: 'Img', base: 'Hoge' }) } ] },
    { code: 'const HogeIcon = styled(Hoge)``', errors: [ { message: messageProperName({ extended: 'HogeIcon', matcher: /(Icon|^(img|svg))$/, suffix: 'Icon', base: 'Hoge' }) } ] },
    { code: `import { ComboBox as ComboBoxHoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'ComboBoxHoge', matcher: /Combobox$/, base: 'ComboBox' }) } ] },
    { code: 'const RadioButton = styled(FugaRadioButtonPanel)``', errors: [
      { message: messageInheritance({ extended: 'RadioButton', matcher: /RadioButtonPanel$/ }) },
      { message: messageProperName({ extended: 'RadioButton', matcher: /(B|^b)utton$/, sampleMatcher: /(Button)$/, suffix: 'Button', base: 'FugaRadioButtonPanel' }) },
      { message: messageProperName({ extended: 'RadioButton', matcher: /RadioButton$/, sampleMatcher: /(RadioButton)$/, suffix: 'RadioButton', base: 'FugaRadioButtonPanel' }) }] },
    { code: 'const SideNav = styled(Hoge)``', errors: [ { message: messageExtendSectioningContent({ extended: 'SideNav', expected: 'Nav' }) }, { message: messageProperName({ extended: 'SideNav', matcher: /SideNav$/, sampleMatcher: /(SideNav)$/, suffix: 'SideNav', base: 'Hoge' }) } ] },

    { code: `import { DropdownTrigger as Hoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'Hoge', matcher: /DropdownTrigger$/, base: 'DropdownTrigger' }) } ] },
    { code: `import { DialogTrigger as Hoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'Hoge', matcher: /DialogTrigger$/, base: 'DialogTrigger' }) } ] },
    { code: `import { Button as Hoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'Hoge', matcher: /Button$/, base: 'Button' }) } ] },
    { code: `import { AbcAnchorButton as Hoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'Hoge', matcher: /Button$/, base: 'AbcAnchorButton' }) }, messageImportAs({ extended: 'Hoge', matcher: /AnchorButton$/, base: 'AbcAnchorButton' }) ] },
    { code: `import { Anchor as Hoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'Hoge', matcher: /Anchor$/, base: 'Anchor' }) } ] },
    { code: `import { Link as Hoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'Hoge', matcher: /Link$/, base: 'Link' }) } ] },
    { code: 'const Hoge = styled.a``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /(Anchor|Link)$/ }) } ] },
    { code: 'const Hoge = styled(Button)``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /Button$/ }) } ] },
    { code: 'const Hoge = styled(AnchorButton)``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /Button$/ }) }, { message: messageInheritance({ extended: 'Hoge', matcher: /AnchorButton$/ }) } ] },
    { code: 'const Hoge = styled(ButtonAnchor)``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /Anchor$/ }) } ] },
    { code: 'const Hoge = styled(Anchor)``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /Anchor$/ }) } ] },
    { code: 'const Hoge = styled(Link)``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /Link$/ }) } ] },
    { code: 'const Hoge = styled(DropdownTrigger)``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /DropdownTrigger$/ }) } ] },
    { code: 'const Hoge = styled(DialogTrigger)``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /DialogTrigger$/ }) } ] },

    { code: 'const Hoge = styled(RemoteDialogTrigger)``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: /DialogTrigger$/ }) }, { message: messageInheritance({ extended: 'Hoge', matcher: /RemoteDialogTrigger$/ }) } ] },
    { code: 'const Fuga = styled(RemoteTriggerActionDialog)``', errors: [ { message: messageInheritance({ extended: 'Fuga', matcher: /RemoteTrigger(.+)Dialog$/ }) } ] },
  ]
})
