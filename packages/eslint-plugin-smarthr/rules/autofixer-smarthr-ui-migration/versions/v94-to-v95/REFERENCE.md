# v94-to-v95 実装の参考ポイント

このドキュメントは、v94→v95の移行ルール実装の構造と、新しいversionを追加する際の参考ポイントを説明します。

## v94→v95 特有の実装パターン

### 1. LanguageSwitcher, AppLauncher, InputFile の decorators 属性削除

v95では LanguageSwitcher, AppLauncher, InputFile コンポーネントから `decorators` 属性が削除されました。v93-to-v94のThCheckboxと同じく、**新しい属性への移行はなく、完全に削除する**だけのシンプルなパターンです。

#### 1-1. decorators属性のチェッカー（シンプルな削除）

```javascript
'JSXAttribute[name.name="decorators"]'(node) {
  const componentName = node.parent.name.name

  // 対象コンポーネントのみ
  if (!COMPONENTS_REMOVE_DECORATORS.includes(componentName)) return

  context.report({
    node,
    messageId: 'removeDecorators',
    data: { component: componentName, to: TARGET_VERSION },
    fix(fixer) {
      // decorators属性を削除
      const tokenBefore = sourceCode.getTokenBefore(node)
      if (tokenBefore && tokenBefore.range[1] < node.range[0]) {
        return fixer.removeRange([tokenBefore.range[1], node.range[1]])
      }
      return fixer.remove(node)
    },
  })
}
```

**ポイント:**
- v93-to-v94のThCheckboxと同じパターン
- **値の解析不要**: decoratorsの内容に関わらず削除するため、複雑な解析関数は不要
- **条件分岐なし**: 常に削除するだけ
- **自動修正: 常に可能**: 手動対応が必要なケースなし

### 2. FormDialog/ActionDialog のボタン属性統合

v95では FormDialog と ActionDialog のボタン関連属性が Object 形式に統合されました。これは**複雑な移行パターン**です。

#### 2-1. 移行が必要な属性

**削除される属性:**
- `actionText` → `actionButton` (文字列 or Object)
- `actionTheme` → `actionButton={{ theme: "..." }}` (Object)
- `actionDisabled` → `actionButton={{ disabled: true }}` (Object)
- `closeDisabled` → `closeButton={{ disabled: true }}` (Object)
- `decorators.closeButtonLabel` → `closeButton` (文字列 or Object)

**統合後の形式:**
```tsx
// シンプルな場合（文字列のみ）
actionButton="保存"
closeButton="キャンセル"

// 詳細設定（Object形式）
actionButton={{ text: "削除", theme: "danger", disabled: false }}
closeButton={{ text: "閉じる", disabled: true }}
```

#### 2-2. 実装の制約と自動修正可能なパターン

**自動修正可能:**
- `actionText`のみの場合 → `actionButton`にリネーム
- 既に`actionButton`/`closeButton`がある場合 → 古い属性を削除

**自動修正不可（エラーのみ表示）:**
- `actionText` + `actionTheme` → Object形式への変換が必要
- `actionText` + `actionDisabled` → Object形式への変換が必要
- `decorators.closeButtonLabel`の値抽出 → 複雑な解析が必要

#### 2-3. 実装パターン（段階的な対応）

```javascript
'JSXOpeningElement'(node) {
  const componentName = node.name.name

  // 対象コンポーネントのみ
  if (!DIALOG_COMPONENTS_WITH_BUTTONS.includes(componentName)) return

  // 各属性を収集
  let actionTextAttr = null
  let actionThemeAttr = null
  let actionDisabledAttr = null
  let closeDisabledAttr = null
  let decoratorsAttr = null
  let actionButtonAttr = null
  let closeButtonAttr = null

  node.attributes.forEach((attr) => {
    if (attr.type !== 'JSXAttribute') return
    const attrName = attr.name.name

    if (attrName === 'actionText') actionTextAttr = attr
    if (attrName === 'actionTheme') actionThemeAttr = attr
    // ... 他の属性も同様
  })

  const hasActionButton = !!actionButtonAttr
  const hasCloseButton = !!closeButtonAttr

  // actionText を actionButton に移行
  if (actionTextAttr) {
    context.report({
      node: actionTextAttr,
      messageId: 'migrateActionText',
      fix(fixer) {
        if (hasActionButton) {
          // actionButton属性が既にある場合は削除のみ
          const tokenBefore = sourceCode.getTokenBefore(actionTextAttr)
          if (tokenBefore && tokenBefore.range[1] < actionTextAttr.range[0]) {
            return fixer.removeRange([tokenBefore.range[1], actionTextAttr.range[1]])
          }
          return fixer.remove(actionTextAttr)
        }

        // actionText のみの場合、actionButton にリネーム
        if (!actionThemeAttr && !actionDisabledAttr) {
          return fixer.replaceText(actionTextAttr.name, 'actionButton')
        }

        // 複雑な場合はエラーのみ（手動対応）
        return null
      },
    })
  }

  // actionTheme, actionDisabled, closeDisabled も同様
  // ...
}
```

**ポイント:**
- **属性の収集**: すべての関連属性を先に収集
- **既存の新属性チェック**: `actionButton`/`closeButton`が既にあるかチェック
- **段階的な修正**:
  1. 新属性が既にある → 古い属性を削除
  2. 単一属性のみ → 単純なリネーム
  3. 複数属性 → エラーのみ（手動対応）

#### 2-4. decorators.closeButtonLabel の処理

```javascript
if (decoratorsAttr) {
  // decorators属性の値を解析してcloseButtonLabelがあるかチェック
  const decoratorsValue = sourceCode.getText(decoratorsAttr.value)
  if (decoratorsValue.includes('closeButtonLabel')) {
    context.report({
      node: decoratorsAttr,
      messageId: 'migrateDecoratorsCloseButtonLabel',
      fix(fixer) {
        // closeButton属性が既にある場合は削除のみ
        if (hasCloseButton) {
          const tokenBefore = sourceCode.getTokenBefore(decoratorsAttr)
          if (tokenBefore && tokenBefore.range[1] < decoratorsAttr.range[0]) {
            return fixer.removeRange([tokenBefore.range[1], decoratorsAttr.range[1]])
          }
          return fixer.remove(decoratorsAttr)
        }

        // 値の抽出は複雑なため、エラーのみ（手動対応）
        return null
      },
    })
  }
}
```

**ポイント:**
- `sourceCode.getText(decoratorsAttr.value)`で値の文字列を取得
- `includes('closeButtonLabel')`で簡易的にチェック
- 値の抽出（`() => 'キャンセル'`から`'キャンセル'`を取り出す）は複雑なため、手動対応

### 3. MessageDialog の decorators 削除

MessageDialogは FormDialog/ActionDialog と似ていますが、`closeButtonLabel`のみの対応です。

```javascript
'JSXOpeningElement[name.name="MessageDialog"] > JSXAttribute[name.name="decorators"]'(node) {
  const decoratorsValue = sourceCode.getText(node.value)
  if (decoratorsValue.includes('closeButtonLabel')) {
    const closeButtonAttr = node.parent.attributes.find(
      (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'closeButton'
    )

    context.report({
      node,
      messageId: 'migrateMessageDialogDecorators',
      fix(fixer) {
        // closeButton属性が既にある場合は削除のみ
        if (closeButtonAttr) {
          const tokenBefore = sourceCode.getTokenBefore(node)
          if (tokenBefore && tokenBefore.range[1] < node.range[0]) {
            return fixer.removeRange([tokenBefore.range[1], node.range[1]])
          }
          return fixer.remove(node)
        }

        // 値の抽出は複雑なため、エラーのみ（手動対応）
        return null
      },
    })
  }
}
```

## v93-to-v94との実装比較

### ThCheckbox (v93-to-v94) - シンプルな削除

```javascript
// 値の解析不要、条件分岐なし
context.report({
  node,
  messageId: 'removeDecorators',
  fix(fixer) {
    // decorators削除のみ
    const tokenBefore = sourceCode.getTokenBefore(node)
    if (tokenBefore && tokenBefore.range[1] < node.range[0]) {
      return fixer.removeRange([tokenBefore.range[1], node.range[1]])
    }
    return fixer.remove(node)
  }
})
```

### FormDialog (v94-to-v95) - 複雑な属性統合

```javascript
// 複数の属性を収集
let actionTextAttr = null
let actionThemeAttr = null
// ...

// 条件分岐で段階的に対応
if (actionTextAttr) {
  context.report({
    fix(fixer) {
      if (hasActionButton) {
        // 削除のみ
        return fixer.remove(actionTextAttr)
      }
      if (!actionThemeAttr && !actionDisabledAttr) {
        // 単純なリネーム
        return fixer.replaceText(actionTextAttr.name, 'actionButton')
      }
      // 複雑な場合はエラーのみ
      return null
    }
  })
}
```

## テストケースのパターン

### valid（エラーにならないケース）

```javascript
// decoratorsなし
'<LanguageSwitcher />',
'<AppLauncher />',
'<InputFile />',

// 既に新しい属性を使用
'<FormDialog actionButton="保存" />',
'<FormDialog actionButton={{ text: "削除", theme: "danger" }} />',
'<MessageDialog closeButton="OK" />',
```

### invalid（エラーになるケース）

```javascript
// decorators削除（自動修正可能）
{
  code: '<LanguageSwitcher decorators={{ triggerLabel: () => "Language" }} />',
  output: '<LanguageSwitcher />',
  errors: [{ messageId: 'removeDecorators' }]
},

// actionText リネーム（自動修正可能）
{
  code: '<FormDialog actionText="保存" />',
  output: '<FormDialog actionButton="保存" />',
  errors: [{ messageId: 'migrateActionText' }]
},

// 複数属性（エラーのみ、自動修正なし）
{
  code: '<FormDialog actionText="削除" actionTheme="danger" />',
  output: null, // 自動修正なし
  errors: [
    { messageId: 'migrateActionText' },
    { messageId: 'migrateActionTheme' }
  ]
},

// decorators.closeButtonLabel（エラーのみ、自動修正なし）
{
  code: '<FormDialog decorators={{ closeButtonLabel: () => "キャンセル" }} />',
  output: null, // 自動修正なし
  errors: [{ messageId: 'migrateDecoratorsCloseButtonLabel' }]
},
```

## 新しいversionを追加する場合

### シンプルな削除パターン（LanguageSwitcherタイプ）の場合

1. **セレクター**: `JSXAttribute[name.name="属性名"]`
2. **コンポーネント判定**: `if (!TARGET_COMPONENTS.includes(componentName)) return`
3. **fix**: decorators属性を削除（前の空白も含む）
4. **テスト**: valid（属性なし、他コンポーネント）、invalid（属性あり → 削除）

### 複雑な属性統合パターン（FormDialogタイプ）の場合

1. **属性収集**: すべての関連属性を先に収集
2. **既存の新属性チェック**: 新しい属性が既にあるかチェック
3. **段階的な fix**: 単純なケースのみ自動修正、複雑なケースはエラーのみ
4. **テスト**: valid（新属性）、invalid（各パターン、自動修正可/不可）

## 実装の参考ポイント

**最新version:** [v94-to-v95/REFERENCE.md](./versions/v94-to-v95/REFERENCE.md)

### ESLint fixer API

- `fixer.remove(node)`: ノードを削除
- `fixer.removeRange([start, end])`: 範囲を削除
- `fixer.replaceText(node, text)`: ノードのテキストを置換
- `fixer.insertTextAfter(node, text)`: ノードの後にテキスト挿入
- `sourceCode.getTokenBefore(node)`: 前のトークンを取得
- `sourceCode.getText(node)`: ノードのテキストを取得

### 段階的な自動修正のアプローチ

v94-to-v95のように複雑な変換が必要な場合、完全な自動修正を目指すと実装が複雑になりすぎます。以下のアプローチを推奨します：

**1. 単純なケースのみ自動修正:**
- `actionText` のみ → `actionButton` にリネーム
- 既に新属性がある → 古い属性を削除

**2. 複雑なケースはエラーのみ:**
- 複数属性の統合 → エラーメッセージで手動対応を促す
- 値の抽出が必要 → エラーメッセージで手動対応を促す

**3. エラーメッセージで移行方法を明示:**
```javascript
messages: {
  migrateActionText: 'smarthr-ui {{to}} では {{component}} の actionText 属性は actionButton に統合されました',
  // READMEで詳しい移行方法を説明
}
```

このアプローチにより：
- 実装がシンプルに保たれる
- 多くの一般的なケースは自動修正可能
- 複雑なケースは手動で正確に対応できる

## トラブルシューティング

### 前の空白が残る

**原因**: `fixer.remove(node)`のみだと、前の空白が残る

**解決策**:
```javascript
const tokenBefore = sourceCode.getTokenBefore(node)
if (tokenBefore && tokenBefore.range[1] < node.range[0]) {
  return fixer.removeRange([tokenBefore.range[1], node.range[1]])
}
```

### 複数の属性を統合する自動修正が難しい

**原因**: Object形式への変換は複雑

**解決策**: 段階的なアプローチ
- 単純なケース（単一属性）のみ自動修正
- 複雑なケース（複数属性）はエラーのみ表示
- READMEで手動での移行方法を詳しく説明

### decoratorsの値を抽出できない

**原因**: `() => '文字列'` や `() => getLabel()` など、様々なパターンがある

**解決策**:
- 完全な解析は避ける
- `sourceCode.getText(node.value).includes('closeButtonLabel')`で簡易チェック
- 値の抽出は手動対応とする
