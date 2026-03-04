# smarthr/a11y-prohibit-checkbox-or-radio-in-table-cell

テーブルセル（Th, Td）内に直接 Checkbox, RadioButton を配置することを禁止するルールです。<br />
SmartHR UI には、デフォルトでアクセシブルネームを設定する TdCheckbox, ThCheckbox, TdRadioButton といったより適切なコンポーネントが用意されています。

## なぜテーブルセル内に直接Checkbox, RadioButtonを配置してはならないのか

テーブルセル内に設置するCheckbox, RadioButtonはUIの関係上、可視ラベルが設定されない可能性が高く、a11yの問題になる場合があるためです。

```jsx
// Table内のCheckbox使用例
<Table>
  <thead>
    <tr>
      <Th><Checkbox /></Th>
      <Th>名前</Th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <Td><Checkbox /></Td>
      <Td>労務 太郎</Td>
    </tr>
    <tr>
      <Td><Checkbox /></Td>
      <Td>労務 次郎</Td>
    </tr>
  </tbody>
</Table>
```

上記例の場合、各Checkboxにa11y nameが設定されておらず、スクリーンリーダーなどのユーザーにとってはなんのためのCheckboxが正しく伝えられない可能性があります。<br />
この問題を解決するためには適切に不可視ラベルを設定する必要がありますが、thead内、tbody内でcheckboxの役割が違うため、それぞれ異なる設定方法が必要です。

- tbody内のCheckboxの場合
  - Checkboxが存在するtr要素内からその行を一意に特定できるテキストが設定されているものをaria-labelledby属性を利用してa11y nameを設定します
  - aria-labelledby属性は**設定した要素と参照対象になった要素のひも付きも表せる**ため、今回の様な場合に使用することが推奨されます
- thead内のCheckboxの場合
  - Table内のすべての行に対してcheckする処理を行う一括処理のためCheckboxであることから **一括処理することがわかるテキスト** を設定する必要があります
  - 同tr要素内には上記条件に合致するテキストは存在しないため、aria-label属性を利用してa11y nameを設定します

上記を実際のコードに反映すると以下のようになります。

```jsx
// Table内のCheckboxに適切にa11y nameを設定した場合
<Table>
  <thead>
    <tr>
      <Th><Checkbox aria-label="すべての項目を選択/解除" /></Th>
      <Th>名前</Th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <Td><Checkbox aria-labelledby="name-1" /></Td>
      <Td id="name-1">労務 太郎</Td>
    </tr>
    <tr>
      <Td><Checkbox aria-labelledby="name-2" /></Td>
      <Td id="name-2">労務 次郎</Td>
    </tr>
  </tbody>
</Table>
```

上記のような記述を毎回適切に設定すればa11y的な問題発生しませんが、簡略化・使いやすくするためTdCheckbox, ThCheckbox, TdRadioButtonが用意されています。

```jsx
// ThCheckbox, TdCheckboxを利用した例
<Table>
  <thead>
    <tr>
      {/* aria-labelがデフォルトで設定されており、一括チェックであることがわかる */}
      <ThCheckbox />
      <Th>名前</Th>
    </tr>
  </thead>
  <tbody>
    <tr>
      {/* aria-labelledbyが必須属性になっており、設定ミスが防げる */}
      <TdCheckbox aria-labelledby="name-1" />
      <Td id="name-1">労務 太郎</Td>
    </tr>
    <tr>
      <TdCheckbox aria-labelledby="name-2" />
      <Td id="name-2">労務 次郎</Td>
    </tr>
  </tbody>
</Table>
```

### aria-labelledby属性で複数の要素を参照する場合

aria-labelledby属性には複数の要素のidを設定することが可能性です。

```jsx
<Table>
  <thead>
    <tr>
      <ThCheckbox />
      <Th>従業員ID</Th>
      <Th>名前</Th>
      <Th>概要</Th>
      <Th>操作</Th>
    </tr>
  </thead>
  <tbody>
    <tr>
      {/* a11y nameは smarthr-001 労務 太郎 */}
      <TdCheckbox aria-labelledby="id-1 name-1" />
      <Th id="id-1">smarthr-001</Th>
      <Td id="name-1">労務 太郎</Td>
      <Td>労務 太郎は......</Td>
      <Td><Button>編集</Button></Td>
    </tr>
    <tr>
      {/* a11y nameは smarthr-002 労務 次郎 */}
      <TdCheckbox aria-labelledby="id-2 name-2" />
      <Th id="id-2">smarthr-002</Th>
      <Td id="name-2">労務 次郎</Td>
      <Td>労務 次郎は......</Td>
      <Td><Button>編集</Button></Td>
    </tr>
  </tbody>
</Table>
```

aria-labelledbyに複数の要素を設定する場合、"elm1 elm2" のように空白で区切るようにしてください。<br />
TdCheckboxに設定する場合 **その行が一意に特定できる、人間が分かりやすい状態** になるよう心がけてください。<br />
上記の例で言えば**名前だけでは同姓同名と被る可能性がある**、**従業員IDだけではどの従業員か人間が分かりづらい** などの観点があり、両方の要素を設定するほうが望ましいでしょう。<br />
逆に**概要**や**操作**のカラムをaria-labelledbyに含めることは過剰な情報になるため、含めないほうが良いでしょう。<br />
スクリーンリーダーなどがaria-labelledbyを読み上げる際、過剰な情報は利用者にとってノイズとなる可能性が高いためです。

## rules

```js
{
  rules: {
    'smarthr/a11y-prohibit-checkbox-or-radio-in-table-cell': [
      'error', // 'warn', 'off'
    ]
  },
}
```

## ❌ Incorrect

```jsx
// Td, Th内にCheckbox, RadioButtonを配置しているためNG
<Td>
  <Checkbox />
</Td>
<Td>
  <RadioButton />
</Td>
<Th>
  <Checkbox />
</Th>
```

```jsx
// Td, Thに適切にaria-labelledby, aria-label属性を設定していても置き換え推奨のためNG
<Td>
  <Checkbox aria-labelledby="id1" />
</Td>
<Td>
  <RadioButton aria-labelledby="id2" />
</Td>
<Th>
  <Checkbox aria-label="any text" />
</Th>
```

## ✅ Correct

```jsx
<TdCheckbox aria-labelledby="id1" />
<TdRadioButton aria-labelledby="id2" />
<ThCheckbox />
```
