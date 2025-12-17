const SCHEMA = []

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    schema: SCHEMA,
  },
  create(context) {
    return {
      [`RestElement[argument.name='props']`]: (node) => {
        context.report({
          node,
          message: `残余引数には 'props' という名称を利用しないでください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-rest-parameters
 - 'rest' という名称を推奨します`,
        });
      },
      [`:not(RestElement)>Identifier[name='rest']`]: (node) => {
        context.report({
          node,
          message: `残余引数以外に 'rest' という名称を利用しないでください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-rest-parameters
 - 残余引数(rest parameters)と混同する可能性があるため別の名称に修正してください`,
        });
      },
    }
  },
}
module.exports.schema = SCHEMA
