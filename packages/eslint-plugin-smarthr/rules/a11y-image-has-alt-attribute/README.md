# smarthr/a11y-image-has-alt-attribute

画像にalt属性(代替テキスト)を設定することを強制するルールです

## なぜ画像に代替テキストが必要なのか

スクリーンリーダーなどの一部のブラウザで**対象画像が何を表しているのか？という情報が欠落することを防ぐ**目的があります。<br />
閲覧可能なUI上では十分な情報が存在していても、テキスト読み上げなどでは情報が不足することがあるため、**画像が何を表しているのかを説明する必要があります。**

[詳細: 画像に代替テキストが付与されている](https://smarthr.design/accessibility/check-list/alternative-text/)


### 画像に代替テキストが不要な場合について

例外的に**装飾目的の画像画像はaltに空文字を指定する**ことが許容されます。(例: `<XxxImage alt="" />`)<br />
**ただしこのルールでは上記のようなalt指定もエラーになります。**<br />
理由は**SmartHRのプロダクトにおいて装飾目的の画像はほぼ全てアイコンとなる**ためです。<br />
smarthr-uiが提供するIconではないアイコンのコンポーネントを定義する場合、コンポーネント名の末尾を `Icon` にすることでこのチェックを回避出来ます。<br />
SmartHRのプロダクトにおいて、アイコンを単一で使う可能性は低く、利用する場合でも[a11y-clickable-element-has-text](https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-clickable-element-has-text)で別途チェックされます。

[詳細: 装飾目的の画像が無視できるようになっている](https://smarthr.design/accessibility/check-list/decorative-image/)

## alt以外の代替テキストの設定方法について

**前提として可能な限りalt属性を利用してください。** 迷うような条件の場合、alt属性を利用すれば大きな問題は発生しないでしょう。<br />
例外として以下の場合 `aria-describedby` 属性を利用して代替テキストを設定することが出来ます。

1. 設定するべき代替テキストが、すでに他要素でテキスト、もしくは代替テキストとして存在している
2. 1であり、かつその要素を直接関係性がある場合

わかり易い例として以下の様なパターンが考えられます。

- Tableに値が一覧されており、それをグラフ画像として表示する場合
- すでに存在するアイコンにチェックアイコンを重ねる場合

## spread-attributesが設定されているなら許容したい場合

下記の様にspread attributesが設定されていれば、代替テキストが設定されている扱いにしたい場合、lintのoptionとして `checkType` に `allow-spread-attributes` を設定してください。

```jsx
// checkType: 'allow-spread-attributes'
<XxxImage {...args} />
```

便利な設定ではありますが、**代替テキストが実際に設定されているかは判定出来ていないため、チェック漏れが発生する可能性があります。**  
設定される場合は慎重に検討してください。

## rules

```js
{
  rules: {
    'smarthr/a11y-image-has-alt-attribute': [
      'error', // 'warn', 'off'
      // { checkType: 'always' } /* 'always' || 'allow-spread-attributes' */
    ]
  },
}
```

## ❌ Incorrect

```jsx
// 画像に代替テキストが設定されていないためNG
<Img />
```

```jsx
// 子要素が存在する場合でも同様にNG
// この場合、Imageは画像要素ではない場合がありますが
// その場合は画像と勘違いしない名称に変更してください
<Image>
  <Any />
</Image>
```

```jsx
// spread attributesにに代替テキスト用の属性が含まれていてもNG

// checkType: 'always'
<XxxImage {...args} />
```

## ✅ Correct

```jsx
<Img alt="message" />
```

```jsx
<Image alt="message">
  <Any />
</Image>
```

```jsx
// Iconは画像として扱われますが、例外的に代替テキストを設定しなくてもOK
<Icon />
```

```jsx
// checkType: 'allow-spread-attributes'
<XxxImage {...args} />
```
