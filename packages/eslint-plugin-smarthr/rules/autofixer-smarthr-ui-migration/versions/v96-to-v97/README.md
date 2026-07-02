# smarthr-ui v96 → v97 移行ガイド

このドキュメントは、smarthr-ui を v96 から v97 にアップグレードする際の破壊的変更と対処方法を説明します。

## 破壊的変更

### TabItem: onClick の型が変更

**変更内容:**
`TabItem` コンポーネントの `onClick` プロパティの型が、カスタムハンドラから標準的なイベントハンドラに変更されました。

**Before (v96):**
```tsx
<TabItem onClick={(tabId: string) => console.log(tabId)} />
```

**After (v97):**
```tsx
<TabItem onClick={(e: MouseEvent<HTMLButtonElement>) => console.log(e.currentTarget.value)} />
```

**変更の理由:**
- より標準的なイベントハンドラの型に統一
- ESLint ルール `smarthr/best-practice-for-unstable-dependencies` との互換性向上
- `useCallback` の依存配列を安定化

**自動修正について:**
この変更は**自動修正に対応していません**。以下の理由により、手動での対応が必要です:

- 引数名が可変（`tabId`, `id`, `value` など）
- 関数本体内での使用箇所の特定が複雑
- 変数代入、関数呼び出し、オブジェクトプロパティなど多様な使用パターン

**手動対応の手順:**

1. **引数を `e` に変更**
   ```tsx
   // Before
   onClick={(tabId) => handleClick(tabId)}

   // After
   onClick={(e) => handleClick(e.currentTarget.value)}
   ```

2. **引数の使用箇所を `e.currentTarget.value` に置き換え**
   ```tsx
   // Before
   onClick={(id) => {
     console.log(id)
     setActiveTab(id)
   }}

   // After
   onClick={(e) => {
     const id = e.currentTarget.value
     console.log(id)
     setActiveTab(id)
   }}
   ```

3. **TypeScript の型エラーを確認**
   ```tsx
   // 型定義を明示的に指定する場合
   onClick={(e: MouseEvent<HTMLButtonElement>) => {
     // 処理
   }}
   ```

## 検出方法

このルールは `TabItem` コンポーネントに `onClick` プロパティがある箇所を検出し、手動対応を促すエラーを表示します。

```bash
# ESLintでエラーを確認
eslint .
```

**重要な注意事項:**
- `--fix` オプションを使用しても自動修正されません。エラーメッセージに従って手動で修正してください。
- **このエラーは手動で修正しても消えません**。`TabItem` に `onClick` がある限り検出され続けます。
- すべての対応が完了したら、ESLint設定から `{ from: "96", to: "97" }` の設定を削除してください。

```javascript
// .eslintrc.js または eslint.config.js
{
  rules: {
    // 対応完了後は削除またはコメントアウト
    // 'smarthr/autofixer-smarthr-ui-migration': ['error', { from: '96', to: '97' }],
  }
}
```

## 参考リンク

- [smarthr-ui v97.0.0 Release Notes](https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v97.0.0)
- [PR #6421: onClickの型をイベントハンドラに変更](https://github.com/kufu/smarthr-ui/pull/6421)
