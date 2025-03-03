const { AST_NODE_TYPES } = require('@typescript-eslint/utils')

const SCHEMA = []
const SPACING_CLASS_PATTERNS = {
  margin: /shr-m[trbl]?-/, // mt-, mr-, mb-, ml-, m-
  padding: /shr-p[trbl]?-/, // pt-, pr-, pb-, pl-, p-
}

/**
 * コンポーネントのルート要素を渡し、該当の余白クラスが存在すればそれを、なければNULLを返す
 * @param {import('@typescript-eslint/utils').TSESTree.Node} node
 * @returns {import('@typescript-eslint/utils').TSESTree.Literal | null}
 */
const findSpacingClassInRootElement = (node) => {
  // JSX でなければ対象外
  if (node.type !== AST_NODE_TYPES.JSXElement) return null

  // className属性がなければ対象外
  const classNameAttr = node.openingElement.attributes.find(
    (attr) => attr.type === AST_NODE_TYPES.JSXAttribute && attr.name.name === 'className',
  )
  if (!classNameAttr) return null

  // className属性の値がリテラルでなければ対象外
  if (classNameAttr?.value?.type !== AST_NODE_TYPES.Literal) return null
  if (typeof classNameAttr.value.value !== 'string') return null

  // className属性の値に余白クラスが含まれていればそれを返す
  const hasSpacingClass = Object.values(SPACING_CLASS_PATTERNS).some((pattern) => pattern.test(classNameAttr.value.value))
  return hasSpacingClass ? classNameAttr.value : null
}

/**
 * ブロックステートメント内から、JSX要素を返す ReturnStatement を返す
 * @param {import('@typescript-eslint/utils').TSESTree.BlockStatement} block
 * @returns {import('@typescript-eslint/utils').TSESTree.ReturnStatement | null}
 */
const findJSXReturnStatement = (block) => {
  for (const statement of block.body) {
    if (statement.type === AST_NODE_TYPES.ReturnStatement && statement.argument?.type === AST_NODE_TYPES.JSXElement) {
      return statement
    }
  }
  return null
}

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
    messages: {
      noRootSpacing:
        'コンポーネントのルート要素に余白（margin/padding）を設定しないでください。コンポーネントは余白を持たず、使用する側で余白を制御するべきです。',
    },
  },
  create(context) {
    /**
     * 関数本体をチェックし、ルート要素で余白クラスが設定されたJSXを返している場合、エラーを報告する
     * @param {import('@typescript-eslint/utils').TSESTree.Node} body
     */
    const checkFunctionBody = (body) => {
      // 関数がブロックを持たずに直接JSXを返すパターン
      if (body.type === AST_NODE_TYPES.JSXElement) {
        const spacingClass = findSpacingClassInRootElement(body)
        if (spacingClass) {
          context.report({
            node: spacingClass,
            messageId: 'noRootSpacing',
          })
        }
        return
      }

      // 関数がブロック内で JSX を return するパターン
      if (body.type === AST_NODE_TYPES.BlockStatement) {
        const returnStatement = findJSXReturnStatement(body)
        if (returnStatement?.argument) {
          const spacingClass = findSpacingClassInRootElement(returnStatement.argument)
          if (spacingClass) {
            context.report({
              node: spacingClass,
              messageId: 'noRootSpacing',
            })
          }
        }
      }
    }

    return {
      // アロー関数式のコンポーネントをチェック
      ArrowFunctionExpression: (node) => {
        if (node.parent?.type === AST_NODE_TYPES.VariableDeclarator) {
          checkFunctionBody(node.body)
        }
      },

      // function宣言のコンポーネントをチェック
      FunctionDeclaration: (node) => {
        checkFunctionBody(node.body)
      },
    }
  },
}

module.exports.schema = SCHEMA
