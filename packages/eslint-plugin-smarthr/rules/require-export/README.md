# smarthr/require-export

対象ファイルにexportを強制させたい場合に利用します。特定のディレクトリやファイルパターンに対して、必須のexportを定義することで、プロジェクト全体の一貫性を保ちます。

## なぜ特定のexportを強制する必要があるのか

プロジェクトのアーキテクチャパターンを維持し、コードの一貫性を保つために、特定のファイルで必要なexportを強制することが重要です：

### アーキテクチャパターンの強制

特定のディレクトリに配置されるファイルには、決められたexportが必要な場合があります。例えば：

- adapterファイルには必ず `Props` と `generator` をexportする
- sliceファイルには必ず `default` exportを持つ
- Pageコンポーネントには `useTitle` をexportしてページタイトルを設定する

### インターフェースの明示化

必須のexportを定義することで、そのファイルが提供すべきインターフェースが明確になります。これにより：

- ファイルの役割と責務が明確になる
- 他の開発者が期待する構造を理解しやすくなる
- ドキュメントとしての役割も果たす

### 実装漏れの防止

必須のexportを強制することで、実装時の漏れを防ぐことができます。ESLintが自動的にチェックするため、レビュー時の確認項目を減らすことができます。

## config

設定は正規表現でファイルを指定し、各ファイルに対して必要なexport名の配列を定義します。`default` を指定することで、default exportを強制できます。

## rules

```js
{
  rules: {
    'smarthr/require-export': [
      'error',
      {
        'adapter\/.+\.ts': ['Props', 'generator'],
        // slice以下のファイルかつmodulesディレクトリに属さずファイル名にmockを含まないもの
        '^(?=.*\/slices\/[a-zA-Z0-9]+\.ts)(?!.*(\/modules\/|mock\.)).*$': [ 'default' ],
      },
    ]
  },
}
```

## ❌ Incorrect

```js
// adapter/index.ts
export type Type = { abc: string }

// slice/index.ts
export const slice = { method: () => 'any action' }
```

## ✅ Correct


```js
// adapter/index.ts
export type Props = { abc: string }

// slice/index.ts
const slice = { method: () => 'any action' }
export default slice
```
