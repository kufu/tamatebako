# smarthr/a11y-form-control-in-form

fieldset, Fieldset, FormControl を利用する場合、form要素で囲むことを促すルールです。  
このルールは[smarthr/a11y-input-in-form-control](https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-input-in-form-control) と組み合わせることでより厳密なチェックを行えます。

## なぜform要素で囲むことを推奨するのか

form要素で対象コンポーネントを囲むことで `formの範囲が明確になる` 以外に以下のメリットが存在します。

### 入力要素にfocusした状態でEnterキーなどでフォームを送信(submit)できる

ブラウザの標準機能として入力要素にfocusした状態でEnterキー、またはそれに準ずるキーボード操作などをした場合、formを送信(submit)することができるようになります。  
この機能は**ブラウザの標準機能として存在するため、submitできることを期待する利用者は多い**ため、form要素を利用したマークアップをすることを推奨しています。

状況によっては**ユーザーの誤操作を防止するためEnterなどでsubmitさせたくない**場合もありえますが、この挙動は**ブラウザの標準機能のため、無効にする場合は慎重に判断してください。**

### input要素のrequired属性、pattern属性を利用した入力チェックが有効になる

input要素のrequired属性、pattern属性はform要素で囲んでいない場合でも設定自体は出来ますが、submit時のチェック自体は発火しません。  
これらの属性はform要素で囲まれる事により、はじめて有効になります。

ブラウザの機能として、入力チェックを行うため、jsなどで同等の機能を実装した場合と比較して非常に高速なチェックが可能になるため、導入を検討してください。

## FormControl、Fieldsetを内包するコンポーネントの名称について

FormControl・Fieldsetを内包するコンポーネントを命名する場合、名称のsuffixにFormControl、Fieldset、もしくはFormControls, Fieldsetsのいずれかを設定してください。

```jsx
// FormControl、Fieldsetが内包されるコンポーネントの場合、名称のsuffixを
// FormControl、Fieldset、もしくはFormControls, Fieldsetsのいずれかにする
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
```

上記ルールは **条件によってはFormControl, Fieldsetが表示されない場合がある** 際にも適用してください。

```jsx
// AnyFieldsetは条件次第で表示されない場合があるが、それとは無関係にコンポーネント名は `XxxFieldset` とすること
const SampleFieldset = () => (
  <>
    <Hoge />
    {condition && (
      <AnyFieldset  />
    )}
    <Fuga name="field3" />
  </>
)
```

このような名称にすることで、対象のコンポーネントがFormの入力要素関連のコンポーネントであることが明示され、lintによるチェックが正常に動作するようになります。  
名称を決定するルールは以下の通りです。

### Fieldsetを含まず、FormControlを単一で含む場合 -> `XxxFormControl`

```jsx
const SampleFormControl = (props) => (
  <FormControl {...props} title="Sample" />
)
```

### FormControlを含まず、Fieldsetを単一で含む場合 -> `XxxFieldset`

```jsx
const SampleFieldset = (props) => (
  <Fieldset {...props} title="Sample" />
)
```

### Fieldsetを含まず、FormControlを複数含む可能性がある場合 -> `XxxFormControls`

```jsx
const SampleFormControls = () => (
  <>
    <AnyFormControl name="field1" />
    <AnyFormControl name="field2" />
    <AnyFormControl name="field3" />
  </>
)
```

### FormControlを含まず、Fieldsetを複数含む可能性がある場合 -> `XxxFieldsets`

```jsx
const SampleFieldsets = () => (
  <>
    <AnyFieldset name="field1" />
    <AnyFieldset name="field2" />
    <AnyFieldset name="field3" />
  </>
)
```

### FormControl, Fieldsetが複数混ざって存在する場合 -> `XxxFieldsets`

```jsx
const SampleFieldsets = () => (
  <>
    <AnyFormControl name="field1" />
    <AnyFieldset name="field2" />
    <AnyFormControl name="field3" />
  </>
)
```

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

```jsx
// FormControl、Fieldsetを内包するコンポーネントの場合、名称のsuffixが
// FormControl、Fieldset、もしくはFormControls, Fieldsetsのいずれかである必要があるためNG
const Sample1 = () => (
  <>
    <StyledFormControl name="field1" />
    <StyledFormControl name="field2" />
    <StyledFormControl name="field3" />
  </>
)
const Sample2 = (props) => (
  <Fieldset {...props}>
    <Any />
  </>
)

// コンポーネント名を上記の様に調整することで
// これらのコンポーネントを利用する別コンポーネントでも正しくチェックが行えます
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
// FormControl、Fieldsetを内包するコンポーネントの場合、名称のsuffixが
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
