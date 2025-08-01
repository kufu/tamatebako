# @smarthr/i18n

SmartHRの国際化（i18n）ユーティリティライブラリです。

## 主な機能

- ロケールの取得
- Reactコンポーネント向けの国際化サポート

## サブパッケージ

- [`get-locale`](./src/get-locale/README.md): 複数の情報源から最適な言語コードを判定して返します。
- [`use-intl`](./src/use-intl/README.md): `use-intl`または`next-intl`ライブラリを利用して国際化（i18n）機能を提供するカスタムReactフックです。

## インストール

```bash
npm install @smarthr/i18n
```

## 利用方法

各サブパッケージの詳細な使い方は、上記リンク先のREADMEをご参照ください。

### Next.jsでの使用例

[next-intlのGetting started](https://next-intl.dev/docs/getting-started)に従って`next-intl`の環境をセットアップします。
ここではApp Routerでの[i18nルーティングを使わないパターン](https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing)で`@smarthr/i18n`を利用する例を記載します。

`request.ts`ファイルで`getLocale`を利用してアプリケーションがサポートする言語からロケールを決定します。`currentLocale`の取得はアプリケーションごとに実装するものとします。

```ts
import { getRequestConfig } from 'next-intl/server'
import { getLocale, Locale } from '@smarthr/i18n'
import { getUserLocale } from '@/getUserLocale'

const supportedLocales: Locale[] = ['ja-JP', 'en-US']

export default getRequestConfig(async () => {
  const currentLocale = await getUserLocale()

  const locale = getLocale({
    currentLocale,
    supportedLocales,
  })
  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  }
})
```

`layout.tsx`で`NextIntlClientProvider`を適用します。

```tsx
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
```

多言語化を適用したいページで`useNextIntl`を使います。
React Server Componentsで使う場合は[ワークアラウンド](./src/use-intl/README.md#react-server-componentsで使う場合のワークアラウンド)を利用します。

```tsx
import { useNextIntl } from '@smarthr/i18n'

export default function Home() {
  const { formatMessage } = useNextIntl()
  return <div>{formatMessage('Home.greeting')}</div>
}
```
