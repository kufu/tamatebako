# smarthr-ui v97 → v98 移行ルール

このルールは smarthr-ui v98 の破壊的変更を検出します。**自動修正機能はありません。手動での対応が必要です。**

参考: [smarthr-ui v98.0.0 Release Notes](https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v98.0.0)

## 検出される破壊的変更

### 1. `useDevice` の削除

`useDevice` フックが削除されました。代わりに `useTheme().device` を使用してください。

#### ❌ 移行前

```tsx
import { useDevice } from 'smarthr-ui'

function Component() {
  const { isMobile } = useDevice()
  return <div>{isMobile ? 'Mobile' : 'Desktop'}</div>
}
```

#### ✅ 移行後

```tsx
import { useTheme } from 'smarthr-ui'

function Component() {
  const { device } = useTheme()
  const isMobile = device === 'SP'
  return <div>{isMobile ? 'Mobile' : 'Desktop'}</div>
}
```

**注意:** `useDevice` の返り値と `useTheme().device` の形式が異なるため、使用箇所の修正が必要です。

---

### 2. `Th` の `decorators` prop の削除

`Th` コンポーネントの `decorators` prop が削除されました。v94以降、IntlProvider 配下で自動的に翻訳されるため、`decorators` prop は不要です。

#### ❌ 移行前

```tsx
<Th decorators={(text) => text.toUpperCase()}>ヘッダー</Th>
```

#### ✅ 移行後

```tsx
<Th>ヘッダー</Th>
```

**背景:** v94以降、smarthr-ui のコンポーネントは IntlProvider 配下で自動的に翻訳対応されるようになりました。decorators は主に翻訳のために使用されていたため、不要になりました。

---

### 3. `useDecorator` の削除

`useDecorator` フックが削除されました。代わりに `useTranslation()` を使用してください。

#### ❌ 移行前

```tsx
import { useDecorator } from 'smarthr-ui'

function Component() {
  const decorator = useDecorator()
  return <div>{decorator('ラベル')}</div>
}
```

#### ✅ 移行後

```tsx
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation()
  return <div>{t('label')}</div>
}
```

---

## エラーについて

このルールは**検出のみ**を行います。手動修正後もエラーは消えません。

すべての破壊的変更に対応した後、ESLint設定から以下を削除してください:

```js
{
  rules: {
    'smarthr/autofixer-smarthr-ui-migration': ['error', [
      // この行を削除
      { from: '97', to: '98' },
    ]],
  }
}
```

## 設定例

```js
{
  rules: {
    'smarthr/autofixer-smarthr-ui-migration': [
      'error',
      [
        { from: '97', to: '98' },
      ],
    ],
  },
}
```
