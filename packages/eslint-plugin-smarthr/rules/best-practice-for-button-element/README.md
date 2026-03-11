# smarthr/best-practice-for-button-element

button要素ではなく、smarthr-ui/Button、もしくはsmarthr-ui/UnstyledButtonの利用を促すルールです

## なぜ smarthr-ui/Button を使うべきなのか

button要素にはtype属性が存在します。<br />
type属性のデフォルト値は 'submit' ですが、これはform要素内にbutton要素を設置すると影響します。<br />
type属性が'submit'の場合、設定したbutton要素をクリックすると、親のform要素を送信する状態になります。

React等を利用している場合、button要素とform要素のコード的な距離が離れている場合も多く、またコンポーネント名もButtonなどに変更した結果、formを送信してしまう可能性にエンジニア自体が気づきにくい状況が発生します。<br />

この問題を解決するため、smarthr-ui/Button・smarthr-ui/UnstyledButtonはtype属性をデフォルトを'button'に変更しており、利用を推奨しています。
またこのルールではtype属性を明示している場合、button要素を直接利用してもエラーにならないようになっています。

## rules

```js
{
  rules: {
    'smarthr/best-practice-for-button-element': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```js
// smarthr-ui/Buttonを利用しておらず、type属性も明示していないためNG
<button>click</button>
```

## ✅ Correct

```js
// smarthr-ui/Buttonを利用しているのでOK
<Button>click</Button>
<AnyButton>click</AnyButton>
```

```js
// type属性を明示しているのでOK
<button type="button">click</button>
<button type="submit">click</button>
```
