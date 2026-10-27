/**
 * smarthr-ui v93 → v94 移行ルール
 *
 * v94での破壊的変更に対応する自動修正を提供します。
 *
 * 対応する破壊的変更:
 * 1. ThCheckbox の decorators 属性削除
 *    - decorators属性を削除し、IntlProviderのみを使用
 *
 * 参考: https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v94.0.0
 */

const { setupSmarthrUiAliasOptions } = require('../../helpers')

// ============================================================
// 定数定義
// ============================================================

// v94を示す定数（メッセージで使用）
const TARGET_VERSION = 'v94'

// ============================================================
// モジュールエクスポート
// ============================================================

module.exports = {
  messages: {
    removeDecorators: 'smarthr-ui {{to}} では {{component}} の decorators 属性は削除されました。翻訳はsmarthr-ui内で自動的に行われます',
  },

  createCheckers(context, sourceCode, options = {}) {
    const { validSources, isAliasFile, filename } = setupSmarthrUiAliasOptions(context, options)

    const checkers = {
      // ============================================================
      // ThCheckbox の decorators 属性削除
      // ============================================================

      'JSXAttribute[name.name="decorators"]'(node) {
        const componentName = node.parent.name.name

        // ThCheckboxコンポーネントのみを対象
        if (componentName !== 'ThCheckbox') return

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
      },
    }

    // aliasファイルの場合、export変数名の置換は不要
    // (ThCheckboxはリネームされないため)

    return checkers
  },
}
