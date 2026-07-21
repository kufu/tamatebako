# require-i18n-translation-sync

TypeScript翻訳ファイル（ja.ts）とJSON翻訳ファイル（ja.json）の同期を保証するルールです。

## 背景

多言語翻訳の仕組みでは以下の要件があります：

1. **TypeScript形式が必要な理由**
   - 翻訳キーの型定義により、存在しないキーの使用を静的解析でエラーに
   - FormattedMessageの`defaultMessage`が翻訳ファイルの値と一致することを型で保証

2. **JSON形式が必要な理由**
   - 全言語でキー構造を揃える必要がある（翻訳ツールの仕様）
   - 翻訳ツールとの互換性

3. **SSOT（Single Source of Truth）の原則**
   - ja.ts と ja.json を別々に定義すると内容の食い違いが発生
   - ja.ts をソースとして、ja.json を自動生成する

このルールは、ja.ts と ja.json の内容が一致することを保証し、不一致があれば自動修正します。

## チェック内容

### 1. オブジェクトリテラルのexportは1つのみ

翻訳ファイルは必ず1つのオブジェクトリテラルをexportする必要があります。型定義など、オブジェクトリテラル以外のexportは複数あっても問題ありません。

```typescript
// ❌ NG: オブジェクトリテラルが複数
export const translations = { ... }
export const other = { ... }

// ✅ OK: オブジェクトリテラルは1つのみ
export const translations = { ... }

// ✅ OK: 型定義とオブジェクトリテラル
export type TranslationKeys = keyof typeof translations
export const translations = { ... }
```

### 2. フラットな構造

翻訳ファイルはフラットなオブジェクト構造である必要があります。

```typescript
// ❌ NG: ネストされたオブジェクト
export const translations = {
  Common: {
    Button: {
      Submit: '送信',
    },
  },
}

// ✅ OK: フラットな構造
export const translations = {
  'Common/Button/Submit': '送信',
}
```

### 3. 値は文字列のみ

オブジェクトの値はすべて文字列である必要があります。

```typescript
// ❌ NG: 数値、真偽値
export const translations = {
  count: 123,
  enabled: true,
}

// ✅ OK: 文字列のみ
export const translations = {
  count: '123',
  enabled: 'true',
}
```

### 4. JSONとの同期

ja.ts と ja.json の内容が一致する必要があります。不一致の場合、autofixで ja.json を自動生成します。

## エラーケース

### オブジェクトリテラルが複数

```typescript
// ❌ NG
export const translations = { key1: 'value1' }
export const other = { key2: 'value2' }
```

**エラー:** 翻訳ファイルはオブジェクトリテラルを1つのみexportする必要があります。

### オブジェクトリテラルのexportがない

```typescript
// ❌ NG: exportがない
const translations = { key1: 'value1' }

// ❌ NG: オブジェクトリテラル以外をexport
export const translations = 'not an object'
export const translations = ['array']

// ❌ NG: 型のみをexport
export type TranslationKeys = string
```

**エラー:** 翻訳ファイルはオブジェクトリテラルをexportする必要があります。

### 値が文字列以外

```typescript
// ❌ NG
export const translations = {
  count: 123,
  enabled: true,
  value: null,
}
```

**エラー:** キー "count" の値は文字列である必要があります。

### ネストされたオブジェクト

```typescript
// ❌ NG
export const translations = {
  Common: {
    Button: 'ボタン',
  },
}
```

**エラー:** キー "Common" の値はネストされたオブジェクトです。翻訳ファイルはフラットな構造である必要があります。

### スプレッド構文

```typescript
// ❌ NG
const base = { key1: 'value1' }
export const translations = { ...base, key2: 'value2' }
```

**エラー:** スプレッド構文は使用できません。

### テンプレートリテラルに式を含む

```typescript
// ❌ NG
export const translations = {
  message: `Hello ${name}`,
}
```

**エラー:** テンプレートリテラルに式を含めることはできません。

### ja.ts と ja.json が不一致

```typescript
// ja.ts
export const translations = { key1: 'new value' }

// ja.json（古い内容）
{
  "key1": "old value"
}
```

**エラー:** 翻訳ファイル（ja.ts）とJSONファイル（ja.json）の内容が一致しません。autofixで同期できます。

**修正:** ESLintの`--fix`オプションを使用すると、ja.json が自動的に更新されます。

## OK例

### export const

```typescript
export const translations = {
  'Common/Button/Submit': '送信',
  'Common/Button/Cancel': 'キャンセル',
}
```

### export default

```typescript
export default {
  'Common/Button/Submit': '送信',
  'Common/Button/Cancel': 'キャンセル',
}
```

### 型アサーション

```typescript
export const translations = {
  'Common/Button/Submit': '送信',
} as const
```

### satisfies演算子

```typescript
// satisfies のみ
export const translations = {
  'Common/Button/Submit': '送信',
} satisfies Record<string, string>

// as const と satisfies の併用
export const translations = {
  'Common/Button/Submit': '送信',
} as const satisfies Record<string, string>

// satisfies と as const の併用（順序逆）
export const translations = {
  'Common/Button/Submit': '送信',
} satisfies Record<string, string> as const
```

### 型注釈

```typescript
export const translations: Record<string, string> = {
  'Common/Button/Submit': '送信',
}
```

### テンプレートリテラル（式なし）

```typescript
export const translations = {
  message: `Hello`,
}
```

### Identifierキー

```typescript
export const translations = {
  submit: '送信',
  cancel: 'キャンセル',
}
```

### 型定義との併用

```typescript
export type TranslationKeys = keyof typeof translations

export const translations = {
  'Common/Button/Submit': '送信',
  'Common/Button/Cancel': 'キャンセル',
}
```

## オプション

### targetFileName

対象とするファイル名を指定します。デフォルトは`ja.ts`です。

```javascript
{
  'smarthr/require-i18n-translation-sync': ['error', {
    targetFileName: 'en_us.ts'
  }]
}
```

### indent

JSON出力時のインデント幅を指定します。デフォルトは`2`（2スペース）です。

```javascript
{
  'smarthr/require-i18n-translation-sync': ['error', {
    indent: 4
  }]
}
```

### endOfLine

JSON出力時の改行コードを指定します。デフォルトは`lf`です。

- `lf`: LF（`\n`）Unix/Linux/macOS標準
- `crlf`: CRLF（`\r\n`）Windows標準

```javascript
{
  'smarthr/require-i18n-translation-sync': ['error', {
    endOfLine: 'crlf'
  }]
}
```

## 使用例

### 推奨: 対象ファイルのみに適用（効率的）

**このルールは対象ファイル（デフォルト: ja.ts）のみをチェックするため、全ファイルに対して実行すると無駄なチェックが発生します。**

ESLintの `files` オプションで対象ファイルを指定することで、効率的にチェックできます。

```javascript
export default [
  {
    files: ['**/ja.ts'],
    rules: {
      'smarthr/require-i18n-translation-sync': 'error',
    },
  },
]
```

### 基本的な使用（非推奨）

全ファイルに対してルールを有効化する場合（対象外ファイルは内部でスキップされますが効率が悪いです）：

```javascript
{
  'smarthr/require-i18n-translation-sync': 'error'
}
```

### カスタム設定

```javascript
export default [
  {
    files: ['**/ja.ts'],
    rules: {
      'smarthr/require-i18n-translation-sync': [
        'error',
        {
          targetFileName: 'ja.ts',
          indent: 2,
          endOfLine: 'lf',
        },
      ],
    },
  },
]
```

### 複数の言語ファイルに対応

英語の翻訳ファイルも同様にチェックする場合：

```javascript
export default [
  {
    files: ['**/ja.ts'],
    rules: {
      'smarthr/require-i18n-translation-sync': [
        'error',
        {
          targetFileName: 'ja.ts',
        },
      ],
    },
  },
  {
    files: ['**/en.ts'],
    rules: {
      'smarthr/require-i18n-translation-sync': [
        'error',
        {
          targetFileName: 'en.ts',
        },
      ],
    },
  },
]
```

## 自動修正

このルールは`--fix`オプションで自動修正できます。

```bash
eslint --fix path/to/ja.ts
```

自動修正により、ja.ts から抽出した翻訳データが ja.json に書き込まれます。

## 注意事項

- このルールは指定されたファイル名（デフォルト: ja.ts）にのみ適用されます
- JSONファイルのキー順序は、TypeScriptファイルの記述順を保持します
- 他言語ファイル（en.json, zh.json など）は翻訳ツールで管理し、開発者が直接編集することは想定していません
