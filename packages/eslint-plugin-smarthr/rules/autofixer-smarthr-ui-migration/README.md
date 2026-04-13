# smarthr/autofixer-smarthr-ui-migration

smarthr-ui のバージョン間の移行を支援する自動修正ルールです。

オプションで移行元・移行先のバージョンを指定することで、該当するバージョンの変更（破壊的変更や推奨される書き方への置き換えなど）を検出し、自動修正します。

**重要:** このルールは一時的な使用を想定しています。移行完了後は無効化してください。

## オプション

このルールは `from` と `to` オプションの指定が必須です。

```javascript
{
  "rules": {
    "smarthr/autofixer-smarthr-ui-migration": ["error", { "from": "90", "to": "91" }]
  }
}
```

### 複数バージョンのスキップ

複数のバージョンをまたぐ移行も可能です（例: `90` → `93`）。この場合、存在する移行ルールを自動的に適用し、実装されていないバージョンについては警告を表示します。

```javascript
{
  "rules": {
    // 90→91と92→93のルールが適用される（91→92がない場合は警告）
    "smarthr/autofixer-smarthr-ui-migration": ["error", { "from": "90", "to": "93" }]
  }
}
```

### smarthr-ui の alias を使用している場合

プロジェクトで smarthr-ui を独自のパスから re-export している場合（例: `@/components/parts/smarthr-ui`）、`smarthrUiAlias` オプションを指定することで、alias ファイル内のコンポーネント定義も自動修正の対象になります。

#### 前提条件

このオプションを使用するには、`tsconfig.json` で paths 設定が必要です：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

#### 使用方法

```javascript
{
  "rules": {
    "smarthr/autofixer-smarthr-ui-migration": [
      "error",
      {
        "from": "90",
        "to": "91",
        "smarthrUiAlias": "@/components/parts/smarthr-ui"
      }
    ]
  }
}
```

#### 動作

このオプションを指定すると、以下の3つが置換対象になります：

1. **`smarthr-ui` からの直接 import**（`smarthrUiAlias` 指定に関わらず常に置換）
   ```typescript
   // Before
   import { ActionDialog } from 'smarthr-ui'
   // After
   import { ControlledActionDialog } from 'smarthr-ui'
   ```

2. **alias パスからの import**
   ```typescript
   // Before
   import { ActionDialog } from '@/components/parts/smarthr-ui'
   // After
   import { ControlledActionDialog } from '@/components/parts/smarthr-ui'
   ```

3. **alias ファイル内の export 変数名**（smarthr-ui のコンポーネント名と同じ場合のみ）
   ```typescript
   // @/components/parts/smarthr-ui/ActionDialog.tsx（aliasファイル）

   // Before（v90 使用時）
   import { ActionDialog as ShrActionDialog } from 'smarthr-ui'
   export const ActionDialog = (props) => {
     return <ShrActionDialog {...props} customProp="value" />
   }

   // After（v91 移行後）
   import { ControlledActionDialog as ShrActionDialog } from 'smarthr-ui'
   export const ControlledActionDialog = (props) => {
     return <ShrActionDialog {...props} customProp="value" />
   }
   ```

#### barrel import 構造への対応

`smarthrUiAlias` で指定されたパス配下のすべてのファイルが置換対象になります。

**ディレクトリ形式:**
```
@/components/parts/smarthr-ui/
├── index.tsx               # ✅ 置換対象
├── ActionDialog.tsx        # ✅ 置換対象
├── FormDialog.tsx          # ✅ 置換対象
└── dialogs/
    └── MessageDialog.tsx   # ✅ 置換対象（サブディレクトリも含む）
```

```typescript
// index.tsx（barrel export）
export { ActionDialog } from './ActionDialog'
export { FormDialog } from './FormDialog'

// または、smarthr-uiから直接re-export
export { ActionDialog } from 'smarthr-ui'
// → export { ControlledActionDialog } from 'smarthr-ui' に自動置換

// ActionDialog.tsx
import { ActionDialog as ShrActionDialog } from 'smarthr-ui'
export const ActionDialog = (props) => <ShrActionDialog {...props} />
// → export const ControlledActionDialog に自動置換
```

**単一ファイル形式:**
```
@/components/parts/smarthr-ui.tsx   # ✅ 置換対象
```

```typescript
// smarthr-ui.tsx
export const ActionDialog = (props) => <div>{props.children}</div>
// → export const ControlledActionDialog に自動置換
```

#### 制限事項

- **対象ファイルの範囲:** `smarthrUiAlias` で指定されたパス配下のファイルのみ。他のディレクトリにある同名の export は変更されません
  ```typescript
  // src/components/parts/smarthr-ui/index.tsx → 置換される ✅
  // src/features/custom/ActionDialog.tsx → 置換されない ✅
  ```

- **変数名の判定:** smarthr-ui が提供するコンポーネント名と完全一致する export 変数名のみ置換
  ```typescript
  export const ActionDialog = ...  // ✅ 置換される
  export const MyActionDialog = ... // ❌ 置換されない
  export const CustomDialog = ...   // ❌ 置換されない
  ```

- **export 形式:** 現在は `export const` 形式のみサポート
  ```typescript
  export const ActionDialog = ... // ✅ サポート
  export function ActionDialog()  // ❌ 未サポート
  export class ActionDialog       // ❌ 未サポート
  ```

- **ファイル名の変更:** ファイル名が変更対象のコンポーネント名と一致する場合、ファイル名の変更を促すエラーが表示されます（自動修正不可）
  ```
  // エラー例
  smarthr-ui v91 では ActionDialog が ControlledActionDialog にリネームされました。
  以下の手順で対応してください:
  1. ファイル名を変更（例: git mv ActionDialog.tsx ControlledActionDialog.tsx）
  2. このファイルをimportしている箇所を更新（例: from '@/path/ActionDialog' → from '@/path/ControlledActionDialog'）
  ```

  **対応手順:**
  1. ファイル名を変更: `git mv ActionDialog.tsx ControlledActionDialog.tsx`
  2. このファイルをimportしている箇所を手動で更新:
     ```typescript
     // Before
     import { FormDialog } from '@/components/parts/smarthr-ui/FormDialog'

     // After
     import { ControlledFormDialog } from '@/components/parts/smarthr-ui/ControlledFormDialog'
     ```

## サポートされているバージョン

各バージョンの破壊的変更の詳細と対応内容については、リンク先の移行ガイドを参照してください。

| バージョン | 詳細 |
|-----------|------|
| `90` → `91` | [移行ガイド](./versions/v90-to-v91/README.md) |
| `91` → `92` | [移行ガイド](./versions/v91-to-v92/README.md) |

## 使用方法

### eslint-config-smarthr を使用している場合

`.eslintrc.js` または `eslint.config.js` でルールを有効化してください:

```javascript
module.exports = {
  extends: ['smarthr'],
  rules: {
    'smarthr/autofixer-smarthr-ui-migration': ['error', { from: '90', to: '91' }],
  },
}
```

### 個別に使用する場合

```javascript
module.exports = {
  plugins: ['smarthr'],
  rules: {
    'smarthr/autofixer-smarthr-ui-migration': ['error', { from: '90', to: '91' }],
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
    // 'smarthr/autofixer-smarthr-ui-migration': ['error', { from: '90', to: '91' }],

    // v92 への移行時は新しいオプションを設定
    // 'smarthr/autofixer-smarthr-ui-migration': ['error', { from: '91', to: '92' }],
  },
}
```

## 制限事項

このルールは**あくまで機械的に対応できる箇所を自動修正するもの**です。以下の点に注意してください：

### 自動修正の限界

- **100%の移行を保証するものではありません**
- 複雑なコード（変数経由での属性設定、動的な値など）は自動修正されない場合があります
- 一部のケースは検出のみでエラーを表示し、手動対応が必要です

### 独自のsmarthr-uiラッパーを持つプロジェクトでの使用

このルールは `import { Component } from 'smarthr-ui'` のように**直接smarthr-uiからインポートしているコード**を対象としています。

独自のsmarthr-uiラッパー（例: `@/components/parts/smarthr-ui`）を使用しているプロジェクトでは、以下の理由により**手動での移行を推奨**します：

- 自動移行ルールはJSX要素名を変更しますが、独自ラッパーのexportは変更されません
- 結果として、変更後のコンポーネント名が未定義エラーになる可能性があります

**例:**
```tsx
// 独自ラッパー: @/components/parts/smarthr-ui/index.tsx
export * from 'smarthr-ui'
export { FormDialog } from './FormDialog'  // 独自のFormDialogラッパー

// 使用側
import { FormDialog } from '@/components/parts/smarthr-ui'
<FormDialog>...</FormDialog>
```

このようなコードで自動移行を実行すると：
```tsx
// 自動修正後
<ControlledFormDialog>...</ControlledFormDialog>
// ❌ ControlledFormDialogは独自ラッパーにexportされていないため未定義エラー
```

**対応方法:**
手動でsmarthr-uiラッパーのexportを調整してください。その際、可能な限りsmarthr-uiが出力する名称と揃えることを推奨します。

### 移行完了後に必要な作業

自動修正を実行した後は、必ず以下を実施してください：

1. **手動での確認と修正**
   - 自動修正されなかったエラーを確認し、手動で対応
   - コードレビューで変更内容を確認

2. **表示確認**
   - VRT（Visual Regression Testing）での確認
   - 実際の画面で表示崩れがないか目視確認
   - 機能的に問題がないか動作確認

各バージョンの具体的な制限事項については、移行ガイドを参照してください。
