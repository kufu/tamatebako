# smarthr/best-practice-for-nested-attributes-array-index

- 入力要素のname属性で、配列に当たる部分の連番を指定しない場合（例: a[xxx][][yyy]）、配列内アイテムの属性が意図せず入れ替わってしまう場合がありえるため、常にindexを設定してすることを促すルールです
- 前述例のyyyに当たる値が配列内の別アイテムに紐づいてしまう場合があります

## indexを設定しない場合に起こり得る問題の詳細

配列に当たる部分の連番を指定しない場合（例: a[xxx][][yyy]）、配列のアイテムの値はどこからどこまでが1つ目、ここから2つ目... というように区切る処理が自動的に行われます。
これらの区切りは `全く同じnameが出てきたら区切る` という処理が行われます。

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

この挙動は、例えば以下のようなパターンで問題になります。

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

この問題は正しくnameにindexを含めることで回避できます

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
