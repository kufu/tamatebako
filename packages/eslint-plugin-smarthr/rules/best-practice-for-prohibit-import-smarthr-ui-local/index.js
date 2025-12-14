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
      [`ImportDeclaration[source.value=/^smarthr-ui\\u002Flib\\u002Fcomponents\\u002F/]`]: (node) => {
        context.report({
          node,
          message: `smarthr-uiからコンポーネントや型をimportする際は 'smarthr-ui' からimportしてください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-prohibit-import-smarthr-ui-local
 - 'smarthr-ui/lib/components' 以下からのexportはsmarthr-uiの内部実装・もしくはstorybook用であり、プロダクトからの利用は非推奨です
 - 型を使いたい場合、コンポーネントからreact/ComponentPropsを利用し生成するように修正してください`,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
