# v94-to-v95 実装の参考ポイント

このドキュメントは、v94→v95の移行ルール実装の構造と、新しいversionを追加する際の参考ポイントを説明します。

## v94→v95 特有の実装パターン

### 1. LanguageSwitcher, InputFile の decorators 属性削除

v95では LanguageSwitcher, InputFile コンポーネントから `decorators` 属性が削除されました。v93-to-v94のThCheckboxと同じく、**新しい属性への移行はなく、完全に削除する**だけのシンプルなパターンです。

#### 1-1. decorators属性のチェッカー（シンプルな削除）

```javascript
'JSXAttribute[name.name="decorators"]'(node) {
  const componentName = node.parent.name.name

  // 対象コンポーネントのみ（LanguageSwitcher, InputFile）
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

### 1-2. AppLauncher の decorators.triggerLabel を triggerLabel 属性に移行

v95では AppLauncher コンポーネントの `decorators.triggerLabel` が `triggerLabel` 属性に移行されました。これは**値の抽出が必要な複雑なパターン**です。

#### 変更内容

**削除される属性:**
- `decorators.triggerLabel` → `triggerLabel` 属性（動的な値の場合のみ）

**移行後の形式:**
```tsx
// 固定値の場合 → decoratorsを削除してIntlProviderに任せる
<AppLauncher />

// 動的な値の場合 → triggerLabel属性に移行
<AppLauncher triggerLabel={featureName} />
```

#### 実装の制約と自動修正可能なパターン

**自動修正可能:**
- 既に`triggerLabel`属性がある場合 → `decorators`を削除

**自動修正不可（エラーのみ表示）:**
- `decorators.triggerLabel`の値抽出 → `() => value`から`value`を取り出す処理が複雑

#### 実装パターン

```javascript
'JSXOpeningElement[name.name="AppLauncher"] > JSXAttribute[name.name="decorators"]'(node) {
  // decorators属性の値を解析してtriggerLabelがあるかチェック
  const decoratorsValue = sourceCode.getText(node.value)
  if (decoratorsValue.includes('triggerLabel')) {
    // triggerLabel属性が既にあるかチェック
    const triggerLabelAttr = node.parent.attributes.find(
      (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'triggerLabel'
    )

    context.report({
      node,
      messageId: 'migrateAppLauncherDecorators',
      data: { to: TARGET_VERSION },
      fix(fixer) {
        // triggerLabel属性が既にある場合は削除のみ
        if (triggerLabelAttr) {
          const tokenBefore = sourceCode.getTokenBefore(node)
          if (tokenBefore && tokenBefore.range[1] < node.range[0]) {
            return fixer.removeRange([tokenBefore.range[1], node.range[1]])
          }
          return fixer.remove(node)
        }

        // 値の抽出は複雑なため、エラーのみ表示（手動対応）
        return null
      },
    })
  }
}
```

**ポイント:**
- `sourceCode.getText(node.value).includes('triggerLabel')`で簡易チェック
- `triggerLabel`属性が既にある場合は`decorators`を削除
- 値の抽出（`() => featureName`から`featureName`を取り出す）は複雑なため手動対応
- 固定値の場合も手動対応（`() => 'Apps'` → decorators削除）

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
- `actionText` + `actionTheme` → Object形式へ自動変換
- `actionText` + `actionDisabled` → Object形式へ自動変換
- `actionText` + `actionTheme` + `actionDisabled` → Object形式へ自動変換
- 既に`actionButton`/`closeButton`がある場合 → 古い属性を削除
- `decorators.closeButtonLabel`（引数なしの関数） → 値を抽出して`closeButton`に変換

**自動修正不可（エラーのみ表示）:**
- `closeDisabled` → Object形式への変換が複雑
- `decorators.closeButtonLabel`（引数あり、またはBlockStatement）

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
  3. 複数属性 → Object形式へ自動変換（v94-to-v95で追加）

**Object形式への自動変換（actionText + actionTheme/actionDisabled）:**

```javascript
if (actionTextAttr) {
  context.report({
    node: actionTextAttr,
    messageId: 'migrateActionText',
    fix(fixer) {
      if (hasActionButton) {
        // actionButton属性が既にある場合は削除のみ
        return removeAttribute(fixer, actionTextAttr)
      }

      // actionButton属性がない場合
      if (!actionThemeAttr && !actionDisabledAttr) {
        // actionTextのみ → 単純にリネーム
        return fixer.replaceText(actionTextAttr.name, 'actionButton')
      }

      // 複数の属性がある場合、Object形式に変換
      const fixes = []
      const textValue = getAttributeValue(actionTextAttr)
      const themeValue = actionThemeAttr ? getAttributeValue(actionThemeAttr) : null
      const disabledValue = actionDisabledAttr ? getAttributeValue(actionDisabledAttr) : null

      const objectParts = [`text: ${textValue}`]
      if (themeValue) objectParts.push(`theme: ${themeValue}`)
      if (disabledValue !== null) objectParts.push(`disabled: ${disabledValue}`)

      const newValue = `actionButton={{ ${objectParts.join(', ')} }}`

      // actionText属性をactionButton={{ ... }}に置換
      fixes.push(fixer.replaceText(actionTextAttr, newValue))

      // actionTheme/actionDisabled属性を削除
      if (actionThemeAttr) {
        fixes.push(removeAttribute(fixer, actionThemeAttr))
      }
      if (actionDisabledAttr) {
        fixes.push(removeAttribute(fixer, actionDisabledAttr))
      }

      return fixes
    },
  })
}

// actionTheme/actionDisabledのfix関数では、actionTextが存在する場合はnullを返す
// （actionTextのfixでまとめて処理されるため）
```

**getAttributeValue ヘルパー関数:**

```javascript
function getAttributeValue(attr) {
  if (!attr || !attr.value) return '""'

  // 文字列リテラル: actionText="保存"
  if (attr.value.type === 'Literal') {
    return JSON.stringify(attr.value.value)
  }

  // JSX式: actionTheme={"danger"} または actionDisabled={false}
  if (attr.value.type === 'JSXExpressionContainer') {
    const expr = attr.value.expression
    if (expr.type === 'Literal') {
      return JSON.stringify(expr.value)
    }
    // 変数や式の場合はソースコードをそのまま取得
    return sourceCode.getText(expr)
  }

  return '""'
}
```

#### 2-4. decorators.closeButtonLabel の処理（値の自動抽出）

v94→v95では、引数なしの関数（`() => "OK"`形式）から値を抽出する実装を追加しました。

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

        // decorators={{ closeButtonLabel: () => "OK" }}から値を抽出
        const extractedValue = extractDecoratorValue(decoratorsAttr, 'closeButtonLabel')
        if (extractedValue) {
          // 自動修正可能: decoratorsを削除してcloseButtonを追加
          return fixer.replaceText(decoratorsAttr, `closeButton=${extractedValue}`)
        }

        // 複雑なため、エラーのみ（手動対応）
        return null
      },
    })
  }
}
```

**extractDecoratorValue 関数:**

```javascript
/**
 * decorators属性から指定されたプロパティの値を抽出
 *
 * decorators={{ closeButtonLabel: () => "OK" }} から "OK" を抽出
 * decorators={{ closeButtonLabel: () => variable }} から {variable} を抽出
 *
 * @param {Object} decoratorsAttr - decorators属性のASTノード
 * @param {string} propertyName - 抽出するプロパティ名
 * @returns {string|null} 抽出された値、または抽出不可の場合null
 */
function extractDecoratorValue(decoratorsAttr, propertyName) {
  if (!decoratorsAttr || !decoratorsAttr.value) return null
  if (decoratorsAttr.value.type !== 'JSXExpressionContainer') return null

  const expr = decoratorsAttr.value.expression
  if (expr.type !== 'ObjectExpression') return null

  // プロパティを探す
  const property = expr.properties.find((prop) => {
    return (
      prop.type === 'Property' &&
      prop.key &&
      ((prop.key.type === 'Identifier' && prop.key.name === propertyName) ||
        (prop.key.type === 'Literal' && prop.key.value === propertyName))
    )
  })

  if (!property || !property.value) return null

  // ArrowFunctionExpression: () => "OK"
  if (property.value.type !== 'ArrowFunctionExpression') return null

  // 引数なしの場合のみ処理
  if (property.value.params.length !== 0) return null

  const body = property.value.body

  // BlockStatement（ブロック形式）は対応しない: () => { return "OK" }
  if (body.type === 'BlockStatement') return null

  // Literal: () => "OK" → "OK"
  if (body.type === 'Literal') {
    return JSON.stringify(body.value)
  }

  // その他のExpression: () => variable → {variable}
  //                    () => a() → {a()}
  //                    () => obj.prop → {obj.prop}
  return `{${sourceCode.getText(body)}}`
}
```

**ポイント:**
- `ArrowFunctionExpression`の`params.length === 0`（引数なし）の場合のみ処理
- `BlockStatement`（`() => { return "OK" }`）は対応しない
- `body.type === 'Literal'` → 文字列として返す（`"OK"`）
- その他のExpression → JSX式として返す
  - `() => variable` → `{variable}`
  - `() => a()` → `{a()}`
  - `() => obj.prop` → `{obj.prop}`
  - `sourceCode.getText(body)`でbody部分のソースコードをそのまま抽出

### 3. MessageDialog の decorators 削除

MessageDialogは FormDialog/ActionDialog と似ていますが、`closeButtonLabel`のみの対応です。FormDialogと同じく`extractDecoratorValue`を使って値を自動抽出します。

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

        // decorators={{ closeButtonLabel: () => "OK" }}から値を抽出
        const extractedValue = extractDecoratorValue(node, 'closeButtonLabel')
        if (extractedValue) {
          // 自動修正可能
          return fixer.replaceText(node, `closeButton=${extractedValue}`)
        }

        // 複雑なため、エラーのみ（手動対応）
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

// AppLauncher with triggerLabel
'<AppLauncher triggerLabel={featureName} />',
'<AppLauncher triggerLabel="Custom Label" />',

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

// AppLauncher decorators.triggerLabel（エラーのみ、自動修正なし）
{
  code: '<AppLauncher decorators={{ triggerLabel: () => featureName }} />',
  output: null, // 自動修正なし
  errors: [{ messageId: 'migrateAppLauncherDecorators' }]
},

// AppLauncher（triggerLabel属性が既にある場合、decorators削除）
{
  code: '<AppLauncher decorators={{ triggerLabel: () => "Apps" }} triggerLabel={featureName} />',
  output: '<AppLauncher triggerLabel={featureName} />',
  errors: [{ messageId: 'migrateAppLauncherDecorators' }]
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
