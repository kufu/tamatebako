const SCHEMA = []

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
  },
  create(context) {
    return {
      'JSXAttribute[name.name="overflow"][value.value="hidden"]': (node) => {
        context.report({
          node,
          message: `overflow属性に"hidden"を設定しないでください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-overflow-hidden
 - "overflow: hidden" を設定するとa11y・実装上の問題が発生する可能性があります。可能な限り避けてください
   - 角丸を表現するためにoverflow="hidden"を設定している場合、子要素にborder-radiusを指定するべきです
   - smarthr-uiのコンポーネントにはrounded属性が設定可能なものが多くあります
   - tailwindの場合、"rounded-l"、smarthr-uiを利用している場合は"shr-rounded-l" などでborder-radiusを表現できます
     - https://tailwindcss.com/docs/border-radius`,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
