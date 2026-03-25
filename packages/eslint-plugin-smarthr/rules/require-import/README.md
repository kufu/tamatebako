# smarthr/require-import

対象ファイルにimportを強制させるルールです。

## なぜimportを強制する必要があるのか

プロジェクトのルールとして、特定のファイルでは特定のモジュールを必ずimportしてほしい場合があります:

### ページタイトルの設定を強制

例: `Page.tsx` ではページタイトルを設定させたいので `useTitle` を必ずimportさせたい

```jsx
// Page.tsx では useTitle のimportが必須
import useTitle from './hooks/useTitle'
```

### コンポーネントの拡張を強制

例: `Buttons/` 以下のファイルでは、必ずsmarthr-uiのButtonコンポーネントを拡張してほしい

```jsx
// Buttons/ 以下では smarthr-ui の Button を必ずimportする
import { SecondaryButton } from 'smarthr-ui'
```

このルールを使うことで、プロジェクトのコーディング規約を強制し、一貫性を保つことができます。

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

- `'Page.tsx$'` - `Page.tsx`で終わるファイル
- `'Buttons\/.+\.tsx'` - `Buttons/` ディレクトリ以下の`.tsx`ファイル

### imported オプション

- `true` - そのモジュールから何らかのimportがあればOK
- `['エクスポート名']` - 特定のエクスポートのimportを強制

### reportMessage オプション

カスタムエラーメッセージを指定できます。以下のプレースホルダーが使用可能です:

- `{{module}}` - モジュール名
- `{{export}}` - エクスポート名

## rules

```js
{
  rules: {
    'smarthr/require-import': [
      'error',
      {
        'Buttons\/.+\.tsx': {
          'smarthr-ui': {
            imported: ['SecondaryButton'],
            reportMessage: 'Buttons以下のコンポーネントでは {{module}}/{{export}} を拡張するようにしてください',
          },
        },
        'Page.tsx$': {
          './client/src/hooks/useTitle': {
            imported: true,
            reportMessage: '{{module}} を利用してください（ページタイトルを設定するため必要です）',
          },
        },
      },
    ]
  },
}
```

## ❌ Incorrect

```js
// client/src/Buttons/SecondaryButton.tsx
import { SecondaryButtonAnchor } from 'smarthr-ui'

// client/src/Page.tsx
import { SecondaryButton } from 'smarthr-ui'
```

## ✅ Correct


```js
// client/src/Buttons/SecondaryButton.tsx
import { SecondaryButton } from 'smarthr-ui'

// client/src/Page.tsx
import useTitle from '.hooks/useTitle'
```
