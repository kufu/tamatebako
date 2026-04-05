# v90-to-v91 実装の参考ポイント

このドキュメントは、v90→v91の移行ルール実装の構造と、新しいversionを追加する際の参考ポイントを説明します。

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

#### validSourcesの拡張

`smarthr-ui`に加えて、aliasパスからのimportもチェック対象にします。

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

#### ファイルパスのマッチング（ヘルパー関数）

```javascript
const { rootPath } = require('../../../../libs/common')

function isFileMatchingSmarthrUiAlias(filename, smarthrUiAlias) {
  // rootPathを使って絶対パスで比較を試みる
  const resolved = smarthrUiAlias.replace(/^@\//, `${rootPath}/`)
  if (filename.includes(resolved)) {
    return true
  }

  // rootPathでマッチしない場合:
  // パスの一部としてマッチング（テスト環境などで使用）
  const pathPart = smarthrUiAlias.replace(/^@\//, '').replace(/^~\//, '')

  // 以下のパターンにマッチング:
  // 1. ディレクトリ形式: /components/parts/smarthr-ui/index.tsx
  // 2. 個別ファイル: /components/parts/smarthr-ui/ActionDialog.tsx
  // 3. 単一ファイル形式: /components/parts/smarthr-ui.tsx
  return (
    filename.includes(`/${pathPart}/`) ||
    filename.endsWith(`/${pathPart}`) ||
    filename.includes(`/${pathPart}.`)
  )
}
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
