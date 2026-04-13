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
type Props = ComponentProps<typeof RemoteTriggerActionDialog>

// Correct（自動修正）
import {
  ActionDialog,
  FormDialog,
  MessageDialog,
  StepFormDialog
} from 'smarthr-ui'
type Props = ComponentProps<typeof ActionDialog>
```

**対応コンポーネント:**
- `RemoteTriggerActionDialog` → `ActionDialog`
- `RemoteTriggerFormDialog` → `FormDialog`
- `RemoteTriggerMessageDialog` → `MessageDialog`
- `RemoteTriggerStepFormDialog` → `StepFormDialog`

**自動修正される箇所:**
- import文
- JSX要素（開始タグ・終了タグ）
- export文（re-export）
- typeof型参照（`typeof RemoteTriggerActionDialog` など）

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
- MultiCombobox / SingleCombobox
- SearchInput
- Textarea
- InformationPanel

#### 3-1. Combobox（MultiCombobox / SingleCombobox）

**基本的な移行（自動修正）:**

`noResultText` は新しい独立した属性として提供されます。以下のパターンは自動的に移行されます：

```tsx
// Before（自動修正されます）
<MultiCombobox
  decorators={{
    noResultText: () => '該当するユーザーが見つかりません'
  }}
  items={items}
/>

// After（自動修正後）
<MultiCombobox
  noResultText="該当するユーザーが見つかりません"
  items={items}
/>
```

**自動修正される条件:**
- arrow function で引数なし、returnなし（`() => ...`）のパターン
- 文字列リテラル、変数参照、関数呼び出し、テンプレートリテラルすべて対応

```tsx
// ✅ 自動修正される例
decorators={{ noResultText: () => '該当なし' }}
decorators={{ noResultText: () => message }}
decorators={{ noResultText: () => getMessage() }}
decorators={{ noResultText: () => `${count}件該当` }}

// ⚠️ 手動対応が必要な例（エラーが表示されます）
decorators={{ noResultText: () => { return '該当なし' } }}  // returnあり
decorators={{ noResultText: (defaultText) => defaultText }}  // 引数あり
decorators={{ ...baseDecorators, noResultText: () => '該当なし' }}  // spread syntax
```

**noResultText以外の属性:**

`noResultText` 以外の属性（`selectedListAriaLabel`、`destroyButtonIconAltSuffix` など）は削除され、IntlProvider経由の翻訳が自動適用されます。

```tsx
// Before
<MultiCombobox
  decorators={{
    noResultText: () => '該当なし',
    selectedListAriaLabel: () => '選択済みアイテム'
  }}
  items={items}
/>

// After（自動修正後）
<MultiCombobox
  noResultText="該当なし"
  items={items}
/>
// selectedListAriaLabelはsmarthr-uiの翻訳が自動適用されます
```

#### 3-2. その他のコンポーネント（SearchInput / Textarea / InformationPanel）

これらのコンポーネントでは `decorators` 属性が完全に削除されます（自動修正）。IntlProvider経由の翻訳が自動的に適用されます。

```tsx
// Before
<SearchInput decorators={{ iconAlt: () => '検索' }} />
<Textarea decorators={{ beforeMaxLettersCount: () => 'あと' }} />
<InformationPanel decorators={{ openButtonLabel: () => '開く' }} />

// After（自動修正後）
<SearchInput />
<Textarea />
<InformationPanel />
```

**参考:**
- [Combobox decorators削除PR](https://github.com/kufu/smarthr-ui/pull/6238)
- [SearchInput decorators削除PR](https://github.com/kufu/smarthr-ui/pull/6237)
- [Textarea decorators削除PR](https://github.com/kufu/smarthr-ui/pull/6232)
- [InformationPanel decorators削除PR](https://github.com/kufu/smarthr-ui/pull/6231)

## 制限事項

以下のケースは自動修正されません：

- **Comboboxのdecorators属性（手動対応が必要なパターン）:**
  - spread syntaxが含まれる場合
  - noResultTextにreturn文がある場合
  - noResultTextに引数がある場合
- **size属性が変数の場合:** `size={dynamicSize}` など
- **複雑なコード:** 条件分岐での属性設定など

## v90 から一気に v92 に更新する場合

**⚠️ 重要: v90→v92の一気実行は禁止されています**

v90からv92に一気に更新しようとすると、コンポーネント名の衝突によりエラーが表示されます。

**理由:**
- v90→v91: `ActionDialog` → `ControlledActionDialog`
- v91→v92: `RemoteTriggerActionDialog` → `ActionDialog`
- ESLintの自動再実行により、`ActionDialog`という名前が衝突します

**正しい手順:**
1. まず `{ from: '90', to: '91' }` で実行
2. その後 `{ from: '91', to: '92' }` で実行

詳細は [v90→v91 移行ガイド](../v90-to-v91/README.md) も参照してください。
