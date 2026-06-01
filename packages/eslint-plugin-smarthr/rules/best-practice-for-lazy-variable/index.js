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
 * ノード内に指定された名前のIdentifierが存在するかチェック
 */
function containsIdentifier(node, identifierName) {
  if (!node || typeof node !== 'object') return false

  if (node.type === 'Identifier' && node.name === identifierName) {
    return true
  }

  for (const key in node) {
    if (key === 'parent') continue
    const child = node[key]
    if (Array.isArray(child)) {
      if (child.some(c => containsIdentifier(c, identifierName))) return true
    } else if (child && typeof child === 'object') {
      if (containsIdentifier(child, identifierName)) return true
    }
  }

  return false
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
 * ノードから最も近い関数スコープを取得
 */
function getNearestFunctionScope(node) {
  let current = node.parent
  while (current) {
    if (FUNCTION_SCOPE_TYPES.has(current.type)) {
      return current
    }
    current = current.parent
  }
  return null
}

/**
 * 変数の全ての使用箇所（参照と再代入）を取得
 * 宣言より後で、同一スコープ内の使用箇所を収集
 * 関数スコープ内も含めて探索し、再代入も含める
 */
function getVariableUsages(sourceCode, varName, declarationNode) {
  const usages = []
  const reassignmentsInFunctionScope = new Map() // 関数スコープ内の再代入を記録

  /**
   * ASTを再帰的に探索して使用箇所を収集
   */
  function traverse(node, parent, insideFunctionScope = false, currentFunctionScope = null) {
    if (!node || typeof node !== 'object') return

    // 関数スコープに入る
    let nowInsideFunctionScope = insideFunctionScope
    let nowFunctionScope = currentFunctionScope
    if (FUNCTION_SCOPE_TYPES.has(node.type)) {
      nowInsideFunctionScope = true
      nowFunctionScope = node
    }

    // 再代入のチェック（AssignmentExpression）
    if (node.type === 'AssignmentExpression' &&
        node.left.type === 'Identifier' &&
        node.left.name === varName) {
      if (nowInsideFunctionScope && nowFunctionScope) {
        // 関数スコープ内の再代入: 関数スコープを記録
        reassignmentsInFunctionScope.set(nowFunctionScope, true)
      }
      usages.push({ identifier: node.left, parent, isReassignment: true })
    }

    // 再代入のチェック（UpdateExpression: ++, --）
    if (node.type === 'UpdateExpression' &&
        node.argument.type === 'Identifier' &&
        node.argument.name === varName) {
      if (nowInsideFunctionScope && nowFunctionScope) {
        // 関数スコープ内の再代入: 関数スコープを記録
        reassignmentsInFunctionScope.set(nowFunctionScope, true)
      }
      usages.push({ identifier: node.argument, parent, isReassignment: true })
    }

    // 変数名が一致するIdentifierを収集（宣言自体と再代入は除外）
    if (node.type === 'Identifier' &&
        node.name === varName &&
        node !== declarationNode.id &&
        node.parent?.type !== 'AssignmentExpression' &&
        node.parent?.type !== 'UpdateExpression') {
      // 関数スコープ内の参照は収集しない（同一スコープのみ）
      if (!nowInsideFunctionScope) {
        usages.push({ identifier: node, parent, isReassignment: false })
      }
    }

    // 同名変数の再宣言がある場合はその先を探索しない
    if (node.type === 'VariableDeclarator' &&
        node !== declarationNode &&
        node.id.type === 'Identifier' &&
        node.id.name === varName) {
      return
    }

    // 子ノードを再帰的に探索
    for (const key in node) {
      if (key === 'parent') continue
      const child = node[key]
      if (Array.isArray(child)) {
        child.forEach(c => traverse(c, node, nowInsideFunctionScope, nowFunctionScope))
      } else if (child && typeof child === 'object' && child.type) {
        traverse(child, node, nowInsideFunctionScope, nowFunctionScope)
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
      traverse(statements[i], scopeNode, false, null)
    }
  }

  // 注: 以前のロジックで関数呼び出し元を追加していましたが、これは誤りでした
  // array.forEach(() => { update = true })の場合、arrayがupdateの使用箇所として
  // 誤って追加されてしまうため、このロジックを削除しました

  return { usages, reassignmentsInFunctionScope }
}

/**
 * switch文で変数が複数のcaseで使われているかチェック
 * 複数のcaseで使われている場合は移動すべきでない
 */
function isUsedInMultipleSwitchCases(targetConditional, usageInfo) {
  if (targetConditional.type !== 'SwitchStatement') {
    return false
  }

  const usedCases = new Set()
  usageInfo.forEach(info => {
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
 * 変数宣言を移動するfixer関数を生成
 */
function createMoveFixer(sourceCode, variableDeclaration, targetConditional, targetStatement, statements, targetStatementIndex, usageInfo) {
  return function(fixer) {
    const declarationText = sourceCode.getText(variableDeclaration)
    const text = sourceCode.text

    // 変数宣言の行全体を削除（インデント含む）
    const startPos = variableDeclaration.range[0]
    const endPos = variableDeclaration.range[1]

    // 行の先頭を探す
    let lineStart = startPos
    while (lineStart > 0 && text[lineStart - 1] !== '\n' && text[lineStart - 1] !== '\r') {
      lineStart--
    }

    // 改行文字も削除範囲に含める
    let removeEnd = endPos
    if (text[endPos] === '\n') {
      removeEnd = endPos + 1
    } else if (text[endPos] === '\r' && text[endPos + 1] === '\n') {
      removeEnd = endPos + 2
    }

    const fixes = [fixer.removeRange([lineStart, removeEnd])]

    // 最初の使用箇所が再代入の場合、または条件部分で使用される場合 → 条件文の直前に移動
    const firstUsageIsReassignment = usageInfo.some(info => info.isReassignment)
    const usedInTest = usageInfo.some(info => info.isInTest)

    if (targetConditional && !firstUsageIsReassignment && !usedInTest) {
      // 条件分岐があり、再代入がなく、条件部分で使用されていない → body内の先頭に移動
      const body = getConditionalBody(targetConditional)
      if (body && body.length > 0) {
        fixes.push(fixer.insertTextBefore(body[0], declarationText + '\n'))
      } else {
        // bodyが空の場合は条件文の直前に移動
        const statement = statements[targetStatementIndex]
        fixes.push(fixer.insertTextBefore(statement, declarationText + '\n'))
      }
    } else {
      // それ以外 → 最初の使用箇所を含む文の直前に移動
      const statement = statements[targetStatementIndex]
      fixes.push(fixer.insertTextBefore(statement, declarationText + '\n'))
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

  const { usages, reassignmentsInFunctionScope } = getVariableUsages(sourceCode, varName, node)

  // 使用箇所がない場合はスキップ
  if (usages.length === 0) return null

  // 使用箇所を位置順（range[0]）にソート
  const sortedUsages = usages.slice().sort((a, b) => {
    const posA = a.identifier.range ? a.identifier.range[0] : 0
    const posB = b.identifier.range ? b.identifier.range[0] : 0
    return posA - posB
  })

  // 最初の使用箇所を取得
  const firstUsage = sortedUsages[0]

  // 全ての使用箇所の祖先にある条件分岐を収集
  // （再代入が関数スコープ内にあっても、他の使用箇所で条件分岐を検出するため）
  const allConditionals = sortedUsages.flatMap(usage =>
    getAncestorConditionals(usage.identifier)
  )

  // 重複を除去し、最も内側の条件分岐を取得
  const uniqueConditionals = Array.from(new Set(allConditionals))
  const conditionals = uniqueConditionals.length > 0 ? [uniqueConditionals[0]] : []

  // 宣言と移動先の間にコードがあるかチェック
  const variableDeclaration = node.parent
  const declarationParent = variableDeclaration.parent

  if (!declarationParent || !declarationParent.body || !Array.isArray(declarationParent.body)) return null

  const statements = declarationParent.body
  const declarationIndex = statements.indexOf(variableDeclaration)

  // 条件分岐がある場合は、最も内側の条件分岐を対象とする
  const targetConditional = conditionals.length > 0 ? conditionals[0] : null

  // 条件分岐がない場合は移動対象外（このルールは条件分岐内でのみ使用される変数が対象）
  if (!targetConditional) return null

  // 全ての使用箇所（関数スコープ内の再代入を除く）がその条件分岐内にあるかチェック
  if (targetConditional) {
    const usagesExcludingReassignmentsInFunctionScope = usages.filter(usage => {
      // 再代入でない場合は含める
      if (!usage.isReassignment) return true

      // 再代入の場合、関数スコープ内かチェック
      const isInFunctionScope = reassignmentsInFunctionScope.size > 0
      return !isInFunctionScope
    })

    const allUsagesInConditional = usagesExcludingReassignmentsInFunctionScope.every(usage =>
      containsNode(targetConditional, usage.identifier)
    )

    // 条件分岐の外でも使用される場合は移動対象外
    if (!allUsagesInConditional) return null
  }

  // 各使用箇所が条件部分で使われているかチェック
  const usageInfo = usages.map(usage => ({
    identifier: usage.identifier,
    conditional: targetConditional,
    isInTest: targetConditional ? isUsedInConditionalTest(usage.identifier) : false,
    isReassignment: usage.isReassignment,
  }))

  // switch文で複数のcaseで使われている場合は移動しない
  if (targetConditional && isUsedInMultipleSwitchCases(targetConditional, usageInfo)) return null

  // 移動先の文を宣言と同じスコープ内で探す
  let targetStatementIndex = -1
  let targetStatement = null

  // 関数スコープ内で再代入がある場合、その関数スコープを含む文を探す
  let targetNode = targetConditional || firstUsage.identifier

  if (reassignmentsInFunctionScope.size > 0) {
    // 関数スコープのいずれかを含む最初の文を探す
    for (let i = declarationIndex + 1; i < statements.length; i++) {
      for (const [functionScope] of reassignmentsInFunctionScope) {
        if (containsNode(statements[i], functionScope)) {
          targetStatementIndex = i
          targetStatement = statements[i]
          targetNode = functionScope
          break
        }
      }
      if (targetStatementIndex !== -1) break
    }
  } else {
    // 通常の処理
    for (let i = declarationIndex + 1; i < statements.length; i++) {
      if (containsNode(statements[i], targetNode)) {
        targetStatementIndex = i
        targetStatement = statements[i]
        break
      }
    }
  }

  if (targetStatementIndex === -1) return null

  // 宣言と移動先の間にコードがある場合のみ移動対象
  const hasCodeBetween = targetStatementIndex > declarationIndex + 1

  if (!hasCodeBetween) return null

  // 間にある変数宣言が移動先の文で使われており、かつ移動しない場合は移動対象外（変数の順序を保つため）
  for (let i = declarationIndex + 1; i < targetStatementIndex; i++) {
    if (statements[i].type === 'VariableDeclaration') {
      for (const declarator of statements[i].declarations) {
        if (declarator.id.type === 'Identifier') {
          const betweenVarName = declarator.id.name
          // targetStatementで使われているかチェック
          if (containsIdentifier(targetStatement, betweenVarName)) {
            // この変数が移動するかどうかをチェック
            const { usages: betweenVarUsages } = getVariableUsages(sourceCode, betweenVarName, declarator)
            // 条件分岐がある場合、全ての使用箇所が条件分岐内かチェック
            if (targetConditional) {
              const allUsagesInConditional = betweenVarUsages.every(usage =>
                containsNode(targetConditional, usage.identifier)
              )
              // 条件分岐の外でも使われる = 移動しない → ブロック
              if (!allUsagesInConditional) {
                return null
              }
            }
          }
        }
      }
    }
  }

  const usedInTest = targetConditional && usageInfo.some(info => info.isInTest)

  return {
    node,
    varName,
    variableDeclaration,
    targetConditional,
    targetStatement,
    statements,
    targetStatementIndex,
    usageInfo,
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
function createGroupMoveFixer(sourceCode, variables, targetConditional, targetStatement) {
  return function(fixer) {
    const fixes = []
    const text = sourceCode.text
    const usedInTest = variables[0].usedInTest
    const hasReassignment = variables.some(v => v.usageInfo.some(info => info.isReassignment))

    // 条件部分で使われている場合は、条件での出現順にソート
    const sortedVariables = usedInTest
      ? [...variables].sort((a, b) => a.position - b.position)
      : variables

    // 各変数の宣言の行全体を削除（インデント含む）
    sortedVariables.forEach(variable => {
      const startPos = variable.variableDeclaration.range[0]
      const endPos = variable.variableDeclaration.range[1]

      // 行の先頭を探す
      let lineStart = startPos
      while (lineStart > 0 && text[lineStart - 1] !== '\n' && text[lineStart - 1] !== '\r') {
        lineStart--
      }

      // 改行文字も削除範囲に含める
      let removeEnd = endPos
      if (text[endPos] === '\n') {
        removeEnd = endPos + 1
      } else if (text[endPos] === '\r' && text[endPos + 1] === '\n') {
        removeEnd = endPos + 2
      }

      fixes.push(fixer.removeRange([lineStart, removeEnd]))
    })

    // 移動先のテキストを生成（ソート済みの順序で）
    const declarationsText = sortedVariables
      .map(v => sourceCode.getText(v.variableDeclaration))
      .join('\n') + '\n'

    // 最初の使用箇所が再代入の場合、または条件部分で使用される場合 → 条件文の直前に移動
    if (targetConditional && !hasReassignment && !usedInTest) {
      // 条件分岐があり、再代入がなく、条件部分で使用されていない → body内の先頭に移動
      const body = getConditionalBody(targetConditional)
      if (body && body.length > 0) {
        fixes.push(fixer.insertTextBefore(body[0], declarationsText))
      } else {
        // bodyが空の場合は条件文の直前に移動
        fixes.push(fixer.insertTextBefore(targetStatement, declarationsText))
      }
    } else {
      // それ以外 → 最初の使用箇所を含む文の直前に移動
      fixes.push(fixer.insertTextBefore(targetStatement, declarationsText))
    }

    return fixes
  }
}

/**
 * 同じスコープ内の移動対象変数をグループ化して処理
 */
function processVariableGroup(context, sourceCode, variables) {
  // 移動先でグループ化
  const groups = new Map()

  variables.forEach(variable => {
    // targetStatementでグループ化（nullの場合は"null"文字列を使用）
    const targetRange = variable.targetStatement ? variable.targetStatement.range[0] : 'null'
    const key = `${targetRange}_${variable.usedInTest}`
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key).push(variable)
  })

  // グループごとに処理
  groups.forEach(group => {
    const firstVar = group[0]
    const targetStatement = firstVar.statements[firstVar.targetStatementIndex]

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
          variable.targetStatement,
          variable.statements,
          variable.targetStatementIndex,
          variable.usageInfo
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
            targetStatement
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
