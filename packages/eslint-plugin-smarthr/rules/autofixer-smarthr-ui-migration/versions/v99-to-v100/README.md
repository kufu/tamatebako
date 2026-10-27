# smarthr-ui v99 → v100 移行ガイド

smarthr-ui v100 での破壊的変更に対応する移行ルールです。

## 設定

```json
{
  "rules": {
    "smarthr/autofixer-smarthr-ui-migration": ["error", { "from": "99", "to": "100" }]
  }
}
```

## 対応する変更

### 1. `NotificationBar` の `base` 属性が `paneled` にリネーム

意味の変更はなく、属性名のみのリネームです。

**Before:**

```tsx
<NotificationBar base type="info">
  お知らせ
</NotificationBar>
```

**After:**

```tsx
<NotificationBar paneled type="info">
  お知らせ
</NotificationBar>
```

**自動修正:** ✅ 可能

## escape hatch className の変更はありません

このバージョンの変更は属性名のリネームのみで、`smarthr-ui-` で始まる className に変更はありません。CSS/SCSS/styled-components の修正は不要です。

## 対象外の変更（このバージョンでは対応しません）

v100には上記以外にも多数の破壊的変更が含まれていますが、以下の理由からこのルールでは対応していません：

- **型定義のみの変更**（実行時のコード変更が不要なもの）: `DefinitionListItem`/`DropdownMenuGroup`/`DefinitionList`/`DropdownTrigger`のProps型縮小、`SmartHRLogo`/`SmartHRAILogo`のProps型縮小、`Icon`のComponentProps export廃止
- **非推奨コンポーネントの削除**（代替コンポーネントへの手動移行が必要）: `WakuWakuButton`
- **構造的な変更**（自動修正が複雑すぎる）: `Dialog`の`DialogWrapper`廃止・`Dialog`への一本化
- **挙動の変更**（単純なリネームではない）: `UnstyledButton`の`disabled`属性→`aria-disabled`、`Combobox`の`ComboboxItem.label`調整

これらの変更については[smarthr-ui v100.0.0 リリースノート](https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v100.0.0)を参照の上、手動で対応してください。

## 参考

- [smarthr-ui v100.0.0 リリースノート](https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v100.0.0)
- [smarthr-ui PR #7159](https://github.com/kufu/smarthr-ui/pull/7159)
