# smarthr/best-practice-for-nested-attributes-array-index

入力要素のname属性で、配列に当たる部分の連番を必ず指定することを促すルールです。

## なぜindexを指定する必要があるのか

配列に当たる部分の連番を指定しない場合（例: `a[xxx][][yyy]`）、配列内アイテムの属性が意図せず入れ替わってしまう場合があります。

### 自動区切り処理の問題

連番を指定しない場合、配列のアイテムの値は「全く同じnameが出てきたら区切る」という処理が自動的に行われます。

```js
a[xxx][][id]='1'
a[xxx][][value]='hoge'
a[xxx][][id]='2' // `a[xxx][][id]`が被ったのでここで別オブジェクトになる
a[xxx][][value]='fuga'

/* 送信される値の概念モデル
a: {
  xxx: [
    { id: 1, value: 'hoge' },
    { id: 2, value: 'fuga' },
  ]
}
*/
```

一見正しく動作しているように見えますが、以下のようなパターンで問題が発生します。

### 値の入れ替わりが発生する例

```js
// 問題あるパターン
// 新規作成でa[xxx][][id]=undefinedなので非表示にしたと仮定
a[xxx][][value]='hoge'
a[xxx][][id]='2' // 本来↓のvalueと紐づくべき値が↑に紐づいてしまう
a[xxx][][value]='fuga' // `a[xxx][][value]`が被ったのでここで別オブジェクトになる

/* 送信される値の概念モデル
a: {
  xxx: [
    { id: 2, value: 'hoge' },
    { id: nil, value: 'fuga' }, // fugaだったもののidがhogeに紐づいてしまう
  ]
}
*/
```

この例では、前述の`yyy`に当たる値が配列内の別アイテムに紐づいてしまっています。

### 正しい実装方法

この問題は、name属性に必ずindexを含めることで回避できます。

```js
a[xxx][0][value]='hoge'
a[xxx][1][id]='2'
a[xxx][1][value]='fuga'

/* 送信される値の概念モデル
a: {
  xxx: [
    { id: nil, value: 'hoge' },
    { id: 2, value: 'fuga' },
  ]
}
*/
```

## チェックする内容

文字列中に`][][`のパターンが含まれている場合、エラーになります。これはname属性だけでなく、文字列変数でも同様です。

```jsx
// NG: name属性に[][] が含まれている
<Input name="a[xxxx][][yyy]" />

// NG: 文字列変数でも[][]はほぼname属性として利用される可能性が高い
const namePrefix = 'a[xxx][][yyy]'
```

## rules

```js
{
  rules: {
    'smarthr/best-practice-for-nested-attributes-array-index': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
<Input name="a[xxxx][][yyy]" />
<Input name={"${any}[][xxx]"} />


// 文字列の変数などでも `[][` のような指定が出てくるのはほぼname属性に対する指定として
// 利用される可能性が高いためチェック対象です
const namePrefix = 'a[xxx][][yyy]'
```

## ✅ Correct

```jsx
<Input name="a[xxxx][0][yyy]" />
<Input name={"${any}[${index}][xxx]"} />
const namePrefix = `a[xxx][${index}][yyy]`
```
