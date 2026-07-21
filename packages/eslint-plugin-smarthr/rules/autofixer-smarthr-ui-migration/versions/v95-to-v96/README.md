# smarthr-ui v95 → v96 移行ガイド

このドキュメントは、smarthr-ui を v95 から v96 にアップグレードする際の破壊的変更と対処方法を説明します。

## 破壊的変更

### Chip: size 属性の値が "s" から "S" に変更

**変更内容:**
`Chip` コンポーネントの `size` 属性の値が小文字の `"s"` から大文字の `"S"` に変更されました。

**Before (v95):**

```jsx
<Chip size="s">label</Chip>
```

**After (v96):**

```jsx
<Chip size="S">label</Chip>
```

**自動修正:**
このルールは自動修正に対応しています。ESLintの`--fix`オプションを使用することで、自動的に変換されます。

```bash
eslint --fix .
```

**対象:**

- 文字列リテラル `"s"` のみが対象です
- 動的な値（変数など）は検出されません
- `Chip` で終わるコンポーネント名（例: `CustomChip`, `MyChip`）も対象です

```jsx
// 自動修正される
<Chip size="s">label</Chip>
<CustomChip size="s">label</CustomChip>  // ラップコンポーネントも対象

// 検出されない（手動で対応が必要）
<Chip size={dynamicSize}>label</Chip>
<Chip size={SIZES.SMALL}>label</Chip>
<ChipContainer size="s" />  // "Chip"で終わらない
```

## 参考リンク

- [smarthr-ui v96.0.0 Release Notes](https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v96.0.0)
