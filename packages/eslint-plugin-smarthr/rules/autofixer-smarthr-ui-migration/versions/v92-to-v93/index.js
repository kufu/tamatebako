/**
 * smarthr-ui v92 → v93 移行ルール
 *
 * v93での破壊的変更に対応する自動修正を提供します。
 *
 * 対応する破壊的変更:
 * 1. DropZone の decorators 属性削除
 *    - decorators={{ selectButtonLabel: () => 'label' }} → selectButtonLabel="label"
 *    - decorators なしの場合、IntlProviderの翻訳が適用される
 *
 * 参考: https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v93.0.0
 */

const { setupSmarthrUiAliasOptions } = require('../../helpers')

// ============================================================
// 定数定義
// ============================================================

// v93を示す定数（メッセージで使用）
const TARGET_VERSION = 'v93'

// ============================================================
// モジュールエクスポート
// ============================================================

module.exports = {
  messages: {
    removeDecorators: 'smarthr-ui {{to}} では {{component}} の decorators 属性は削除されました。selectButtonLabel 属性を使用してください',
    migrateSelectButtonLabelManually: '{{component}} の decorators.selectButtonLabel を手動で移行してください。selectButtonLabel属性として独立しました。詳細: https://github.com/kufu/smarthr-ui/pull/6236',
  },

  createCheckers(context, sourceCode, options = {}) {
    const { validSources, isAliasFile, filename } = setupSmarthrUiAliasOptions(context, options)

    /**
     * decorators属性からselectButtonLabelを抽出し、移行可能かチェック
     *
     * @param {Object} decoratorsNode - decorators属性のASTノード
     * @returns {Object} 解析結果
     *   - type: 'spread' | 'migratable' | 'not-migratable' | 'no-label' | 'invalid' | 'other-keys'
     *   - value?: string (migratableの場合)
     *   - isStringLiteral?: boolean (migratableの場合)
     */
    function extractSelectButtonLabel(decoratorsNode) {
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

    const checkers = {
      // ============================================================
      // DropZone の decorators 属性削除
      // ============================================================

      'JSXAttribute[name.name="decorators"]'(node) {
        const componentName = node.parent.name.name

        // DropZoneコンポーネントのみを対象
        if (componentName !== 'DropZone') return

        const result = extractSelectButtonLabel(node)

        // spread syntaxがある場合 → エラーのみ（手動対応）
        if (result.type === 'spread') {
          context.report({
            node,
            messageId: 'migrateSelectButtonLabelManually',
            data: { component: componentName, to: TARGET_VERSION },
          })
          return
        }

        // selectButtonLabel以外のキーがある場合 → エラーのみ（手動対応）
        if (result.type === 'other-keys') {
          context.report({
            node,
            messageId: 'migrateSelectButtonLabelManually',
            data: { component: componentName, to: TARGET_VERSION },
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
      },
    }

    // aliasファイルの場合、export変数名の置換は不要
    // (DropZoneはリネームされないため)

    return checkers
  },
}
