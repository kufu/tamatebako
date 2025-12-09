# smarthr/best-practice-for-layouts

- smarthr-ui/Layoutsに属するコンポーネントの利用方法をチェックするルールです

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

// Cluster、かつ右寄せをしている場合は子一つでもOK
<Cluster justify="end">
  <Any />
</Cluster>
<Cluster justify="flex-end">
  <Any />
  <Any />
</Cluster>

// Heading, FormControlのlabel, FieldsetのlegendにIconを設定したい場合はicon属性を利用する
<Heading icon={<AnyIcon />}><Text /></Heading>
<FormControl label={{
  text: <Text />,
  icon: <AnyIcon />,
}} />
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

// FormControl、Fieldsetで見出しの右側の領域に要素を設置する場合、statusLabels, subActionAreaを利用する
<FormControl
  label={<Text />}
  statusLabels={<RequiredLabel />}
  subActionArea={<HelpLink />}
/>
```
