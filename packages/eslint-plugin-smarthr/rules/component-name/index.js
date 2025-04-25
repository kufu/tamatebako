const { generateTagFormatter } = require('../../libs/format_styled_components')

const EXPECTED_NAMES = {
  '(Ordered(.*)List|^ol)$': '(Ordered(.*)List)$',
  '(S|s)elect$': '(Select)$',
}
const UNEXPECTED_NAMES = EXPECTED_NAMES


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
    return generateTagFormatter({ context, EXPECTED_NAMES, UNEXPECTED_NAMES })
  },
}
module.exports.schema = SCHEMA
