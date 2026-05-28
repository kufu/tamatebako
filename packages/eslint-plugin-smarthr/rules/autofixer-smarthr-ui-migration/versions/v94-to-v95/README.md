# smarthr-ui v94 → v95 移行ガイド

このドキュメントは、smarthr-ui v94からv95への移行に必要な変更をまとめたものです。

## 対応する破壊的変更

### 1. LanguageSwitcher: decorators属性の削除

v95では、`LanguageSwitcher`コンポーネントから`decorators`属性が削除されました。翻訳はsmarthr-ui内で自動的に行われます。

#### 変更内容

- `decorators` 属性削除
- トリガーラベルは常に`'Language'`で固定
- チェックアイコンのaltはsmarthr-uiの翻訳が自動適用（全9言語対応済み）

#### 移行方法

**Before (v94):**
```tsx
<LanguageSwitcher decorators={{ triggerLabel: () => 'Language' }} />
```

**After (v95):**
```tsx
<LanguageSwitcher />
```

#### 自動修正可能なパターン

以下のパターンは、ESLintの`--fix`オプションで自動的に修正されます：

```tsx
// decorators属性を削除
<LanguageSwitcher decorators={{ triggerLabel: () => '言語' }} />
→ <LanguageSwitcher />
```

### 1-2. AppLauncher: decorators.triggerLabelをtriggerLabel属性に移行

v95では、`AppLauncher`コンポーネントから`decorators`属性が削除され、`triggerLabel`属性が追加されました。

#### 変更内容

- `decorators.triggerLabel` → `triggerLabel` 属性に移行
- `triggerLabel`が指定されていない場合はsmarthr-uiの翻訳が自動適用（全9言語対応済み）
- 動的な値（例: featureName）を渡す必要がある場合のみ、`triggerLabel`属性を使用

#### 移行方法

**Before (v94):**
```tsx
// 固定値の場合
<AppLauncher decorators={{ triggerLabel: () => 'Apps' }} />

// 動的な値の場合
<AppLauncher decorators={{ triggerLabel: () => featureName }} />
```

**After (v95):**
```tsx
// 固定値の場合 → decoratorsを削除してIntlProviderに任せる
<AppLauncher />

// 動的な値の場合 → triggerLabel属性に移行
<AppLauncher triggerLabel={featureName} />
```

#### 自動修正可能なパターン

**注意:** AppLauncherの`decorators.triggerLabel`の値抽出は複雑なため、エラーのみ表示されます。手動で移行してください。

```tsx
// エラーのみ表示（手動対応が必要）
<AppLauncher decorators={{ triggerLabel: () => featureName }} />
→ 手動で <AppLauncher triggerLabel={featureName} /> に変更してください

// 固定値の場合は decorators を削除
<AppLauncher decorators={{ triggerLabel: () => 'アプリ' }} />
→ 手動で <AppLauncher /> に変更してください
```

### 2. InputFile: decorators属性の削除

v95では、`InputFile`コンポーネントから`decorators`属性が削除されました。削除ボタンのラベルはsmarthr-uiが提供する翻訳が自動的に適用されます（IntlProvider経由）。

#### 移行方法

**Before (v94):**
```tsx
<InputFile decorators={{ deleteButtonLabel: () => '削除' }} />
```

**After (v95):**
```tsx
<InputFile />
```

### 3. FormDialog: ボタン属性をObject形式に統合

v95では、`FormDialog`のボタン関連の属性がObject形式に統合されました。

#### 変更内容

以下のpropsが削除されました：
- `actionText` → `actionButton`で指定
- `actionTheme` → `actionButton={{ text: "...", theme: "..." }}`で指定
- `actionDisabled` → `actionButton={{ text: "...", disabled: true }}`で指定
- `closeDisabled` → `closeButton={{ text: "...", disabled: true }}`で指定
- `decorators.closeButtonLabel` → `closeButton="キャンセル"`で指定

#### 移行方法

**シンプルな使い方（文字列のみ指定）:**
```tsx
// Before (v94)
<FormDialog
  actionText="保存"
  decorators={{ closeButtonLabel: () => 'キャンセル' }}
>

// After (v95)
<FormDialog
  actionButton="保存"
  closeButton="キャンセル"
>
```

**詳細な設定が必要な場合:**
```tsx
// Before (v94)
<FormDialog
  actionText="削除"
  actionTheme="danger"
  actionDisabled={false}
  closeDisabled={true}
  decorators={{ closeButtonLabel: () => '閉じる' }}
>

// After (v95)
<FormDialog
  actionButton={{ text: "削除", theme: "danger", disabled: false }}
  closeButton={{ text: "閉じる", disabled: true }}
>
```

#### 自動修正可能なパターン

以下のパターンは、ESLintの`--fix`オプションで自動的に修正されます：

```tsx
// actionText のみの場合は自動でリネーム
<FormDialog actionText="保存">
→ <FormDialog actionButton="保存">

// 複数の属性がある場合はエラーのみ表示（手動対応が必要）
<FormDialog actionText="削除" actionTheme="danger">
→ エラー表示（手動でObject形式に変換してください）
```

### 4. ActionDialog: ボタン属性をObject形式に統合

`ActionDialog`も`FormDialog`と同様に、ボタン関連の属性がObject形式に統合されました。

#### 変更内容と移行方法

FormDialogと同じです。詳細は「3. FormDialog」セクションを参照してください。

### 5. MessageDialog: decorators削除とcloseButton属性への統一

v95では、`MessageDialog`の`decorators.closeButtonLabel`が`closeButton`属性に統一されました。

#### 変更内容

以下のpropsが削除されました：
- `decorators.closeButtonLabel` → `closeButton`で指定

#### 移行方法

**デフォルトラベル使用の場合（省略可能）:**
```tsx
// Before (v94)
<MessageDialog heading="確認">
  メッセージ本文
</MessageDialog>

// After (v95) - 変更なし
<MessageDialog heading="確認">
  メッセージ本文
</MessageDialog>
```

**カスタムラベルが必要な場合:**
```tsx
// Before (v94)
<MessageDialog
  heading="確認"
  decorators={{ closeButtonLabel: () => 'OK' }}
>
  メッセージ本文
</MessageDialog>

// After (v95)
<MessageDialog heading="確認" closeButton="OK">
  メッセージ本文
</MessageDialog>
```

## ESLintルールの使用方法

### .eslintrc.js の設定

```javascript
module.exports = {
  rules: {
    'smarthr/autofixer-smarthr-ui-migration': ['error', { from: '94', to: '95' }],
  },
}
```

### 自動修正の実行

```bash
# エラーを確認
pnpm run lint

# 自動修正を実行
pnpm run lint --fix
```

### 注意事項

- FormDialog/ActionDialogのボタン属性が複数ある場合（`actionText` + `actionTheme`など）は、自動修正できません。エラーメッセージを確認して、手動でObject形式に変換してください。
- MessageDialogの`decorators.closeButtonLabel`も、自動修正できない場合があります。その場合は手動で`closeButton`属性に変換してください。

### smarthrUiAlias オプション

プロジェクト固有のsmarthr-ui aliasパスを使用している場合は、`smarthrUiAlias`オプションを指定してください。

```javascript
module.exports = {
  rules: {
    'smarthr/autofixer-smarthr-ui-migration': [
      'error',
      {
        from: '94',
        to: '95',
        smarthrUiAlias: '@/components/parts/smarthr-ui', // プロジェクト固有のalias
      },
    ],
  },
}
```

## 参考リンク

- [smarthr-ui v95.0.0 リリースノート](https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v95.0.0)
