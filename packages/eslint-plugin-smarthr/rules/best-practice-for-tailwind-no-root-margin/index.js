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

const isArrowFunctionBody = (node) => {
  let current = node
  while (current) {
    if (current.type === AST_NODE_TYPES.ArrowFunctionExpression) {
      // アロー関数の本体が直接JSXの場合
      if (current.body === node) {
        return current
      }
      // return文を含むブロックの場合
      if (
        current.body.type === AST_NODE_TYPES.BlockStatement &&
        current.body.body.some((stmt) => stmt.type === AST_NODE_TYPES.ReturnStatement && stmt.argument === node)
      ) {
        return current
      }
    }
    current = current.parent
  }
  return null
}

const isComponentDefinition = (arrowFunction) => {
  return arrowFunction && arrowFunction.parent && arrowFunction.parent.type === AST_NODE_TYPES.VariableDeclarator
}

const isComponentRootElement = (node) => {
  // クラス名が属性として含まれるJSX要素を見つける
  const jsxElement = findJSXElement(node)
  if (!jsxElement) return false

  // このJSX要素が他のJSX要素の子要素でないことを確認
  const parentElement = findJSXElement(jsxElement.parent)
  if (parentElement) return false

  // アロー関数の本体として直接返される、またはreturn文で返されることを確認
  const arrowFunction = isArrowFunctionBody(jsxElement)
  if (!arrowFunction) return false

  // コンポーネントの定義内にあることを確認
  return isComponentDefinition(arrowFunction)
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
      /**
       * JSXの属性に対してチェックを行う
       */
      JSXAttribute: (node) => {
        // クラス名でない場合はスキップ
        if (node.name.name !== 'className') {
          return
        }

        // 値が文字列リテラルでない場合はスキップ
        if (!node.value || node.value.type !== AST_NODE_TYPES.Literal || typeof node.value.value !== 'string') {
          return
        }

        // margin または padding でない場合はスキップ
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
