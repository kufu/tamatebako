# smarthr/a11y-prohibit-overflow-hidden

コンポーネントのoverflow属性に 'hidden' を設定することを禁止するルールです

## なぜoverflow属性にhiddenを指定しないほうが良いのか

`overflow="hidden"` を指定することでa11y的な問題・実装上の問題が発生する可能性があるためです。

### overflow="hidden" のa11y的問題

主に以下の問題が発生します。

- 非表示部分にfocus可能な要素が配置された場合、キーボード操作などでユーザーが混乱する
- hiddenした要素内にscroll可能な要素がある場合、ブラウザがscroll可能な要素内のフォーカス可能な要素をフォーカスできるものとして扱わない場合がある
- focusした際のoutlineが途切れてしまう等、ユーザーに対するフィードバックが正しく行えなくなってしまう場合がある

以上からoverflow以外の手段でstyleを設定することが可能なら避けるべきです。<br />
特によく利用されるパターンとしては `内部の要素を角丸にするために設定する` というものです。

```jsx
<Base overflow="hidden">
  <Table />
</Base>
```

この場合は子要素側で角丸を指定するべきです。

```jsx
<Base>
  <Table rounded={true} />
</Base>
```

### overflow="hidden" の実装上の問題

主に以下の問題が発生します。

- `position: sticky` を利用しようとした場合、親要素でoveflow属性を利用していると正常にstyleを設定することが出来きない場合があります
  - その他にも `position: absolute` や `position: fixed` の要素が意図せず隠れてしまうなどの問題も発生する場合があります
  - z-indexの値に関わらず、子要素が境界の外側に描画されない（クリップされる）場合があります。

この問題はoverflowが原因である、と気づきにくいこと・実際にどのoveflowの指定が問題になっているか調べにくいためa11y的問題の対応同様、避けるべきです。


## rules

```js
{
  rules: {
    'smarthr/a11y-prohibit-overflow-hidden': [
      'error', // 'warn', 'off'
    ]
  },
}
```

## ❌ Incorrect

```jsx
// 角丸を実現するためにはoverflow="hidden"ではなく、子要素にborder-radiusを指定することで実現するべき
<Base overflow="hidden">
  <Table />
</Base>
```

## ✅ Correct

```jsx
<Base>
  <Table rounded={true} />
</Base>
```

```jsx
// rounded属性を持たない要素・コンポーネントの場合でもstyleでborder-radiusを当てるようにする
// tailwindの場合 `rounded-l(smarthr-uiを利用している場合shr-rounded-l)` などで指定できます
// https://tailwindcss.com/docs/border-radius
<Base>
  <Section className="shr-bg-white shr-rounded-l" />
    {children}
  </Section>
</Base>
```
