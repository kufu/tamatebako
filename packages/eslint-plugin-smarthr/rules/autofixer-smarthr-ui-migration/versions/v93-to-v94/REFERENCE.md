# v93-to-v94 実装の参考ポイント

このドキュメントは、v93→v94の移行ルール実装の構造と、新しいversionを追加する際の参考ポイントを説明します。

## v93→v94 特有の実装パターン

### 1. ThCheckbox の decorators 属性削除

v94では ThCheckbox コンポーネントから `decorators` 属性が削除されました。v92-to-v93のDropZoneと異なり、**新しい属性への移行はなく、完全に削除する**だけのシンプルなパターンです。

#### 1-1. decorators属性のチェッカー（シンプルな削除）

```javascript
'JSXAttribute[name.name="decorators"]'(node) {
  const componentName = node.parent.name.name

  // ThCheckboxコンポーネントのみを対象
  if (componentName !== 'ThCheckbox') return

  context.report({
    node,
    messageId: 'removeDecorators',
    data: { component: componentName, to: TARGET_VERSION },
    fix(fixer) {
      // decorators属性を削除
      const tokenBefore = sourceCode.getTokenBefore(node)
      if (tokenBefore && tokenBefore.range[1] < node.range[0]) {
        return fixer.removeRange([tokenBefore.range[1], node.range[1]])
      }
      return fixer.remove(node)
    },
  })
}
```

**ポイント:**
- **v92-to-v93のDropZoneとの違い**:
  - DropZone: `decorators.selectButtonLabel` → `selectButtonLabel`属性への移行
  - ThCheckbox: `decorators` 完全削除（IntlProviderのみ使用）
- **値の解析不要**: decoratorsの内容に関わらず削除するため、`extractSelectButtonLabel`のような解析関数は不要
- **条件分岐なし**: spread syntax、他のキーの存在など、複雑な条件分岐が不要
- **自動修正: 常に可能**: 手動対応が必要なケースなし

#### 1-2. 前後の空白処理

```javascript
// decorators属性を削除
const tokenBefore = sourceCode.getTokenBefore(node)
if (tokenBefore && tokenBefore.range[1] < node.range[0]) {
  // 前のトークンとの間に空白がある場合、空白も含めて削除
  return fixer.removeRange([tokenBefore.range[1], node.range[1]])
}
return fixer.remove(node)
```

**重要:**
- `getTokenBefore`で前のトークン（他の属性やコンポーネント名）を取得
- 前のトークンの終了位置とdecorators属性の開始位置の間に空白があれば、空白も含めて削除
- これにより `<ThCheckbox decorators={{}}` → `<ThCheckbox` のように余分な空白が残らない

## v92-to-v93との実装比較

### DropZone (v92-to-v93) - 複雑

```javascript
// decoratorsの値を解析
const result = extractSelectButtonLabel(node)

// 条件分岐
if (result.type === 'spread') { /* 手動対応 */ }
if (result.type === 'other-keys') { /* 手動対応 */ }
if (result.type === 'migratable') {
  // selectButtonLabel属性を追加 + decorators削除
  fix(fixer) {
    const fixes = []
    fixes.push(fixer.insertTextAfter(node.parent.name, selectButtonLabelAttr))
    fixes.push(fixer.removeRange([tokenBefore.range[1], node.range[1]]))
    return fixes
  }
}
```

### ThCheckbox (v93-to-v94) - シンプル

```javascript
// 値の解析不要、条件分岐なし
context.report({
  node,
  messageId: 'removeDecorators',
  fix(fixer) {
    // decorators削除のみ
    const tokenBefore = sourceCode.getTokenBefore(node)
    if (tokenBefore && tokenBefore.range[1] < node.range[0]) {
      return fixer.removeRange([tokenBefore.range[1], node.range[1]])
    }
    return fixer.remove(node)
  }
})
```

## 共通パターン

### setupSmarthrUiAliasOptions の使用

```javascript
const { validSources, isAliasFile, filename } = setupSmarthrUiAliasOptions(context, options)
```

**目的:**
- `smarthrUiAlias`オプションに対応
- aliasファイル（`@/components/parts/smarthr-ui`等）の検出
- export変数名の置換（コンポーネント名変更時のみ必要）

**v93-to-v94では:**
- ThCheckboxはリネームされないため、export変数名の置換は不要
- ただし`setupSmarthrUiAliasOptions`は他のversionとの一貫性のため呼び出す

## テストケースのパターン

### valid（エラーにならないケース）

```javascript
'<ThCheckbox>Label</ThCheckbox>',  // decoratorsなし
'<OtherComponent decorators={{}} />',  // ThCheckbox以外
```

### invalid（エラーになるケース）

```javascript
{
  code: '<ThCheckbox decorators={{ selectAll: () => "全選択" }}>Label</ThCheckbox>',
  output: '<ThCheckbox>Label</ThCheckbox>',
  errors: [{ messageId: 'removeDecorators' }]
},
{
  code: '<ThCheckbox decorators={{}}>Label</ThCheckbox>',
  output: '<ThCheckbox>Label</ThCheckbox>',
  errors: [{ messageId: 'removeDecorators' }]
}
```

## 新しいversionを追加する場合

### シンプルな削除パターン（ThCheckboxタイプ）の場合

1. **セレクター**: `JSXAttribute[name.name="属性名"]`
2. **コンポーネント判定**: `if (componentName !== 'TargetComponent') return`
3. **fix**: decorators属性を削除（前の空白も含む）
4. **テスト**: valid（属性なし、他コンポーネント）、invalid（属性あり → 削除）

### 複雑な移行パターン（DropZoneタイプ）の場合

1. **解析関数**: decoratorsの値を解析し、移行可能性を判定
2. **条件分岐**: spread / migratable / not-migratable / no-label 等
3. **fix**: 新属性追加 + decorators削除（migratableの場合のみ）
4. **テスト**: valid（新属性、他コンポーネント）、invalid（各パターン）

## 実装の参考ポイント

**最新version:** [v93-to-v94/REFERENCE.md](./versions/v93-to-v94/REFERENCE.md)

### ESLint fixer API

- `fixer.remove(node)`: ノードを削除
- `fixer.removeRange([start, end])`: 範囲を削除
- `fixer.insertTextAfter(node, text)`: ノードの後にテキスト挿入
- `sourceCode.getTokenBefore(node)`: 前のトークンを取得
- `sourceCode.getText(node)`: ノードのテキストを取得

### ASTノード構造

```javascript
// <ThCheckbox decorators={{ selectAll: () => "全選択" }}>
{
  type: 'JSXAttribute',
  name: { type: 'JSXIdentifier', name: 'decorators' },
  value: {
    type: 'JSXExpressionContainer',
    expression: {
      type: 'ObjectExpression',
      properties: [...]
    }
  },
  parent: {
    type: 'JSXOpeningElement',
    name: { type: 'JSXIdentifier', name: 'ThCheckbox' }
  }
}
```

## トラブルシューティング

### 前の空白が残る

**原因**: `fixer.remove(node)`のみだと、前の空白が残る

**解決策**:
```javascript
const tokenBefore = sourceCode.getTokenBefore(node)
if (tokenBefore && tokenBefore.range[1] < node.range[0]) {
  return fixer.removeRange([tokenBefore.range[1], node.range[1]])
}
```

### aliasファイルで動作しない

**原因**: `smarthrUiAlias`オプションが設定されていない

**解決策**:
- `setupSmarthrUiAliasOptions`を呼び出す
- テストで`smarthrUiAlias`オプションを指定したケースを追加

### export変数名が置換されない

**原因**: コンポーネント名変更時、aliasファイルのexport変数名を置換していない

**解決策**: v90-to-v91の`renameExportedIdentifiers`パターンを参照
