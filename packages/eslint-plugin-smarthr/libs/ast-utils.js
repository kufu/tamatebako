/**
 * AST操作の汎用ユーティリティ
 */

const FUNCTION_SCOPE_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
])

const LOOP_STATEMENT_TYPES = new Set([
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
])

/**
 * ノードが関数スコープかどうか判定
 */
function isFunctionScope(node) {
  return FUNCTION_SCOPE_TYPES.has(node.type)
}

/**
 * ループ構文かどうか判定
 */
function isLoopStatement(node) {
  return LOOP_STATEMENT_TYPES.has(node.type)
}

/**
 * スコープのstatements配列を取得
 */
function getStatements(scope) {
  return scope.body || scope.statements || []
}

/**
 * あるノードが別のノードを含んでいるか確認
 */
function containsNode(parent, target) {
  if (parent === target) return true

  function traverse(node) {
    if (node === target) return true
    if (!node || typeof node !== 'object') return false

    for (const key in node) {
      if (key === 'parent') continue
      const child = node[key]
      if (child && (
        (Array.isArray(child) && child.some(c => traverse(c))) ||
        (typeof child === 'object' && traverse(child))
      )) {
        return true
      }
    }
    return false
  }

  return traverse(parent)
}

/**
 * 指定した型のノードが含まれているかチェック（関数スコープを超えない）
 */
function containsNodeType(node, nodeType) {
  if (!node || typeof node !== 'object') return false
  if (node.type === nodeType) return true

  // 関数スコープを超えない
  if (isFunctionScope(node)) return false

  for (const key in node) {
    if (key === 'parent') continue
    const child = node[key]
    if (child && (
      (Array.isArray(child) && child.some(c => containsNodeType(c, nodeType))) ||
      (typeof child === 'object' && containsNodeType(child, nodeType))
    )) {
      return true
    }
  }

  return false
}

/**
 * await式が含まれているかチェック
 */
function containsAwait(node) {
  return containsNodeType(node, 'AwaitExpression')
}

/**
 * 式の複雑さを計算
 * 関数呼び出し、プロパティアクセス、演算子などの数をカウント
 * @param {object} node - ASTノード
 * @param {number} [maxComplexity] - 最大複雑さ（この値に達したら計算を中断）
 */
function calculateComplexity(node, maxComplexity) {
  let complexity = 0

  function traverse(n) {
    // 早期終了: maxComplexityを超えたら計算を中断
    if (maxComplexity !== undefined && complexity > maxComplexity) return

    if (!n || typeof n !== 'object') return

    switch (n.type) {
      case 'CallExpression':
      case 'MemberExpression':
      case 'BinaryExpression':
      case 'LogicalExpression':
      case 'NewExpression':
      case 'SpreadElement':
      case 'TSAsExpression':
      case 'TSTypeAssertion':
        complexity++
        break
      case 'ConditionalExpression':
      case 'ObjectExpression':
      case 'ArrayExpression':
      case 'ArrowFunctionExpression':
      case 'FunctionExpression':
      case 'JSXOpeningElement':
        complexity += 2
        break
    }

    // 再帰的に子ノードを探索
    for (const key in n) {
      if (key === 'parent') continue
      const child = n[key]
      if (child) {
        if (Array.isArray(child)) {
          for (const c of child) {
            traverse(c)
            if (maxComplexity !== undefined && complexity > maxComplexity) return
          }
        } else if (typeof child === 'object' && child.type) {
          traverse(child)
          if (maxComplexity !== undefined && complexity > maxComplexity) return
        }
      }
    }
  }

  traverse(node)
  return complexity
}

/**
 * インライン化時に括弧が必要な式タイプかどうかを判定
 */
function needsParentheses(node) {
  const typesNeedingParens = new Set([
    'NewExpression',
    'ObjectExpression',
    'TSAsExpression',
    'TSNonNullExpression',
    'TSTypeAssertion',
    'ConditionalExpression',
  ])
  return typesNeedingParens.has(node.type)
}

module.exports = {
  isFunctionScope,
  isLoopStatement,
  getStatements,
  containsNode,
  containsNodeType,
  containsAwait,
  calculateComplexity,
  needsParentheses,
}
