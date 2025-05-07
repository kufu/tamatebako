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
  ],
  invalid: [
    { code: `import hoge from 'styled-components'`, errors: [ { message: `styled-components をimportする際は、名称が"styled" となるようにしてください。例: "import styled from 'styled-components'"` } ] },

    { code: `const HogeOrderedFugaList = styled.ul`, errors: [ { message: messageProperName({ extended: 'HogeOrderedFugaList', matcher: '/(Ordered(.*)List|^ol)$/', suffix: 'OrderedFugaList', base: 'ul' }) } ] },
    { code: `const HogeOrderedFugaList = styled(Hoge)`, errors: [ { message: messageProperName({ extended: 'HogeOrderedFugaList', matcher: '/(Ordered(.*)List|^ol)$/', suffix: 'OrderedFugaList', base: 'Hoge' }) } ] },
    { code: `const Hoge = styled.ol`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/Ordered(.*)List$/' }) } ] },
    { code: `import { HogeOrderedFugaList as Fuga } from 'hoge'`, errors: [ { message: messageImportAs({ extended: 'Fuga', matcher: '/Ordered(.*)List$/', base: 'HogeOrderedFugaList' }) } ] },

    { code: `const HogeSelect = styled.div`, errors: [ { message: messageProperName({ extended: 'HogeSelect', matcher: '/(S|^s)elect$/', suffix: 'Select', base: 'div' }) } ] },

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
    { code: `import { HogeSideNav as Hoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'Hoge', matcher: '/Nav$/', base: 'HogeSideNav' }) }, { message: messageImportAs({ extended: 'Hoge', matcher: '/SideNav$/', base: 'HogeSideNav' }) } ] },
    { code: 'const AccordionPanelAny = styled(FugaAccordionPanel)``', errors: [ { message: messageInheritance({ extended: 'AccordionPanelAny', matcher: '/AccordionPanel$/' }) } ]  },
    { code: `import { HogeFilterDropdown as Hoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'Hoge', matcher: '/FilterDropdown$/', base: 'HogeFilterDropdown' }) } ] },
    { code: `const Hoge = styled.fieldset`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/Fieldset$/' }) } ] },
    { code: `const Hoge = styled(Fieldsets)`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/Fieldsets$/' }) } ] },
    { code: `const Hoge = styled(FormControls)`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/FormControls$/' }) } ] },
    { code: `const Hoge = styled(FilterDropdown)`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/FilterDropdown$/' }) } ] },

    { code: `import { HogePageHeading as PageHeadingAbc } from './hoge'`, errors: [ { message: `PageHeadingAbcを正規表現 "/Heading$/" がmatchする名称に変更してください。
 - HogePageHeadingが型の場合、'import type { HogePageHeading as PageHeadingAbc }' もしくは 'import { type HogePageHeading as PageHeadingAbc }' のように明示的に型であることを宣言してください。名称変更が不要になります` }, { message: `PageHeadingAbcを正規表現 "/PageHeading$/" がmatchする名称に変更してください。
 - HogePageHeadingが型の場合、'import type { HogePageHeading as PageHeadingAbc }' もしくは 'import { type HogePageHeading as PageHeadingAbc }' のように明示的に型であることを宣言してください。名称変更が不要になります` } ] },
    { code: `import { Heading as HeadingHoge } from './hoge'`, errors: [ { message: `HeadingHogeを正規表現 "/Heading$/" がmatchする名称に変更してください。
 - Headingが型の場合、'import type { Heading as HeadingHoge }' もしくは 'import { type Heading as HeadingHoge }' のように明示的に型であることを宣言してください。名称変更が不要になります` } ] },
    { code: `import { HogeArticle as HogeArticleFuga } from './hoge'`, errors: [ { message: `HogeArticleFugaを正規表現 "/Article$/" がmatchする名称に変更してください。
 - HogeArticleが型の場合、'import type { HogeArticle as HogeArticleFuga }' もしくは 'import { type HogeArticle as HogeArticleFuga }' のように明示的に型であることを宣言してください。名称変更が不要になります` } ] },
    { code: `import { HogeAside as HogeAsideFuga } from './hoge'`, errors: [ { message: `HogeAsideFugaを正規表現 "/Aside$/" がmatchする名称に変更してください。
 - HogeAsideが型の場合、'import type { HogeAside as HogeAsideFuga }' もしくは 'import { type HogeAside as HogeAsideFuga }' のように明示的に型であることを宣言してください。名称変更が不要になります` } ] },
    { code: `import { HogeNav as HogeNavFuga } from './hoge'`, errors: [ { message: `HogeNavFugaを正規表現 "/Nav$/" がmatchする名称に変更してください。
 - HogeNavが型の場合、'import type { HogeNav as HogeNavFuga }' もしくは 'import { type HogeNav as HogeNavFuga }' のように明示的に型であることを宣言してください。名称変更が不要になります` } ] },
    { code: `import { HogeSection as HogeSectionFuga } from './hoge'`, errors: [ { message: `HogeSectionFugaを正規表現 "/Section$/" がmatchする名称に変更してください。
 - HogeSectionが型の場合、'import type { HogeSection as HogeSectionFuga }' もしくは 'import { type HogeSection as HogeSectionFuga }' のように明示的に型であることを宣言してください。名称変更が不要になります` } ] },
    { code: `import { HogeModelessDialog as HogeModelessDialogFuga } from './hoge'`, errors: [ { message: `HogeModelessDialogFugaを正規表現 "/ModelessDialog$/" がmatchする名称に変更してください。
 - HogeModelessDialogが型の場合、'import type { HogeModelessDialog as HogeModelessDialogFuga }' もしくは 'import { type HogeModelessDialog as HogeModelessDialogFuga }' のように明示的に型であることを宣言してください。名称変更が不要になります` } ] },
    { code: 'const Hoge = styled.h1``', errors: [ { message: `Hogeを正規表現 "/PageHeading$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Hoge = styled.h2``', errors: [ { message: `Hogeを正規表現 "/Heading$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Hoge = styled.h3``', errors: [ { message: `Hogeを正規表現 "/Heading$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Hoge = styled.h4``', errors: [ { message: `Hogeを正規表現 "/Heading$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Hoge = styled.h5``', errors: [ { message: `Hogeを正規表現 "/Heading$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Hoge = styled.h6``', errors: [ { message: `Hogeを正規表現 "/Heading$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Fuga = styled(Heading)``', errors: [ { message: `Fugaを正規表現 "/Heading$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Fuga = styled(HogeHeading)``', errors: [ { message: `Fugaを正規表現 "/Heading$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Fuga = styled(HogeHeading).attrs(() => ({ type: "blockTitle" }))``', errors: [ { message: `Fugaを正規表現 "/Heading$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Fuga = styled(HogeArticle)``', errors: [ { message: `Fugaを正規表現 "/Article$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Fuga = styled(HogeAside)``', errors: [ { message: `Fugaを正規表現 "/Aside$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Fuga = styled(HogeNav)``', errors: [ { message: `Fugaを正規表現 "/Nav$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Fuga = styled(HogeSection)``', errors: [ { message: `Fugaを正規表現 "/Section$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Fuga = styled(HogeCenter)``', errors: [ { message: `Fugaを正規表現 "/Center$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Fuga = styled(HogeReel)``', errors: [ { message: `Fugaを正規表現 "/Reel$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Fuga = styled(HogeSidebar)``', errors: [ { message: `Fugaを正規表現 "/Sidebar$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Fuga = styled(HogeStack)``', errors: [ { message: `Fugaを正規表現 "/Stack$/" がmatchする名称に変更してください。` } ] },
    { code: 'const StyledSection = styled.div``', errors: [ { message: `StyledSection は smarthr-ui/Section をextendすることを期待する名称になっています
 - childrenにHeadingを含まない場合、コンポーネントの名称から"Section"を取り除いてください
 - childrenにHeadingを含み、アウトラインの範囲を指定するためのコンポーネントならば、smarthr-ui/Sectionをexendしてください
   - "styled(Xxxx)" 形式の場合、拡張元であるXxxxコンポーネントの名称の末尾に"Section"を設定し、そのコンポーネント内でsmarthr-ui/Sectionを利用してください` } ] },
    { code: 'const StyledArticle = styled(Hoge)``', errors: [ { message: `StyledArticle は smarthr-ui/Article をextendすることを期待する名称になっています
 - childrenにHeadingを含まない場合、コンポーネントの名称から"Article"を取り除いてください
 - childrenにHeadingを含み、アウトラインの範囲を指定するためのコンポーネントならば、smarthr-ui/Articleをexendしてください
   - "styled(Xxxx)" 形式の場合、拡張元であるXxxxコンポーネントの名称の末尾に"Article"を設定し、そのコンポーネント内でsmarthr-ui/Articleを利用してください` } ] },
    { code: 'const StyledAside = styled(AsideXxxx)``', errors: [ { message: `StyledAside は smarthr-ui/Aside をextendすることを期待する名称になっています
 - childrenにHeadingを含まない場合、コンポーネントの名称から"Aside"を取り除いてください
 - childrenにHeadingを含み、アウトラインの範囲を指定するためのコンポーネントならば、smarthr-ui/Asideをexendしてください
   - "styled(Xxxx)" 形式の場合、拡張元であるXxxxコンポーネントの名称の末尾に"Aside"を設定し、そのコンポーネント内でsmarthr-ui/Asideを利用してください` } ] },
    { code: 'const StyledHeading = styled(Hoge)``', errors: [ { message: `StyledHeading は /(Heading|^h(1|2|3|4|5|6))$/ にmatchする名前のコンポーネントを拡張することを期待している名称になっています
 - StyledHeading の名称の末尾が"Heading" という文字列ではない状態にしつつ、"Hoge"を継承していることをわかる名称に変更してください
 - もしくは"Hoge"を"StyledHeading"の継承元であることがわかるような名称に変更するか、適切な別コンポーネントに差し替えてください
   - 修正例1: const StyledXxxx = styled(Hoge)
   - 修正例2: const StyledHeadingXxxx = styled(Hoge)
   - 修正例3: const StyledHeading = styled(XxxxHeading)` } ] },
    { code: 'const StyledHeading = styled.div``', errors: [ { message: `StyledHeading は /(Heading|^h(1|2|3|4|5|6))$/ にmatchする名前のコンポーネントを拡張することを期待している名称になっています
 - StyledHeading の名称の末尾が"Heading" という文字列ではない状態にしつつ、"div"を継承していることをわかる名称に変更してください
 - もしくは"div"を"StyledHeading"の継承元であることがわかるような適切なタグや別コンポーネントに差し替えてください
   - 修正例1: const StyledXxxx = styled.div
   - 修正例2: const StyledHeadingXxxx = styled.div
   - 修正例3: const StyledHeading = styled(XxxxHeading)` } ] },
    { code: `import { HogeImg as ImgFuga } from './hoge'`, errors: [ { message: `ImgFugaを正規表現 "/Img$/" がmatchする名称に変更してください。
 - HogeImgが型の場合、'import type { HogeImg as ImgFuga }' もしくは 'import { type HogeImg as ImgFuga }' のように明示的に型であることを宣言してください。名称変更が不要になります` } ] },
    { code: `import { HogeImage as HogeImageFuga } from './hoge'`, errors: [ { message: `HogeImageFugaを正規表現 "/Image$/" がmatchする名称に変更してください。
 - HogeImageが型の場合、'import type { HogeImage as HogeImageFuga }' もしくは 'import { type HogeImage as HogeImageFuga }' のように明示的に型であることを宣言してください。名称変更が不要になります` } ] },
    { code: `import { Icon as Hoge } from './hoge'`, errors: [ { message: `Hogeを正規表現 "/Icon$/" がmatchする名称に変更してください。
 - Iconが型の場合、'import type { Icon as Hoge }' もしくは 'import { type Icon as Hoge }' のように明示的に型であることを宣言してください。名称変更が不要になります` } ] },
    { code: 'const Hoge = styled.img``', errors: [ { message: `Hogeを正規表現 "/(Img|Image|Icon)$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Hoge = styled.svg``', errors: [ { message: `Hogeを正規表現 "/(Img|Image|Icon)$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Hoge = styled(Icon)``', errors: [ { message: `Hogeを正規表現 "/Icon$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Hoge = styled(Img)``', errors: [ { message: `Hogeを正規表現 "/Img$/" がmatchする名称に変更してください。` } ] },
    { code: 'const Hoge = styled(Image)``', errors: [ { message: `Hogeを正規表現 "/Image$/" がmatchする名称に変更してください。` } ] },
    { code: 'const StyledImage = styled.span``', errors: [ { message: `StyledImage は /(Image|^(img|svg))$/ にmatchする名前のコンポーネントを拡張することを期待している名称になっています
 - StyledImage の名称の末尾が"Image" という文字列ではない状態にしつつ、"span"を継承していることをわかる名称に変更してください
 - もしくは"span"を"StyledImage"の継承元であることがわかるような適切なタグや別コンポーネントに差し替えてください
   - 修正例1: const StyledXxxx = styled.span
   - 修正例2: const StyledImageXxxx = styled.span
   - 修正例3: const StyledImage = styled(XxxxImage)` } ] },
    { code: 'const StyledImg = styled(Hoge)``', errors: [ { message: `StyledImg は /(Img|^(img|svg))$/ にmatchする名前のコンポーネントを拡張することを期待している名称になっています
 - StyledImg の名称の末尾が"Img" という文字列ではない状態にしつつ、"Hoge"を継承していることをわかる名称に変更してください
 - もしくは"Hoge"を"StyledImg"の継承元であることがわかるような名称に変更するか、適切な別コンポーネントに差し替えてください
   - 修正例1: const StyledXxxx = styled(Hoge)
   - 修正例2: const StyledImgXxxx = styled(Hoge)
   - 修正例3: const StyledImg = styled(XxxxImg)` } ] },
    { code: 'const FugaIcon = styled(Fuga)``', errors: [ { message: `FugaIcon は /(Icon|^(img|svg))$/ にmatchする名前のコンポーネントを拡張することを期待している名称になっています
 - FugaIcon の名称の末尾が"Icon" という文字列ではない状態にしつつ、"Fuga"を継承していることをわかる名称に変更してください
 - もしくは"Fuga"を"FugaIcon"の継承元であることがわかるような名称に変更するか、適切な別コンポーネントに差し替えてください
   - 修正例1: const FugaXxxx = styled(Fuga)
   - 修正例2: const FugaIconXxxx = styled(Fuga)
   - 修正例3: const FugaIcon = styled(XxxxIcon)` } ] },
    { code: `import { ComboBox as ComboBoxHoge } from './hoge'`, errors: [ { message: `ComboBoxHogeを正規表現 "/Combobox$/" がmatchする名称に変更してください。
 - ComboBoxが型の場合、'import type { ComboBox as ComboBoxHoge }' もしくは 'import { type ComboBox as ComboBoxHoge }' のように明示的に型であることを宣言してください。名称変更が不要になります` } ] },
    { code: 'const RadioButton = styled(FugaRadioButtonPanel)``', errors: [
      { message: `RadioButtonを正規表現 "/RadioButtonPanel$/" がmatchする名称に変更してください。` },
      { message: `RadioButton は /(B|^b)utton$/ にmatchする名前のコンポーネントを拡張することを期待している名称になっています
 - RadioButton の名称の末尾が"Button" という文字列ではない状態にしつつ、"FugaRadioButtonPanel"を継承していることをわかる名称に変更してください
 - もしくは"FugaRadioButtonPanel"を"RadioButton"の継承元であることがわかるような名称に変更するか、適切な別コンポーネントに差し替えてください
   - 修正例1: const RadioXxxx = styled(FugaRadioButtonPanel)
   - 修正例2: const RadioButtonXxxx = styled(FugaRadioButtonPanel)
   - 修正例3: const RadioButton = styled(XxxxButton)` },
      { message: `RadioButton は /RadioButton$/ にmatchする名前のコンポーネントを拡張することを期待している名称になっています
 - RadioButton の名称の末尾が"RadioButton" という文字列ではない状態にしつつ、"FugaRadioButtonPanel"を継承していることをわかる名称に変更してください
 - もしくは"FugaRadioButtonPanel"を"RadioButton"の継承元であることがわかるような名称に変更するか、適切な別コンポーネントに差し替えてください
   - 修正例1: const Xxxx = styled(FugaRadioButtonPanel)
   - 修正例2: const RadioButtonXxxx = styled(FugaRadioButtonPanel)
   - 修正例3: const RadioButton = styled(XxxxRadioButton)` }] },
    { code: 'const SideNav = styled(Hoge)``', errors: [ { message: `SideNav は smarthr-ui/Nav をextendすることを期待する名称になっています
 - childrenにHeadingを含まない場合、コンポーネントの名称から"Nav"を取り除いてください
 - childrenにHeadingを含み、アウトラインの範囲を指定するためのコンポーネントならば、smarthr-ui/Navをexendしてください
   - "styled(Xxxx)" 形式の場合、拡張元であるXxxxコンポーネントの名称の末尾に"Nav"を設定し、そのコンポーネント内でsmarthr-ui/Navを利用してください` }, { message: `SideNav は /SideNav$/ にmatchする名前のコンポーネントを拡張することを期待している名称になっています
 - SideNav の名称の末尾が"SideNav" という文字列ではない状態にしつつ、"Hoge"を継承していることをわかる名称に変更してください
 - もしくは"Hoge"を"SideNav"の継承元であることがわかるような名称に変更するか、適切な別コンポーネントに差し替えてください
   - 修正例1: const Xxxx = styled(Hoge)
   - 修正例2: const SideNavXxxx = styled(Hoge)
   - 修正例3: const SideNav = styled(XxxxSideNav)` } ] },
  ]
})
