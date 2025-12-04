const rule = require('../rules/best-practice-for-async-current-target')
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

const ERRORMESSAGE_NORMAL = `currentTargetはイベント処理中以外に参照するとnullになる場合があります。イベントハンドラ用関数のスコープ直下でcurrentTarget、もしくはcurrentTarget以下の属性を含む値を変数として宣言してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-async-current-target
 - React/useStateのsetterは第一引数に関数を渡すと非同期処理になるためこの問題が起きる可能性があります
 - イベントハンドラ内で関数を定義すると参照タイミングがずれる可能性があるため、イベントハンドラ直下のスコープ内にcurrentTarget関連の参照を変数に残すことをオススメします
 - NG例:
    const onSelect = (e) => {
      setItem((current) => ({ ...current, value: e.currentTarget.value }))
    }
 - 修正例:
    const onSelect = (e) => {
      const value = e.currentTarget.value
      setItem((current) => ({ ...current, value }))
    }`
const ERRORMESSAGE_AWAIT = `currentTargetはイベント処理中以外に参照するとnullになる場合があります。awaitの宣言より前にcurrentTarget、もしくはcurrentTarget以下の属性を含む値を変数として宣言してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-async-current-target
 - NG例:
    const onChange = async (e) => {
      await hoge()
      fuga(e.currentTarget.value)
    }
 - 修正例:
    const onChange = async (e) => {
      const value = e.currentTarget.value
      await hoge()
      fuga(value)
    }`

ruleTester.run('best-practice-for-async-current-target', rule, {
  valid: [
    { code: `(e) => { setValue(e.currentTarget) }` },
    { code: `const action = function(e) { setValue(e.currentTarget) }` },
    { code: `async (e) => { const value = e.currentTarget.value; await any(); action(value) }` },
    { code: `const action = async function(e) { const value = e.currentTarget.value; await any(); action(value) }` },
  ],
  invalid: [
    { code: `(e) => { setItem(() => { e.currentTarget }) }`, errors: [ { message: ERRORMESSAGE_NORMAL } ] },
    { code: `(function(e) { setItem(() => { e.currentTarget }) })`, errors: [ { message: ERRORMESSAGE_NORMAL } ] },
    { code: `async (e) => { await any();const value = e.currentTarget.value; action(value) }`, errors: [ { message: ERRORMESSAGE_AWAIT } ] },
    { code: `const action = async function(e) { await any();const value = e.currentTarget.value;action(value) }`, errors: [ { message: ERRORMESSAGE_AWAIT } ] },
    { code: `async (e) => { await any(e.currentTarget.value); }`, errors: [ { message: ERRORMESSAGE_AWAIT } ] },
  ]
})
