# v100-to-v101 実装リファレンス

このドキュメントは v100-to-v101 移行ルールの実装に関する開発者向けの参考資料です。

v100-to-v101 は v99-to-v100 と同じ「単一属性名リネーム」パターンですが、**対象の組み合わせ（コンポーネント + 旧属性名 + 新属性名）が複数ある**点が異なります。

## 実装パターン

### 複数の属性名リネームを配列で管理

v99-to-v100では対象が1件だけだったため定数を直接埋め込みましたが、2件以上になったため配列で管理し、ループでチェッカーを生成します。

```javascript
const ATTRIBUTE_RENAMES = [
  { component: 'SingleCombobox', oldName: 'defaultItem', newName: 'emptySelectionFallbackItem' },
  { component: 'Badge', oldName: 'type', newName: 'color' },
]

createCheckers(context) {
  const checkers = {}

  for (const { component, oldName, newName } of ATTRIBUTE_RENAMES) {
    const selector = `JSXAttribute[name.name="${oldName}"]`

    checkers[selector] = (node) => {
      const componentName = node.parent.name.name

      if (componentName !== component) return

      context.report({
        node,
        messageId: 'renameAttribute',
        data: { component, oldName, newName, to: TARGET_VERSION, readmeUrl: README_URL },
        fix(fixer) {
          return fixer.replaceText(node.name, newName)
        },
      })
    }
  }

  return checkers
}
```

**ポイント:**

- `oldName`が異なる限り、セレクターのキーが重複しないため`checkers`オブジェクトに安全に追加できる
- もし複数の対象コンポーネントが**同じ**旧属性名を使っている場合（例: `Foo`と`Bar`が両方とも`type`属性を持ち、別の名前にリネームされる場合）、セレクターキーが衝突し後勝ちで上書きされてしまう。その場合はセレクター自体にコンポーネント名の条件を含める（`JSXOpeningElement[name.name="Foo"] > JSXAttribute[name.name="type"]`）か、セレクター内で複数コンポーネントの配列を参照して分岐する
- messagesは`renameAttribute`の1つに共通化し、`data`で component/oldName/newName を渡す（v99-to-v100では1件だったため専用のmessageIdだったが、件数が増えたら汎用化するのが自然）

### このパターンが使えるかどうかの判断基準（v99-to-v100から変更なし）

以下をすべて満たす場合、このシンプルなパターンで実装できます：

1. 属性名のみの変更で、値の意味・型は変わらない
2. 新旧の属性が同時に存在するケースを考慮する必要がない

これに当てはまらない場合は、v98-to-v99 のような分割代入解析パターンを参考にしてください。

## エラーメッセージ設計

完全に自動修正可能なため、「注意: このエラーは手動修正後も消えません」のような持続性の説明は不要です。

```javascript
renameAttribute:
  'smarthr-ui {{to}} では {{component}} の `{{oldName}}` 属性は `{{newName}}` にリネームされました。詳細: {{readmeUrl}}',
```

## テストケース設計

### valid（エラーにならない）

- 移行後の書き方（各コンポーネントで新属性名を使用）
- 他コンポーネントで同名の旧属性名を使っているケース（誤検出防止の確認。例: `Badge`以外のコンポーネントの`type`属性）

### invalid（エラーになる）

- 各リネーム対象ごとに、旧属性名のみ指定した場合に自動修正されることを確認

## トラブルシューティング

v99-to-v100のREFERENCE.mdと共通のため省略します。[v99-to-v100/REFERENCE.md](../v99-to-v100/REFERENCE.md)を参照してください。
