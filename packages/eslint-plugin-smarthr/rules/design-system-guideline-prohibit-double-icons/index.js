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
      'JSXOpeningElement[name.name=/(Button|Link)$/]:has(JSXAttribute[name.name="prefix"]):has(JSXAttribute[name.name="suffix"])': (node) => {
        context.report({
          node,
          message: `${node.name.name} には prefix と suffix は同時に設定できません。
 - どちらにもアイコンをつけられそうな場合は、prefixを優先してください。`,
        })
      }
    }
  },
}
module.exports.schema = SCHEMA
