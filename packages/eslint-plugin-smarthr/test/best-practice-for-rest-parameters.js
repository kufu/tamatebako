const rule = require('../rules/best-practice-for-rest-parameters')
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

const DETAIL_LINK = `
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-rest-parameters`
const ERROR_REST_NAME = `残余引数には /(^r|R)est$/ とマッチする名称を指定してください${DETAIL_LINK}`
const ERROR_NOT_REST_NAME = `残余引数以外に /(^r|R)est$/ とマッチする名称を利用しないでください${DETAIL_LINK}
 - 残余引数(rest parameters)と混同する可能性があるため別の名称に修正してください`
const ERROR_REST_CHILD_REF = `残余引数内の属性を参照しないでください${DETAIL_LINK}`
const redundantPassthroughMessage = (propName, restName) => `"${propName}"は変更されずに残余引数(${restName})と同じ箇所にそのまま渡されているだけのため、分割代入せず${restName}からまとめて渡すことができます${DETAIL_LINK}`

ruleTester.run('best-practice-for-rest-parameters', rule, {
  valid: [
    { code: `const hoge = (...rest) => {}` },
    { code: `const hoge = (a, b, ...rest) => {}` },
    { code: `const hoge = ({ a, b, ...anyRest }) => {}` },
    { code: `const hoge = (props) => {}` },
    { code: `const props = {}` },
    { code: `const hoge = { fuga: rest }` },
    { code: `const hoge = hogeRest` },
    { code: `const hoge = hoge.rest.fuga` },
    { code: `const hoge = { ...anyRest }` },
    { code: `const hoge = [rest]` },
    { code: `hoge(fugaRest)` },
    { code: `<Any {...rest} />` },
    { code: `
      const removeKey = (key, obj) => {
        const { [key]: _removed, ...rest } = obj
        return rest
      }
    ` },
    { code: `const removeIdAttr = ({ id: _id, ...rest }) => rest` },
    // in演算子のleftにrestがあるケースは検知しない（rightのみ検知）
    { code: `const hoge = (...rest) => { if (rest in obj) return null }` },

    // 冗長な受け渡しチェック: propAが他でも使われている場合は対象外
    { code: `
      const Component = ({ a, b, abc, ...rest }) => {
        if (abc) {
          return <Children {...rest} abc={abc} />
        }
      }
    ` },
    // リネームされている場合は対象外
    { code: `const hoge = ({ a: b, ...rest }) => <Foo {...rest} a={b} />` },
    // デフォルト値がある場合は対象外
    { code: `const hoge = ({ a = false, ...rest }) => <Foo {...rest} a={a} />` },
    // {...rest}とpropA={propA}が別のJSX要素にある場合は対象外
    { code: `
      const hoge = ({ a, ...rest }) => (
        <Parent {...rest}>
          <Child a={a} />
        </Parent>
      )
    ` },
    // オブジェクト版: propAが他でも使われている場合は対象外
    { code: `
      const hoge = ({ a, ...rest }) => {
        if (a) return { ...rest, a }
      }
    ` },
    // restが複数箇所で使われている場合、分割代入をやめると別の箇所にも値が流れるため対象外
    { code: `const Th = ({ sort, onSort, ...rest }) => sort ? <SortableTh {...rest} sort={sort} onSort={onSort} /> : <ActualTh {...rest} />` },
    { code: `
      const hoge = ({ a, ...rest }) => {
        log(rest)
        return { ...rest, a }
      }
    ` },
    // keyはスプレッドに含めるとReactが警告を出すため対象外
    { code: `const List = ({ items }) => items.map(({ key, ...rest }) => <Item {...rest} key={key} />)` },
    // rest以外のスプレッドが同じ箇所にある場合、上書き順が変わる可能性があるため対象外
    { code: `const hoge = ({ icon, ...rest }) => <Text {...rest} {...typography} icon={icon} />` },
    { code: `const hoge = ({ a, ...rest }) => ({ ...rest, ...other, a })` },
    // restが別スコープでシャドーイングされている場合、名前が同じでも別の変数のため対象外(JSX)
    { code: `
      const hoge = ({ a, ...rest }) => {
        return items.map(({ x, ...rest }) => <Foo {...rest} a={a} />)
      }
    ` },
    // restが別スコープでシャドーイングされている場合、名前が同じでも別の変数のため対象外(オブジェクト)
    { code: `
      const hoge = ({ a, ...rest }) => {
        return items.map(({ x, ...rest }) => ({ ...rest, a }))
      }
    ` },
  ],
  invalid: [
    { code: `const hoge = ({ ...rest }) => {}`, errors: [ { message: `意味のない残余引数のため、単一の引数に変更してください${DETAIL_LINK}` } ] },
    { code: `const hoge = (a, b, ...any) => {}`, errors: [ { message: ERROR_REST_NAME } ] },
    { code: `const hoge = ({ a, b, ...restHoge }) => {}`, errors: [ { message: ERROR_REST_NAME } ] },
    { code: `const hoge = (rest) => {}`, errors: [ { message: ERROR_NOT_REST_NAME } ] },
    { code: `const hogeRest = {}`, errors: [ { message: ERROR_NOT_REST_NAME } ] },
    { code: `const hoge = (a, b, rest) => {}`, errors: [ { message: ERROR_NOT_REST_NAME } ] },
    { code: `const hoge = ({ a: anyRest, b }) => {}`, errors: [ { message: ERROR_NOT_REST_NAME } ] },
    { code: `const rest = {}`, errors: [ { message: ERROR_NOT_REST_NAME } ] },
    { code: `const hoge = { hogeRest }`, errors: [ { message: ERROR_NOT_REST_NAME } ] },
    { code: `const hoge = { rest: fuga }`, errors: [ { message: ERROR_NOT_REST_NAME } ] },
    { code: `const hoge = rest.hoge`, errors: [ { message: ERROR_REST_CHILD_REF } ] },
    { code: `const hoge = anyRest.hoge.fuga`, errors: [ { message: ERROR_REST_CHILD_REF } ] },
    { code: `const { any } = rest`, errors: [ { message: ERROR_REST_CHILD_REF } ] },
    // in演算子の右辺も内部属性へのアクセスなのでエラー
    { code: `const hoge = (...rest) => { if ('userMap' in rest) return null }`, errors: [ { message: ERROR_REST_CHILD_REF } ] },
    { code: `const hoge = ({ id, ...rest }) => 'key' in rest`, errors: [ { message: ERROR_REST_CHILD_REF } ] },
    // in演算子とプロパティアクセスの両方でエラー（2つ）
    { code: `const hoge = (...rest) => { if ('userMap' in rest) return rest.userMap }`, errors: [ { message: ERROR_REST_CHILD_REF }, { message: ERROR_REST_CHILD_REF } ] },
    // 極端なケース: rest in rest（rightのrestのみエラー）
    { code: `const hoge = (...rest) => { if (rest in rest) return null }`, errors: [ { message: ERROR_REST_CHILD_REF } ] },
    // hogeRest in rest（rightのrestにエラー）
    { code: `const hoge = (...rest) => { if (hogeRest in rest) return null }`, errors: [ { message: ERROR_REST_CHILD_REF } ] },
    // rest in hogeRest（rightのhogeRestにエラー）
    { code: `const hoge = ({ id, ...rest }) => { if (rest in hogeRest) return null }`, errors: [ { message: ERROR_REST_CHILD_REF } ] },

    // 冗長な受け渡し: JSX属性として同じ要素にそのまま渡しているだけ
    {
      code: `const hoge = ({ children, fixedHead, ...rest }) => (<ScrollerSwitcher {...rest} fixedHead={fixedHead}>{children}</ScrollerSwitcher>)`,
      errors: [ { message: redundantPassthroughMessage('fixedHead', 'rest') } ],
    },
    // 自動修正(fix: true)
    // HINT: JSX属性はカンマ区切りではないため、削除後に前後の空白が1つ残る
    // (フォーマットはprettier/oxfmt任せのため許容。既存ルールの方針と同様)
    {
      code: `const hoge = ({ children, fixedHead, ...rest }) => (<ScrollerSwitcher {...rest} fixedHead={fixedHead}>{children}</ScrollerSwitcher>)`,
      output: `const hoge = ({ children, ...rest }) => (<ScrollerSwitcher {...rest} >{children}</ScrollerSwitcher>)`,
      options: [{ fix: true }],
      errors: [ { message: redundantPassthroughMessage('fixedHead', 'rest') } ],
    },
    // fix未指定(デフォルトfalse)の場合は自動修正されない
    {
      code: `const hoge = ({ a, ...rest }) => <Foo {...rest} a={a} />`,
      errors: [ { message: redundantPassthroughMessage('a', 'rest') } ],
    },
    // 分割代入の先頭のプロパティの場合の自動修正(カンマの扱い確認)
    {
      code: `const hoge = ({ a, b, ...rest }) => <Foo {...rest} a={a} />`,
      output: `const hoge = ({ b, ...rest }) => <Foo {...rest}  />`,
      options: [{ fix: true }],
      errors: [ { message: redundantPassthroughMessage('a', 'rest') } ],
    },
    // オブジェクト版: shorthandでの冗長な受け渡し
    {
      code: `const hoge = ({ a, ...rest }) => ({ ...rest, a })`,
      output: `const hoge = ({ ...rest }) => ({ ...rest })`,
      options: [{ fix: true }],
      errors: [ { message: redundantPassthroughMessage('a', 'rest') } ],
    },
    // オブジェクト版: 明示的な `a: a` での冗長な受け渡し
    {
      code: `const hoge = ({ a, ...rest }) => ({ ...rest, a: a })`,
      output: `const hoge = ({ ...rest }) => ({ ...rest })`,
      options: [{ fix: true }],
      errors: [ { message: redundantPassthroughMessage('a', 'rest') } ],
    },
    // 複数プロパティが同時に冗長な場合、それぞれ検知される
    // HINT: 1回のfixパスでは片方のみ修正される(ESLintは1つの報告内の複数範囲の修正を
    // 1つの結合された範囲として扱うため、離れた2箇所を同時に書き換える報告同士が重複と
    // みなされる)。`eslint --fix`は複数パス実行するため実運用では問題にならない
    {
      code: `const hoge = ({ a, b, ...rest }) => <Foo {...rest} a={a} b={b} />`,
      errors: [ { message: redundantPassthroughMessage('a', 'rest') }, { message: redundantPassthroughMessage('b', 'rest') } ],
    },
  ]
})

