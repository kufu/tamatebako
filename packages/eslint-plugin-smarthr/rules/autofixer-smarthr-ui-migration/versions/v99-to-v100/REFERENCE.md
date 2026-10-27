# v99-to-v100 実装リファレンス

このドキュメントは v99-to-v100 移行ルールの実装に関する開発者向けの参考資料です。

v99-to-v100 は **単一コンポーネントの単一属性名リネーム** という、これまでのversionの中で最もシンプルなパターンです。値そのものは変更せず、属性名だけを置き換えます。

## 実装パターン

### 単一属性名のリネーム

`NotificationBar` の `base` 属性を `paneled` にリネームするだけなので、
`JSXAttribute` セレクターで属性名にマッチし、親要素（`JSXOpeningElement`）のコンポーネント名で対象を絞り込みます。

```javascript
const checkers = {
  'JSXAttribute[name.name="base"]'(node) {
    const componentName = node.parent.name.name

    // NotificationBarコンポーネントのみを対象
    if (componentName !== 'NotificationBar') return

    context.report({
      node,
      messageId: 'renameNotificationBarBase',
      data: { component: componentName, to: TARGET_VERSION, readmeUrl: README_URL },
      fix(fixer) {
        // 属性名のみ置換し、値はそのまま引き継ぐ
        return fixer.replaceText(node.name, 'paneled')
      },
    })
  },
}
```

**ポイント:**

- `JSXAttribute` の `node.parent` は常に `JSXOpeningElement`
- 値の意味が変わらない単純なリネームの場合、`node.name`（属性名部分）だけを置換すれば良く、属性の値（`node.value`）には触れない
- import元のチェック（`validSources`/`smarthrUiAlias`）は不要。JSXの属性名・コンポーネント名のみで判定できるパターンのため（`ThCheckbox` の `decorators` 属性削除と同じ方針）

### このパターンが使えるかどうかの判断基準

以下をすべて満たす場合、このシンプルなパターンで実装できます：

1. 属性名のみの変更で、値の意味・型は変わらない
2. 対象コンポーネントが1つ（複数コンポーネントで同名属性がリネームされる場合は、コンポーネントごとに分岐が必要）
3. 新旧の属性が同時に存在するケースを考慮する必要がない（例: `base` と `paneled` が両方指定されるケースは実質起こらない）

これに当てはまらない場合（値の型変換が必要、複数属性の統合など）は、v98-to-v99 のような分割代入解析パターンを参考にしてください。

## エラーメッセージ設計

このバージョンは完全に自動修正可能なため、「注意: このエラーは手動修正後も消えません」のような持続性の説明は**不要**です。

```javascript
renameNotificationBarBase:
  'smarthr-ui {{to}} では {{component}} の `base` 属性は `paneled` にリネームされました。詳細: {{readmeUrl}}',
```

## テストケース設計

### valid（エラーにならない）

- 移行後の書き方（`paneled` を使用）
- 他コンポーネントで同名の `base` 属性を使っているケース（誤検出防止の確認）
- `base` 属性自体を使っていないケース

### invalid（エラーになる）

- `base` のみ指定
- `base` と他の属性を併用
- 値が式（`base={condition}`）の場合でも属性名のみ置換されること

## トラブルシューティング

### メッセージが見つからないエラーが出る

**症状:** `messageId "xxx" was not found` でテストが落ちる

**原因:** 親の `index.js` の `meta.messages` にversionモジュールのmessagesを展開し忘れている

**対策:** `VERSION_MODULES` への登録と**両方**を更新する

```javascript
// 1. VERSION_MODULES への登録
const VERSION_MODULES = {
  'v99-v100': v99ToV100,
}

// 2. meta.messages への展開（忘れやすい）
messages: {
  ...v99ToV100.messages,
}
```

### `unsupportedVersion` のテストが落ちる

**症状:** 既存の「未サポートバージョン」テストが 0 errors になる

**原因:** そのテストが、今回追加したバージョンを「未サポート」の例として使っていた

**対策:** テストのオプションを、まだ実装していないバージョンに更新する

```javascript
// 変更前（v99-v100 を追加したことでサポート済みになった）
options: [{ from: '99', to: '100' }],

// 変更後
options: [{ from: '100', to: '101' }],
```
