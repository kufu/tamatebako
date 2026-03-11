# smarthr/best-practice-for-date

`new Date(arg)` と `Date.parse(arg)` の利用を禁止するルールです

### なぜDateを直接利用すると危険なのか

`new Date(arg)` と `Date.parse(arg)` はブラウザの実装によっては、意図しない日付として解釈されてしまう場合があります。

- [Date オブジェクトを生成するいくつかの方法](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date#date_%E3%82%AA%E3%83%96%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%82%92%E7%94%9F%E6%88%90%E3%81%99%E3%82%8B%E3%81%84%E3%81%8F%E3%81%A4%E3%81%8B%E3%81%AE%E6%96%B9%E6%B3%95)
- [Date.parse](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date#date.parse)

簡単にまとめると**文字列を引数として渡した場合、ブラウザによって結果が異なります**。<br />
[上記MDNの記事](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date#date_%E3%82%AA%E3%83%96%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E3%82%92%E7%94%9F%E6%88%90%E3%81%99%E3%82%8B%E3%81%84%E3%81%8F%E3%81%A4%E3%81%8B%E3%81%AE%E6%96%B9%E6%B3%95) では`YYYY-MM-DDTHH:MM:SS`形式の動作の信頼性が書かれていますが、あくまで仕様としてであり、実際のブラウザでの挙動ではエラーになる場合があります。

有名なものではChromeで以下の様に解釈されます。

```jsx
new Date('2022/12/31') // Sat Dec 31 2022 00:00:00 GMT+0900 (日本標準時)
new Date('2022-12-31') // Sat Dec 31 2022 09:00:00 GMT+0900 (日本標準時)
```

区切り文字が `/` と `-` の場合で9時間分のズレが生じています。<br />
例は `new Date` でしたが `Date.parse` も基本的に同様のロジックで解釈されるため、結果は同様になります。

Chromeの場合は上記の時差で済みましたが、そもそも `/` 区切りの日付を解釈できない場合や、前述の通り`YYYY-MM-DDTHH:MM:SS`形式でもエラーを発生させるブラウザなども存在しています。

この問題は文字列を解釈する際のブラウザの実装の差異によって発生することから `new Date()` のように引数がない場合、もしくは `new Date(year, month, date)`のように引数が日付フォーマットの文字列ではない場合は発生しません。<br />
そのためこのルールでは`new Date(arg)`と`Date.parse(arg)`のように**引数が一つの場合にエラーになります**。

### 対応方法について

対応方法は以下のいずれかを推奨します

1. `new Date(year, month, date)`のように年月日などを個別に設定した状態で利用する
2. dayjsなどのmoduleを利用する(強く推奨)

軽微なロジックの場合を除き、基本的にdayjsなどのmoduleを利用して日付を解釈することを推奨します。<br />
Date Instanceが必要な場合でも、基本的に手段が用意されている場合が多いため問題なく利用できるはずです。<br />
(dayjsの場合、toDate()メソッドでDate Instanceが取得できます)

## rules

```js
{
  rules: {
    'smarthr/best-practice-for-date': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```js
// 日付を正しくparseできない、ブラウザによって結果にブレが発生する可能性が高いためNG
new Date('2022/12/31')
```

```js
// 変数にした場合も同様にNG
new Date(arg)
```

```js
// Date.parseの場合はそもそも利用している時点でNG
Date.parse(value)
```

## ✅ Correct


```js
// 年月日などを個別に指定しており、日付をparseする必要がないためOK
new Date(2022, 11, 31)
```

```js
// new Dateではなく事前にparseする場合は問題なし
const args = arg.split('/')
new Date(args[0], parseInt(args[1], 10) - 1, args[2])
```

```js
// dayjsなどの外部モジュールを使って日付解釈を行うことを推奨
dayjs(arg)
```
