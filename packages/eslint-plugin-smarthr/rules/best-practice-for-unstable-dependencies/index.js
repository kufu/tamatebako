const SCHEMA = [
  {
    type: 'object',
    properties: {
      additionalUnstableNames: {
        type: 'array',
        items: { type: 'string' },
        default: [],
      },
      additionalTargetHooks: {
        type: 'array',
        items: { type: 'string' },
        default: [],
      },
    },
    additionalProperties: false,
  },
]

const DOLLAR_SIGN_REGEX = /\$/g
const DEFAULT_UNSTABLE_NAMES = ['children']
const DEFAULT_TARGET_HOOKS = ['useEffect', 'useLayoutEffect', 'useCallback', 'useMemo']

const DETAIL_LINK = `
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-unstable-dependencies`

/**
 * 名前の配列から正規表現を生成する（$をエスケープして処理）
 * @param {string[]} names - 名前の配列
 * @returns {RegExp} 生成された正規表現
 */
function buildRegex(names) {
  const pattern = names.reduce((acc, name, i) =>
    acc + (i > 0 ? '|' : '') + name.replace(DOLLAR_SIGN_REGEX, '\\$'), '')
  return new RegExp(`^(${pattern})$`)
}

/**
 * 依存配列内の識別子を取得する
 * @param {object} dependenciesArray - 依存配列のArrayExpressionノード
 * @returns {Array<{node: object, name: string}>} 識別子の配列
 */
function getDependencyIdentifiers(dependenciesArray) {
  const identifiers = []

  if (dependenciesArray.type === 'ArrayExpression') {
    for (const element of dependenciesArray.elements) {
      if (element?.type === 'Identifier') {
        // [children]
        identifiers.push({
          node: element,
          name: element.name,
        })
      }
    }
  }

  return identifiers
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
    const unstableNames = [...DEFAULT_UNSTABLE_NAMES, ...(options.additionalUnstableNames || [])]
    const targetHooks = [...DEFAULT_TARGET_HOOKS, ...(options.additionalTargetHooks || [])]

    const unstableNamesRegex = buildRegex(unstableNames)
    const targetHooksRegex = buildRegex(targetHooks)

    return {
      CallExpression(node) {
        // 対象のHooksかチェック
        if (
          node.callee.type !== 'Identifier' ||
          !targetHooksRegex.test(node.callee.name)
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
          if (unstableNamesRegex.test(identifier.name)) {
            context.report({
              node: identifier.node,
              messageId: 'unstableDependency',
              data: {
                name: identifier.name,
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
