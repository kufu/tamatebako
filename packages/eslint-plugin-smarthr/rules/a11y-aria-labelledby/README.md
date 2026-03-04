# smarthr/a11y-aria-labelledby

[aria-labelledby属性](https://developer.mozilla.org/ja/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-labelledby)の設定方法をチェックするルールです。<br />
[aria-labelledby属性](https://developer.mozilla.org/ja/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-labelledby)は**別要素のid属性と同じ値を指定する必要がある属性のため、変数を設定することを強制**します。<br />

## なぜaria-labelledby属性に変数を設定するべきなのか

[aria-labelledby属性](https://developer.mozilla.org/ja/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-labelledby)は他要素からテキストを参照し、そのテキストをaccessible nameとしてaria-labelledby属性を記述した要素に設定します。<br />

```jsx
<span id="label">入力要素1</span>
{/* accessible nameは '入力要素1' になる */}
<input aria-labelledby="label" />
```

この特性からaria-labelledby属性の設定に変数の使用を強制することでtypoなどのミスを防ぐ事が出決ます。

```jsx
const labelId = 'label'

...

<span id={labelId}>入力要素1</span>
<input aria-labelledby={labelId} />
```

### aria-labelledby属性を設定する際のTips

#### aria-labelledby属性に設定するidの参照先になる要素は必ず存在する必要がある

例えば以下の様なコードは問題になります。

```jsx
const textId = 'TEXT_ID'
const textVisible = false

...

<Text id={textId} visible={textVisible}>Body!</Text>
<Any aria-labelledby={textId} />
```

Textコンポーネントが**visibleがtrueのときのみ、要素を出力する**ロジックになっている場合、id属性が設定された要素が存在しないため、invalidな状態になってしまいます。
以下のようにaria-labelledbyを適切に切り替えてください

```jsx
const textId = 'TEXT_ID'
const textVisible = false
...

<Text id={textId} visible={textVisible}>Body!</Text>
<Any aria-labelledby={textVisible ? textId : undefined} />
```

#### aria-labelledby属性には複数要素の参照を設定できる

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
    {crews.map((crew) => {
      const empCodeId = `empcode-${crew.id}`
      const nameId = `name-${crew.id}`

      return (
        <tr>
          <TdCheckbox aria-labelledby={`${empCodeId} ${nameId}`} />
          <Th id={empCodeId}>{crew.empcode}</Th>
          <Td id={nameId}>{crew.name}</Td>
          <Td>{crew.outline}</Td>
          <Td><Button>編集</Button></Td>
        </tr>
      )
    })}
  </tbody>
</Table>
```

aria-labelledbyに複数の要素を設定する場合、"elm1 elm2" のように空白で区切るようにしてください。<br />
Table等で複数指定を利用する場合が多いですが、 **その行が一意に特定できる、人間が分かりやすい状態** になるよう心がけてください。<br />
上記の例で言えば**名前だけでは同姓同名と被る可能性がある**、**従業員IDだけではどの従業員か人間が分かりづらい** などの観点があり、両方の要素を設定するほうが望ましいでしょう。<br />
逆に**概要**や**操作**のカラムをaria-labelledbyに含めることは過剰な情報になるため、含めないほうが良いでしょう。<br />
スクリーンリーダーなどがaria-labelledbyを読み上げる際、過剰な情報は利用者にとってノイズとなる可能性が高いためです。


## rules

```js
{
  rules: {
    'smarthr/a11y-aria-labelledby': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
// aria-labelledby属性に文字リテラルが直接指定されているためNG
// 変数化して参照先要素と同じidであることを担保するべき
<Any aria-labelledby="hoge" />
```

```jsx
// テンプレートリテラルの場合も文字リテラル同様NG
<Any aria-labelledby={`hoge-${fuga}`} />
```

## ✅ Correct

```jsx
// aria-labelledby属性に変数が設定されているのでOK
<Any aria-labelledby={hoge} />
<Any aria-labelledby={obj.attr} />
```

```jsx
// テンプレートリテラルの場合でも複数指定のパターンは許容
<Any aria-labelledby={`${hoge} ${fuga}`} />
```
