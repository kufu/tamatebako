# smarthr/a11y-help-link-with-support-href

[ヘルプページ](https://support.smarthr.jp/)へのリンクは[smarthr-ui/HelpLink](https://smarthr.design/products/components/text-link/help-link/)を使うことを促すルールです

## なぜ[ヘルプページ](https://support.smarthr.jp/)へのリンクはsmarthr-ui/HelpLinkを使う必要があるのか
ヘルプページへのリンクは、通常のテキストリンクと設定するべき属性が異なるため、専用のコンポーネントとして[smarthr-ui/HelpLink](https://smarthr.design/products/components/text-link/help-link/)が定義されています。<br />
例えば `rel="help"` は `現在のページとリンク先の関係を表す` ものであり `ヘルプページへのリンク` であることが明確になります。

## rules

```js
{
  rules: {
    'smarthr/a11y-help-link-with-support-href': [
      'error', // 'warn', 'off'
    ]
  },
}
```

## ❌ Incorrect

```jsx
// supportという文字列を含むドメインの場合、smarthr-ui/HelpLinkを利用する必要がある
<TextLink href="https://support.smarthr.jp/xxxxx">any</TextLink>
<a href={`//support.smarthr.jp/${hoge}`}>any</a>
```

```jsx
// supportというprefixの変数名が設定されている場合も同様にHelpLinkを利用する必要がある
<AnchorButton href={supportURL}>any</AnchorButton>
```

```jsx
// path、xxxPath形式のオブジェクト以下で `support` という値を参照する場合もHelpLinkの利用が必要
<AnyAnchor href={path.support.xxxx.yyyy} />
<AnyAnchor href={path.xxxx.support.yyyy} />
```

## ✅ Correct

```jsx
<HelpLink href="https://support.smarthr.jp/xxxxx">any</HelpLink>
<HelpLink href={`//support.smarthr.jp/${hoge}`}>any</HelpLink>
```

```jsx
<StyledHelpLink href={supportURL}>any</StyledHelpLink>
```

```jsx
<AnyHelpLink href={path.support.xxxx.yyyy} />
<AnyHelpLink href={path.xxxx.support.yyyy} />
```
