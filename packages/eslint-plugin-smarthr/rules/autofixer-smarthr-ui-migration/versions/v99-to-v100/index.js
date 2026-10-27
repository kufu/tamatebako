/**
 * smarthr-ui v99 → v100 移行ルール
 *
 * v100での破壊的変更に対応します。
 *
 * 対応する破壊的変更:
 * 1. NotificationBar の `base` 属性が `paneled` にリネーム
 *
 * 参考: https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v100.0.0
 *      https://github.com/kufu/smarthr-ui/pull/7159
 */

// ============================================================
// 定数定義
// ============================================================

// v100を示す定数（メッセージで使用）
const TARGET_VERSION = 'v100'

// README.mdへのGitHubリンク（エラーメッセージで使用）
const README_URL =
  'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v99-to-v100/README.md'

// NotificationBar の旧属性名 → 新属性名
const OLD_ATTRIBUTE_NAME = 'base'
const NEW_ATTRIBUTE_NAME = 'paneled'
const TARGET_COMPONENT = 'NotificationBar'

// ============================================================
// モジュールエクスポート
// ============================================================

module.exports = {
  messages: {
    renameNotificationBarBase:
      'smarthr-ui {{to}} では {{component}} の `base` 属性は `paneled` にリネームされました。詳細: {{readmeUrl}}',
  },

  createCheckers(context, sourceCode) {
    const checkers = {
      // ============================================================
      // NotificationBar の base 属性リネーム
      // ============================================================

      [`JSXAttribute[name.name="${OLD_ATTRIBUTE_NAME}"]`](node) {
        const componentName = node.parent.name.name

        // NotificationBarコンポーネントのみを対象
        if (componentName !== TARGET_COMPONENT) return

        context.report({
          node,
          messageId: 'renameNotificationBarBase',
          data: { component: componentName, to: TARGET_VERSION, readmeUrl: README_URL },
          fix(fixer) {
            // 属性名のみ置換し、値はそのまま引き継ぐ（意味の変更はないため）
            return fixer.replaceText(node.name, NEW_ATTRIBUTE_NAME)
          },
        })
      },
    }

    return checkers
  },
}
