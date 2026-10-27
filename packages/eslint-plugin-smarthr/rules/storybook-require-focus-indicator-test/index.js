/**
 * Storybookファイルに FocusIndicatorTest Story の追加を推奨するルール
 *
 * アクセシビリティチェックの一環として、フォーカスインジケーター（フォーカスリング）が
 * 正しく表示されているかをStorybook上で確認するための Story を追加することを推奨します。
 *
 * @see https://github.com/kufu/tamatebako/tree/master/packages/storybook-focus-indicator
 */

const SCHEMA = []

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    messages: {
      missingFocusTest: `Storybookファイルには FocusIndicatorTest Story を追加することを推奨します。
 - focusIndicatorTemplate を使用することで、フォーカスリングの表示チェックができます。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/storybook-focus-indicator`,
    },
    schema: SCHEMA,
  },
  create(context) {
    const filename = context.filename || context.getFilename()

    // .stories.tsx または .stories.ts ファイルのみを対象
    if (!/\.stories\.tsx?$/.test(filename)) {
      return {}
    }

    let hasFocusIndicatorTest = false
    let hasFocusIndicatorTemplate = false

    return {
      // export const FocusIndicatorTest を探す
      'ExportNamedDeclaration > VariableDeclaration > VariableDeclarator[id.name="FocusIndicatorTest"]'() {
        hasFocusIndicatorTest = true
      },
      // focusIndicatorTemplate の呼び出しを探す
      'CallExpression[callee.name="focusIndicatorTemplate"]'() {
        hasFocusIndicatorTemplate = true
      },
      'Program:exit'(node) {
        if (!hasFocusIndicatorTest && !hasFocusIndicatorTemplate) {
          context.report({
            node,
            messageId: 'missingFocusTest',
          })
        }
      },
    }
  },
}

module.exports.schema = SCHEMA
