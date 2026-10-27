# smarthr-ui v100 → v101 移行ガイド

smarthr-ui v101 での破壊的変更に対応する移行ルールです。

## 設定

```json
{
  "rules": {
    "smarthr/autofixer-smarthr-ui-migration": ["error", { "from": "100", "to": "101" }]
  }
}
```

## 対応する変更

### 1. `SingleCombobox` の `defaultItem` 属性が `emptySelectionFallbackItem` にリネーム

値の型（`ComboboxItem<T>`）に変更はなく、属性名のみのリネームです。

**Before:**

```tsx
<SingleCombobox items={items} selectedItem={selectedItem} defaultItem={items[0]} />
```

**After:**

```tsx
<SingleCombobox items={items} selectedItem={selectedItem} emptySelectionFallbackItem={items[0]} />
```

**自動修正:** ✅ 可能

### 2. `Badge` の `type` 属性が `color` にリネーム

値の型（`'grey' | 'blue' | 'yellow' | 'red'`）に変更はなく、属性名のみのリネームです。

**Before:**

```tsx
<Badge type="red">3</Badge>
```

**After:**

```tsx
<Badge color="red">3</Badge>
```

**自動修正:** ✅ 可能

## escape hatch className の変更はありません

このバージョンの変更は属性名のリネームのみで、`smarthr-ui-` で始まる className に変更はありません。CSS/SCSS/styled-components の修正は不要です。

## 対象外の変更（このバージョンでは対応しません）

v101には上記以外にも破壊的変更が含まれていますが、以下の理由からこのルールでは対応していません：

- **WarekiPicker**: `showAlternative`でfalse/関数を指定可能にし、`DatePicker`を非公開化する（型拡張・非公開化であり単純なリネームではない）
- **useEnvironment**: `EnvironmentProvider`が無い場合にエラーにする（挙動変更であり、prop/属性のリネームではない）
- **コンポーネントの型を拡張し、予想されるhtml要素の属性を設定可能にする**（型定義のみの変更）

これらの変更については[smarthr-ui v101.0.0 リリースノート](https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v101.0.0)を参照の上、手動で対応してください。

## 参考

- [smarthr-ui v101.0.0 リリースノート](https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v101.0.0)
- [smarthr-ui PR #7353](https://github.com/kufu/smarthr-ui/pull/7353)（SingleCombobox）
- [smarthr-ui PR #7332](https://github.com/kufu/smarthr-ui/pull/7332)（Badge）
