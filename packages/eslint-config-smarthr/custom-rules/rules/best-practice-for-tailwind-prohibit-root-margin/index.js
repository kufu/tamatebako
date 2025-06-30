const { AST_NODE_TYPES } = require('@typescript-eslint/utils')

const SCHEMA = []
const MARGIN_CLASS_PATTERNS = /shr-m[trbl]?-/ // mt-, mr-, mb-, ml-, m-

const findClassNameAttr = (attr) => attr.type === AST_NODE_TYPES.JSXAttribute && attr.name.name === 'className'

/**
 * コンポーネントのルート要素を渡し、該当の余白クラスが存在すればそれを、なければNULLを返す
 * @param {import('@typescript-eslint/utils').TSESTree.Node} node
 * @returns {import('@typescript-eslint/utils').TSESTree.Literal | null}
 */
const findSpacingClassInRootElement = (node) => {
  // JSX でなければ対象外
  if (node.type !== AST_NODE_TYPES.JSXElement) return null

  const classNameAttr = node.openingElement.attributes.find(findClassNameAttr)

  if (
    classNameAttr &&
    // className属性の値がリテラル、かつ余白クラスの場合
    classNameAttr.value?.type === AST_NODE_TYPES.Literal && typeof classNameAttr.value.value === 'string' &&
    MARGIN_CLASS_PATTERNS.test(classNameAttr.value.value)
  ) {
    return classNameAttr.value
  }

  return null
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
        'コンポーネントのルート要素に外側への余白（margin）を設定しないでください。外側の余白は使用する側で制御するべきです。',
    },
  },
  create(context) {
    /**
     * 関数本体をチェックし、ルート要素で余白クラスが設定されたJSXを返している場合、エラーを報告する
     * @param {import('@typescript-eslint/utils').TSESTree.Node} body
     */
    const checkFunctionBody = (n) => {
      const body = n.body

      switch (body.type) {
        // 関数がブロックを持たずに直接JSXを返すパターン
        case AST_NODE_TYPES.JSXElement: {
          const spacingClass = findSpacingClassInRootElement(body)

          if (spacingClass) {
            context.report({
              node: spacingClass,
              messageId: 'noRootSpacing',
            })
          }

          break
        }
        // 関数がブロック内で JSX を return するパターン
        case AST_NODE_TYPES.BlockStatement: {
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

          break
        }
      }
    }

    return {
      // アロー関数式のコンポーネントをチェック
      ArrowFunctionExpression: (node) => {
        if (node.parent?.type === AST_NODE_TYPES.VariableDeclarator) {
          checkFunctionBody(node)
        }
      },

      // function宣言のコンポーネントをチェック
      FunctionDeclaration: checkFunctionBody,
    }
  },
}

module.exports.schema = SCHEMA
