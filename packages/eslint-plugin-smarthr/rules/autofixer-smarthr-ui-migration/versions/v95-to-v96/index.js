/**
 * smarthr-ui v95 → v96 移行ルール
 *
 * v96での破壊的変更に対応する自動修正を提供します。
 *
 * 対応する破壊的変更:
 * 1. Chip の size 属性: "s" → "S"
 *
 * 参考: https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v96.0.0
 */

const { setupSmarthrUiAliasOptions } = require('../../helpers')

// ============================================================
// 定数定義
// ============================================================

// v96を示す定数（メッセージで使用）
const TARGET_VERSION = 'v96'

// ============================================================
// モジュールエクスポート
// ============================================================

module.exports = {
  messages: {
    migrateChipSize: 'smarthr-ui {{to}} では Chip の size 属性が "s" から "S" に変更されました',
  },

  createCheckers(context, sourceCode, options = {}) {
    const { validSources, isAliasFile, filename } = setupSmarthrUiAliasOptions(context, options)

    const checkers = {
      // ============================================================
      // 1. Chip の size 属性: "s" → "S"
      // Chipで終わるコンポーネント（CustomChip等のラップコンポーネント）も対象
      // ============================================================

      'JSXOpeningElement[name.name=/Chip$/] > JSXAttribute[name.name="size"][value.type="Literal"][value.value="s"]'(node) {
        context.report({
          node,
          messageId: 'migrateChipSize',
          data: { to: TARGET_VERSION },
          fix(fixer) {
            // "s" → "S" に置換
            return fixer.replaceText(node.value, '"S"')
          },
        })
      },
    }

    return checkers
  },
}
