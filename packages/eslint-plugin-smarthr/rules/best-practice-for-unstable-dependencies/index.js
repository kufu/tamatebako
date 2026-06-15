const SCHEMA = [
  {
    type: 'object',
    properties: {
      unstableNames: {
        type: 'array',
        items: { type: 'string' },
        default: ['children'],
      },
    },
    additionalProperties: false,
  },
]

const TARGET_HOOKS = ['useEffect', 'useCallback', 'useMemo', 'useLayoutEffect']

const DETAIL_LINK = `
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-unstable-dependencies`

/**
 * 依存配列内の識別子を取得する
 * @param {object} dependenciesArray - 依存配列のArrayExpressionノード
 * @returns {Array<{node: object, name: string}>} 識別子の配列
 */
function getDependencyIdentifiers(dependenciesArray) {
  if (!dependenciesArray || dependenciesArray.type !== 'ArrayExpression') {
    return []
  }

  const identifiers = []

  for (const element of dependenciesArray.elements) {
    if (!element) continue

    if (element.type === 'Identifier') {
      // [children]
      identifiers.push({
        node: element,
        name: element.name,
      })
    } else if (element.type === 'MemberExpression') {
      // [props.children]
      const names = []
      let current = element

      while (current) {
        if (current.type === 'MemberExpression') {
          if (current.property.type === 'Identifier') {
            names.unshift(current.property.name)
          }
          current = current.object
        } else if (current.type === 'Identifier') {
          names.unshift(current.name)
          break
        } else {
          break
        }
      }

      identifiers.push({
        node: element,
        name: names.join('.'),
      })
    }
  }

  return identifiers
}

/**
 * 識別子が不安定な参照と予想される名前を含むかチェック
 * @param {string} identifierName - 識別子名（props.children等）
 * @param {Array<string>} unstableNames - 不安定な参照と予想される名前のリスト
 * @returns {string|null} マッチした名前、マッチしない場合はnull
 */
function matchesUnstableName(identifierName, unstableNames) {
  for (const unstableName of unstableNames) {
    // 完全一致 または 末尾一致（props.children等）
    if (identifierName === unstableName || identifierName.endsWith(`.${unstableName}`)) {
      return unstableName
    }
  }
  return null
}

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
    messages: {
      unstableDependency: '依存配列に不安定な参照と予想される"{{name}}"が含まれています。オブジェクトやReactNodeなどの参照は頻繁に変わるため、不要な再実行や無限ループの原因となります。{{detailLink}}',
    },
  },
  create(context) {
    const options = context.options[0] || {}
    const unstableNames = options.unstableNames || ['children']

    return {
      CallExpression(node) {
        // 対象のHooksかチェック
        if (
          node.callee.type !== 'Identifier' ||
          !TARGET_HOOKS.includes(node.callee.name)
        ) {
          return
        }

        // 第2引数（依存配列）を取得
        const dependenciesArray = node.arguments[1]
        if (!dependenciesArray) {
          return
        }

        // 依存配列内の識別子を取得
        const identifiers = getDependencyIdentifiers(dependenciesArray)

        // 不安定な参照と予想される名前が含まれているかチェック
        for (const identifier of identifiers) {
          const matchedName = matchesUnstableName(identifier.name, unstableNames)
          if (matchedName) {
            context.report({
              node: identifier.node,
              messageId: 'unstableDependency',
              data: {
                name: matchedName,
                detailLink: DETAIL_LINK,
              },
            })
          }
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
