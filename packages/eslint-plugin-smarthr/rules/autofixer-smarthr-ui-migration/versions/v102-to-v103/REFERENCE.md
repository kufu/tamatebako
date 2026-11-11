# v102-to-v103 実装リファレンス

このドキュメントは v102-to-v103 移行ルールの実装に関する開発者向けの参考資料です。

v102-to-v103 は v100-to-v101 と同じ「トップレベル属性名のリネーム」パターンですが、**複数コンポーネントが同じ旧属性名を共有する**点が異なります（`SingleCombobox`と`MultiCombobox`がどちらも`onChange`を`onChangeInput`にリネーム）。

## 実装パターン

### 複数コンポーネントで同じ旧属性名を共有する場合は `components` を配列にする

v100-to-v101のREFERENCE.mdで事前に指摘されていた「複数の対象コンポーネントが同じ旧属性名を使っている場合、セレクターキーが衝突する」問題に該当するケースです。

```javascript
const ATTRIBUTE_RENAMES = [
  { components: ['SingleCombobox', 'MultiCombobox'], oldName: 'onChange', newName: 'onChangeInput' },
]

createCheckers(context) {
  const checkers = {}

  for (const { components, oldName, newName } of ATTRIBUTE_RENAMES) {
    const selector = `JSXAttribute[name.name="${oldName}"]`

    checkers[selector] = (node) => {
      const componentName = node.parent.name.name

      if (!components.includes(componentName)) return

      context.report({
        node,
        messageId: 'renameAttribute',
        data: { component: componentName, oldName, newName, to: TARGET_VERSION, readmeUrl: README_URL },
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

- v100-to-v101では`component`が単一文字列だったが、ここでは`components`配列にして`includes`で判定する。こうすることで`oldName`が同じ2つのエントリを別々に定義する必要がなくなり、セレクターキー（`JSXAttribute[name.name="onChange"]`）の衝突を避けられる
- `data.component`にはマッチした実際の`componentName`を渡す（`components.join(', ')`等にしない）ことで、エラーメッセージが「SingleComboboxのonChange属性は...」のように具体的なコンポーネント名を示せる
- もし「同じ旧属性名だが新属性名がコンポーネントによって異なる」場合はこのパターンは使えない。その場合は`component`を単一のまま維持し、セレクター自体にコンポーネント名の条件を含める（`JSXOpeningElement[name.name="Foo"] > JSXAttribute[name.name="..."]`）

### 自動修正不可能な変更が大半を占める場合の扱い

v103は「非推奨APIの削除」に伴う破壊的変更が7件あるが、単純なリネームで済むのは1件（Combobox onChange）のみで、残り6件（WarekiPicker, Dialog/ModelessDialog, LineClamp, Sidebar, BottomFixedArea, Icon）はいずれも以下のいずれかの理由で自動修正の対象外とした:

- コールバックの引数の形自体が変わる（WarekiPicker）
- 値の対応表が必要（数値→enum、Dialog/ModelessDialogのwidth）
- コンポーネントの置き換え+属性構造の変更（LineClamp, Sidebar）
- 移行先コンポーネントの具体的なprops例がPR本文に無い（BottomFixedArea）
- デザイントークンの値変換が必要（Icon size）

このように、1バージョンの破壊的変更のうち自動修正可能な対象が少数（または0件）であることは珍しくない。index.jsのコメントとREADME.mdの「対象外の変更」セクションに、なぜ自動修正しないかの理由を明記することを徹底する。

## エラーメッセージ設計

v100-to-v101と同じ`renameAttribute`メッセージをそのまま使い回している。完全に自動修正可能なため、持続性の説明（「手動修正後も消えません」等）は不要。

## テストケース設計

### valid（エラーにならない）

- 移行後の書き方（両コンポーネントで`onChangeInput`を使用）
- 他コンポーネント・html要素の同名属性（誤検出防止の確認。`input`の`onChange`、`OtherCombobox`の`onChange`）

### invalid（エラーになる）

- `SingleCombobox`、`MultiCombobox`それぞれで`onChange`を指定した場合に自動修正されることを確認（`components`配列が両方正しく動作することの確認）

## トラブルシューティング

v100-to-v101のREFERENCE.mdと共通のため省略します。[v100-to-v101/REFERENCE.md](../v100-to-v101/REFERENCE.md)を参照してください。
