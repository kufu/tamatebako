# smarthr-ui v102 → v103 移行ガイド

smarthr-ui v103 での破壊的変更に対応する移行ルールです。

## 設定

```json
{
  "rules": {
    "smarthr/autofixer-smarthr-ui-migration": ["error", { "from": "102", "to": "103" }]
  }
}
```

## 対応する変更

### 1. `SingleCombobox`, `MultiCombobox` の非推奨 `onChange` 属性が削除（`onChangeInput` に統一）

`onChangeInput`への移行が`@deprecated`として案内されていた`onChange`属性が削除されました。シグネチャに変更はなく、属性名のみのリネームです。

**Before:**

```tsx
<SingleCombobox onChange={(e) => { ... }} />
```

**After:**

```tsx
<SingleCombobox onChangeInput={(e) => { ... }} />
```

**自動修正:** ✅ 可能

## escape hatch className の変更はありません

`SingleCombobox`/`MultiCombobox`の属性名リネームのみで、`smarthr-ui-` で始まる className に変更はありません。CSS/SCSS/styled-components の修正は不要です。

## 対象外の変更（このバージョンでは対応しません）

v103には上記以外にも多数の破壊的変更（非推奨APIの削除）が含まれていますが、いずれもコールバックのシグネチャ変更やコンポーネントの置き換えを伴うため、このルールでは対応していません：

- **WarekiPicker**: 非推奨の`onChangeDate`を削除。`onChange`に統合されましたが、コールバックの引数の形が変わっています（`(date, value, { errors }) => {}` → `(e, { date, formatValue, errors }) => {}`）
- **Dialog, ModelessDialog**: 非推奨の`width`属性を削除。`size`(enum)または`className`に置き換える必要があり、数値からenumへの対応表が必要なため自動変換しません
- **LineClamp**: 非推奨コンポーネントを削除。`Text`の`maxLines`属性（オブジェクト形式）に置き換える必要があり、`tooltip`の要否は仕様判断が必要なため自動変換しません
- **Sidebar**: 非推奨コンポーネントを削除。`Cluster`の`grow`属性に置き換える必要があり、`right`(boolean)→`grow`(enum)の変換に加え子要素へのclassName追加が必要なため自動変換しません
- **BottomFixedArea**: 非推奨コンポーネントを削除。`FloatArea`への移行が必要です
- **Icon**: 非推奨の`size`属性を削除。className(デザイントークン)への置き換えが必要です

これらの変更については[smarthr-ui v103.0.0 リリースノート](https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v103.0.0)を参照の上、手動で対応してください。

## 参考

- [smarthr-ui v103.0.0 リリースノート](https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v103.0.0)
- [smarthr-ui PR #7500](https://github.com/kufu/smarthr-ui/pull/7500)（Combobox onChange）
- [smarthr-ui PR #7499](https://github.com/kufu/smarthr-ui/pull/7499)（WarekiPicker onChangeDate）
- [smarthr-ui PR #7490](https://github.com/kufu/smarthr-ui/pull/7490)（Dialog/ModelessDialog width）
- [smarthr-ui PR #7481](https://github.com/kufu/smarthr-ui/pull/7481)（LineClamp）
- [smarthr-ui PR #7489](https://github.com/kufu/smarthr-ui/pull/7489)（Sidebar）
- [smarthr-ui PR #7491](https://github.com/kufu/smarthr-ui/pull/7491)（BottomFixedArea）
- [smarthr-ui PR #7503](https://github.com/kufu/smarthr-ui/pull/7503)（Icon size）
