# smarthr/a11y-help-link-with-support-href

[ヘルプページ](https://support.smarthr.jp/)へのリンクは[smarthr-ui/HelpLink](https://smarthr.design/products/components/text-link/help-link/)を使うことを促すルールです

## なぜ[ヘルプページ](https://support.smarthr.jp/)へのリンクはsmarthr-ui/HelpLinkを使う必要があるのか
ヘルプページへのリンクは、通常のテキストリンクと設定するべき属性が異なるため、専用のコンポーネントとして[smarthr-ui/HelpLink](https://smarthr.design/products/components/text-link/help-link/)が定義されています。<br />
例えば `rel="help"` は `現在のページとリンク先の関係を表す` ものであり `ヘルプページへのリンク` であることが明確になります。

## [ヘルプページ](https://support.smarthr.jp/)へのリンクとして扱われる条件

a要素、もしくはa要素と思われるコンポーネントのhref属性に `support` 関連と思われる値が設定さている場合がチェック対象になります。

### a要素、もしくはa要素と思われるコンポーネントの判定方法

a要素として判定されるコンポーネントの条件は以下のいずれかに合致する場合です。

- a要素
- コンポーネント名の末尾が `Link` `Anchor` `AnchorButton` のいずれかであること

### hrefがsupport関連のものかどうかの判定方法

hrefに設定されたURLがsupport関連であると判定される条件は以下のいずれかに合致する場合です。

- ドメイン部分に `support` という文言を含む場合
- `path` もしくは `xxxPath` というオブジェクト以下から `support` という値を参照する場合
  - 例:
    - path.support
    - path.support.xxxx.yyyy
    - path.xxxx.support.yyyy
- 変数の場合、`support` と `href` もしくは `url` という単語を含む場合
  - 大文字小文字の組み合わせも許容されています
    - 例:
      - supportURL
      - xxxSupportYyyHref

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
// path、xxxPath形式のオブジェクト以下で `support` という値を参照する場合もHelpLinkの利用が必要
<AnyAnchor href={path.support.xxxx.yyyy} />
<AnyAnchor href={path.xxxx.support.yyyy} />
```

```jsx
// supportという単語が含まれる変数名が設定されている場合も同様にHelpLinkを利用する必要がある
<AnchorButton href={supportURL}>any</AnchorButton>
<AnchorButton href={xxxSupportYyyHref}>any</AnchorButton>
```


## ✅ Correct

```jsx
<HelpLink href="https://support.smarthr.jp/xxxxx">any</HelpLink>
<HelpLink href={`//support.smarthr.jp/${hoge}`}>any</HelpLink>
```

```jsx
<AnyHelpLink href={path.support.xxxx.yyyy} />
<AnyHelpLink href={path.xxxx.support.yyyy} />
```

```jsx
<StyledHelpLink href={supportURL}>any</StyledHelpLink>
<StyledHelpLink href={xxxSupportYyyHref}>any</StyledHelpLink>
```
