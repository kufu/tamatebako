const SCHEMA = []

const TV_COMPONENTS_METHOD = 'tv'
const TV_COMPONENTS = 'tailwind-variants'
const TV_RESULT_CONST_NAME_REGEX = /(C|c)lassNameGenerator$/

const findValidImportNameNode = (s) => s.type === 'ImportSpecifier' && s.imported.name === TV_COMPONENTS_METHOD && s.local.name !== TV_COMPONENTS_METHOD

const findNodeHasId = (node) => {
  if (node.id) {
    return node
  }

  if (node.parent) {
    return findNodeHasId(node.parent)
  }

  return null
}
const findNodeUseMemo = (node) => {
  if (node.type === 'CallExpression' && node.callee.name === 'useMemo') {
    return node
  }

  if (node.parent) {
    return findNodeUseMemo(node.parent)
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
  },
  create(context) {
    return {
      ImportDeclaration: (node) => {
        if (node.source.value === TV_COMPONENTS && node.specifiers.some(findValidImportNameNode)) {
          context.report({
            node,
            message: `${TV_COMPONENTS} をimportする際は、名称が"${TV_COMPONENTS_METHOD}" となるようにしてください。例: "import { ${TV_COMPONENTS_METHOD} } from '${TV_COMPONENTS}'"
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-tailwind-variants`,
          });
        }
      },
      CallExpression: (node) => {
        if (node.callee.name === TV_COMPONENTS_METHOD) {
          const idNode = findNodeHasId(node.parent)

          if (idNode && !TV_RESULT_CONST_NAME_REGEX.test(idNode.id.name)) {
            context.report({
              node: idNode,
              message: `${TV_COMPONENTS_METHOD}の実行結果を格納する変数名は "${idNode.id.name}" ではなく "${TV_RESULT_CONST_NAME_REGEX}"にmatchする名称に統一してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-tailwind-variants`,
            });
          }
        } else if (TV_RESULT_CONST_NAME_REGEX.test(node.callee.name) && !findNodeUseMemo(node.parent)) {
          context.report({
            node,
            message: `"${node.callee.name}" を実行する際、useMemoでラップし、メモ化してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-tailwind-variants`,
          });
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
