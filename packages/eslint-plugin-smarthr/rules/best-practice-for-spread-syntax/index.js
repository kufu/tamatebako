const SCHEMA = [
  {
    type: 'object',
    properties: {
      fix: { type: 'boolean', default: false },
      checkType: { type: 'string', enum: ['always', 'only-jsx', 'only-object'], default: 'always' },
    },
    additionalProperties: false,
  }
]

const CHECK_REGEX = {
  JSXSpreadAttribute: /^(always|only-jsx)$/,
  SpreadElement: /^(always|only-object)$/,
}

// HINT: -1: 見つからなかった >= 0: 見つかった
const getInsertIndex = (node, type, attributesKey) => {
  const attributes = node.parent[attributesKey]

  // HINT: 関数のspread elementの場合などは除外したいので属性がない場合に対応
  if (attributes) {
    for (let i = 0; i < attributes.length; i++) {
      const a = attributes[i]

      if (a === node) {
        return -1
      } else if (a.type !== type) {
        return i
      }
    }
  }

  return -1
}

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    fixable: 'code',
    schema: SCHEMA,
  },
  create(context) {
    const option = context.options[0] || {}
    const fix = option.fix
    const checkType = option.checkType || 'always'
    const result = {}

    const generateAction = (type, attributesKey, fixAction) => {
      if (CHECK_REGEX[type].test(checkType)) {
        result[type] = (node) => {
          const insertIndex = getInsertIndex(node, type, attributesKey)

          if (insertIndex !== -1) {
            const code = context.sourceCode.getText(node)

            context.report({
              node,
              message: `"${code}" は意図しない上書きを防ぐため、spread syntaxでない属性より先に記述してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-spread-syntax`,
              fix: fixAction ? (fixer) => {
                const elementNode = node.parent
                const normals = []
                const spreads = []

                elementNode[attributesKey].forEach((a, i) => {
                  if (a !== node) {
                    if (insertIndex === i) {
                      spreads.push(code)
                    }

                    (a.type === type ? spreads : normals).push(context.sourceCode.getText(a))
                  }
                })

                return fixer.replaceText(
                  elementNode,
                  fixAction(spreads.concat(normals), elementNode),
                )
              } : null
            });
          }
        }
      }
    }

    generateAction('JSXSpreadAttribute', 'attributes', (option.fix) && ((attributes, e) => `<${e.name.name} ${attributes.join(' ')}${e.selfClosing ? ' /' : ''}>`))
    generateAction('SpreadElement', 'properties', (option.fix) && ((attributes) => `{ ${attributes.join(', ')} }`))

    return result
  },
}
module.exports.schema = SCHEMA
