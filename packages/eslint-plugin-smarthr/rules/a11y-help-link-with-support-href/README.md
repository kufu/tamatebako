# smarthr/a11y-help-link-with-support-href

- [ヘルプページ](https://support.smarthr.jp/) へのリンクはsmarthr-ui/HelpLinkを使うことを促すルールです
  - ヘルプページへのリンクは、通常のテキストリンクと設定するべき属性が異なるため、専用のコンポーネントが用意されています

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
<TextLink href="https://support.smarthr.jp/xxxxx">any</TextLink>
<a href={`//support.smarthr.jp/${hoge}`}>any</a>
<AnchorButton href={supportURL}>any</a>
<AnyAnchor href={path.support.xxxx.yyyy} />
```

## ✅ Correct

```jsx
<HelpLink href="https://support.smarthr.jp/xxxxx">any</HelpLink>
<HelpLink href={`//support.smarthr.jp/${hoge}`}>any</HelpLink>
<HelpLink href={supportURL}>any</HelpLink>
<HogeHelpLink href={path.support.xxxx.yyyy} />
```
