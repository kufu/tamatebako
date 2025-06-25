# getLocale

## 📋 概要

`getLocale`関数は、複数の情報源から最適な言語コードを判定して返します。

## 🌐 対応言語

| 言語コード | 言語名 |
|-----------|--------|
| `ja-JP` | 日本語 |
| `en-US` | 英語 |
| `ko-KR` | 韓国語 |
| `zh-Hant-TW` | 繁体中文 |
| `zh-Hans-CN` | 簡体中文 |
| `vi-VN` | ベトナム語 |
| `pt-BR` | ポルトガル語 |
| `ja-JP-x-easy` | やさしい日本語 |
| `id-ID` | インドネシア語 |

## 🔍 判定優先順位

`getLocale`関数は以下の優先順位で言語コードを判定します：

1. **`shouldReturnDefaultLanguage`が`true`** → デフォルト言語（`ja-JP`）
2. **`locale`パラメータ** → 明示的に指定された言語コード
3. **Cookie値** → `cookieKey`で指定したCookieの値
4. **ブラウザ言語設定** → ブラウザの言語設定から対応言語を検索
5. **デフォルト言語** → 上記すべてに該当しない場合

## 📝 型定義

```typescript
export type Locale = 
  | 'ja-JP' 
  | 'en-US' 
  | 'ko-KR' 
  | 'zh-Hant-TW' 
  | 'zh-Hans-CN' 
  | 'vi-VN' 
  | 'pt-BR' 
  | 'ja-JP-x-easy' 
  | 'id-ID'
```

## 🚀 使用方法

### 基本的な使用例

```typescript
import { getLocale } from './getLocale'

// 基本的な使用
const locale = getLocale({
  locale: 'en-US',
  locales: ['ja-JP', 'en-US', 'ko-KR']
})
// 結果: 'en-US'
```

### 各パラメータの詳細

#### `locale: Locale | null`
明示的に指定する言語コード。

```typescript
const locale = getLocale({
  locale: 'ko-KR',
  locales: ['ja-JP', 'en-US', 'ko-KR']
})
// 結果: 'ko-KR'
```

#### `locales: Locale[]`
アプリケーションが対応する言語コードの配列。

```typescript
const supportedLocales = ['ja-JP', 'en-US', 'zh-Hans-CN']
const locale = getLocale({
  locale: null,
  locales: supportedLocales
})
```

#### `shouldReturnDefaultLanguage?: boolean`
`true`の場合、常にデフォルト言語（`ja-JP`）を返します。

```typescript
const locale = getLocale({
  locale: 'en-US',
  locales: ['ja-JP', 'en-US'],
  shouldReturnDefaultLanguage: true
})
// 結果: 'ja-JP' (強制的にデフォルト)
```

#### `cookieKey?: string`
Cookie から言語設定を取得する際のキー名。デフォルトは`'selectedLocale'`。

```typescript
// カスタムCookieキーを使用
const locale = getLocale({
  locale: null,
  locales: ['ja-JP', 'en-US'],
  cookieKey: 'userPreferredLocale'
})
```

## 🔧 内部機能

### `getCookieLocale(cookieKey: string): Locale | null`
指定されたキーのCookie値を取得し、有効なロケールの場合のみ返します。

- サーバーサイドレンダリング対応
- 無効な値の場合は`null`を返す
- 型安全性を保証

### `convertLang(lang: string): Locale`
ブラウザの言語設定文字列を、アプリケーションで使用する言語コードに変換します。

#### 変換ルール
- `ja*` → `ja-JP`
- `en*` → `en-US`
- `ko*` → `ko-KR`
- `pt*` → `pt-BR`
- `vi*` → `vi-VN`
- `id*` → `id-ID`
- `zh-cn*` / `zh-hans*` → `zh-Hans-CN`
- `zh-tw*` / `zh-hant*` / `zh-hk*` → `zh-Hant-TW`
- `zh*` (その他) → `zh-Hans-CN`

### `validateLocale(locale: string): locale is Locale`
文字列が有効な`Locale`型かどうかを判定するタイプガード関数。

## 🧪 テスト

### テストファイル
- `getLocale.browser.test.ts` - ブラウザ環境でのテスト（jsdom）
- `getLocale.node.test.ts` - Node.js環境でのテスト

### テスト実行
```bash
# ブラウザ環境テスト
npm test -- getLocale.browser.test.ts

# Node.js環境テスト  
npm test -- getLocale.node.test.ts
```

## 🔒 サーバーサイドレンダリング（SSR）対応

- `typeof window === 'undefined'` でサーバーサイドを検出
- サーバーサイドでは常にデフォルト言語を返す
- `document.cookie` の安全なアクセスを保証

## ⚠️ 注意事項

1. **Cookie値の検証**: Cookieから取得した値は必ず`validateLocale`で検証されます
2. **フォールバック**: すべての判定に失敗した場合は`ja-JP`が返されます
3. **大文字小文字**: ブラウザ言語設定は小文字に正規化してから処理されます
4. **型安全性**: TypeScriptの型システムにより、無効な言語コードの使用を防止

## 📖 使用例集

### シンプルな多言語対応
```typescript
const locale = getLocale({
  locale: null,
  locales: ['ja-JP', 'en-US']
})
```

### Cookie による言語記憶機能
```typescript
// 言語をCookieに保存
document.cookie = `selectedLocale=en-US; path=/; max-age=31536000`

// 次回アクセス時に自動復元
const locale = getLocale({
  locale: null,
  locales: ['ja-JP', 'en-US', 'ko-KR']
})
// 結果: 'en-US' (Cookieから復元)
```

### 管理画面での強制日本語表示
```typescript
const locale = getLocale({
  locale: 'en-US',
  locales: ['ja-JP', 'en-US'],
  shouldReturnDefaultLanguage: true
})
// 結果: 'ja-JP' (管理者向けは常に日本語)
``` 
