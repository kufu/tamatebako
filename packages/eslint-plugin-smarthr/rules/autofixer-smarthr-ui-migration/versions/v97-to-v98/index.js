/**
 * smarthr-ui v97 → v98 移行ルール
 *
 * v98での破壊的変更を検出します（自動修正なし）。
 *
 * 対応する破壊的変更:
 * 1. useDevice の削除: useTheme().device を使用してください
 * 2. Th の decorators prop の削除: IntlProvider配下で自動的に翻訳されます
 * 3. useDecorator の削除: useTranslation() を使用してください
 *
 * 参考: https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v98.0.0
 */

const { setupSmarthrUiAliasOptions } = require('../../helpers')

// ============================================================
// 定数定義
// ============================================================

// v98を示す定数（メッセージで使用）
const TARGET_VERSION = 'v98'

// README.mdへのGitHubリンク（エラーメッセージで使用）
const README_URL =
  'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v97-to-v98/README.md'

// ============================================================
// モジュールエクスポート
// ============================================================

module.exports = {
  messages: {
    migrateUseDevice:
      'smarthr-ui {{to}} では useDevice が削除されました。useTheme().device を使用してください。注意: このエラーは手動修正後も消えません。対応完了後は { from: "97", to: "98" } 設定を削除してください。詳細: {{readmeUrl}}',
    migrateThDecorators:
      'smarthr-ui {{to}} では Th の decorators prop が削除されました。IntlProvider 配下で自動的に翻訳されるため、decorators prop を削除してください。注意: このエラーは手動修正後も消えません。対応完了後は { from: "97", to: "98" } 設定を削除してください。詳細: {{readmeUrl}}',
    migrateUseDecorator:
      'smarthr-ui {{to}} では useDecorator が削除されました。useTranslation() を使用してください。注意: このエラーは手動修正後も消えません。対応完了後は { from: "97", to: "98" } 設定を削除してください。詳細: {{readmeUrl}}',
  },

  createCheckers(context, sourceCode, options = {}) {
    const { validSources, isAliasFile, filename } = setupSmarthrUiAliasOptions(context, options)

    const checkers = {
      // ============================================================
      // 1. useDevice の削除（検出のみ、自動修正なし）
      // ============================================================

      "ImportDeclaration[source.value='smarthr-ui'] > ImportSpecifier[imported.name='useDevice']"(node) {
        if (!validSources.includes(node.parent.source.value) && !isAliasFile) {
          return
        }

        context.report({
          node,
          messageId: 'migrateUseDevice',
          data: { to: TARGET_VERSION, readmeUrl: README_URL },
        })
      },

      // ============================================================
      // 2. Th の decorators prop の削除（検出のみ、自動修正なし）
      // ============================================================

      'JSXOpeningElement[name.name="Th"] > JSXAttribute[name.name="decorators"]'(node) {
        context.report({
          node,
          messageId: 'migrateThDecorators',
          data: { to: TARGET_VERSION, readmeUrl: README_URL },
        })
      },

      // ============================================================
      // 3. useDecorator の削除（検出のみ、自動修正なし）
      // ============================================================

      "ImportDeclaration[source.value='smarthr-ui'] > ImportSpecifier[imported.name='useDecorator']"(node) {
        if (!validSources.includes(node.parent.source.value) && !isAliasFile) {
          return
        }

        context.report({
          node,
          messageId: 'migrateUseDecorator',
          data: { to: TARGET_VERSION, readmeUrl: README_URL },
        })
      },
    }

    return checkers
  },
}
