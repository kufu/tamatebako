# smarthr/best-practice-for-layouts

smarthr-ui/Layoutsに属するコンポーネント(Center,Cluster,Container,Reel,Stack,Sidebar)の利用方法をチェックするルールです。

## チェックする内容

### Cluster, Stackの子要素が単一の場合エラー

Cluster, Stackは子要素が単一の場合エラーになります。<br />
Cluster, Stackは複数要素の間隔を調整するためのコンポーネントのため、子要素が単一である場合は利用する必要がありません。<br />
そのためこのチェックは**ループ処理などで結果単一になる場合**ではなく、**コードとして子要素が単一になる場合**が対象です。

```jsx
// aryのアイテムが一つだけの場合でもOK
<Stack>{ary.map((i) => i)}</Stack>

// 仮にMultipleItemsコンポーネントが複数要素を帰す場合でもNG
<Stack><MultipleItems /></Stack>
```

上記例のMultipleItemsコンポーネントが複数要素を帰す場合、StackコンポーネントはMultipleItems内で設置するようにしてください。

例外として下記の条件に合致する場合、UIの変更が起きるためエラーにはなりません

- Stackに `align="end"` もしくは `align="flex-end"` が指定されている場合
- Clusterに `justify="end"` もしくは `justify="flex-end"` が指定されている場合

### Cluster, Stackの子要素が単一であり、かつalign属性・もしくはjustify属性に `center` が指定されている場合エラー

Cluster・Stackのalign・justify属性に`end` `flex-end` を指定した場合、子要素が単一でも許容されますが、`center` の場合は許容されません。<br />
この場合は同じLayoutsに属するコンポーネントのCenterを利用してください。

```jsx
// NG
<Cluster justify="center"><Any /></Cluster>

// OK
<Center><Any /></Center>
```

### Stackに `gap={0}` を指定している場合エラー

Stackに`gap={0}`を指定するとエラーになります。<br />
多くの場合**`gap={0}`を指定したStackはdivに置換可能なため置き換えてください**。<br />
それ以外のパターンとして**Stackが内部的に設定している `display: flex;` を利用したいために使われている場合**が多くありますが、これは**smarthr-uiの内部実装に依存したコードになってしまうため、Stackを利用しない方法に修正することを強く推奨**します。<br />

このチェックも**結果としてgapが0になる**場合ではなく、**gapが0に固定されている**場合が対象です。

```jsx
// gap変数が仮に0にしかならない場合でもOK
<Stack gap={gap}>{any}</Stack>

// gap属性に0が直接指定されているためNG
<Stack gap={0}>{any}</Stack>
```

### Headingの子要素、FormControlのlabel属性、Fieldsetのlegend属性にLayoutsに属するコンポーネントを設置するとエラー

Headingの子要素、FormControlのlabel属性、Fieldsetのlegend属性にLayoutsに属するコンポーネントを設置するとエラーになります。<br />
Heading, FormControl, Fieldsetには要素を配置するための属性が用意されています。<br />
チェックに引っかかるパターンとして多くあるのは `見出しの左右にアイコンを設置する` 目的のためClusterを利用する、というものですがこれらはicon属性を利用することで実装可能です。<br />

例外として**見出しの上下にサブ見出しを設置したい**という要求に対応できるようStackは設置することが可能です。<br />
その場合、Stackのas・もしくはforwardedAs属性に `span` を指定してください。<br />
`span` を指定する理由はLayoutsに属するコンポーネントは基本的にdiv要素で出力されるため、デフォルトのままではinvalidなhtmlになってしまうためです。


### Checkbox, RadioButtonの子要素にLayoutsに属するコンポーネントを設置する場合エラー 

Checkbox, RadioButtonの子要素にLayoutsに属するコンポーネントを設置する場合エラーになります。<br />
設定したい場合、as・もしくはforwardedAs属性に `span` を指定してください。<br />
`span` を指定する理由はLayoutsに属するコンポーネントは基本的にdiv要素で出力されるため、デフォルトのままではinvalidなhtmlになってしまうためです。


## rules

```js
{
  rules: {
    'smarthr/best-practice-for-layouts': 'error', // 'warn', 'off',
  },
}
```

## ❌ Incorrect

```jsx
// Cluster, Stackは子要素が複数存在する場合に利用するべきもののため
// 要素が単一の場合エラーになる
<Cluster>
  <div>
    hoge
  </div>
</Cluster>
<StyledStack>
  <Any />
</StyledStack>
```

```jsx
// centerをしたい場合、Centerコンポーネントを利用するべきなのでNG
<Cluster justify="center"><Any /></Cluster>
```

```jsx
// divに置き換え可能 or Stackの内部的なstyleを期待した実装になってしまうためNG
<Stack gap={0}>
  <Any />
  <Any />
</Stack>
```

```jsx
// Heading, FormControlのlabel, Fieldsetのlegendにsmarthr-ui/Layoutsに属するコンポーネントを設置するとエラー
<Heading><Cluster><AnyIcon /><Text /></Cluster></Heading>
<FormControl label={{
  text: <Text prefixIcon={<AnyIcon />}>hoge</Cluster>
}} />
<Fieldset legend={
  <Stack>
    <Text />
    <SubText />
  </Stack>
} />
```

```jsx
// Checkbox, RadioButtonのchildrenにLayout系コンポーネントを設置する場合、as・forwardedAs属性にspanを指定していないければエラー
<AnyRadioButton><Cluster><A /><B /></Cluster></AnyRadioButton>
<RadioButtonPanel><AnyStack><A /><B /></AnyStack></RadioButtonPanel>
<AnyCheckbox><Sidebar><A /><B /></Sidebar></AnyCheckbox>
```

## ✅ Correct

```jsx
// 子が複数あるのでOK
<Cluster>
  <Any />
  <Any />
</Cluster>

<StyledStack>
  {flg ? 'a' : (
    <>
      <Any />
      <Any />
    </>
  )}
</StyledStack>
```

```jsx
// Cluster、かつ右寄せをしている場合は子一つでもOK
<Cluster justify="end">
  <Any />
</Cluster>
<Cluster justify="flex-end">
  <Any />
  <Any />
</Cluster>
```

```jsx
// Heading, FormControlのlabel, FieldsetのlegendにIconを設定したい場合はicon属性を利用する
<Heading icon={<AnyIcon />}><Text /></Heading>
<FormControl label={{
  text: <Text />,
  icon: <AnyIcon />,
}} />
```

```jsx
// Stackはas="span"、もしくはforwardedAs="span"を指定すれば利用できる
<Fieldset legend={
  <Stack as="span">
    <Text />
    <SubText />
  </Stack>
} />
<FormControl label={{
  text: (
   <AnyStack forwardedAs="span">
     <Text />
     <SubText />
   </AnyStack>
  ),
}} />
```

```jsx
// FormControl、Fieldsetで見出しの右側の領域に要素を設置する場合、statusLabels, subActionAreaを利用する
<FormControl
  label={<Text />}
  statusLabels={<RequiredLabel />}
  subActionArea={<HelpLink />}
/>
```

```jsx
// Checkbox, RadioButtonのchildrenにLayout系コンポーネントを設置する場合、as・forwardedAs属性にspanを指定する
<AnyRadioButton><Cluster as="span"><A /><B /></Cluster></AnyRadioButton>
<RadioButtonPanel><AnyStack forwardedAs="span"><A /><B /></AnyStack></RadioButtonPanel>
<AnyCheckbox><Sidebar as="span"><A /><B /></Sidebar></AnyCheckbox>
```
