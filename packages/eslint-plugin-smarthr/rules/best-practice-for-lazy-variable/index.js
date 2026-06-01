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
 * 条件部分で変数が出現する位置を取得
 * 条件部分のASTを走査して、変数のIdentifierの位置（range[0]）を返す
 */
function getVariablePositionInConditionalTest(conditional, varName) {
  let testNode

  switch (conditional.type) {
    case 'SwitchStatement':
      testNode = conditional.discriminant
      break
    case 'IfStatement':
    case 'ConditionalExpression':
      testNode = conditional.test
      break
    case 'LogicalExpression':
    case 'ChainExpression':
      // これらは式全体が条件なので、式自体を探索
      testNode = conditional
      break
    default:
      testNode = null
  }

  if (!testNode) {
    return -1
  }

  let position = -1

  function traverse(node) {
    if (!node || typeof node !== 'object') return false

    // 変数名が一致するIdentifierを発見
    if (node.type === 'Identifier' && node.name === varName && node.range) {
      position = node.range[0]
      return true
    }

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

  traverse(testNode)
  return position
}

/**
 * 変数宣言を移動するfixer関数を生成（複数の変数をまとめて処理）
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
 * 変数が移動対象かどうかを判定し、移動情報を返す
 */
function analyzeVariable(sourceCode, node) {
  // const/let のみ対象（varは除外）
  if (node.parent.kind === 'var') return null
  if (node.id.type !== 'Identifier') return null

  const varName = node.id.name
  const references = getVariableReferences(sourceCode, varName, node)

  // 参照がない場合はスキップ
  if (references.length === 0) return null

  // 各参照の祖先にある条件分岐を取得
  const refConditionals = references.map(ref => ({
    identifier: ref.identifier,
    conditionals: getAncestorConditionals(ref.identifier),
  }))

  // 条件分岐と関係ない参照がある場合は対象外
  if (refConditionals.some(info => info.conditionals.length === 0)) return null

  // 全ての参照に共通する条件分岐を見つける
  const firstConditionals = refConditionals[0].conditionals
  const commonConditionals = firstConditionals.filter(conditional =>
    refConditionals.every(info => info.conditionals.includes(conditional))
  )

  // 共通する条件分岐がない場合は対象外
  if (commonConditionals.length === 0) return null

  // 最も内側の共通条件分岐を対象とする
  const targetConditional = commonConditionals[0]

  // 各参照が条件部分で使われているかチェック
  const refInfo = references.map(ref => ({
    identifier: ref.identifier,
    conditional: targetConditional,
    isInTest: isUsedInConditionalTest(ref.identifier),
  }))

  // switch文で複数のcaseで使われている場合は移動しない
  if (isUsedInMultipleSwitchCases(targetConditional, refInfo)) return null

  // 宣言と条件分岐の間にコードがあるかチェック
  const variableDeclaration = node.parent
  const declarationParent = variableDeclaration.parent

  if (!declarationParent || !declarationParent.body) return null

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

  if (conditionalStatementIndex === -1) return null

  // 宣言と条件分岐の間にコードがある場合のみ移動対象
  const hasCodeBetween = conditionalStatementIndex > declarationIndex + 1

  if (!hasCodeBetween) return null

  const usedInTest = refInfo.some(info => info.isInTest)

  return {
    node,
    varName,
    variableDeclaration,
    targetConditional,
    statements,
    conditionalStatementIndex,
    refInfo,
    usedInTest,
    // 条件部分での出現位置（ソート用）
    position: usedInTest ? getVariablePositionInConditionalTest(targetConditional, varName) : -1,
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
    const variablesToMove = new Map() // スコープごとに移動対象の変数を収集

    return {
      'VariableDeclarator': (node) => {
        const analysis = analyzeVariable(sourceCode, node)
        if (!analysis) return

        // スコープ（親の文のリスト）をキーにして収集
        const scopeKey = analysis.statements
        if (!variablesToMove.has(scopeKey)) {
          variablesToMove.set(scopeKey, [])
        }
        variablesToMove.get(scopeKey).push(analysis)
      },

      'Program:exit': () => {
        // 収集した変数をまとめて処理
        variablesToMove.forEach((variables) => {
          processVariableGroup(context, sourceCode, variables)
        })
      },
    }
  },
}

/**
 * 複数の変数宣言をまとめて移動するfixer関数を生成
 */
function createGroupMoveFixer(sourceCode, variables, targetConditional, conditionalStatement) {
  return function(fixer) {
    const fixes = []
    const usedInTest = variables[0].usedInTest

    // 条件部分で使われている場合は、条件での出現順にソート
    const sortedVariables = usedInTest
      ? [...variables].sort((a, b) => a.position - b.position)
      : variables

    // 各変数の宣言を削除
    sortedVariables.forEach(variable => {
      fixes.push(fixer.remove(variable.variableDeclaration))
    })

    // 移動先のテキストを生成（ソート済みの順序で）
    const declarationsText = sortedVariables
      .map(v => sourceCode.getText(v.variableDeclaration))
      .join('\n') + '\n'

    if (usedInTest) {
      // 条件部分で使用 → 条件文の直前に移動
      fixes.push(fixer.insertTextBefore(conditionalStatement, declarationsText))
    } else {
      // body内で使用 → body内の先頭に移動
      const body = getConditionalBody(targetConditional)

      if (body && body.length > 0) {
        fixes.push(fixer.insertTextBefore(body[0], declarationsText))
      } else {
        // bodyが空の場合は条件文の直前に移動
        fixes.push(fixer.insertTextBefore(conditionalStatement, declarationsText))
      }
    }

    return fixes
  }
}

/**
 * 同じスコープ内の移動対象変数をグループ化して処理
 */
function processVariableGroup(context, sourceCode, variables) {
  // 条件分岐×移動先でグループ化
  const groups = new Map()

  variables.forEach(variable => {
    const key = `${variable.targetConditional.range[0]}_${variable.usedInTest}`
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key).push(variable)
  })

  // グループごとに処理
  groups.forEach(group => {
    const firstVar = group[0]
    const conditionalStatement = firstVar.statements[firstVar.conditionalStatementIndex]

    // グループが1つの変数のみの場合
    if (group.length === 1) {
      const variable = group[0]
      context.report({
        node: variable.node,
        messageId: 'moveToLazy',
        data: { name: variable.varName },
        fix: createMoveFixer(
          sourceCode,
          variable.variableDeclaration,
          variable.targetConditional,
          variable.statements,
          variable.conditionalStatementIndex,
          variable.refInfo
        ),
      })
      return
    }

    // 複数の変数がある場合は、まとめて処理
    // 最初の変数だけにfixを設定し、残りはfixなしでreport
    group.forEach((variable, index) => {
      if (index === 0) {
        // 最初の変数にグループ全体のfixを設定
        context.report({
          node: variable.node,
          messageId: 'moveToLazy',
          data: { name: variable.varName },
          fix: createGroupMoveFixer(
            sourceCode,
            group,
            variable.targetConditional,
            conditionalStatement
          ),
        })
      } else {
        // 残りの変数はfixなしでreport（最初のfixで一緒に処理される）
        context.report({
          node: variable.node,
          messageId: 'moveToLazy',
          data: { name: variable.varName },
        })
      }
    })
  })
}
module.exports.schema = SCHEMA
