# v90 → v91 移行ガイド

このドキュメントは、smarthr-ui v90 から v91 への移行時に発生する破壊的変更と、その自動修正内容について説明します。

参考: [smarthr-ui v91.0.0 リリースノート](https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v91.0.0)

## 対応する破壊的変更

### 1. Dialog コンポーネントのリネーム

v91 では Dialog 系コンポーネントが Controlled プレフィックス付きにリネームされました。

```tsx
// Incorrect
import { ActionDialog, FormDialog } from 'smarthr-ui'
<ActionDialog>...</ActionDialog>
<FormDialog>...</FormDialog>
type Props = ComponentProps<typeof ActionDialog>

// Correct（自動修正）
import { ControlledActionDialog, ControlledFormDialog } from 'smarthr-ui'
<ControlledActionDialog>...</ControlledActionDialog>
<ControlledFormDialog>...</ControlledFormDialog>
type Props = ComponentProps<typeof ControlledActionDialog>
```

**対応コンポーネント:**
- `ActionDialog` → `ControlledActionDialog`
- `FormDialog` → `ControlledFormDialog`
- `MessageDialog` → `ControlledMessageDialog`
- `StepFormDialog` → `ControlledStepFormDialog`

**自動修正される箇所:**
- import文
- JSX要素（開始タグ・終了タグ）
- export文（re-export）
- typeof型参照（`typeof ActionDialog` など）

### 2. ResponseMessage の `type` → `status` リネーム

```tsx
// Incorrect
<ResponseMessage type="success">Xxxx</ResponseMessage>

// Correct（自動修正）
<ResponseMessage status="success">Xxxx</ResponseMessage>
```

### 3. ResponseMessage の `right` 属性削除

`right` 属性は削除されました。このエラーが表示された場合は @group-smarthrui-core に連絡してください。

```tsx
// Incorrect
<ResponseMessage right>Xxxx</ResponseMessage>
```

**注意:** このケースは自動修正されません。各プロダクトで `right` 属性が使われていないことは確認済みですが、もしエラーが発生した場合は想定外のケースのため、コアチームへの報告が必要です。

### 4. ResponseMessage の `iconGap` 属性削除と移行

`iconGap` 属性は削除されました。親コンポーネント（Heading/FormControl/Fieldset）で `icon.gap` を使用してください。

#### パターンA: 親コンポーネントに icon 属性がない場合（自動修正）

ResponseMessage と同じ UI になるように、status に応じた icon を追加します。

```tsx
// Incorrect
<Heading><ResponseMessage status="success" iconGap={0.5}>Xxxx</ResponseMessage></Heading>

// Correct（自動修正）
<Heading icon={{ prefix: <FaCircleCheckIcon />, gap: 0.5 }}>Xxxx</Heading>
```

#### パターンB: 親コンポーネントに既に icon 属性がある場合（エラーのみ）

既に icon が設定されている場合は、意図的な可能性があるため自動修正されません。手動で調整してください。

```tsx
// エラー（自動修正なし）
<Heading icon={<CustomIcon />}><ResponseMessage iconGap={0.5}>Xxxx</ResponseMessage></Heading>

// 手動で修正
<Heading icon={{ prefix: <CustomIcon />, gap: 0.5 }}>Xxxx</Heading>
```

#### パターンC: 適切な親がない場合（自動修正）

iconGap のみ削除されます。

```tsx
// Incorrect
<div><ResponseMessage iconGap={0.5}>Xxxx</ResponseMessage></div>

// Correct（自動修正）
<div><ResponseMessage>Xxxx</ResponseMessage></div>
```

### 5. AppHeader の `arbitraryDisplayName` 属性削除

`arbitraryDisplayName` 属性は削除されました。表示名は `email`、`empCode`、`firstName`、`lastName` から自動生成されます。

```tsx
// Incorrect
<AppHeader arbitraryDisplayName="山田太郎" email="test@example.com" />

// Correct（自動修正）
<AppHeader email="test@example.com" />
```

## 制限事項

以下のケースは自動修正されません：

- 親コンポーネントに既に `icon` 属性が設定されている場合の `ResponseMessage` の `iconGap`（手動対応が必要）
- `ResponseMessage` の `right` 属性
- 複雑なコード（変数経由での属性設定など）
