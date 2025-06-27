# getLocale

## 📋 概要

`getLocale`関数は、複数の情報源から最適な言語コードを判定して返します。

## 🚀 使用方法

```typescript
import { getLocale } from './getLocale'

// 基本的な使用
const locale = getLocale({
  locale: 'en-US',
  locales: ['ja-JP', 'en-US', 'ko-KR']
})
// 結果: 'en-US'
```

### パラメータ

- **`locale`**: 明示的に指定する言語コード
- **`locales`**: アプリケーションが対応する言語コードの配列
- **`shouldReturnDefaultLanguage`**: `true`の場合、常にデフォルト言語を返す
- **`cookieKey`**: Cookie から言語設定を取得する際のキー名（デフォルト: `'selectedLocale'`）

## 🔍 判定優先順位

1. `shouldReturnDefaultLanguage` パラメータが true の場合デフォルト言語（ `ja-JP` ）を返す
2. `locale` パラメータが指定されており、`locales`配列に含まれていればそれを返す
3. `cookieKey` パラメータで指定したkey（デフォルトは `selectedLocale`）のCookieの値が `locales` 配列に含まれていればそれを返す
4. ブラウザの言語設定を優先度順に確認し、locales配列に含まれていればそれを返す
5. 上記すべてに該当しない場合デフォルト言語（`ja-JP`）を返す


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

## ⚠️ 注意事項

- すべての判定に失敗した場合は`ja-JP`が返されます
- サーバーサイドレンダリング（SSR）対応済み
