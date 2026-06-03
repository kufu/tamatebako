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

module.exports = {
  FUNCTION_SCOPE_TYPES,
  LOOP_STATEMENT_TYPES,
  isFunctionScope,
  isLoopStatement,
  getStatements,
  containsNode,
  containsNodeType,
  containsAwait,
}
