# smarthr/a11y-form-control-in-form

- fieldset, Fieldset, FormControl を利用する場合、form要素で囲むことを促すルールです
- form要素で囲むことで以下のようなメリットがあります
  - 適切にマークアップできるようになり、フォームの範囲などがスクリーンリーダーに正しく伝わる
  - 入力要素にfocusした状態でEnterを押せばフォームをsubmitできる
  - inputのrequired属性、pattern属性を利用した入力チェックをブラウザの機能として実行できる
- smarthr/a11y-input-in-form-control と組み合わせることでより厳密なフォームのマークアップを行えます


## rules

```js
{
  rules: {
    'smarthr/a11y-form-control-in-form': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
// formで囲まれていないためNG
const Sample = () => (
  <>
    <FormControl />
    <HogeFieldset />
    <fieldset />
  </>
)
```

## ✅ Correct

```jsx
// form要素で囲まれているならOK
const Sample1 = () => (
  // form要素と推測されるコンポーネントならOK
  <StyledForm>
    <FormControl />
    <HogeFieldset />
    <fieldset />
  </StyledForm>
)
const Sample2 = () => (
  // as, forwardedAsでform要素にされているコンポーネントの場合もOK
  <Hoge as="form">
    <FormControl />
    <HogeFieldset />
    <fieldset />
  </Hoge>
)
```

```jsx
// Dialogの場合、FormDialog・RemoteTriggerFormDialogで囲めばOK
const SampleFormDialog = () => (
  <FormDialog>
    <FugaFormControl />
  </FormDialog>
)
const SampleRemoteTriggerFormDialog = () => (
  <RemoteTriggerAnyFormDialog>
    <FugaFormControl />
  </RemoteTriggerAnyFormDialog>
)
```

```jsx
// 対象のFormControl、Fieldsetがコンポーネントの一要素の場合、所属しているコンポーネントの名称のsuffixが
// FormControl、Fieldset、もしくはFormControls, Fieldsetsのいずれかの場合OK
const SampleFormControls = () => (
  <>
    <StyledFormControl name="field1" />
    <StyledFormControl name="field2" />
    <StyledFormControl name="field3" />
  </>
)
const SampleFieldset = (props) => (
  <Fieldset {...props}>
    <Any />
  </>
)

// コンポーネント名を上記の様に調整することで
// これらのコンポーネントを利用する別コンポーネントでも正しくチェックが行えます
```
