/**
 * smarthr-ui v100 → v101 移行ルール
 *
 * v101での破壊的変更に対応します。
 *
 * 対応する破壊的変更:
 * 1. SingleCombobox の `defaultItem` 属性が `emptySelectionFallbackItem` にリネーム
 * 2. Badge の `type` 属性が `color` にリネーム
 *
 * 参考: https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v101.0.0
 *      https://github.com/kufu/smarthr-ui/pull/7353
 *      https://github.com/kufu/smarthr-ui/pull/7332
 */

// ============================================================
// 定数定義
// ============================================================

// v101を示す定数（メッセージで使用）
const TARGET_VERSION = 'v101'

// README.mdへのGitHubリンク（エラーメッセージで使用）
const README_URL =
  'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v100-to-v101/README.md'

// コンポーネントごとの属性リネーム定義（旧属性名 → 新属性名）
const ATTRIBUTE_RENAMES = [
  { component: 'SingleCombobox', oldName: 'defaultItem', newName: 'emptySelectionFallbackItem' },
  { component: 'Badge', oldName: 'type', newName: 'color' },
]

// ============================================================
// モジュールエクスポート
// ============================================================

module.exports = {
  messages: {
    renameAttribute:
      'smarthr-ui {{to}} では {{component}} の `{{oldName}}` 属性は `{{newName}}` にリネームされました。詳細: {{readmeUrl}}',
  },

  createCheckers(context) {
    const checkers = {}

    // ============================================================
    // コンポーネントごとの属性リネーム
    // ============================================================

    for (const { component, oldName, newName } of ATTRIBUTE_RENAMES) {
      const selector = `JSXAttribute[name.name="${oldName}"]`

      checkers[selector] = (node) => {
        const componentName = node.parent.name.name

        if (componentName !== component) return

        context.report({
          node,
          messageId: 'renameAttribute',
          data: { component, oldName, newName, to: TARGET_VERSION, readmeUrl: README_URL },
          fix(fixer) {
            // 属性名のみ置換し、値はそのまま引き継ぐ（意味の変更はないため）
            return fixer.replaceText(node.name, newName)
          },
        })
      }
    }

    return checkers
  },
}
