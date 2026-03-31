# smarthr/require-declaration

対象ファイルに宣言してほしい、変数・関数・class・型などを定義するルールです。コードの規約などを決める際に便利です。

## なぜ特定の宣言を強制する必要があるのか

プロジェクトが大きくなるにつれ、コードの一貫性を保つことが重要になります：

### アーキテクチャパターンの強制

特定のディレクトリやファイルに対して、必要な宣言を強制することで、プロジェクト全体で統一されたアーキテクチャパターンを維持できます。例えば：

- Redux ToolkitのsliceファイルでCreateSliceの使用を強制
- adapterファイルでPropsとgeneratorの定義を強制
- 特定のパターンに従った型定義の強制

### コードレビューの効率化

宣言の命名規則や必須項目が自動的にチェックされるため、レビュアーは実装のロジックに集中できます。また、新しいチームメンバーがプロジェクトの規約を学習する際の助けにもなります。

### リファクタリングの安全性

必須の宣言が定義されていることが保証されるため、リファクタリング時に意図せず重要な要素を削除してしまうリスクが減少します。

## チェック内容

このルールは以下をチェックします：

- 対象ファイルで特定の名前を持つ変数・関数・class・型が宣言されているか
- 宣言の種類（type, const, let, class, function, arrow-function）が正しいか
- 宣言内で特定のキーワードや識別子が使用されているか

## config

設定は正規表現でファイルを指定し、各ファイルに対して必要な宣言を定義します。

### 宣言設定の構造

```js
{
  '<ファイルパスの正規表現>': {
    '<宣言名>': {
      type: 'type' | 'const' | 'let' | 'class' | 'function' | 'arrow-function',
      use: ['<使用を強制したいキーワード>'],
      reportMessage: '<エラーメッセージ>' // 省略可能
    }
  }
}
```

## rules

```js
{
  rules: {
    'smarthr/require-declaration': [
      'error', // 'warn', 'off'
      {
        '\crews\/index\/slices\/': { // パスに合致する正規表現でファイル指定
          'ActionCreatorsProps': { // 定義してほしい名称
            type: 'type', // 定義したい種類 type | const | let | class | function | arrow-function
            use: ['payload', 'AnyAction'], // 定義対象の内部で利用を強制したいものを指定する
            reportMessage: `'type ActionCreatorsProps = { xxxYyy: (payload: XxxProps) => AnyAction }' というフォーマットで型を作成してください` // 省略可能
          },
        },
        '^(?=.*\/slices\/[a-zA-Z0-9]+\.ts)(?!.*(\/modules\/|mock\.)).*$': { // slices以下のファイルで、かつフルパスにmodulesや `mock.` を含まないもの
          'slice': {
            type: 'const',
            use: ['createSlice', 'path', 'initialState', 'reducers'],
            reportMessage: `'const slice = createSlice({ name: path.xxxx, initialState, reducers })' というフォーマットでsliceを作成してください`
          },
        },
      },
    ]
  },
}
```

## ❌ Incorrect

```jsx
// crews/index/slice/index.ts

type Actions = {
  hoge: (payload: hogeProps) => any
}
```


## ✅ Correct

```jsx
// crews/index/slice/index.ts

type ActionCreatorsProps = {
  hoge: (payload: hogeProps) => AnyAction
}

const slice = createSlice({
  name: path.hoge,
  initialState,
  reducers,
})
```
