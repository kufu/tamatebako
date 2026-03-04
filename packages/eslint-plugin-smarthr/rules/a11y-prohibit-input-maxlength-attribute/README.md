# smarthr/a11y-prohibit-input-maxlength-attribute

input, textarea 要素に maxLength 属性を設定することを禁止するルールです。

## なぜmaxLength属性を利用しないほうが良いのか

maxLength属性を設定した入力要素に設定した上限以上の文字列を入力した場合、ほぼすべてのブラウザで**文字が入力できていないことのフィードバックがありません。**<br />
この挙動は特にコピー&ペーストの際に問題になりやすく、**maxLength属性がついた要素にテキストをペーストすると、maxLength属性の値を超えた範囲が意図せず切り捨てられてしまう**ことになります。

ユーザーはフィードバックがないため末端が切り取られてしまったことに気づけず、そのままフォームを送信してしまうなどの問題が発生する可能性があります。

### 代替手段

maxLength 属性ではなく、pattern属性・必要に応じてtitle属性を組み合わせることでsubmit時にバリデーションすることができます。

```jsx
<form onSubmit={onSubmit}>
  <input pattern=".{0,10}" title="10文字以内で入力してください" />
  <Button type="submit">送信</Button>
</form>
```

title属性を併用することで**submit時にpattern属性に設定した条件とマッチしない場合、title属性の内容をエラー文言として表示**できます。<br />
(title属性を設定していない場合、ブラウザが自動的にエラー文言を生成しますが、一般的には読みにくい内容になることが多いため、title属性を設定することをおすすめします)

注意点として、pattern属性はform要素でラップされている&submitイベントが発生しなければvalidationを実行しないため注意してください。


## rules

```js
{
  rules: {
    'smarthr/a11y-prohibit-input-maxlength-attribute': [
      'error', // 'warn', 'off'
    ]
  },
}
```

## ❌ Incorrect

```jsx
<>
  <input maxLength={30} />
  <Button onClick={onSubmit}>送信</Button>
</>
```

## ✅ Correct

```jsx
<form onSubmit={onSubmit}>
  <input pattern=".{0,30}" title="30文字以内で入力してください" />
  <Button type="submit">送信</Button>
</form>
```
