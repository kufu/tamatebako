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

const CHECK_JSX_REGEX = /^(always|only-jsx)$/
const CHECK_OBJ_REGEX = /^(always|only-object)$/

// HINT: -1: 見つからなかった >= 0: 見つかった
const getInsertIndex = (node, type, attributesKey) => {
  const attributes = node.parent[attributesKey]

  for (let i = 0; i < attributes.length; i++) {
    const a = attributes[i]

    if (a === node) {
      return -1
    } else if (a.type !== type) {
      return i
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

    const generateAction = (type, attributesKey, fixAction) => {
      return ((node) => {
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
      })
    }

    return {
      JSXSpreadAttribute: (
        CHECK_JSX_REGEX.test(checkType)
          ? generateAction('JSXSpreadAttribute', 'attributes', (option.fix) && ((attributes, e) => `<${e.name.name} ${attributes.join(' ')}${e.selfClosing ? ' /' : ''}>`))
          : undefined
      ),
      SpreadElement: (
        CHECK_OBJ_REGEX.test(checkType)
          ? generateAction('SpreadElement', 'properties', (option.fix) && ((attributes) => `{ ${attributes.join(', ')} }`))
          : undefined
      ),
    }
  },
}
module.exports.schema = SCHEMA
