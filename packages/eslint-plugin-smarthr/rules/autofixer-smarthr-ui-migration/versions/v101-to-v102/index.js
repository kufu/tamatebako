/**
 * smarthr-ui v101 → v102 移行ルール
 *
 * v102での破壊的変更に対応します。
 *
 * 対応する破壊的変更:
 * 1. FilterDropdown の `filtered` に渡すオブジェクトの `iconAlt` キーが `alt` にリネーム
 * 2. DropdownMenuButton の `trigger` に渡すオブジェクトの `children` キーが `text` にリネーム
 *
 * 参考: https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v102.0.0
 *      https://github.com/kufu/smarthr-ui/pull/7428
 *      https://github.com/kufu/smarthr-ui/pull/7419
 */

// ============================================================
// 定数定義
// ============================================================

// v102を示す定数（メッセージで使用）
const TARGET_VERSION = 'v102'

// README.mdへのGitHubリンク（エラーメッセージで使用）
const README_URL =
  'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v101-to-v102/README.md'

// コンポーネントごとの「オブジェクト形式の属性」内のキーリネーム定義
// 属性自体が文字列やReactNodeで直接指定されている場合（ObjectExpressionでない場合）は対象外
const OBJECT_PROPERTY_RENAMES = [
  { component: 'FilterDropdown', attribute: 'filtered', oldKey: 'iconAlt', newKey: 'alt' },
  { component: 'DropdownMenuButton', attribute: 'trigger', oldKey: 'children', newKey: 'text' },
]

// ============================================================
// モジュールエクスポート
// ============================================================

module.exports = {
  messages: {
    renameObjectKey:
      'smarthr-ui {{to}} では {{component}} の `{{attribute}}` に渡すオブジェクトの `{{oldKey}}` キーは `{{newKey}}` にリネームされました。詳細: {{readmeUrl}}',
  },

  createCheckers(context) {
    const checkers = {}

    // ============================================================
    // コンポーネントごとの「オブジェクト形式の属性」内のキーリネーム
    // ============================================================

    for (const { component, attribute, oldKey, newKey } of OBJECT_PROPERTY_RENAMES) {
      const selector = `JSXAttribute[name.name="${attribute}"]`

      checkers[selector] = (node) => {
        const componentName = node.parent.name.name

        if (componentName !== component) return

        // 属性の値がオブジェクトでない場合（文字列・ReactNode直接指定等）は対象外
        if (node.value?.type !== 'JSXExpressionContainer') return
        const expression = node.value.expression
        if (expression.type !== 'ObjectExpression') return

        // 対象のキーを探す（spread syntaxは対象外）
        const property = expression.properties.find(
          (prop) =>
            prop.type === 'Property' &&
            !prop.computed &&
            ((prop.key.type === 'Identifier' && prop.key.name === oldKey) ||
              (prop.key.type === 'Literal' && prop.key.value === oldKey))
        )

        if (!property) return

        context.report({
          node: property.key,
          messageId: 'renameObjectKey',
          data: { component, attribute, oldKey, newKey, to: TARGET_VERSION, readmeUrl: README_URL },
          fix(fixer) {
            // キー名のみ置換し、値はそのまま引き継ぐ（意味の変更はないため）
            return fixer.replaceText(property.key, newKey)
          },
        })
      }
    }

    return checkers
  },
}
