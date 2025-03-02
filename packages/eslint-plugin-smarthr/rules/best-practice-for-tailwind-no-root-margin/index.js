const { AST_NODE_TYPES } = require('@typescript-eslint/utils')

const SCHEMA = []
const SPACING_CLASS_PATTERNS = {
  margin: /shr-m[trbl]?-/, // mt-, mr-, mb-, ml-, m-
  padding: /shr-p[trbl]?-/, // pt-, pr-, pb-, pl-, p-
}

/**
 * コンポーネントのルート要素から余白のクラス名を探す
 * @param {import('@typescript-eslint/utils').TSESTree.Node} node
 * @returns {import('@typescript-eslint/utils').TSESTree.Literal | null}
 */
const findSpacingClassInRootElement = (node) => {
  if (node.type === AST_NODE_TYPES.JSXElement) {
    const classNameAttr = node.openingElement.attributes.find(
      (attr) => attr.type === AST_NODE_TYPES.JSXAttribute && attr.name.name === 'className',
    )
    if (classNameAttr?.value?.type === AST_NODE_TYPES.Literal && typeof classNameAttr.value.value === 'string') {
      const hasSpacingClass = Object.values(SPACING_CLASS_PATTERNS).some((pattern) => pattern.test(classNameAttr.value.value))
      if (hasSpacingClass) {
        return classNameAttr.value
      }
    }
  }
  return null
}

/**
 * JSX要素を返すreturn文を探す
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
    return {
      // アロー関数式のコンポーネントをチェック
      ArrowFunctionExpression: (node) => {
        // コンポーネント定義かチェック
        if (!(node.parent?.type === AST_NODE_TYPES.VariableDeclarator)) {
          return
        }

        // JSX要素を直接返す場合
        if (node.body.type === AST_NODE_TYPES.JSXElement) {
          const spacingClass = findSpacingClassInRootElement(node.body)
          if (spacingClass) {
            context.report({
              node: spacingClass,
              messageId: 'noRootSpacing',
            })
          }
          return
        }

        // ブロック内でJSX要素を返す場合
        if (node.body.type === AST_NODE_TYPES.BlockStatement) {
          const returnStatement = findJSXReturnStatement(node.body)
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
      },
    }
  },
}

module.exports.schema = SCHEMA
