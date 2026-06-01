const SCHEMA = []

/**
 * 条件分岐のノードタイプ
 */
const CONDITIONAL_TYPES = new Set([
  'IfStatement',
  'ConditionalExpression', // 三項演算子
  'SwitchStatement',
  'LogicalExpression', // && ||
  'ChainExpression', // ?.
])

/**
 * 関数スコープのノードタイプ
 */
const FUNCTION_SCOPE_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
])

/**
 * ループのノードタイプ
 */
const LOOP_TYPES = new Set([
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
])

/**
 * スコープの境界となるノードタイプ
 * 関数スコープとループの和集合
 */
const SCOPE_BOUNDARY_TYPES = new Set([
  ...FUNCTION_SCOPE_TYPES,
  ...LOOP_TYPES,
])

/**
 * スコープの境界となるノードか判定
 */
function isScopeBoundary(node) {
  return SCOPE_BOUNDARY_TYPES.has(node.type)
}

/**
 * ノードから最も近い条件分岐ノードを取得
 * スコープ境界（関数やループ）を超えたらnullを返す
 */
function getNearestConditional(node) {
  let current = node.parent
  while (current) {
    if (CONDITIONAL_TYPES.has(current.type)) {
      return current
    }
    if (isScopeBoundary(current)) {
      return null
    }
    current = current.parent
  }
  return null
}

/**
 * ノードが条件部分（test, discriminant等）で使用されているか判定
 * body内ではなく、条件分岐の判定部分で使われているかをチェック
 */
function isUsedInConditionalTest(identifier) {
  let current = identifier
  while (current) {
    const parent = current.parent
    if (!parent) return false

    // 各条件分岐タイプで条件部分かチェック
    switch (parent.type) {
      case 'IfStatement':
        return containsNode(parent.test, identifier)
      case 'ConditionalExpression':
        return containsNode(parent.test, identifier)
      case 'LogicalExpression':
        // && や || の左辺・右辺は条件部分として扱う
        return true
      case 'SwitchStatement':
        return containsNode(parent.discriminant, identifier)
    }

    // 条件分岐ノードに到達したがbody内にいる場合
    if (CONDITIONAL_TYPES.has(parent.type)) {
      return false
    }

    current = parent
  }
  return false
}

/**
 * 条件分岐のbodyを取得
 */
function getConditionalBody(conditional) {
  if (!conditional) return null

  switch (conditional.type) {
    case 'IfStatement':
      // consequent（then節）のbodyを取得
      if (conditional.consequent.type === 'BlockStatement') {
        return conditional.consequent.body
      }
      // BlockStatementでない場合は単一の文
      return [conditional.consequent]

    case 'SwitchStatement':
      // 全てのcaseのbodyを結合
      const allStatements = []
      conditional.cases.forEach(caseNode => {
        allStatements.push(...caseNode.consequent)
      })
      return allStatements

    case 'ConditionalExpression':
    case 'LogicalExpression':
    case 'ChainExpression':
      // これらは式なので、bodyを持たない
      return null

    default:
      return null
  }
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
      if (Array.isArray(child)) {
        if (child.some(c => traverse(c))) return true
      } else if (child && typeof child === 'object') {
        if (traverse(child)) return true
      }
    }
    return false
  }

  return traverse(parent)
}

/**
 * ノードの祖先にある全ての条件分岐を取得（内側から外側の順）
 * スコープ境界（関数やループ）を超えたら終了
 */
function getAncestorConditionals(node) {
  const conditionals = []
  let current = node.parent

  while (current) {
    if (CONDITIONAL_TYPES.has(current.type)) {
      conditionals.push(current)
    }
    if (isScopeBoundary(current)) {
      break
    }
    current = current.parent
  }

  return conditionals
}

/**
 * 変数の全ての参照（Identifier）を取得
 * 宣言より後で、同一スコープ内の参照のみを対象とする
 */
function getVariableReferences(sourceCode, varName, declarationNode) {
  const references = []

  /**
   * ASTを再帰的に探索して参照を収集
   */
  function traverse(node, parent) {
    if (!node || typeof node !== 'object') return

    // 変数名が一致するIdentifierを収集（宣言自体は除外）
    if (node.type === 'Identifier' && node.name === varName && node !== declarationNode.id) {
      references.push({ identifier: node, parent })
    }

    // 探索を停止する条件: 関数スコープまたは同名変数の再宣言
    if (
      FUNCTION_SCOPE_TYPES.has(node.type) ||
      (node.type === 'VariableDeclarator' && node !== declarationNode && node.id.type === 'Identifier' && node.id.name === varName)
    ) {
      return
    }

    // 子ノードを再帰的に探索
    for (const key in node) {
      if (key === 'parent') continue
      const child = node[key]
      if (Array.isArray(child)) {
        child.forEach(c => traverse(c, node))
      } else if (child && typeof child === 'object' && child.type) {
        traverse(child, node)
      }
    }
  }

  // 宣言が含まれるスコープを取得
  const variableDeclaration = declarationNode.parent
  let scopeNode = variableDeclaration.parent

  // BlockStatementまたはProgramまで遡る
  while (scopeNode && scopeNode.type !== 'Program' && scopeNode.type !== 'BlockStatement') {
    scopeNode = scopeNode.parent
  }

  if (scopeNode) {
    // 宣言以降のノードのみを探索
    const statements = scopeNode.body || scopeNode.statements || []
    const declarationIndex = statements.indexOf(variableDeclaration)

    for (let i = declarationIndex + 1; i < statements.length; i++) {
      traverse(statements[i], scopeNode)
    }
  }

  return references
}

/**
 * switch文で変数が複数のcaseで使われているかチェック
 * 複数のcaseで使われている場合は移動すべきでない
 */
function isUsedInMultipleSwitchCases(targetConditional, refInfo) {
  if (targetConditional.type !== 'SwitchStatement') {
    return false
  }

  const usedCases = new Set()
  refInfo.forEach(info => {
    // 条件部分(discriminant)で使われている場合はスキップ
    if (info.isInTest) return

    // どのcaseで使われているか探す
    let current = info.identifier
    while (current && current !== targetConditional) {
      if (current.type === 'SwitchCase') {
        usedCases.add(current)
        break
      }
      current = current.parent
    }
  })

  return usedCases.size > 1
}

/**
 * 変数宣言を移動するfixer関数を生成
 */
function createMoveFixer(sourceCode, variableDeclaration, targetConditional, statements, conditionalStatementIndex, refInfo) {
  return function(fixer) {
    const usedInTest = refInfo.some(info => info.isInTest)
    const declarationText = sourceCode.getText(variableDeclaration)
    const fixes = [fixer.remove(variableDeclaration)]

    if (usedInTest) {
      // 条件部分で使用 → 条件文の直前に移動
      const conditionalStatement = statements[conditionalStatementIndex]
      fixes.push(fixer.insertTextBefore(conditionalStatement, declarationText + '\n'))
    } else {
      // body内で使用 → body内の先頭に移動
      const body = getConditionalBody(targetConditional)

      if (body && body.length > 0) {
        fixes.push(fixer.insertTextBefore(body[0], declarationText + '\n'))
      } else {
        // bodyが空の場合は条件文の直前に移動
        const conditionalStatement = statements[conditionalStatementIndex]
        fixes.push(fixer.insertTextBefore(conditionalStatement, declarationText + '\n'))
      }
    }

    return fixes
  }
}

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    schema: SCHEMA,
    messages: {
      moveToLazy: '変数"{{name}}"は条件分岐で使われない可能性があります。使用される直前に宣言を移動してください。',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode()

    return {
      'VariableDeclarator': (node) => {
        // const/let のみ対象（varは除外）
        if (node.parent.kind === 'var') return
        if (node.id.type !== 'Identifier') return

        const varName = node.id.name
        const references = getVariableReferences(sourceCode, varName, node)

        // 参照がない場合はスキップ
        if (references.length === 0) return

        // 各参照の祖先にある条件分岐を取得
        const refConditionals = references.map(ref => ({
          identifier: ref.identifier,
          conditionals: getAncestorConditionals(ref.identifier),
        }))

        // 条件分岐と関係ない参照がある場合は対象外
        if (refConditionals.some(info => info.conditionals.length === 0)) return

        // 全ての参照に共通する条件分岐を見つける
        const firstConditionals = refConditionals[0].conditionals
        const commonConditionals = firstConditionals.filter(conditional =>
          refConditionals.every(info => info.conditionals.includes(conditional))
        )

        // 共通する条件分岐がない場合は対象外
        if (commonConditionals.length === 0) return

        // 最も内側の共通条件分岐を対象とする
        const targetConditional = commonConditionals[0]

        // 各参照が条件部分で使われているかチェック
        const refInfo = references.map(ref => ({
          identifier: ref.identifier,
          conditional: targetConditional,
          isInTest: isUsedInConditionalTest(ref.identifier),
        }))

        // switch文で複数のcaseで使われている場合は移動しない
        if (isUsedInMultipleSwitchCases(targetConditional, refInfo)) return

        // 宣言と条件分岐の間にコードがあるかチェック
        const variableDeclaration = node.parent
        const declarationParent = variableDeclaration.parent

        if (!declarationParent || !declarationParent.body) return

        const statements = declarationParent.body
        const declarationIndex = statements.indexOf(variableDeclaration)

        // 条件分岐を含む文のインデックスを探す
        let conditionalStatementIndex = -1
        for (let i = declarationIndex + 1; i < statements.length; i++) {
          if (containsNode(statements[i], targetConditional)) {
            conditionalStatementIndex = i
            break
          }
        }

        if (conditionalStatementIndex === -1) return

        // 宣言と条件分岐の間にコードがある場合のみエラーを報告
        const hasCodeBetween = conditionalStatementIndex > declarationIndex + 1

        if (hasCodeBetween) {
          context.report({
            node,
            messageId: 'moveToLazy',
            data: { name: varName },
            fix: createMoveFixer(
              sourceCode,
              variableDeclaration,
              targetConditional,
              statements,
              conditionalStatementIndex,
              refInfo
            ),
          })
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
