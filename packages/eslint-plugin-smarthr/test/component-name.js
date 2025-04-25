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

    { code: `const HogeSelect = styled.select` },
    { code: `const HogeSelect = styled(FugaSelect)` },
    { code: `import { HogeSelect as FugaSelect } from 'hoge'` },

    { code: `const HogeAnchor = styled.a` },
    { code: `const HogeLink = styled.a` },
    { code: `const HogeAnchor = styled(FugaAnchor)` },
    { code: `const HogeLink = styled(FugaLink)` },
    { code: `import { HogeAnchor as FugaAnchor } from 'hoge'` },
    { code: `import { HogeLink as FugaLink } from 'hoge'` },

    { code: `import { SmartHRLogo as HogeSmartHRLogo } from './hoge'` },
    { code: `import { AbcButton as StyledAbcButton } from './hoge'` },
    { code: `import { FugaText as HogeFugaText } from './hoge'` },
    { code: `import { FugaMessage as HogeFugaMessage } from './hoge'` },
    { code: 'const HogeButton = styled.button``' },
    { code: 'const HogeButton = styled(Button)``' },
    { code: 'const FugaSmartHRLogo = styled(SmartHRLogo)``' },
    { code: 'const FugaText = styled(HogeText)(() => ``)' },
    { code: 'const FugaMessage = styled(HogeMessage)(() => ``)' },
  ],
  invalid: [
    { code: `import hoge from 'styled-components'`, errors: [ { message: `styled-components をimportする際は、名称が"styled" となるようにしてください。例: "import styled from 'styled-components'"` } ] },

    { code: `const HogeOrderedFugaList = styled.ul`, errors: [ { message: messageProperName({ extended: 'HogeOrderedFugaList', matcher: '/(Ordered(.*)List|^ol)$/', suffix: 'OrderedFugaList', base: 'ul' }) } ] },
    { code: `const HogeOrderedFugaList = styled(Hoge)`, errors: [ { message: messageProperName({ extended: 'HogeOrderedFugaList', matcher: '/(Ordered(.*)List|^ol)$/', suffix: 'OrderedFugaList', base: 'Hoge' }) } ] },
    { code: `const Hoge = styled.ol`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/Ordered(.*)List$/' }) } ] },
    { code: `import { HogeOrderedFugaList as Fuga } from 'hoge'`, errors: [ { message: messageImportAs({ extended: 'Fuga', matcher: '/Ordered(.*)List$/', base: 'HogeOrderedFugaList' }) } ] },

    { code: `const HogeSelect = styled.div`, errors: [ { message: messageProperName({ extended: 'HogeSelect', matcher: '/(S|s)elect$/', suffix: 'Select', base: 'div' }) } ] },
    { code: `const HogeSelect = styled(Hoge)`, errors: [ { message: messageProperName({ extended: 'HogeSelect', matcher: '/(S|s)elect$/', suffix: 'Select', base: 'Hoge' }) } ] },
    { code: `const Hoge = styled.select`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/Select$/' }) } ] },
    { code: `import { HogeSelect as Fuga } from 'hoge'`, errors: [ { message: messageImportAs({ extended: 'Fuga', matcher: '/Select$/', base: 'HogeSelect' }) } ] },

    { code: `const HogeAnchor = styled.div`, errors: [ { message: messageProperName({ extended: 'HogeAnchor', matcher: '/(Anchor|^a)$/', suffix: 'Anchor', base: 'div' }) } ] },
    { code: `const HogeLink = styled.div`, errors: [ { message: messageProperName({ extended: 'HogeLink', matcher: '/(Link|^a)$/', suffix: 'Link', base: 'div' }) } ] },
    { code: `const HogeAnchor = styled(Hoge)`, errors: [ { message: messageProperName({ extended: 'HogeAnchor', matcher: '/(Anchor|^a)$/', suffix: 'Anchor', base: 'Hoge' }) } ] },
    { code: `const HogeLink = styled(Hoge)`, errors: [ { message: messageProperName({ extended: 'HogeLink', matcher: '/(Link|^a)$/', suffix: 'Link', base: 'Hoge' }) } ] },
    { code: `const Hoge = styled.a`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/(Anchor|Link)$/' }) } ] },
    { code: `import { HogeAnchor as Fuga } from 'hoge'`, errors: [ { message: messageImportAs({ extended: 'Fuga', matcher: '/Anchor$/', base: 'HogeAnchor' }) } ] },
    { code: `import { HogeLink as Fuga } from 'hoge'`, errors: [ { message: messageImportAs({ extended: 'Fuga', matcher: '/Link$/', base: 'HogeLink' }) } ] },

    { code: `import { SmartHRLogo as SmartHRLogoHoge } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'SmartHRLogoHoge', matcher: '/SmartHRLogo$/', base: 'SmartHRLogo' }) } ] },
    { code: `import { AbcButton as AbcButtonFuga } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'AbcButtonFuga', matcher: '/Button$/', base: 'AbcButton' }) } ] },
    { code: `import { FugaText as FugaTextFuga } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'FugaTextFuga', matcher: '/Text$/', base: 'FugaText' }) } ] },
    { code: `import { FugaMessage as FugaMessageFuga } from './hoge'`, errors: [ { message: messageImportAs({ extended: 'FugaMessageFuga', matcher: '/Message$/', base: 'FugaMessage' }) } ] },
    { code: 'const Hoge = styled.button``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/Button$/' }) } ]  },
    { code: 'const Hoge = styled(Button)``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/Button$/' }) } ]  },
    { code: 'const Fuga = styled(SmartHRLogo)``', errors: [ { message: messageInheritance({ extended: 'Fuga', matcher: '/SmartHRLogo$/' }) } ]  },
    { code: 'const Hoge = styled(Text)``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/Text$/' }) } ]  },
    { code: 'const Hoge = styled(HogeMessage)``', errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/Message$/' }) } ]  },
    { code: 'const HogeButton = styled.div``', errors: [ { message: messageProperName({ extended: 'HogeButton', matcher: '/(B|^b)utton$/', suffix: 'Button', base: 'div' }) } ]  },
  ]
})
