# useIntl

## 📋 概要

`useIntl` は、`use-intl`ライブラリを利用して国際化（i18n）機能を提供するカスタムReactフックです。

このフックは、アプリケーション内でメッセージの翻訳や国際化処理を簡単に行うためのユーティリティを提供します。内部的に `use-intl` ライブラリの `useTranslations` を使用し、型安全なメッセージ取得をサポートします。

## 🚀 使用方法

### 基本的な使い方

```typescript
import { useIntl } from '@smarthr/i18n'

function MyComponent() {
  const intl = useIntl();

  return <div>{intl.formatMessage('greeting')}</div>;
}
```

### 型安全な使い方

カスタムメッセージ型を定義して使用することで、より型安全にメッセージを扱えます。

```tsx
import messages from '@/locales/ja.json'

type MyMessages = typeof messages

function MyComponent() {
  const intl = useIntl<MyMessages>()

  // TypeScriptが型チェックを行います
  return <div>{intl.formatMessage('greeting')}</div>
}
```

> **参考**
>
> 個別に型パラメータを指定せずにまとめて指定したい場合は `next-intl`の[ドキュメント](https://next-intl.dev/docs/workflows/typescript)を参考に定義してください。

動的にリソースのキーIDを組み立てて使うなどで、意図的に型チェックを緩める必要がある場合は `strict`オプションを`false`指定してください。

```tsx
import messages from '@/locales/ja.json'

type MyMessages = typeof messages

function MyComponent() {
  const intl = useIntl<MyMessages>()

  // 型チェックを意図的に弱めます
  return <div>{intl.formatMessage('unknown', { strict: false })}</div>
}
```

### パラメータ付きメッセージ

埋め込みパラメータを利用する場合は `values`オプションで指定します。その他タグの拡張をしたい場合は`next-intl`の[Rich textのドキュメント](https://next-intl.dev/docs/usage/messages#rich-text)を参照してください。

brタグは標準で置き換えを行います。メッセージでの書き方は[こちら](https://next-intl.dev/docs/usage/messages#rich-text-self-closing)を参照してください。

```tsx
function MyComponent() {
  const intl = useIntl()

  return (
    <div>
      {intl.formatMessage('user.welcome', {
        values: { name: 'test' },
      })}
    </div>
  )
}
```

## ⚠️ 注意事項

- `useIntl`フックはReactのClient Componentのみで動作します。

# useNextIntl

## 📋 概要

`useNextIntl` は、`next-intl`ライブラリを利用して国際化（i18n）機能を提供するNext.jsベースのアプリケーション向けのカスタムReactフックです。

このフックは、アプリケーション内でメッセージの翻訳や国際化処理を簡単に行うためのユーティリティを提供します。内部的に `next-intl` ライブラリの `useTranslations` を使用し、型安全なメッセージ取得をサポートします。

## 🚀 使用方法

`useIntl`の使用方法を参照してください。

## ⚠️ 注意事項

- `useNextIntl`フックはReactのClient Componentのみで動作します。React Server Componentsで利用したい場合は次のワークアラウンドを行ってください。

### React Server Componentsで使う場合のワークアラウンド

アプリケーションのコードベース内で`useIntlImpl`を利用し、次のように`useNextIntl`を実装します。

```tsx
import { useIntlImpl } from '@smarthr/i18n'
import { type Messages, useTranslations } from 'next-intl'

export const useNextIntl = () => useIntlImpl<Messages>(useTranslations)
```

実装した`useNextIntl`をアプリケーション内で利用します。
