# v91-to-v92 実装の参考ポイント

このドキュメントは、v91→v92の移行ルール実装の構造と、新しいversionを追加する際の参考ポイントを説明します。

## v91→v92 特有の実装パターン

### 1. サイズ値の文字列置換

サイズ prop の値を大文字に統一する処理が追加されています。

```javascript
const SIZE_VALUE_MAP = {
  default: 'M',
  s: 'S',
  m: 'M',
}

const SIZE_COMPONENTS = [
  'Button',
  'AnchorButton',
  'Select',
  // ...
]

// JSXAttribute での検出
'JSXAttribute[name.name="size"][value.type="Literal"]'(node) {
  const componentName = node.parent.name.name
  if (!SIZE_COMPONENTS.includes(componentName)) return

  const sizeValue = node.value.value
  const newValue = SIZE_VALUE_MAP[sizeValue]

  if (newValue) {
    // 修正処理
  }
}
```

### 2. decorators 属性の検出（エラーのみ、自動修正なし）

複雑な移行が必要な場合は、エラーのみ表示して手動対応を促します。

```javascript
'JSXAttribute[name.name="decorators"]'(node) {
  const componentName = node.parent.name.name

  if (DECORATORS_COMPONENTS.includes(componentName)) {
    context.report({
      node,
      messageId: 'removeDecorators',
      data: { component: componentName, to: TARGET_VERSION },
      // fixは提供しない
    })
  }
}
```

## ファイル構造

### 1. ファイル冒頭のコメント

```javascript
/**
 * smarthr-ui v90 → v91 移行ルール
 *
 * v91での破壊的変更に対応する自動修正を提供します。
 *
 * 対応する破壊的変更:
 * 1. Dialogコンポーネントのリネーム
 * 2. ResponseMessage の type → status リネーム
 * ...
 *
 * 参考: https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-vXX.0.0
 */
```

**ポイント:**
- 対応する変更のサマリーを箇条書きで記載
- smarthr-uiのリリースノートへのリンクを含める

### 2. 定数定義

変更内容に応じて、マッピングや設定を定数として定義します。

```javascript
// コンポーネント名のマッピング
const DIALOG_COMPONENTS = {
  ActionDialog: 'ControlledActionDialog',
  FormDialog: 'ControlledFormDialog',
  // ...
}

// status値とアイコンのマッピング
const STATUS_ICON_MAP = {
  info: 'FaCircleInfoIcon',
  success: 'FaCircleCheckIcon',
  // ...
}

// バージョン表示用の定数
const TARGET_VERSION = 'v91'
```

**ポイント:**
- 読みやすさのため、定数名は意図を明確に表現
- 複数箇所で使う値は必ず定数化

### 3. messages定義

ESLintのエラーメッセージを定義します。

```javascript
module.exports = {
  messages: {
    renameDialog: 'smarthr-ui {{to}} では {{old}} が {{new}} にリネームされました',
    renameType: 'ResponseMessage の type 属性は status にリネームされました',
    removeIconGap: 'ResponseMessage の iconGap 属性は削除されました。親コンポーネント（Heading/FormControl/Fieldset）で icon.gap を使用してください',
    // ...
  },
  // ...
}
```

**メッセージの書き方:**
- **明確に**: 何が変更されたのかを簡潔に
- **対処方法を含める**: 可能な場合、どう修正すべきかも記載
- **動的な値**: `{{変数名}}` で値を埋め込める（data経由で渡す）

### 4. createCheckers関数

ESLintのセレクターとハンドラーを返す関数です。

**シグネチャ:**
```javascript
createCheckers(context, sourceCode, options = {})
```

- `context`: ESLintのcontext
- `sourceCode`: ESLintのsourceCode
- `options`: ユーザーが指定したオプション（`smarthrUiAlias`など）

**基本構造:**
```javascript
createCheckers(context, sourceCode, options = {}) {
  // smarthrUiAliasオプションの取得
  const customSmarthrUiAlias = options.smarthrUiAlias
  const validSources = ['smarthr-ui']
  if (customSmarthrUiAlias) {
    validSources.push(customSmarthrUiAlias)
  }

  // aliasファイルかどうかの判定
  const isAliasFile = customSmarthrUiAlias && isFileMatchingSmarthrUiAlias(
    context.getFilename(),
    customSmarthrUiAlias
  )

  const checkers = {
    // インポート文の処理
    ImportDeclaration(node) {
      // smarthr-ui + smarthrUiAlias の両方をチェック
      if (!validSources.includes(node.source.value)) return
      // ...
    },

    // JSX要素の処理（セレクターで絞り込み）
    'JSXOpeningElement[name.name=/^(ActionDialog|FormDialog|...)$/]'(node) {
      // ...
    },

    // 特定のコンポーネント
    'JSXOpeningElement[name.name=/ResponseMessage$/]'(node) {
      // ...
    },
  }

  // aliasファイルの場合のみ、export変数名の置換を追加
  if (isAliasFile) {
    checkers['ExportNamedDeclaration > VariableDeclaration > VariableDeclarator'] = function(node) {
      // export const ActionDialog = ... を置換
    }
  }

  return checkers
}
```

**セレクターのパターン:**
- **ImportDeclaration**: import文を処理
- **JSXOpeningElement[name.name=/パターン$/]**: 正規表現で複数コンポーネントに一致
- **JSXAttribute[name.name="属性名"]**: 特定の属性を処理

**fix関数での自動修正:**

```javascript
context.report({
  node,
  messageId: 'renameDialog',
  data: { old: oldName, new: newName, to: TARGET_VERSION },
  fix(fixer) {
    return fixer.replaceText(node.name, newName)
  },
})
```

**自動修正の戦略:**
- **単純な置換**: `fixer.replaceText(node, newText)`
- **削除**: `fixer.remove(node)`
- **複数箇所の修正**: 配列で返す `[fixer.replaceText(...), fixer.replaceText(...)]`
- **修正なし**: fix関数を省略（エラー表示のみ）

### 5. ヘルパー関数

複雑なロジックは関数に切り出します。

```javascript
/**
 * 親要素を再帰的にたどってHeading/FormControl/Fieldsetを探す
 *
 * @param {Object} node - 開始ノード
 * @param {Object} sourceCode - ソースコード
 * @returns {Object|null} 見つかった親要素の情報、または null
 */
function findTargetParent(node, sourceCode) {
  let current = node
  while (current && current.type !== 'Program') {
    const parent = current.parent
    // ...
    current = parent
  }
  return null
}
```

**ポイント:**
- **JSDocコメント必須**: 引数、戻り値、目的を明記
- **読みやすさ優先**: 複雑な処理は段階的に分解
- **エッジケースの考慮**: null/undefinedチェックを忘れずに

## 自動修正の判断基準

実装時に以下の基準で自動修正の可否を判断します：

### ✅ 自動修正可能

機械的に100%正しく変換できる場合に自動修正を実装します。ただし、実用上は100%の正確性が保証できない場合でも、以下の条件を満たせば自動修正を実装して構いません：

- **実際には使用されていない機能や属性**である可能性が高い
- 置換することで**利便性が明らかに向上する**
- 誤った変換が行われても**影響が限定的**である

**例:**
- コンポーネント名のリネーム（ActionDialog → ControlledActionDialog）
- 属性名のリネーム（type → status）
- 属性の削除（値が変わらない場合）
- **未知の属性を保持したまま移行可能な場合**（Text → span など、移行先が明確な置換）
- **理論的には100%正しくないが、実用上問題ない場合**（使用頻度が極めて低い機能の置換など）

### ⚠️ エラーのみ（自動修正なし）

以下のケースは手動確認が必要なため、エラー表示のみ行います：

**例:**
- 意図が不明な場合（既存のicon属性がある状態でのiconGap削除）
- 複数の対処方法がある場合
- 安全性が確保できない場合
- **未知の属性の移行先が不明確な場合**（ResponseMessage → 親のicon属性など、id/onClickをどこに移すべきか不明）

### ❌ 検出も修正もしない

複雑すぎる、または影響範囲が広すぎる場合は対象外とします。

**例:**
- 変数経由での属性設定
- 動的に生成されるコンポーネント
- スプレッド演算子経由のprops

## テストケースのパターン

### valid（正常系）

新しいversion形式が正しく通ることを確認します。

```javascript
{ code: `import { ControlledActionDialog } from 'smarthr-ui'`, options: v90ToV91Options },
{ code: `<ControlledActionDialog>...</ControlledActionDialog>`, options: v90ToV91Options },
```

### invalid（異常系）

古いversion形式が検出されて修正されることを確認します。

```javascript
{
  code: `import { ActionDialog } from 'smarthr-ui'`,
  output: `import { ControlledActionDialog } from 'smarthr-ui'`,
  options: v90ToV91Options,
  errors: [{ messageId: 'renameDialog', data: { old: 'ActionDialog', new: 'ControlledActionDialog', to: 'v91' } }],
}
```

### ヘルパー関数でパターン生成

重複するテストケースはヘルパー関数で生成します。

```javascript
function createDialogRenameTests(oldName, newName) {
  return {
    import: {
      code: `import { ${oldName} } from 'smarthr-ui'`,
      output: `import { ${newName} } from 'smarthr-ui'`,
      options: v90ToV91Options,
      errors: [{ messageId: 'renameDialog', data: { old: oldName, new: newName, to: 'v91' } }],
    },
    jsx: {
      code: `<${oldName}>Xxxx</${oldName}>`,
      output: `<${newName}>Xxxx</${newName}>`,
      options: v90ToV91Options,
      errors: [{ messageId: 'renameDialog', data: { old: oldName, new: newName, to: 'v91' } }],
    },
  }
}

// 使用例
createDialogRenameTests('ActionDialog', 'ControlledActionDialog').import,
createDialogRenameTests('ActionDialog', 'ControlledActionDialog').jsx,
```

## よくある実装パターン

### パターン1: コンポーネント名のリネーム

```javascript
// import文
ImportDeclaration(node) {
  node.specifiers.forEach((specifier) => {
    if (specifier.type === 'ImportSpecifier') {
      const importedName = specifier.imported.name
      const newName = COMPONENT_MAP[importedName]
      if (newName) {
        context.report({
          node: specifier,
          messageId: 'renameComponent',
          data: { old: importedName, new: newName },
          fix(fixer) {
            return fixer.replaceText(specifier.imported, newName)
          },
        })
      }
    }
  })
}

// JSX要素
'JSXOpeningElement[name.name=/^(Component1|Component2)$/]'(node) {
  const oldName = node.name.name
  const newName = COMPONENT_MAP[oldName]
  context.report({
    node,
    messageId: 'renameComponent',
    data: { old: oldName, new: newName },
    fix(fixer) {
      return fixer.replaceText(node.name, newName)
    },
  })
}
```

### パターン2: 属性のリネーム

```javascript
'JSXOpeningElement[name.name="Component"] > JSXAttribute[name.name="oldProp"]'(node) {
  context.report({
    node,
    messageId: 'renameProp',
    fix(fixer) {
      return fixer.replaceText(node.name, 'newProp')
    },
  })
}
```

### パターン3: 属性の削除

```javascript
'JSXOpeningElement[name.name="Component"] > JSXAttribute[name.name="deprecatedProp"]'(node) {
  context.report({
    node,
    messageId: 'removeProp',
    fix(fixer) {
      const sourceCode = context.getSourceCode()
      const tokenAfter = sourceCode.getTokenAfter(node)
      // 属性全体を削除（前後の空白も含める）
      return fixer.removeRange([node.range[0], tokenAfter.range[0]])
    },
  })
}
```

### パターン4: 親要素の検索と修正

```javascript
function findTargetParent(node, sourceCode) {
  let current = node
  while (current && current.type !== 'Program') {
    const parent = current.parent
    if (parent.type === 'JSXElement') {
      const openingElement = parent.openingElement
      const componentName = openingElement.name.name
      if (TARGET_COMPONENTS.includes(componentName)) {
        return { element: parent, opening: openingElement }
      }
    }
    current = parent
  }
  return null
}
```

### パターン5: 未知の属性がある場合の処理

未知の属性（id, onClick, data-*, aria-*など）がある場合の対処法は、移行パターンによって異なります。

#### パターンA: 未知の属性を保持したまま移行（自動修正可能）

コンポーネントを別のコンポーネントやネイティブ要素に置換する場合、未知の属性もそのまま引き継げます。

```javascript
// 例: Text → span への置換
'JSXOpeningElement[name.name="Text"]'(node) {
  const textChildren = sourceCode.getText(element.children[0])

  // 未知の属性も含めて全て保持
  const attributes = node.attributes
    .map(attr => sourceCode.getText(attr))
    .join(' ')

  context.report({
    node,
    messageId: 'replaceWithNative',
    fix(fixer) {
      return fixer.replaceText(
        element,
        `<span ${attributes}>${textChildren}</span>`
      )
    },
  })
}
```

**このパターンが適用できるケース:**
- コンポーネント名の置換（FormDialog → ControlledFormDialog）
- ラッパーコンポーネントからネイティブ要素への置換（Text → span）
- 属性の移行先が明確な場合

#### パターンB: 未知の属性の移行先が不明確（エラーのみ、自動修正なし）

コンポーネントを削除して親に統合する場合など、未知の属性をどこに移すべきか不明確な場合は手動対応が必要です。

```javascript
/**
 * 既知の属性以外が存在するかチェック
 *
 * @param {Object} node - チェック対象のJSXOpeningElement
 * @param {...Object} knownAttrs - 既知の属性ノード（可変長引数）
 * @returns {boolean} 未知の属性が存在する場合true
 */
function hasUnknownAttributes(node, ...knownAttrs) {
  const knownSet = new Set(knownAttrs.filter(Boolean))
  for (const attr of node.attributes) {
    if (attr.type !== 'JSXAttribute') continue
    if (!knownSet.has(attr)) {
      return true
    }
  }
  return false
}

// 使用例: ResponseMessage を親の icon 属性に移行
'JSXOpeningElement[name.name=/ResponseMessage$/]'(node) {
  // 既知の属性を収集
  let statusAttr = null
  let iconGapAttr = null
  for (const attr of node.attributes) {
    if (attr.type !== 'JSXAttribute') continue
    if (attr.name.name === 'status') statusAttr = attr
    if (attr.name.name === 'iconGap') iconGapAttr = attr
  }

  const hasUnknownAttrs = hasUnknownAttributes(node, statusAttr, iconGapAttr)

  if (hasUnknownAttrs) {
    // 未知の属性がある → エラーのみ（自動修正なし）
    context.report({
      node: iconGapAttr || node,
      messageId: 'migrateWithUnknownAttrs',
    })
  } else {
    // 未知の属性がない → 自動修正可能
    context.report({
      node: iconGapAttr || node,
      messageId: 'migrate',
      fix(fixer) {
        // 自動修正処理
      },
    })
  }
}
```

**このパターンが必要なケース:**
- コンポーネントを削除して親に統合（ResponseMessage → 親のicon属性）
- 属性の移行先が複数ありえる場合
- 属性の意味が変わる可能性がある場合

**例（v90-to-v91のResponseMessage）:**
```javascript
// ❌ 未知の属性があるため自動修正しない
<Heading><ResponseMessage id="foo" status="success">Xxxx</ResponseMessage></Heading>
// → エラー: "id 属性がある場合は手動で移行してください"
// （ResponseMessageのid属性をHeadingに移すべきか、削除すべきか不明確）

// ✅ 既知の属性のみなので自動修正可能
<Heading><ResponseMessage status="success">Xxxx</ResponseMessage></Heading>
// → 自動修正: <Heading icon={{ prefix: <FaCircleCheckIcon /> }}>Xxxx</Heading>
```

**判断基準:**
- **属性の移行先が明確** → パターンA（未知の属性も保持して自動修正）
- **属性の移行先が不明確** → パターンB（エラーのみ、手動対応）

### パターン6: smarthrUiAlias オプションへの対応

プロジェクト固有のsmarthr-ui aliasパスに対応するため、`smarthrUiAlias`オプションを利用します。

#### 共通ヘルパー関数の使用（v92以降）

`helpers.js` に共通化されたヘルパー関数を使用します。これにより、重複コードを書く必要がありません。

```javascript
const { setupSmarthrUiAliasOptions } = require('../../helpers')

createCheckers(context, sourceCode, options = {}) {
  // 1行でセットアップ完了
  const { validSources, isAliasFile, filename } = setupSmarthrUiAliasOptions(context, options)

  return {
    ImportDeclaration(node) {
      // smarthr-ui または @/components/parts/smarthr-ui からのimport
      if (!validSources.includes(node.source.value)) return

      // ...置換処理
    }
  }
}
```

**setupSmarthrUiAliasOptionsの戻り値:**
- `validSources`: `['smarthr-ui']` または `['smarthr-ui', '@/components/parts/smarthr-ui']`
- `isAliasFile`: 現在のファイルがaliasファイルかどうか（boolean）
- `filename`: 現在のファイルパス（文字列）

#### validSourcesの拡張（レガシー実装、参考用）

v90-to-v91では手動で実装していましたが、v92以降は`setupSmarthrUiAliasOptions`を使用してください。

<details>
<summary>レガシー実装例（非推奨）</summary>

```javascript
createCheckers(context, sourceCode, options = {}) {
  const customSmarthrUiAlias = options.smarthrUiAlias
  const validSources = ['smarthr-ui']
  if (customSmarthrUiAlias) {
    validSources.push(customSmarthrUiAlias)
  }

  return {
    ImportDeclaration(node) {
      // smarthr-ui または @/components/parts/smarthr-ui からのimport
      if (!validSources.includes(node.source.value)) return

      // ...置換処理
    }
  }
}
```

</details>

#### aliasファイル内のexport変数名置換

aliasディレクトリ配下のファイルで、smarthr-uiコンポーネント名と同じ変数名をexportしている場合に置換します。

```javascript
// aliasファイルかどうかの判定
const isAliasFile = customSmarthrUiAlias && isFileMatchingSmarthrUiAlias(
  context.getFilename(),
  customSmarthrUiAlias
)

const checkers = {
  // ... 通常のチェッカー
}

// aliasファイルの場合のみ、export変数名の置換を追加
if (isAliasFile) {
  checkers['ExportNamedDeclaration > VariableDeclaration > VariableDeclarator'] = function(node) {
    const variableName = node.id.name
    const newName = DIALOG_COMPONENTS[variableName]

    if (newName) {
      context.report({
        node: node.id,
        messageId: 'renameDialog',
        data: { old: variableName, new: newName, to: TARGET_VERSION },
        fix(fixer) {
          return fixer.replaceText(node.id, newName)
        },
      })
    }
  }
}

return checkers
```

#### ファイルパスのマッチング

v92以降では `setupSmarthrUiAliasOptions` に含まれているため、個別に実装する必要はありません。

`isAliasFile` の値を直接使用してください：

```javascript
const { validSources, isAliasFile, filename } = setupSmarthrUiAliasOptions(context, options)

// aliasファイル専用の処理
if (isAliasFile) {
  // ...
}
```

**内部実装の詳細:**

`helpers.js` の `isFileMatchingSmarthrUiAlias` 関数が以下のパターンをマッチングします：

1. **ディレクトリ形式**: `/components/parts/smarthr-ui/index.tsx`
2. **個別ファイル**: `/components/parts/smarthr-ui/ActionDialog.tsx`
3. **単一ファイル形式**: `/components/parts/smarthr-ui.tsx`

低レベルのマッチング処理が必要な場合のみ、`helpers.js` から直接importできます：

```javascript
const { isFileMatchingSmarthrUiAlias } = require('../../helpers')
```

**このパターンが適用されるケース:**
- **barrel import構造**: `@/components/parts/smarthr-ui/index.tsx` + 個別ファイル
- **個別ファイルのみ**: `@/components/parts/smarthr-ui/ActionDialog.tsx` など
- **単一ファイル形式**: `@/components/parts/smarthr-ui.tsx` （ディレクトリではなく1つのファイル）

**ポイント:**
- importチェックは`validSources`で拡張
- export変数名の置換は`isAliasFile`条件付きで追加
- サブディレクトリも含めてマッチング（`filename.includes(resolved)`）
- 単一ファイル形式にも対応（`filename.includes(\`/\${pathPart}.\`)`）

### パターン7: aliasファイル名の変更チェック

aliasファイルのファイル名が変更対象のコンポーネント名と一致する場合、ファイル名の変更を促すエラーを表示します。

```javascript
checkers.Program = function(node) {
  if (!isAliasFile) return

  // ファイル名からコンポーネント名を抽出（拡張子を除く）
  const fileBasename = filename.split('/').pop() || ''
  const componentName = fileBasename.replace(/\.(tsx?|jsx?)$/, '')

  // Dialog系コンポーネント名と一致するかチェック
  const newName = DIALOG_COMPONENTS[componentName]
  if (newName) {
    const oldFile = fileBasename
    const newFile = fileBasename.replace(componentName, newName)

    context.report({
      node,
      messageId: 'renameAliasFile',
      data: {
        old: componentName,
        new: newName,
        to: TARGET_VERSION,
        oldFile,
        newFile,
      },
      // fixは提供しない（ファイル名の変更はESLintでは不可能）
    })
  }
}
```

**このパターンが必要なケース:**
- aliasファイルのファイル名がコンポーネント名と一致している場合
- 例: `ActionDialog.tsx` → `ControlledActionDialog.tsx` に変更が必要

**ポイント:**
- `Program` ノードに対してチェック（ファイルごとに1回だけ実行）
- ファイル名の変更はESLintでは不可能なので、fix関数は提供しない
- エラーメッセージに新旧のファイル名を含める
- export変数名の置換とは別のエラーとして表示される

**エラーメッセージに含める情報:**
- ファイル名の変更手順（`git mv` の例）
- ファイル名変更後、import文も更新が必要であることを明記

**注意:**
- re-export（`export { ActionDialog } from 'smarthr-ui'`）にも対応するため、`ExportNamedDeclaration`チェッカーも実装が必要
- ファイル名変更後、そのファイルをimportしている箇所も手動で更新する必要がある
  ```typescript
  // Before
  import { FormDialog } from '@/components/parts/smarthr-ui/FormDialog'

  // After (ファイル名変更後)
  import { ControlledFormDialog } from '@/components/parts/smarthr-ui/ControlledFormDialog'
  ```

```javascript
ExportNamedDeclaration(node) {
  // sourceがない場合（通常のexport）はスキップ
  if (!node.source) return
  if (!validSources.includes(node.source.value)) return

  node.specifiers.forEach((specifier) => {
    if (specifier.type !== 'ExportSpecifier') return

    const exportedName = specifier.exported.name
    const localName = specifier.local.name
    const newName = DIALOG_COMPONENTS[localName]

    if (newName) {
      context.report({
        node: specifier,
        messageId: 'renameDialog',
        data: { old: localName, new: newName, to: TARGET_VERSION },
        fix(fixer) {
          // export { ActionDialog } のように local === exported の場合
          if (localName === exportedName) {
            return fixer.replaceText(specifier, newName)
          }
          // export { ActionDialog as MyDialog } のような場合
          return fixer.replaceText(specifier.local, newName)
        },
      })
    }
  })
}
```

## 共通化の状況と今後の方針

### 現在共通化されている機能（v92時点）

以下の機能は `../../helpers.js` に共通化されています：

1. **setupSmarthrUiAliasOptions**: validSources拡張とaliasファイル判定を一括で行う
2. **isFileMatchingSmarthrUiAlias**: ファイルパスマッチング（低レベル）

これにより、各versionファイルで約30行の重複コードが削減されました。

### 将来的な共通化の候補

現時点（v92）では以下のパターンが各versionで繰り返されていますが、**読みやすさ重視の方針**により共通化を見送っています。

#### 共通化候補のパターン

| パターン | 繰り返し箇所 | 共通化の可能性 |
|---------|------------|--------------|
| ImportDeclaration | v90-to-v91, v91-to-v92 | 構造は同じだが、マッピング定数とmessageIdが異なる |
| ExportNamedDeclaration | v90-to-v91, v91-to-v92 | 同上 |
| JSXOpeningElement | v90-to-v91, v91-to-v92 | セレクター正規表現が異なる |
| Program（ファイル名変更） | v90-to-v91, v91-to-v92 | マッピング定数のみ異なる |
| VariableDeclarator（export変数） | v90-to-v91, v91-to-v92 | マッピング定数のみ異なる |

#### 共通化を見送る理由

1. **読みやすさの優先**: このルールは一時的な使用を想定し、後から読む人が理解しやすいことを重視
2. **version特有のロジック**: 将来のversionで微妙に異なる処理が必要になる可能性
3. **過度な抽象化のリスク**: ヘルパー関数のパラメータが複雑になり、かえって読みにくくなる

#### 再検討のタイミング

以下の条件を満たした場合、共通化を再検討してください：

- **v93, v94などが追加され、パターンが確立**: 3つ以上のversionで同じパターンが繰り返される
- **明確な抽象化が可能**: パラメータが単純で、特殊ケースが少ない
- **読みやすさを損なわない**: ヘルパー関数の実装が直感的で理解しやすい

**実装候補:**

```javascript
// helpers.js に追加する場合の例
function createComponentRenameCheckers({ componentMap, messageId, targetVersion, validSources }) {
  return {
    ImportDeclaration(node) { /* ... */ },
    ExportNamedDeclaration(node) { /* ... */ },
    // JSXセレクターは動的に生成が難しいため除外
  }
}
```

**注意:**
共通化を進める際は、必ず以下を確認してください：
- 新しいversionで同じパターンが使えるか
- ヘルパー関数のパラメータが複雑すぎないか
- REFERENCE.mdに実装例を記載し、次の開発者が理解できるか

## 複数バージョンスキップ時の衝突検出

複数のバージョンをスキップする移行（例: v90→v93）では、コンポーネント名の衝突が発生する可能性があります。新しいバージョンを追加する際は、過去のバージョンとの組み合わせで衝突が起こらないか検証してください。

### 衝突が発生する仕組み

ESLintは`--fix`実行時にstaged fixesという仕組みを使用します。これは、1回の修正で新たにルール違反が生じた場合、自動的に再実行される機能です。

**問題のシナリオ（v90→v92の場合）:**

```javascript
// 元のコード
import { ActionDialog, RemoteTriggerActionDialog } from 'smarthr-ui'

// 1回目の自動修正（v90→v91とv91→v92が同時に適用）
// - ActionDialog → ControlledActionDialog (v90→v91)
// - RemoteTriggerActionDialog → ActionDialog (v91→v92)
import { ControlledActionDialog, ActionDialog } from 'smarthr-ui'

// ESLintが自動的に再実行される（staged fixes）
// 2回目の自動修正で、新しく生成されたActionDialogがさらに変換される
// - ActionDialog → ControlledActionDialog (v90→v91が再度適用)
import { ControlledActionDialog, ControlledActionDialog } from 'smarthr-ui'
// ❌ 重複！元のRemoteTriggerActionDialogの情報が失われる
```

**原因の分析:**
1. v90→v91で`ActionDialog`→`ControlledActionDialog`というルールがある
2. v91→v92で`RemoteTriggerActionDialog`→`ActionDialog`というルールがある
3. 同時に実行すると、2のルールで新しく生成された`ActionDialog`が、1のルールによって再度変換されてしまう
4. 結果として、元のコンポーネント名の情報が失われる

### 衝突の検出パターン

新しいバージョンを追加する際は、以下をチェックしてください：

**チェック項目:**
- 今回のバージョンで**リネーム先**となる名前が、過去のバージョンで**リネーム元**だった名前と一致しないか

**例:**
```
v90→v91: ActionDialog → ControlledActionDialog（リネーム元: ActionDialog）
v91→v92: RemoteTriggerActionDialog → ActionDialog（リネーム先: ActionDialog）
→ ❌ 衝突！「ActionDialog」が両方に登場
```

### 衝突検出の実装

衝突が発見された場合、`index.js`の`getMigrationPath()`関数に衝突検出ロジックを追加します。

**実装例（rules/autofixer-smarthr-ui-migration/index.js）:**

```javascript
/**
 * バージョン間の移行パスを生成する
 *
 * @param {string} from - 移行元バージョン（例: "90"）
 * @param {string} to - 移行先バージョン（例: "91"）
 * @returns {{ path: string[], skipped: number[], conflict?: boolean, conflictData?: object } | null}
 */
function getMigrationPath(from, to) {
  const fromNum = parseInt(from)
  const toNum = parseInt(to)

  if (fromNum >= toNum || isNaN(fromNum) || isNaN(toNum)) {
    return null
  }

  const path = []
  const skipped = []

  // fromからtoまでの各ステップについて、移行モジュールが存在するかチェック
  for (let i = fromNum; i < toNum; i++) {
    const stepKey = `v${i}-v${i + 1}`
    if (VERSION_MODULES[stepKey]) {
      path.push(stepKey)
    } else {
      skipped.push(i + 1)
    }
  }

  if (path.length === 0) {
    return null
  }

  // ============================================================
  // コンポーネント名衝突の検出
  // ============================================================
  // v90→v91とv91→v92の両方が含まれる場合、ActionDialogの名前が衝突する
  // (v90のActionDialog→ControlledActionDialog、v91のRemoteTriggerActionDialog→ActionDialog)
  if (path.includes('v90-v91') && path.includes('v91-v92')) {
    return {
      path,
      skipped,
      conflict: true,
      conflictData: {
        from,
        to,
        middle: '91',  // 中間バージョン（段階的に実行する際の区切り）
      },
    }
  }

  return { path, skipped }
}
```

**meta.messagesにエラーメッセージを追加:**

```javascript
module.exports = {
  meta: {
    // ...
    messages: {
      // ...
      conflictingMigration: 'v{{from}}→v{{to}}の一気実行はコンポーネント名の衝突により正しく動作しません。段階的に実行してください: 1. { "from": "{{from}}", "to": "{{middle}}" } を実行 2. { "from": "{{middle}}", "to": "{{to}}" } を実行',
    },
  },
  // ...
}
```

**create()関数で衝突をチェック:**

```javascript
create(context) {
  const options = context.options[0]

  // ... オプション必須チェック ...

  const { from, to } = options
  const migrationResult = getMigrationPath(from, to)

  if (!migrationResult) {
    // サポートされていないバージョン
    return {
      Program(node) {
        context.report({
          node,
          messageId: 'unsupportedVersion',
          data: { from, to },
        })
      },
    }
  }

  // コンポーネント名衝突の検出
  if (migrationResult.conflict) {
    return {
      Program(node) {
        context.report({
          node,
          messageId: 'conflictingMigration',
          data: migrationResult.conflictData,
        })
      },
    }
  }

  // ... 通常の処理 ...
}
```

### テストケースの追加

衝突が検出されることを確認するテストケースを追加します。

**test/autofixer-smarthr-ui-migration.js:**

```javascript
ruleTester.run('autofixer-smarthr-ui-migration', rule, {
  valid: [
    // ... 既存のケース ...
  ],

  invalid: [
    // ... 既存のケース ...

    // ============================================================
    // v90→v92 競合テスト（コンポーネント名の衝突により禁止）
    // ============================================================
    {
      code: `import { ActionDialog } from 'smarthr-ui'`,
      options: [{ from: '90', to: '92' }],
      errors: [{ messageId: 'conflictingMigration', data: { from: '90', to: '92', middle: '91' } }],
    },

    // v90→v93 も同様に衝突
    {
      code: `import { ActionDialog } from 'smarthr-ui'`,
      options: [{ from: '90', to: '93' }],
      errors: [{ messageId: 'conflictingMigration', data: { from: '90', to: '93', middle: '91' } }],
    },
  ],
})
```

### 衝突検出のチェックリスト

新しいバージョンを追加する際は、以下を確認してください：

- [ ] **過去のリネーム元との衝突チェック**: 今回のリネーム先が、過去のバージョンでリネーム元だった名前と一致しないか
- [ ] **衝突が発見された場合**:
  - [ ] `getMigrationPath()`に衝突検出ロジックを追加
  - [ ] `conflictingMigration`メッセージに中間バージョンを含める
  - [ ] テストケースで衝突検出を確認
  - [ ] DEVELOPER.mdとREFERENCE.mdに衝突の理由と対策を記載

### 参考実装

- [v91→v92追加時のコミット](https://github.com/kufu/tamatebako/commit/dc29036): v90→v92衝突検出の実装例
- [index.js:L178-L192](../index.js): 実際の衝突検出コード

## トラブルシューティング

### Fix objects must not be overlapped

複数のfix操作が重複している場合のエラーです。

**解決策:**
- 1つのfix関数で完結するように修正
- 親要素全体を一度に置換する

```javascript
// ❌ 重複エラー
return [
  fixer.replaceText(child, 'newChild'),
  fixer.replaceText(parent.attribute, 'newAttribute'),
]

// ✅ 親全体を置換
return fixer.replaceText(parent.attribute, `{{ text: newChild, ... }}`)
```

### セレクターが一致しない

正規表現の終端記号を確認してください。

```javascript
// ❌ 部分一致してしまう
'JSXOpeningElement[name.name=/ResponseMessage/]'  // MyResponseMessage にも一致

// ✅ 完全一致
'JSXOpeningElement[name.name=/^ResponseMessage$/]'
'JSXOpeningElement[name.name=/ResponseMessage$/]'  // 末尾一致でも可
```

### エラーメッセージの順序

Programノードでの警告は、他のノードのエラーより先に報告されます。

テストケースでは、この順序を正しく指定する必要があります：

```javascript
errors: [
  { messageId: 'skippedVersion', data: { version: 'v92' } },  // Program警告が先
  { messageId: 'renameDialog', data: { ... } },  // その後、個別のエラー
]
```

## 参考リンク

- [ESLint Custom Rules Guide](https://eslint.org/docs/latest/extend/custom-rules)
- [ESTree Spec](https://github.com/estree/estree) - AST構造の仕様
- [AST Explorer](https://astexplorer.net/) - ASTの構造を確認できるツール
