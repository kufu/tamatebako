# smarthr/design-system-guideline-prohibit-double-icons

要素の前後両方にアイコンの使用を禁止するルールです。`Button` や `TextLink` において、`prefix` と `suffix` が同時に設定されている場合、エラーとなります。

## なぜ前後両方のアイコンを禁止するのか

デザインシステムのガイドラインでは、ボタンやリンクには前後いずれか一方のみにアイコンを配置することを推奨しています。両方にアイコンを配置すると、視覚的な情報が過多になり、ユーザーの認知負荷が増大します。

また、どちらにもアイコンをつけられそうな場合は、アイコン付き（右）（サフィックス）を優先し、アイコン付き（左）（プレフィックス）には指定しないでください。

## チェック内容

このルールは以下をチェックします：

- `Button` や `TextLink` などのコンポーネントで `prefix` と `suffix` が同時に設定されていないか
- 基本的にアイコンのみが設定される前提ですが、文字列などが設定されている場合もエラーとなります

## options

### checkType

- `'always'` (デフォルト): すべてのケースでチェックを実施
- `'allow-spread-attributes'`: スプレッド構文での属性設定を許可

## rules

```js
{
  rules: {
    'smarthr/design-system-guideline-prohibit-double-icons': [
      'error', // 'warn', 'off'
      // { checkType: 'always' } /* 'always' || 'allow-spread-attributes' */
    ]
  },
}
```

## ❌ Incorrect

```jsx
<Button suffix={SUFFIX} prefix={PREFIX}>hoge</Button>
<Button suffix prefix>hoge</Button>
<StyledButton suffix={undefined} prefix={null}>hoge</StyledButton>
<Link prefix="PREFIX" suffix="SUFFIX">hoge</Link>
<StyledLink prefix="PREFIX" suffix="SUFFIX">hoge</StyledLink>
```

## ✅ Correct

```jsx
<Button>hoge</Button>
<Button suffix={SUFFIX}>hoge</Button>
<Button prefix="PREFIX">hoge</Button>
<TextLink>hoge</TextLink>
<TextLink suffix="SUFFIX">hoge</TextLink>
<TextLink prefix={PREFIX}>hoge</TextLink>
<StyledButton>hoge</StyledButton>
<StyledLink>hoge</StyledLink>
<Input prefix={PREFIX} suffix={SUFFIX} />
```
