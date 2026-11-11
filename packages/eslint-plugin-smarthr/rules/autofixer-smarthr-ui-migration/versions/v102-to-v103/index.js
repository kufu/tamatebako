/**
 * smarthr-ui v102 → v103 移行ルール
 *
 * v103での破壊的変更に対応します。
 *
 * 対応する破壊的変更:
 * 1. SingleCombobox, MultiCombobox の非推奨 `onChange` 属性が削除（`onChangeInput` に統一）
 *
 * v103には他にも多数の破壊的変更（非推奨APIの削除）が含まれますが、
 * コールバックのシグネチャ変更やコンポーネントの置き換えを伴うため自動修正の対象外です。
 * 詳細は README.md の「対象外の変更」を参照してください。
 *
 * 参考: https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v103.0.0
 *      https://github.com/kufu/smarthr-ui/pull/7500
 */

// ============================================================
// 定数定義
// ============================================================

// v103を示す定数（メッセージで使用）
const TARGET_VERSION = 'v103'

// README.mdへのGitHubリンク（エラーメッセージで使用）
const README_URL =
  'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v102-to-v103/README.md'

// コンポーネントごとの属性リネーム定義（旧属性名 → 新属性名）
// `components` は複数コンポーネントが同じ旧属性名を共有する場合に配列で指定する
// （セレクターは属性名のみで構築されるため、componentを分けてもセレクターキーが衝突してしまう）
const ATTRIBUTE_RENAMES = [
  { components: ['SingleCombobox', 'MultiCombobox'], oldName: 'onChange', newName: 'onChangeInput' },
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

    for (const { components, oldName, newName } of ATTRIBUTE_RENAMES) {
      const selector = `JSXAttribute[name.name="${oldName}"]`

      checkers[selector] = (node) => {
        const componentName = node.parent.name.name

        if (!components.includes(componentName)) return

        context.report({
          node,
          messageId: 'renameAttribute',
          data: { component: componentName, oldName, newName, to: TARGET_VERSION, readmeUrl: README_URL },
          fix(fixer) {
            // 属性名のみ置換し、値はそのまま引き継ぐ（シグネチャの変更はないため）
            return fixer.replaceText(node.name, newName)
          },
        })
      }
    }

    return checkers
  },
}
