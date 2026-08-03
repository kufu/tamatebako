# v97-to-v98 実装リファレンス

このドキュメントは v97-to-v98 移行ルールの実装に関する開発者向けの参考資料です。

## 実装パターン

### 検出のみルール（自動修正なし）

v97-to-v98 では、すべての破壊的変更に対して自動修正を行わず、検出のみを行います。

**理由:**
- `useDevice` → `useTheme().device`: 返り値の構造が異なり、単純な置換では対応不可
- `Th decorators`: 使用方法が多様で、一律の削除では対応不可
- `useDecorator` → `useTranslation()`: APIが完全に異なるため、単純な置換では対応不可

**実装方法:**
```javascript
// fix関数を提供しない
context.report({
  node,
  messageId: 'migrateUseDevice',
  data: { to: TARGET_VERSION, readmeUrl: README_URL },
  // fix なし = 自動修正不可
})
```

### Import文の検出

AST セレクタを使用して特定のimportを検出します。

```javascript
"ImportDeclaration[source.value='smarthr-ui'] > ImportSpecifier[imported.name='useDevice']"(node) {
  // validSourcesチェック
  if (!validSources.has(node.parent.source.value) && !isAliasFile) {
    return
  }

  context.report({
    node,
    messageId: 'migrateUseDevice',
    data: { to: TARGET_VERSION, readmeUrl: README_URL },
  })
}
```

**ポイント:**
- `node.parent.source.value` でimport元を確認
- `validSources` と `isAliasFile` でsmarthr-ui関連のimportのみを対象にする

### JSX属性の検出

JSXOpeningElement配下のJSXAttributeを検出します。

```javascript
'JSXOpeningElement[name.name="Th"] > JSXAttribute[name.name="decorators"]'(node) {
  context.report({
    node,
    messageId: 'migrateThDecorators',
    data: { to: TARGET_VERSION, readmeUrl: README_URL },
  })
}
```

**ポイント:**
- JSXOpeningElementで対象コンポーネントを絞り込む
- JSXAttributeで対象属性を検出
- validSourcesチェックは不要（コンポーネント名のみで判定）

## エラーメッセージ設計

### 必須要素

1. **何が変更されたか**: 「useDevice が削除されました」
2. **代替方法**: 「useTheme().device を使用してください」
3. **エラーの持続性**: 「このエラーは手動修正後も消えません」
4. **対応完了後の手順**: 「{ from: "97", to: "98" } 設定を削除してください」
5. **詳細リンク**: README.mdへのリンク

### メッセージテンプレート

```javascript
messages: {
  migrateUseDevice:
    'smarthr-ui {{to}} では useDevice が削除されました。useTheme().device を使用してください。注意: このエラーは手動修正後も消えません。対応完了後は { from: "97", to: "98" } 設定を削除してください。詳細: {{readmeUrl}}',
}
```

## テストケース設計

### valid（エラーにならない）

- 対象のimport/propが含まれていないコード
- 類似しているが異なる名前のコンポーネント/フック

### invalid（エラーになる）

- 基本的な使用例
- 複数のimport/propがある場合
- 複数行にわたる記述
- セルフクロージングタグ

各テストケースには以下を含める:
- `code`: テスト対象コード
- `options`: `[{ from: '97', to: '98' }]`
- `errors`: 期待されるエラー（messageId、data）
- `output`: 自動修正後のコード（検出のみの場合は不要）

## トラブルシューティング

### aliasファイルが検出されない

**症状:** smarthr-uiのエイリアスファイルでimportが検出されない

**原因:** `validSources` チェックでimport元が `'smarthr-ui'` でない場合にスキップされている

**対策:** `isAliasFile` フラグを確認し、aliasファイルの場合は `validSources` チェックをスキップする

```javascript
if (!validSources.has(node.parent.source.value) && !isAliasFile) {
  return
}
```

### JSX属性が検出されすぎる

**症状:** 対象外のコンポーネントでもエラーが出る

**原因:** セレクタが広すぎる

**対策:** JSXOpeningElementで正確なコンポーネント名を指定する

```javascript
// ❌ 広すぎる
'JSXAttribute[name.name="decorators"]'(node) { ... }

// ✅ 正確
'JSXOpeningElement[name.name="Th"] > JSXAttribute[name.name="decorators"]'(node) { ... }
```
