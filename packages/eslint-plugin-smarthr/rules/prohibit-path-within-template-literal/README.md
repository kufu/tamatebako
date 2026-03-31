# smarthr/prohibit-path-within-template-literal

URIを管理するオブジェクト(path, localPath, GlobalPath, PATH, etc...)をtemplate-literalで囲むことを禁止するルールです。

## なぜtemplate-literal内でのpath使用を禁止するのか

URIやパスの生成ロジックをtemplate-literalで記述すると、以下の問題が発生します：

### 責務の拡散

query-stringの生成やパスの一部などをtemplate-literalで結合することは、URL生成の責務を拡散させることになります。例えば：

- **NG**: `${path.xxx}?${queryString}`
  - pathオブジェクト外でqueryStringが生成されてしまい、どのようなqueryStringが設定される可能性があるか？という情報が拡散してしまいます
- **OK**: `path.xxx({ xxxx: 'yyyyy' })`
  - path内でqueryStringを生成するため、URL生成の情報が集約されます

### メンテナンス性の低下

URL生成の情報が複数箇所に散在すると、以下のような問題が生じます：

- どのページでどのようなクエリパラメータが使用されているかが把握しづらい
- URLの形式を変更する際に、修正箇所を見落としやすい
- 同じURLを生成する処理が重複しやすい

このルールにより、URL生成の責務を指定したオブジェクトに集中させ、コードの保守性を向上させることができます。

## options

### pathRegex

URIを管理するオブジェクトの名称を判定する正規表現を指定します（デフォルト: `'((p|P)ath|PATH)$'`）

## rules

```js
{
  rules: {
    'smarthr/prohibit-path-within-template-literal': [
      'error', // 'warn', 'off'
      // {
      //   pathRegex: '((p|P)ath|PATH)$', // URIを管理するオブジェクトの名称を判定する正規表現
      // },
    ]
  },
}
```

## ❌ Incorrect

```jsx
\`${path.any.hoge}\?${queryString}`
```
```jsx
\`${path.any.hoge(ANY)}\${HOGE}`
```
```jsx
\`${path.any.fuga}\`
```

## ✅ Correct
```jsx
path.any.hoge(queryString)
```
