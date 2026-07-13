# v95-to-v96 実装リファレンス

このドキュメントは、v95-to-v96移行ルールの実装パターンとトラブルシューティングをまとめた開発者向けリファレンスです。

## 実装パターン

### 1. JSX属性値の文字列置換

**ユースケース:** Chip の size 属性を "s" から "S" に変更

**実装例:**
```javascript
'JSXOpeningElement[name.name=/Chip$/] > JSXAttribute[name.name="size"][value.type="Literal"][value.value="s"]'(node) {
  context.report({
    node,
    messageId: 'migrateChipSize',
    data: { to: TARGET_VERSION },
    fix(fixer) {
      // "s" → "S" に置換
      return fixer.replaceText(node.value, '"S"')
    },
  })
}
```

**ポイント:**
- セレクタで条件をすべて絞り込む（関数内チェック不要）
- `name.name=/Chip$/`: Chipで終わるコンポーネント名（CustomChip等も対象）
- `[value.type="Literal"][value.value="s"]`: 文字列リテラル "s" のみ
- `fixer.replaceText()` で値全体を置換する

**検出対象:**
```jsx
<Chip size="s">label</Chip>  // ✅ 検出される
```

**検出対象外:**
```jsx
<Chip size={dynamicSize}>label</Chip>  // ❌ 動的な値
<Chip size={"s"}>label</Chip>          // ❌ JSX式
<OtherComponent size="s" />            // ❌ 他のコンポーネント
```

## テストパターン

### 基本的なテスト構成

```javascript
const v95ToV96Options = [{ from: '95', to: '96' }]

const valid = [
  // 既に正しい値
  { code: '<Chip size="S">label</Chip>', options: v95ToV96Options },

  // 動的な値（検出対象外）
  { code: '<Chip size={dynamicSize}>label</Chip>', options: v95ToV96Options },
]

const invalid = [
  {
    code: '<Chip size="s">label</Chip>',
    output: '<Chip size="S">label</Chip>',
    options: v95ToV96Options,
    errors: [
      {
        messageId: 'migrateChipSize',
        data: { to: 'v96' },
      },
    ],
  },
]
```

## トラブルシューティング

### JSX式内の文字列が検出されない

**問題:**
```jsx
<Chip size={"s"}>label</Chip>  // 検出されない
```

**原因:**
JSX式（`{}`）内の文字列は `JSXExpressionContainer > Literal` という構造になる。

**対処:**
現在の実装では文字列リテラル（`size="s"`）のみを対象としています。JSX式内の文字列も対象にする場合は、以下のように拡張できます：

```javascript
'JSXOpeningElement[name.name="Chip"] > JSXAttribute[name.name="size"]'(node) {
  const value = node.value

  // 文字列リテラル: size="s"
  if (value && value.type === 'Literal' && value.value === 's') {
    // 修正処理
  }

  // JSX式: size={"s"}
  if (value && value.type === 'JSXExpressionContainer') {
    const expr = value.expression
    if (expr.type === 'Literal' && expr.value === 's') {
      // 修正処理
    }
  }
}
```

ただし、実用上は文字列リテラルのみで十分なケースが多いです。

## 参考情報

### AST構造

**文字列リテラル:** `size="s"`
```
JSXAttribute
├── name: JSXIdentifier (name: "size")
└── value: Literal (value: "s")
```

**JSX式:** `size={"s"}`
```
JSXAttribute
├── name: JSXIdentifier (name: "size")
└── value: JSXExpressionContainer
    └── expression: Literal (value: "s")
```

### 関連ドキュメント

- [ESLint AST Explorer](https://astexplorer.net/)
- [smarthr-ui v96.0.0 Release Notes](https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v96.0.0)
