# smarthr/autofixer-smarthr-ui-migration

smarthr-ui のバージョン間の移行を支援する自動修正ルールです。

オプションで移行元・移行先のバージョンを指定することで、該当する breaking changes を検出し、自動修正します。

## オプション

このルールは `from` と `to` オプションの指定が必須です。

```javascript
{
  "rules": {
    "smarthr/autofixer-smarthr-ui-migration": ["error", { "from": "v90", "to": "v91" }]
  }
}
```

### サポートされているバージョン

- `v90` → `v91`

## v90 → v91 の対応内容

### 1. Dialog コンポーネントのリネーム

v91 では Dialog 系コンポーネントが Controlled プレフィックス付きにリネームされました。

```tsx
// Incorrect
import { ActionDialog, FormDialog } from 'smarthr-ui'
<ActionDialog>...</ActionDialog>
<FormDialog>...</FormDialog>

// Correct
import { ControlledActionDialog, ControlledFormDialog } from 'smarthr-ui'
<ControlledActionDialog>...</ControlledActionDialog>
<ControlledFormDialog>...</ControlledFormDialog>
```

**対応コンポーネント:**
- `ActionDialog` → `ControlledActionDialog`
- `FormDialog` → `ControlledFormDialog`
- `MessageDialog` → `ControlledMessageDialog`
- `StepFormDialog` → `ControlledStepFormDialog`

### 2. ResponseMessage の `type` → `status` リネーム

```tsx
// Incorrect
<ResponseMessage type="success">Xxxx</ResponseMessage>

// Correct
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

**親コンポーネントに icon 属性がない場合（自動修正）:**

ResponseMessage と同じ UI になるように、status に応じた icon を追加します。

```tsx
// Incorrect
<Heading><ResponseMessage status="success" iconGap={0.5}>Xxxx</ResponseMessage></Heading>

// Correct（自動修正）
<Heading icon={{ prefix: <FaCircleCheckIcon />, gap: 0.5 }}>Xxxx</Heading>
```

**親コンポーネントに既に icon 属性がある場合（エラーのみ）:**

既に icon が設定されている場合は、意図的な可能性があるため自動修正されません。手動で調整してください。

```tsx
// エラー（自動修正なし）
<Heading icon={<CustomIcon />}><ResponseMessage iconGap={0.5}>Xxxx</ResponseMessage></Heading>

// 手動で修正
<Heading icon={{ prefix: <CustomIcon />, gap: 0.5 }}>Xxxx</Heading>
```

**適切な親がない場合（自動修正）:**

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

// Correct
<AppHeader email="test@example.com" />
```

## 使用方法

### eslint-config-smarthr を使用している場合

`.eslintrc.js` または `eslint.config.js` でルールを有効化してください:

```javascript
module.exports = {
  extends: ['smarthr'],
  rules: {
    'smarthr/autofixer-smarthr-ui-migration': ['error', { from: 'v90', to: 'v91' }],
  },
}
```

### 個別に使用する場合

```javascript
module.exports = {
  plugins: ['smarthr'],
  rules: {
    'smarthr/autofixer-smarthr-ui-migration': ['error', { from: 'v90', to: 'v91' }],
  },
}
```

## 自動修正の実行

```bash
# 自動修正を実行
eslint --fix .

# または
npm run lint:fix
```

## 移行後の対応

移行が完了したら、このルールを無効化またはオプションを更新してください:

```javascript
module.exports = {
  extends: ['smarthr'],
  rules: {
    // v91 への移行完了後はコメントアウトまたは削除
    // 'smarthr/autofixer-smarthr-ui-migration': ['error', { from: 'v90', to: 'v91' }],

    // v92 への移行時は新しいオプションを設定
    // 'smarthr/autofixer-smarthr-ui-migration': ['error', { from: 'v91', to: 'v92' }],
  },
}
```

## 制限事項

- 親コンポーネントに既に `icon` 属性が設定されている場合、`ResponseMessage` の `iconGap` は自動修正されません（手動対応が必要）
- `ResponseMessage` の `right` 属性は自動修正されません
- 複雑なコード（変数経由での属性設定など）は自動修正されない場合があります

## 将来のバージョン対応

今後 v92、v93 などの新しいバージョンがリリースされた際は、このルールに新しいバージョンのサポートを追加していく予定です。
