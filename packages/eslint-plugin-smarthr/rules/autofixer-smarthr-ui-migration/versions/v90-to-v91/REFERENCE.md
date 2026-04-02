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

```javascript
createCheckers(context, sourceCode) {
  return {
    // インポート文の処理
    ImportDeclaration(node) {
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

機械的に100%正しく変換できる場合のみ自動修正を実装します。

**例:**
- コンポーネント名のリネーム（ActionDialog → ControlledActionDialog）
- 属性名のリネーム（type → status）
- 属性の削除（値が変わらない場合）

### ⚠️ エラーのみ（自動修正なし）

以下のケースは手動確認が必要なため、エラー表示のみ行います：

**例:**
- 意図が不明な場合（既存のicon属性がある状態でのiconGap削除）
- 複数の対処方法がある場合
- 安全性が確保できない場合

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
