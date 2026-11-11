# smarthr-ui v101 → v102 移行ガイド

smarthr-ui v102 での破壊的変更に対応する移行ルールです。

## 設定

```json
{
  "rules": {
    "smarthr/autofixer-smarthr-ui-migration": ["error", { "from": "101", "to": "102" }]
  }
}
```

## 対応する変更

### 1. `FilterDropdown` の `filtered` に渡すオブジェクトの `iconAlt` キーが `alt` にリネーム

`filtered`属性の型が`FilterIcon`の`checked`型を再利用する形に変わったことに伴うキーのリネームです。値の意味に変更はありません。<br />
`filtered={true}`のように真偽値を直接指定している場合は対象外です。

**Before:**

```tsx
<FilterDropdown filtered={{ iconAlt: '適用中' }} onApply={onApply}>...</FilterDropdown>
```

**After:**

```tsx
<FilterDropdown filtered={{ alt: '適用中' }} onApply={onApply}>...</FilterDropdown>
```

**自動修正:** ✅ 可能（`filtered`がオブジェクト形式の場合のみ）

### 2. `DropdownMenuButton` の `trigger` に渡すオブジェクトの `children` キーが `text` にリネーム

値の意味に変更はなく、キー名のみのリネームです。<br />
`trigger="その他の操作"`のように文字列・ReactNodeを直接指定している場合は対象外です。

**Before:**

```tsx
<DropdownMenuButton trigger={{ children: 'その他の操作', size: 'S' }}>...</DropdownMenuButton>
```

**After:**

```tsx
<DropdownMenuButton trigger={{ text: 'その他の操作', size: 'S' }}>...</DropdownMenuButton>
```

**自動修正:** ✅ 可能（`trigger`がオブジェクト形式の場合のみ）

## escape hatch className の変更はありません

このバージョンの変更はオブジェクト内のキーのリネームのみで、`smarthr-ui-` で始まる className に変更はありません。CSS/SCSS/styled-components の修正は不要です。

## 対象外の変更（このバージョンでは対応しません）

v102には上記以外にも破壊的変更が含まれていますが、以下の理由からこのルールでは対応していません：

- **TabItem, Button**: `disabledReason`/`inactiveReason`でReactNodeを直接指定できるようにする（型拡張であり、既存コードはそのまま動作するためリネーム不要）
- **Combobox**: 選択値をhidden inputでFormDataから取得できるようにする（追加機能であり、破壊的なリネームではない）

これらの変更については[smarthr-ui v102.0.0 リリースノート](https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v102.0.0)を参照の上、必要に応じて対応してください。

## 参考

- [smarthr-ui v102.0.0 リリースノート](https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v102.0.0)
- [smarthr-ui PR #7428](https://github.com/kufu/smarthr-ui/pull/7428)（FilterDropdown）
- [smarthr-ui PR #7419](https://github.com/kufu/smarthr-ui/pull/7419)（DropdownMenuButton）
