const { AST_NODE_TYPES } = require('@typescript-eslint/utils')

const SCHEMA = []
const SPACING_CLASS_PATTERNS = {
  margin: /shr-m[trbl]?-/, // mt-, mr-, mb-, ml-, m-
  padding: /shr-p[trbl]?-/, // pt-, pr-, pb-, pl-, p-
}

/**
 * コンポーネントのルート要素であるかを判定する
 * @param {import('@typescript-eslint/utils').TSESTree.Node} node
 * @returns {boolean}
 */
const findJSXElement = (node) => {
  let current = node
  while (current && current.type !== AST_NODE_TYPES.JSXElement) {
    current = current.parent
  }
  return current
}

const isInsideReturnStatement = (node) => {
  let current = node
  while (current) {
    if (current.type === AST_NODE_TYPES.ReturnStatement) {
      return current
    }
    current = current.parent
  }
  return null
}

const isComponentDefinition = (node) => {
  let current = node
  while (current) {
    if (
      current.type === AST_NODE_TYPES.ArrowFunctionExpression &&
      current.parent &&
      current.parent.type === AST_NODE_TYPES.VariableDeclarator
    ) {
      return true
    }
    current = current.parent
  }
  return false
}

const isComponentRootElement = (node) => {
  // クラス名が属性として含まれるJSX要素を見つける
  const jsxElement = findJSXElement(node)
  if (!jsxElement) return false

  // このJSX要素が他のJSX要素の子要素でないことを確認
  const parentElement = findJSXElement(jsxElement.parent)
  if (parentElement) return false

  // return文の中にあることを確認
  const returnStatement = isInsideReturnStatement(jsxElement)
  if (!returnStatement) return false

  // コンポーネントの定義内にあることを確認
  return isComponentDefinition(returnStatement)
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
      JSXAttribute: (node) => {
        // クラス名の属性でない場合はスキップ
        if (node.name.name !== 'className') {
          return
        }

        // 値が文字列リテラルでない場合はスキップ
        if (!node.value || node.value.type !== AST_NODE_TYPES.Literal || typeof node.value.value !== 'string') {
          return
        }

        // マージンまたはパディングクラスを含まない場合はスキップ
        const hasSpacingClass = Object.values(SPACING_CLASS_PATTERNS).some((pattern) => pattern.test(node.value.value))
        if (!hasSpacingClass) {
          return
        }

        // コンポーネントのルート要素でない場合はスキップ
        if (!isComponentRootElement(node)) {
          return
        }

        context.report({
          node: node.value,
          messageId: 'noRootSpacing',
        })
      },
    }
  },
}

module.exports.schema = SCHEMA
