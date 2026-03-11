# smarthr/best-practice-for-data-test-attribute

テスト用の属性としてよく利用される `data-spec` と `data-testid` 属性の利用を控え、代替手段の検討を推奨するルールです。

## なぜテスト用の属性の利用を控えたほうが良いのか

`data-spec` 等の利用を控えることで、テスト環境標準のメソッドを利用することでアクセシビリティのテストも同時に行えるためテストコードの価値が高まるためです。

```jsx
// testing libraryなどに実装されているgetByRoleでの例
await page.getByRole('button', { name: '検索' }).click()
```

上記のようなテスト用ライブラリのメソッドは実際にアクセス可能か？といった観点のテストも同時にこなせる場合が多いため利用が推奨されます。<br />
逆にdata属性によるテスト対象の絞り込みはユーザーが操作できない状況でも取得できてしまうため、実際にはブラウザ上から操作できないなどの問題を見逃す可能性があるため非推奨です。

```jsx
// querySelectorでは対象要素が画面上に表示されていない・操作できないなどの問題は発見できない
expect(document.querySelector(`[data-spec="hoge"]`)).toBeNull()
```

## rules

```js
{
  rules: {
    'smarthr/best-practice-for-data-test-attribute': 'warn', // 'error', 'off'
  },
}
```

## ❌ Incorrect

```jsx
// data-spec属性の利用はNG
<Any data-spec="hoge">ほげ</Any>
```

```jsx
// data-testid属性の利用も同様にNG
<Any data-testid="hoge">ほげ</Any>
```

## ✅ Correct

```jsx
// data-spec, data-testidが存在しない場合はOK
<Any data-hoge="true">...</Any>
```
