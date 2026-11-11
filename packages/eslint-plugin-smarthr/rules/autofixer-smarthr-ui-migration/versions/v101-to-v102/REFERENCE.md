# v101-to-v102 実装リファレンス

このドキュメントは v101-to-v102 移行ルールの実装に関する開発者向けの参考資料です。

v101-to-v102 は v100-to-v101 までの「トップレベル属性名のリネーム」とは異なり、**オブジェクト形式で渡す属性の内部にあるキーのリネーム**が対象です（例: `filtered={{ iconAlt: ... }}` → `filtered={{ alt: ... }}`）。

## 実装パターン

### オブジェクト内キーのリネームを配列で管理

v100-to-v101の`ATTRIBUTE_RENAMES`パターンを拡張し、「対象属性名」と「対象属性の値のオブジェクト内のキー」の両方を指定する形にしています。

```javascript
const OBJECT_PROPERTY_RENAMES = [
  { component: 'FilterDropdown', attribute: 'filtered', oldKey: 'iconAlt', newKey: 'alt' },
  { component: 'DropdownMenuButton', attribute: 'trigger', oldKey: 'children', newKey: 'text' },
]

createCheckers(context) {
  const checkers = {}

  for (const { component, attribute, oldKey, newKey } of OBJECT_PROPERTY_RENAMES) {
    const selector = `JSXAttribute[name.name="${attribute}"]`

    checkers[selector] = (node) => {
      const componentName = node.parent.name.name
      if (componentName !== component) return

      // 属性の値がオブジェクトでない場合（文字列・ReactNode直接指定等）は対象外
      if (node.value?.type !== 'JSXExpressionContainer') return
      const expression = node.value.expression
      if (expression.type !== 'ObjectExpression') return

      const property = expression.properties.find(
        (prop) =>
          prop.type === 'Property' &&
          !prop.computed &&
          ((prop.key.type === 'Identifier' && prop.key.name === oldKey) ||
            (prop.key.type === 'Literal' && prop.key.value === oldKey))
      )

      if (!property) return

      context.report({
        node: property.key,
        messageId: 'renameObjectKey',
        data: { component, attribute, oldKey, newKey, to: TARGET_VERSION, readmeUrl: README_URL },
        fix(fixer) {
          return fixer.replaceText(property.key, newKey)
        },
      })
    }
  }

  return checkers
}
```

**ポイント:**

- 属性の値が`JSXExpressionContainer` かつ `ObjectExpression` である場合のみ対象にする。文字列・ReactNodeを直接指定しているケース（`filtered={true}`、`trigger="テキスト"`）は属性自体の型が変わっていないため対象外
- `property.key`（オブジェクトのキー部分のみ）を`fixer.replaceText`で置換する。値（`property.value`）には触れないため、動的な値・固定値を問わず安全に変換できる
- spread syntax（`filtered={{ ...rest }}`）の場合、`properties.find`で対象キーが見つからなければ何もしない（oldKeyが明示的に存在する場合のみ変換するため、意図しない誤変換は起きない）
- v100-to-v101と同様、`oldKey`が異なる限りセレクターキー（`attribute`名）が重複しない限り安全に追加できる。もし複数コンポーネントが同じ属性名（例: 複数コンポーネントが`trigger`属性を持つ）を使っている場合、セレクター自体に`JSXOpeningElement[name.name="..."] > JSXAttribute[name.name="..."]`の形でコンポーネント名の条件を含める

### このパターンが使えるかどうかの判断基準

以下をすべて満たす場合、このパターンで実装できます：

1. 対象がトップレベル属性ではなく、オブジェクト形式で渡す属性内の1つのキーのリネームである
2. キーの値の意味・型は変わらない（値自体はそのまま引き継げる）
3. 属性がオブジェクト形式以外（文字列・ReactNode直接指定等）で渡されるケースがある場合、それらは対象外として無視してよい

これに当てはまらない場合（例: キーが複数のオブジェクトに分散して統合される、値自体の型変換が必要等）は、v94-to-v95 のようなオブジェクト統合パターンを参考にしてください。

## エラーメッセージ設計

完全に自動修正可能なため、「注意: このエラーは手動修正後も消えません」のような持続性の説明は不要です。

```javascript
renameObjectKey:
  'smarthr-ui {{to}} では {{component}} の `{{attribute}}` に渡すオブジェクトの `{{oldKey}}` キーは `{{newKey}}` にリネームされました。詳細: {{readmeUrl}}',
```

## テストケース設計

### valid（エラーにならない）

- 移行後の書き方（新キー名を使用）
- 属性がオブジェクト形式でない場合（`filtered={true}`、`trigger="文字列"`）
- 他コンポーネントで同名の属性・旧キーを使っているケース（誤検出防止の確認）

### invalid（エラーになる）

- 各リネーム対象ごとに、旧キー名を含むオブジェクトを指定した場合に自動修正されることを確認

## トラブルシューティング

v100-to-v101のREFERENCE.mdと共通のため省略します。[v100-to-v101/REFERENCE.md](../v100-to-v101/REFERENCE.md)を参照してください。
