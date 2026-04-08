# v91 → v92 移行ガイド

このドキュメントは、smarthr-ui v91 から v92 への移行時に発生する破壊的変更と、その自動修正内容について説明します。

参考: [smarthr-ui v92.0.0 リリースノート](https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v92.0.0)

## 対応する破壊的変更

### 1. RemoteTriggerダイアログのプレフィックス削除

v92 では RemoteTrigger 版の Dialog コンポーネントが推奨版となり、プレフィックスが削除されました。

```tsx
// Incorrect
import {
  RemoteTriggerActionDialog,
  RemoteTriggerFormDialog,
  RemoteTriggerMessageDialog,
  RemoteTriggerStepFormDialog
} from 'smarthr-ui'

// Correct（自動修正）
import {
  ActionDialog,
  FormDialog,
  MessageDialog,
  StepFormDialog
} from 'smarthr-ui'
```

**対応コンポーネント:**
- `RemoteTriggerActionDialog` → `ActionDialog`
- `RemoteTriggerFormDialog` → `FormDialog`
- `RemoteTriggerMessageDialog` → `MessageDialog`
- `RemoteTriggerStepFormDialog` → `StepFormDialog`

**注意:** 制御型（Controlled版）は変更ありません。
- `ControlledActionDialog`、`ControlledFormDialog` などはそのまま使用できます

### 2. コンポーネントサイズ指定を大文字に統一

v92 では全てのコンポーネントのサイズ指定値が大文字に統一されました。

```tsx
// Incorrect
<Button size="default" />
<Button size="s" />
<Select size="m" />
<Loader size="s" />

// Correct（自動修正）
<Button size="M" />
<Button size="S" />
<Select size="M" />
<Loader size="S" />
```

**対応コンポーネント:**
- Button, AnchorButton
- Select
- SegmentedControl
- SideNav, SideNavItemButton, SideNavItemAnchor
- InputFile
- Loader, LoaderSpinner

**サイズ値の変換:**
- `"default"` → `"M"`
- `"s"` → `"S"`
- `"m"` → `"M"`

### 3. decorators 属性削除

以下のコンポーネントから `decorators` 属性が削除されました。

**対象コンポーネント:**
- MultiCombobox
- SingleCombobox
- SearchInput
- Textarea
- InformationPanel

```tsx
// Incorrect（エラーが表示されます）
<MultiCombobox
  decorators={{
    noResultText: () => '該当なし'
  }}
  items={items}
/>

// Correct
<MultiCombobox
  noResultText="該当なし"
  items={items}
/>
```

**注意:** この変更は自動修正されません。各コンポーネントの移行方法については、smarthr-ui のリリースノートを参照してください。

主な変更点：
- **MultiCombobox/SingleCombobox**: `noResultText` は新しい props として提供（ReactNode型で柔軟に指定可能）
- **その他の属性**: IntlProvider 経由でのみカスタマイズ可能

## 制限事項

以下のケースは自動修正されません：

- `decorators` 属性の使用（手動対応が必要）
- size 属性が変数の場合（`size={dynamicSize}` など）
- 複雑なコード（条件分岐やスプレッド構文での属性設定など）

## v90 から一気に v92 に更新する場合

v90 から v92 に一気に更新する場合は、v91 の変更も含まれます。
migrator を `{ from: '90', to: '92' }` で実行すると、v90→v91→v92 の全ての変更が適用されます。

詳細は [v90→v91 移行ガイド](../v90-to-v91/README.md) も参照してください。
