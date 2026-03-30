# smarthr/prohibit-import

特定のモジュールやエクスポートのimportを禁止するルールです。

## なぜimportを禁止する必要があるのか

プロジェクトの進行に伴い、特定のモジュールやエクスポートの使用を禁止したい場合があります:

### バグが発見されたモジュール

特定のバージョンのライブラリにバグが見つかり、修正版がリリースされるまで使用を禁止したい場合があります。

### 非推奨のコンポーネント

新しいコンポーネントに移行したいが、古いコンポーネントが残っている場合:

例: `SecondaryButtonAnchor`が非推奨になり、代わりに別のコンポーネントを使用してほしい

### 特定のディレクトリでの使用制限

特定のディレクトリでは特定のライブラリの使用を禁止したい場合:

例: `/pages/views/` 以下では`query-string`を直接使わず、独自のラッパーを使用してほしい

このルールを使うことで、プロジェクト全体で一貫性を保ちながら、段階的な移行を進めることができます。

## 設定方法

設定は以下の構造になっています:

```js
{
  'ファイルパスの正規表現': {
    'モジュール名': {
      imported: true | ['エクスポート名の配列'],
      reportMessage: 'カスタムエラーメッセージ'
    }
  }
}
```

### ファイルパスの正規表現

どのファイルでチェックするかを正規表現で指定します。

- `'^.+$'` - 全てのファイル
- `'\/pages\/views\/'` - `/pages/views/` を含むパス

### imported オプション

- `true` - そのモジュール全体のimportを禁止
- `['エクスポート名']` - 特定のエクスポートのみ禁止

### reportMessage オプション

カスタムエラーメッセージを指定できます。以下のプレースホルダーが使用可能です:

- `{{module}}` - モジュール名
- `{{export}}` - エクスポート名

## rules

```js
{
  rules: {
    'smarthr/prohibit-import': [
      'error', // 'warn', 'off'
      {
        '^.+$': {
          'smarthr-ui': {
            imported: ['SecondaryButtonAnchor'],
            reportMessage: `{{module}}/{{export}} はXxxxxxなので利用せず yyyy/zzzz を利用してください`
          },
        }
        '\/pages\/views\/': {
          'query-string': {
            imported: true,
          },
        },
      }
    ]
  },
}
```

## ❌ Incorrect

```js
// src/pages/views/Page.tsx
import queryString from 'query-string'
import { SecondaryButtonAnchor } from 'smarthr-ui'
```

## ✅ Correct


```js
// src/pages/views/Page.tsx
import { PrimaryButton, SecondaryButton } from 'smarthr-ui'
```
