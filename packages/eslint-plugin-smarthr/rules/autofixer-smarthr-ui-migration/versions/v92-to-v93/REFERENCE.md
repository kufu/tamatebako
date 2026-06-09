# v92-to-v93 実装の参考ポイント

このドキュメントは、v92→v93の移行ルール実装の構造と、新しいversionを追加する際の参考ポイントを説明します。

## v92→v93 特有の実装パターン

### 1. DropZone の decorators 属性削除と selectButtonLabel の移行

v93では DropZone コンポーネントから `decorators` 属性が削除されました。`selectButtonLabel` を新しい独立した属性に移行する必要があります。

#### 1-1. selectButtonLabel抽出のヘルパー関数

```javascript
/**
 * decorators属性からselectButtonLabelを抽出し、移行可能かチェック
 *
 * @param {Object} decoratorsNode - decorators属性のASTノード
 * @param {Object} sourceCode - ソースコード
 * @returns {Object} 解析結果
 *   - type: 'spread' | 'migratable' | 'not-migratable' | 'no-label' | 'invalid' | 'other-keys'
 *   - value?: string (migratableの場合)
 *   - isStringLiteral?: boolean (migratableの場合)
 */
function extractSelectButtonLabel(decoratorsNode, sourceCode) {
  // decorators={{ ... }} の形式か確認
  if (!decoratorsNode.value || decoratorsNode.value.type !== 'JSXExpressionContainer') {
    return { type: 'invalid' }
  }

  const expression = decoratorsNode.value.expression
  if (expression.type !== 'ObjectExpression') {
    return { type: 'invalid' }
  }

  // spread syntaxが含まれているかチェック
  const hasSpread = expression.properties.some((prop) => prop.type === 'SpreadElement')
  if (hasSpread) {
    return { type: 'spread' }
  }

  // selectButtonLabelプロパティを探す
  const selectButtonLabelProp = expression.properties.find(
    (prop) => prop.type === 'Property' && prop.key.name === 'selectButtonLabel'
  )

  if (!selectButtonLabelProp) {
    return { type: 'no-label' }
  }

  // selectButtonLabel以外のキーがある場合
  if (expression.properties.length > 1) {
    return { type: 'other-keys' }
  }

  const value = selectButtonLabelProp.value

  // ArrowFunctionExpressionで、引数なし、returnなしのパターンのみ対応
  if (
    value.type !== 'ArrowFunctionExpression' ||
    value.params.length > 0 ||
    value.body.type === 'BlockStatement'
  ) {
    return { type: 'not-migratable' }
  }

  // bodyの式を抽出
  const bodyExpression = value.body
  const bodyText = sourceCode.getText(bodyExpression)

  // 文字列リテラルの場合は値を抽出（クォートを除く）
  const isStringLiteral = bodyExpression.type === 'Literal' && typeof bodyExpression.value === 'string'

  return {
    type: 'migratable',
    value: isStringLiteral ? bodyExpression.value : bodyText,
    isStringLiteral,
  }
}
```

**ポイント:**
- **spread syntax検出**: `SpreadElement` の存在をチェック
- **selectButtonLabelの有無**: プロパティが存在するかチェック
- **他のキーの存在**: selectButtonLabel以外のキーがないかチェック
- **自動移行可能性**: arrow function で引数なし、returnなし（`() => expression`）のみ対応
- **戻り値のtype分類**: spread / migratable / not-migratable / no-label / invalid / other-keys

#### 1-2. decorators属性のチェッカー（条件分岐）

```javascript
'JSXAttribute[name.name="decorators"]'(node) {
  const componentName = node.parent.name.name

  // DropZoneコンポーネントのみを対象
  if (componentName !== 'DropZone') return

  const result = extractSelectButtonLabel(node, sourceCode)

  // spread syntaxがある場合 → エラーのみ（手動対応）
  if (result.type === 'spread') {
    context.report({
      node,
      messageId: 'migrateSelectButtonLabelManually',
      data: { component: componentName, to: TARGET_VERSION },
      // fixなし
    })
    return
  }

  // selectButtonLabel以外のキーがある場合 → エラーのみ（手動対応）
  if (result.type === 'other-keys') {
    context.report({
      node,
      messageId: 'migrateSelectButtonLabelManually',
      data: { component: componentName, to: TARGET_VERSION },
      // fixなし
    })
    return
  }

  // selectButtonLabelが自動移行可能な場合
  if (result.type === 'migratable') {
    context.report({
      node,
      messageId: 'removeDecorators',
      data: { component: componentName, to: TARGET_VERSION },
      fix(fixer) {
        const fixes = []

        // 1. selectButtonLabel属性を追加
        const { value, isStringLiteral } = result
        const selectButtonLabelAttr = isStringLiteral
          ? ` selectButtonLabel="${value}"`
          : ` selectButtonLabel={${value}}`
        fixes.push(fixer.insertTextAfter(node.parent.name, selectButtonLabelAttr))

        // 2. decorators属性を削除
        const tokenBefore = sourceCode.getTokenBefore(node)
        if (tokenBefore && tokenBefore.range[1] < node.range[0]) {
          fixes.push(fixer.removeRange([tokenBefore.range[1], node.range[1]]))
        } else {
          fixes.push(fixer.remove(node))
        }

        return fixes
      },
    })
    return
  }

  // selectButtonLabelが存在するが自動移行不可能な場合 → エラーのみ（手動対応）
  if (result.type === 'not-migratable') {
    context.report({
      node,
      messageId: 'migrateSelectButtonLabelManually',
      data: { component: componentName, to: TARGET_VERSION },
      // fixなし
    })
    return
  }

  // selectButtonLabelがない場合 → decoratorsを削除
  if (result.type === 'no-label') {
    context.report({
      node,
      messageId: 'removeDecorators',
      data: { component: componentName, to: TARGET_VERSION },
      fix(fixer) {
        const tokenBefore = sourceCode.getTokenBefore(node)
        if (tokenBefore && tokenBefore.range[1] < node.range[0]) {
          return fixer.removeRange([tokenBefore.range[1], node.range[1]])
        }
        return fixer.remove(node)
      },
    })
    return
  }
}
```

**処理フロー:**
1. **spread syntax** → エラーのみ（`migrateSelectButtonLabelManually`）
2. **selectButtonLabel以外のキーあり** → エラーのみ（`migrateSelectButtonLabelManually`）
3. **selectButtonLabel自動移行可能** → selectButtonLabel追加 + decorators削除
4. **selectButtonLabel自動移行不可能** → エラーのみ（`migrateSelectButtonLabelManually`）
5. **selectButtonLabelなし** → decorators削除のみ

**メッセージID:**
- `removeDecorators`: decorators削除（自動修正あり）
- `migrateSelectButtonLabelManually`: selectButtonLabelの手動移行が必要（自動修正なし）

## decorators属性のテストパターン（v92→v93特有）

#### パターン1: DropZone - selectButtonLabel自動移行

```javascript
// 文字列リテラル
{
  code: `<DropZone decorators={{ selectButtonLabel: () => 'Choose File' }} />`,
  output: `<DropZone selectButtonLabel="Choose File" />`,
  options: v92ToV93Options,
  errors: [{ messageId: 'removeDecorators', data: { component: 'DropZone', to: 'v93' } }],
},

// 変数参照
{
  code: `<DropZone decorators={{ selectButtonLabel: () => buttonLabel }} />`,
  output: `<DropZone selectButtonLabel={buttonLabel} />`,
  options: v92ToV93Options,
  errors: [{ messageId: 'removeDecorators', data: { component: 'DropZone', to: 'v93' } }],
},

// 関数呼び出し
{
  code: `<DropZone decorators={{ selectButtonLabel: () => getLabel() }} />`,
  output: `<DropZone selectButtonLabel={getLabel()} />`,
  options: v92ToV93Options,
  errors: [{ messageId: 'removeDecorators', data: { component: 'DropZone', to: 'v93' } }],
},

// テンプレートリテラル
{
  code: `<DropZone decorators={{ selectButtonLabel: () => \`Select \${fileType}\` }} />`,
  output: `<DropZone selectButtonLabel={\`Select \${fileType}\`} />`,
  options: v92ToV93Options,
  errors: [{ messageId: 'removeDecorators', data: { component: 'DropZone', to: 'v93' } }],
},
```

#### パターン2: DropZone - selectButtonLabelがない

```javascript
// decorators削除のみ（selectButtonLabelなし）
{
  code: `<DropZone decorators={{}} />`,
  output: `<DropZone />`,
  options: v92ToV93Options,
  errors: [{ messageId: 'removeDecorators', data: { component: 'DropZone', to: 'v93' } }],
},
```

#### パターン3: DropZone - 手動対応が必要（エラーのみ、outputなし）

```javascript
// returnあり
{
  code: `<DropZone decorators={{ selectButtonLabel: () => { return 'Choose' } }} />`,
  options: v92ToV93Options,
  errors: [{ messageId: 'migrateSelectButtonLabelManually', data: { component: 'DropZone', to: 'v93' } }],
},

// 引数あり
{
  code: `<DropZone decorators={{ selectButtonLabel: (defaultLabel) => defaultLabel }} />`,
  options: v92ToV93Options,
  errors: [{ messageId: 'migrateSelectButtonLabelManually', data: { component: 'DropZone', to: 'v93' } }],
},

// spread syntax
{
  code: `<DropZone decorators={{ ...baseDecorators, selectButtonLabel: () => 'Choose' }} />`,
  options: v92ToV93Options,
  errors: [{ messageId: 'migrateSelectButtonLabelManually', data: { component: 'DropZone', to: 'v93' } }],
},

// selectButtonLabel以外のキーがある
{
  code: `<DropZone decorators={{ selectButtonLabel: () => 'Choose', otherKey: () => 'value' }} />`,
  options: v92ToV93Options,
  errors: [{ messageId: 'migrateSelectButtonLabelManually', data: { component: 'DropZone', to: 'v93' } }],
},
```

**ポイント:**
- **outputあり**: 自動修正が行われる
- **outputなし**: エラーのみ（手動対応が必要）
- **messageId**: `removeDecorators`（自動修正）または `migrateSelectButtonLabelManually`（手動対応）

## 最新versionへの参照（重要）

**このREFERENCE.mdを作成したら、DEVELOPER.mdの「参考にするファイル」セクションを必ず更新してください！**

更新箇所:
- `rules/autofixer-smarthr-ui-migration/DEVELOPER.md` の56-65行目付近
- `v91-to-v92` → `v92-to-v93` に変更

これにより、次回以降のversion追加時に最新の実装パターンを参照できるようになります。
