# smarthr/best-practice-for-no-empty-jsx-expression

JSX内の、式もコメントも含まない完全に空の`{}`(JSX式コンテナ)を検知するルールです。

## なぜ空のJSX式を避けるべきか

`{}`は何もレンダリングしない不要なコードです。

多くの場合、`{/* eslint-disable-next-line some-rule */}`のようなeslintのdisableコメントが、該当ルールの指摘が解消されて不要になった際に自動削除され、コメントだけが消えて`{}`が残ってしまうことで発生します。

```jsx
// disableコメントが残っている間はOK
<div>{/* eslint-disable-next-line smarthr/some-rule */}<Hoge /></div>

// disableコメントが不要になり削除されると、{}だけが残ってしまう
<div>{}<Hoge /></div>
```

このルールは発生原因を問わず、コメントも式も含まない空の`{}`を一律で検知します。

## rules

```js
{
  rules: {
    'smarthr/best-practice-for-no-empty-jsx-expression': ['error', { fix: false }],  // デフォルト: 自動修正無効
  },
}
```

## options

### fix

自動修正を有効にするかどうかを指定します。

**デフォルト値**: `false`

```js
{
  rules: {
    'smarthr/best-practice-for-no-empty-jsx-expression': ['error', { fix: true }],
  },
}
```

## ❌ Incorrect

```jsx
<div>{}</div>
```

```jsx
<div>{}<Hoge /></div>
```

```jsx
<>{}</>
```

```jsx
// 空白のみの場合も対象
<div>{ }</div>
```

## ✅ Correct

```jsx
<div></div>
```

```jsx
<div><Hoge /></div>
```

```jsx
// コメントが残っている場合は対象外(コメントの削除は本ルールの責務ではないため)
<div>{/* comment */}</div>
```

```jsx
// 式がある場合は対象外
<div>{value}</div>
```

## autofix

このルールは自動修正に対応しています。自動修正を有効にするには `fix: true` オプションを指定してください。

```jsx
// Before
<div>{}<Hoge /></div>

// After
<div><Hoge /></div>
```

### フォーマット

自動修正後はprettierやoxfmtなどのフォーマッターによってインデントや改行が整形されます。
