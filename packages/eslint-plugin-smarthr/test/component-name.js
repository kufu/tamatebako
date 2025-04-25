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
    { code: `const HogeOrderedFugaList = styled.ol` },
    { code: `const HogeOrderedFugaList = styled(HogeOrderedList)` },
    { code: `import { HogeOrderedFugaList } from 'hoge'` },
    { code: `import { OrderedFugaList as HogeOrderedPiyoList } from 'hoge'` },

    { code: `const HogeSelect = styled.select` },
    { code: `const HogeSelect = styled(FugaSelect)` },
    { code: `import { HogeSelect } from 'hoge'` },
    { code: `import { HogeSelect as FugaSelect } from 'hoge'` },
  ],
  invalid: [
    { code: `const HogeOrderedFugaList = styled.ul`, errors: [ { message: messageProperName({ extended: 'HogeOrderedFugaList', matcher: '/(Ordered(.*)List|^ol)$/', suffix: 'OrderedFugaList', base: 'ul' }) } ] },
    { code: `const HogeOrderedFugaList = styled(Hoge)`, errors: [ { message: messageProperName({ extended: 'HogeOrderedFugaList', matcher: '/(Ordered(.*)List|^ol)$/', suffix: 'OrderedFugaList', base: 'Hoge' }) } ] },
    { code: `const Hoge = styled.ol`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/(Ordered(.*)List)$/' }) } ] },
    { code: `import { HogeOrderedFugaList as Fuga } from 'hoge'`, errors: [ { message: messageImportAs({ extended: 'Fuga', matcher: '/(Ordered(.*)List)$/', base: 'HogeOrderedFugaList' }) } ] },

    { code: `const HogeSelect = styled.div`, errors: [ { message: messageProperName({ extended: 'HogeSelect', matcher: '/(S|s)elect$/', suffix: 'Select', base: 'div' }) } ] },
    { code: `const HogeSelect = styled(Hoge)`, errors: [ { message: messageProperName({ extended: 'HogeSelect', matcher: '/(S|s)elect$/', suffix: 'Select', base: 'Hoge' }) } ] },
    { code: `const Hoge = styled.select`, errors: [ { message: messageInheritance({ extended: 'Hoge', matcher: '/(Select)$/' }) } ] },
    { code: `import { HogeSelect as Fuga } from 'hoge'`, errors: [ { message: messageImportAs({ extended: 'Fuga', matcher: '/(Select)$/', base: 'HogeSelect' }) } ] },
  ]
})
