/**
 * smarthr-ui v96 → v97 移行ルール
 *
 * v97での破壊的変更を検出します（自動修正なし）。
 *
 * 対応する破壊的変更:
 * 1. TabItem の onClick 型変更: (tabId: string) => void → (e: MouseEvent) => void
 *
 * 参考: https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v97.0.0
 */

const { setupSmarthrUiAliasOptions } = require('../../helpers')

// ============================================================
// 定数定義
// ============================================================

// v97を示す定数（メッセージで使用）
const TARGET_VERSION = 'v97'

// README.mdへのGitHubリンク（エラーメッセージで使用）
const README_URL =
  'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v96-to-v97/README.md'

// ============================================================
// モジュールエクスポート
// ============================================================

module.exports = {
  messages: {
    migrateTabItemOnClick:
      'smarthr-ui {{to}} では TabItem の onClick の型が変更されました。引数を (tabId: string) から (e: MouseEvent<HTMLButtonElement>) に変更し、tabId の使用箇所を e.currentTarget.value に置き換えてください。注意: このエラーは手動修正後も消えません。対応完了後は { from: "96", to: "97" } 設定を削除してください。詳細: {{readmeUrl}}',
  },

  createCheckers(context, sourceCode, options = {}) {
    const { validSources, isAliasFile, filename } = setupSmarthrUiAliasOptions(context, options)

    const checkers = {
      // ============================================================
      // 1. TabItem の onClick 型変更（検出のみ、自動修正なし）
      // TabItemで終わるコンポーネント（CustomTabItem等のラップコンポーネント）も対象
      // ============================================================

      'JSXOpeningElement[name.name=/TabItem$/] > JSXAttribute[name.name="onClick"]'(node) {
        context.report({
          node,
          messageId: 'migrateTabItemOnClick',
          data: { to: TARGET_VERSION, readmeUrl: README_URL },
          // fix関数を提供しない = 自動修正不可
        })
      },
    }

    return checkers
  },
}
