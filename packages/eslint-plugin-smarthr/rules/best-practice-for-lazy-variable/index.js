const SCHEMA = []

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

const EARLY_EXIT_STATEMENT_TYPES = new Set([
  'ReturnStatement',
  'ThrowStatement',
])

/**
 * ノードが関数スコープかどうか判定
 */
function isFunctionScope(node) {
  return FUNCTION_SCOPE_TYPES.has(node.type)
}

/**
 * スコープのstatements配列を取得
 */
function getStatements(scope) {
  return scope.body || scope.statements || []
}

/**
 * 変数の全ての使用箇所を取得（宣言と同じスコープ内、関数スコープ内やループ内も含む）
 */
function getVariableUsages(sourceCode, varName, declarationNode) {
  const usages = []
  const variableDeclaration = declarationNode.parent
  let scopeNode = variableDeclaration.parent

  // BlockStatementまたはProgramまで遡る
  while (scopeNode && scopeNode.type !== 'Program' && scopeNode.type !== 'BlockStatement') {
    scopeNode = scopeNode.parent
  }

  if (!scopeNode) return usages

  /**
   * ASTを再帰的に探索（関数スコープ内やループ内も含めてすべて収集）
   */
  function traverse(node) {
    if (!node || typeof node !== 'object') return

    switch (node.type) {
      case 'Identifier': {
        // 変数名が一致するIdentifierを収集（宣言自体は除外）
        if (node.name === varName && node !== declarationNode.id) {
          usages.push(node)
        }
        break
      }
      case 'VariableDeclarator': {
        // 同名変数の再宣言がある場合はその先を探索しない
        if (node !== declarationNode &&
            node.id.type === 'Identifier' &&
            node.id.name === varName) {
          return
        }
        break
      }
    }

    // 子ノードを再帰的に探索
    for (const key in node) {
      if (key === 'parent') continue
      const child = node[key]
      if (child) {
        if (Array.isArray(child)) {
          child.forEach(c => traverse(c))
        } else if (typeof child === 'object' && child.type) {
          traverse(child)
        }
      }
    }
  }

  // 宣言以降のノードのみを探索
  const statements = getStatements(scopeNode)
  const declarationIndex = statements.indexOf(variableDeclaration)

  for (let i = declarationIndex + 1; i < statements.length; i++) {
    traverse(statements[i])
  }

  return usages
}

/**
 * ループ構文かどうか判定
 */
function isLoopStatement(node) {
  return LOOP_STATEMENT_TYPES.has(node.type)
}

/**
 * If文のbodyを探す
 */
function findIfBodyForUsage(ifStatement, usageNode, crossedBarrier) {
  // consequent (then節) に含まれているか
  if (containsNode(ifStatement.consequent, usageNode)) {
    return { type: 'if-body', body: ifStatement.consequent, conditional: ifStatement, crossedBarrier }
  }

  // alternate (else節) に含まれているか
  if (ifStatement.alternate &&
      ifStatement.alternate.type !== 'IfStatement' &&
      containsNode(ifStatement.alternate, usageNode)) {
    return { type: 'if-body', body: ifStatement.alternate, conditional: ifStatement, crossedBarrier }
  }

  return null
}

/**
 * Switch文のbodyを探す
 */
function findSwitchBodyForUsage(switchStatement, usageNode, crossedBarrier) {
  for (const caseNode of switchStatement.cases) {
    // block無しのcase
    if (caseNode.consequent.length === 0 || caseNode.consequent[0].type !== 'BlockStatement') {
      for (const statement of caseNode.consequent) {
        if (containsNode(statement, usageNode)) {
          return { type: 'case-body', body: caseNode.consequent, conditional: switchStatement, crossedBarrier }
        }
      }
      continue
    }

    // block付きのcase
    if (containsNode(caseNode.consequent[0], usageNode) && isDirectChild(caseNode.consequent[0], usageNode)) {
      return { type: 'case-body', body: caseNode.consequent[0], conditional: switchStatement, crossedBarrier }
    }
  }

  return null
}

/**
 * 使用箇所から到達できる条件分岐bodyを探す
 * バリア（ループや関数スコープ）を超えて、その外側のbodyを探す
 * @returns {Object|null} { type: 'if-body'|'case-body', body: Node, conditional: Node, crossedBarrier: boolean }
 */
function findConditionalBodyForUsage(usageNode) {
  let current = usageNode.parent
  let crossedBarrier = false

  while (current) {
    // バリアを検出（ただし、探索は続行）
    if (isFunctionScope(current) || isLoopStatement(current)) {
      crossedBarrier = true
      current = current.parent
      continue
    }

    switch (current.type) {
      // if文のbody内にいるか確認
      case 'IfStatement': {
        const result = findIfBodyForUsage(current, usageNode, crossedBarrier)
        if (result) return result
        break
      }
      // switch文のcase内にいるか確認
      case 'SwitchStatement': {
        const result = findSwitchBodyForUsage(current, usageNode, crossedBarrier)
        if (result) return result
        break
      }
    }

    current = current.parent
  }

  return null
}

/**
 * 条件分岐の祖先チェーンを構築
 */
function buildAncestorChain(conditional) {
  const ancestors = []
  let current = conditional

  while (current && !isFunctionScope(current) && !isLoopStatement(current)) {
    switch (current.type) {
      case 'IfStatement': {
        if (current.consequent.type === 'BlockStatement') {
          ancestors.push({ type: 'if-body', body: current.consequent, conditional: current })
        }
        if (current.alternate && current.alternate.type !== 'IfStatement' && current.alternate.type === 'BlockStatement') {
          ancestors.push({ type: 'if-body', body: current.alternate, conditional: current })
        }
        break
      }
      case 'SwitchStatement': {
        for (const caseNode of current.cases) {
          if (caseNode.consequent.length > 0) {
            const body = caseNode.consequent[0].type === 'BlockStatement'
              ? caseNode.consequent[0]
              : caseNode.consequent
            ancestors.push({ type: 'case-body', body, conditional: current })
          }
        }
        break
      }
    }
    current = current.parent
  }

  return ancestors
}

/**
 * 複数の条件分岐bodyの最小共通祖先bodyを見つける
 */
function findCommonAncestorBody(bodyInfos) {
  if (bodyInfos.length === 0) return null
  if (bodyInfos.length === 1) return bodyInfos[0]

  const firstBody = bodyInfos[0].body
  if (bodyInfos.every(info => info.body === firstBody)) {
    return bodyInfos[0]
  }

  const ancestors = buildAncestorChain(bodyInfos[0].conditional)

  for (const ancestorInfo of ancestors) {
    const allContained = bodyInfos.every(info =>
      containsNode(ancestorInfo.body, info.body) || containsNode(ancestorInfo.body, info.conditional)
    )
    if (allContained) {
      return ancestorInfo
    }
  }

  return null
}

/**
 * If文内での使用位置を判定
 */
function getUsageLocationInIf(conditional, usageNode) {
  // test（条件部分）に含まれているか
  if (containsNode(conditional.test, usageNode)) {
    return { type: 'test', body: null }
  }

  // consequent（then節）に含まれているか
  if (containsNode(conditional.consequent, usageNode) && isDirectChild(conditional.consequent, usageNode)) {
    return { type: 'consequent', body: conditional.consequent }
  }

  // alternate（else節）に含まれているか
  if (conditional.alternate) {
    // else if の場合は再帰的に処理
    if (conditional.alternate.type === 'IfStatement') {
      return getUsageLocationInIf(conditional.alternate, usageNode)
    }
    // else の場合
    if (containsNode(conditional.alternate, usageNode) && isDirectChild(conditional.alternate, usageNode)) {
      return { type: 'alternate', body: conditional.alternate }
    }
  }

  return null
}

/**
 * Switch文内での使用位置を判定
 */
function getUsageLocationInSwitch(conditional, usageNode) {
  // discriminant（条件部分）に含まれているか
  if (containsNode(conditional.discriminant, usageNode)) {
    return { type: 'discriminant', body: null }
  }

  // どのcase/defaultに含まれているか探す
  for (const caseNode of conditional.cases) {
    // block無しのcase
    if (caseNode.consequent.length === 0 || caseNode.consequent[0].type !== 'BlockStatement') {
      for (const statement of caseNode.consequent) {
        if (containsNode(statement, usageNode) && isDirectChildInArray(caseNode.consequent, usageNode)) {
          return { type: 'case', body: caseNode.consequent }
        }
      }
      continue
    }

    // block付きのcase
    if (containsNode(caseNode.consequent[0], usageNode) && isDirectChild(caseNode.consequent[0], usageNode)) {
      return { type: 'case', body: caseNode.consequent[0] }
    }
  }

  return null
}

/**
 * 使用箇所が条件文のどこにあるかを判定
 */
function getUsageLocation(conditional, usageNode) {
  switch (conditional.type) {
    case 'IfStatement':
      return getUsageLocationInIf(conditional, usageNode)
    case 'SwitchStatement':
      return getUsageLocationInSwitch(conditional, usageNode)
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
 * 使用箇所がbody直下にあるか（別関数スコープを経由していないか）
 */
function isDirectChild(body, usageNode) {
  const isArray = Array.isArray(body)
  let current = usageNode.parent

  while (current) {
    if (isFunctionScope(current)) {
      return false
    }
    if (isArray ? body.includes(current) : current === body) {
      return true
    }
    current = current.parent
  }

  return false
}

function isDirectChildInArray(bodyArray, usageNode) {
  return isDirectChild(bodyArray, usageNode)
}

/**
 * ノードのインデントを取得
 */
function getIndent(sourceCode, node) {
  const text = sourceCode.text
  const start = node.range[0]

  // 行の先頭を探す
  let lineStart = start
  while (lineStart > 0 && text[lineStart - 1] !== '\n' && text[lineStart - 1] !== '\r') {
    lineStart--
  }

  // 行の先頭からノードまでの空白を取得
  return text.substring(lineStart, start)
}

/**
 * 変数宣言の削除範囲を計算
 */
function getRemovalRange(sourceCode, variableDeclaration) {
  const text = sourceCode.text
  const startPos = variableDeclaration.range[0]
  const endPos = variableDeclaration.range[1]

  let lineStart = startPos
  while (lineStart > 0 && text[lineStart - 1] !== '\n' && text[lineStart - 1] !== '\r') {
    lineStart--
  }

  let removeEnd = endPos
  if (text[endPos] === '\n') {
    removeEnd = endPos + 1
  } else if (text[endPos] === '\r' && text[endPos + 1] === '\n') {
    removeEnd = endPos + 2
  }

  return { lineStart, removeEnd }
}

/**
 * case文のコロン位置とインデントを取得
 */
function getCaseInfo(sourceCode, firstStatement) {
  const text = sourceCode.text
  let pos = firstStatement.range[0] - 1

  // 空白・改行をスキップしてコロンを探す
  while (pos > 0 && (text[pos] === ' ' || text[pos] === '\t' || text[pos] === '\n' || text[pos] === '\r')) {
    pos--
  }
  while (pos > 0 && text[pos] !== ':') {
    pos--
  }
  const colonPos = pos

  // caseラベルのインデントを取得
  let caseLineStart = colonPos
  while (caseLineStart > 0 && text[caseLineStart - 1] !== '\n' && text[caseLineStart - 1] !== '\r') {
    caseLineStart--
  }
  let caseKeywordStart = caseLineStart
  while (caseKeywordStart < colonPos && (text[caseKeywordStart] === ' ' || text[caseKeywordStart] === '\t')) {
    caseKeywordStart++
  }

  return {
    colonPos,
    caseIndent: text.substring(caseLineStart, caseKeywordStart)
  }
}

/**
 * switch caseにblockを追加して変数を移動
 */
function fixSwitchCase(fixer, sourceCode, declarationText, targetBody, removalRange) {
  const text = sourceCode.text
  const firstStatement = targetBody[0]
  const lastStatement = targetBody[targetBody.length - 1]
  const statementIndent = getIndent(sourceCode, firstStatement)
  const { colonPos, caseIndent } = getCaseInfo(sourceCode, firstStatement)

  let firstLineStart = firstStatement.range[0]
  while (firstLineStart > 0 && text[firstLineStart - 1] !== '\n' && text[firstLineStart - 1] !== '\r') {
    firstLineStart--
  }

  const bodyText = text.substring(firstLineStart, lastStatement.range[1])
  const newBody = ` {\n${statementIndent}${declarationText}\n${bodyText}\n${caseIndent}}`
  const middleText = text.substring(removalRange.removeEnd, colonPos + 1)
  const fullReplacement = middleText + newBody

  return [fixer.replaceTextRange([removalRange.lineStart, lastStatement.range[1]], fullReplacement)]
}

/**
 * BlockStatementに変数を移動
 */
function fixBlockStatement(fixer, sourceCode, declarationText, targetBody, removalRange, firstUsageStatement) {
  if (targetBody.body.length > 0) {
    const insertTarget = firstUsageStatement || targetBody.body[0]
    const targetIndent = getIndent(sourceCode, insertTarget)
    return [
      fixer.removeRange([removalRange.lineStart, removalRange.removeEnd]),
      fixer.insertTextBefore(insertTarget, declarationText + '\n' + targetIndent)
    ]
  } else {
    const openBrace = sourceCode.getFirstToken(targetBody)
    return [
      fixer.removeRange([removalRange.lineStart, removalRange.removeEnd]),
      fixer.insertTextAfter(openBrace, '\n' + declarationText)
    ]
  }
}

/**
 * 変数宣言を移動するfixer関数を生成
 */
function createMoveFixer(sourceCode, variableDeclaration, targetBody, insertBeforeStatement, firstUsageStatement) {
  return function(fixer) {
    const declarationText = sourceCode.getText(variableDeclaration)
    const removalRange = getRemovalRange(sourceCode, variableDeclaration)

    // 早期終了後への移動
    if (insertBeforeStatement) {
      const targetIndent = getIndent(sourceCode, insertBeforeStatement)
      return [
        fixer.removeRange([removalRange.lineStart, removalRange.removeEnd]),
        fixer.insertTextBefore(insertBeforeStatement, declarationText + '\n' + targetIndent)
      ]
    }

    // switch caseの配列（blockなし）
    if (Array.isArray(targetBody) && targetBody.length > 0) {
      return fixSwitchCase(fixer, sourceCode, declarationText, targetBody, removalRange)
    }

    // BlockStatement
    if (targetBody.type === 'BlockStatement') {
      return fixBlockStatement(fixer, sourceCode, declarationText, targetBody, removalRange, firstUsageStatement)
    }

    // 単一文をブロック化
    const statementText = sourceCode.getText(targetBody)
    return [
      fixer.removeRange([removalRange.lineStart, removalRange.removeEnd]),
      fixer.replaceText(targetBody, `{\n${declarationText}\n${statementText}\n}`)
    ]
  }
}

/**
 * ノードがreturn/throw文かどうか判定
 */
function isEarlyExitStatement(node) {
  return EARLY_EXIT_STATEMENT_TYPES.has(node.type)
}

/**
 * try-catchブロックを検出（throw文を含む場合）
 */
function findTryCatchWithThrow(node) {
  let current = node.parent

  while (current) {
    if (current.type === 'TryStatement') {
      // try内またはcatch内にthrowがあるかチェック
      if (containsThrow(current.block) ||
          (current.handler && containsThrow(current.handler.body))) {
        return current
      }
    }

    if (isFunctionScope(current)) {
      return null
    }

    current = current.parent
  }

  return null
}

/**
 * ノード内にthrow文が含まれているかチェック
 */
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

function containsThrow(node) {
  return containsNodeType(node, 'ThrowStatement')
}

function containsAwait(node) {
  return containsNodeType(node, 'AwaitExpression')
}

/**
 * 宣言スコープ内の早期終了（return/throw、またはtry-catch）を検出
 */
function findEarlyExits(declarationScope, variableDeclaration) {
  const statements = getStatements(declarationScope)
  const declarationIndex = statements.indexOf(variableDeclaration)
  const earlyExits = []

  // 宣言より後のstatementを探索
  for (let i = declarationIndex + 1; i < statements.length; i++) {
    const statement = statements[i]

    // try-catchブロック（throw含む）を検出
    if (statement.type === 'TryStatement' &&
        (containsThrow(statement.block) ||
         (statement.handler && containsThrow(statement.handler.body)))) {
      earlyExits.push({
        type: 'try-catch',
        node: statement,
        index: i,
      })
      continue
    }

    // 早期終了文を再帰的に検出
    collectEarlyExitsFromNode(statement, earlyExits, i)
  }

  return earlyExits
}

/**
 * ノードから早期終了文を収集
 */
function collectEarlyExitsFromNode(node, earlyExits, statementIndex) {
  // 関数スコープを超えない
  if (!node || typeof node !== 'object' || isFunctionScope(node)) return

  // return/throw文を検出
  if (isEarlyExitStatement(node)) {
    earlyExits.push({
      type: node.type === 'ReturnStatement' ? 'return' : 'throw',
      node,
      statementIndex,
    })
    return
  }

  // 子ノードを再帰的に探索
  for (const key in node) {
    if (key === 'parent') continue
    const child = node[key]
    if (child) {
      if (Array.isArray(child)) {
        child.forEach(c => collectEarlyExitsFromNode(c, earlyExits, statementIndex))
      } else if (typeof child === 'object') {
        collectEarlyExitsFromNode(child, earlyExits, statementIndex)
      }
    }
  }
}

/**
 * 変数が早期終了前で使用されているかチェック
 */
function isUsedBeforeEarlyExit(varName, declarationNode, earlyExit, declarationScope) {
  const variableDeclaration = declarationNode.parent
  const statements = getStatements(declarationScope)
  const declarationIndex = statements.indexOf(variableDeclaration)

  // 早期終了のインデックスを取得
  const earlyExitIndex = earlyExit.type === 'try-catch' ? earlyExit.index : earlyExit.statementIndex

  // 宣言から早期終了までのstatementをチェック
  for (let i = declarationIndex + 1; i <= earlyExitIndex; i++) {
    const statement = statements[i]

    if (earlyExit.type !== 'try-catch') {
      // 早期終了文を含むstatement内での使用をチェック
      if (containsVariableUsageBeforeEarlyExit(statement, varName, declarationNode, earlyExit.node)) {
        return true
      }
    } else if (statement === earlyExit.node &&
               (containsVariableUsage(earlyExit.node.block, varName, declarationNode) ||
                (earlyExit.node.handler && containsVariableUsage(earlyExit.node.handler.body, varName, declarationNode)) ||
                (earlyExit.node.finalizer && containsVariableUsage(earlyExit.node.finalizer, varName, declarationNode)))) {
      // try-catchブロック内での使用をチェック
      return true
    }
  }

  return false
}

/**
 * ノード内で変数が使用されているかチェック
 */
function containsVariableUsage(node, varName, declarationNode, excludeNode = null, stopAtFunctionScope = false) {
  if (!node || typeof node !== 'object' || node === excludeNode) return false

  if (node.type === 'Identifier' && node.name === varName && node !== declarationNode.id) {
    return true
  }

  if (stopAtFunctionScope && isFunctionScope(node)) return false

  for (const key in node) {
    if (key === 'parent') continue
    const child = node[key]
    if (child && (
      (Array.isArray(child) && child.some(c => containsVariableUsage(c, varName, declarationNode, excludeNode, stopAtFunctionScope))) ||
      (typeof child === 'object' && containsVariableUsage(child, varName, declarationNode, excludeNode, stopAtFunctionScope))
    )) {
      return true
    }
  }

  return false
}

function containsVariableUsageBeforeEarlyExit(node, varName, declarationNode, earlyExitNode) {
  return containsVariableUsage(node, varName, declarationNode, earlyExitNode, true)
}

/**
 * targetBody内で最初に変数が使用されるstatementを見つける
 */
function findFirstUsageStatement(targetBody, usages) {
  const statements = targetBody.type === 'BlockStatement' ? targetBody.body : targetBody
  if (!Array.isArray(statements)) return null

  for (const statement of statements) {
    if (usages.some(usage => containsNode(statement, usage))) {
      return statement
    }
  }

  return null
}

/**
 * statementのインデックスを取得
 */
function getStatementIndex(statements, node) {
  for (let i = 0; i < statements.length; i++) {
    if (containsNode(statements[i], node)) {
      return i
    }
  }
  return -1
}

/**
 * 早期終了後への移動をチェック
 */
function checkEarlyExitMove(sourceCode, node, varName, usages, variableDeclaration, declarationScope) {
  const earlyExits = findEarlyExits(declarationScope, variableDeclaration)
  if (earlyExits.length === 0) return null

  const statements = getStatements(declarationScope)

  for (const earlyExit of earlyExits) {
    if (isUsedBeforeEarlyExit(varName, node, earlyExit, declarationScope)) {
      continue
    }

    const earlyExitIndex = earlyExit.type === 'try-catch' ? earlyExit.index : earlyExit.statementIndex

    // すべての使用箇所が早期終了の後にあるかチェック
    if (usages.length > 0 &&
        usages.every(usage => getStatementIndex(statements, usage) > earlyExitIndex)) {
      const firstUsageIndex = Math.min(...usages.map(usage => getStatementIndex(statements, usage)))

      return {
        node,
        varName,
        variableDeclaration,
        targetBody: null,
        insertBeforeStatement: statements[firstUsageIndex],
        moveType: 'after-early-exit',
      }
    }
  }

  return null
}

/**
 * 変数がスキップ対象かどうかを判定
 */
function shouldSkipVariable(node) {
  const varDecl = node.parent

  if (
    // const/let のみ対象（varは除外）
    node.parent.kind === 'var' ||
    // 分割代入は除外（将来的に対応予定: ArrayPattern, ObjectPattern）
    node.id.type !== 'Identifier' ||
    // ループ変数は対象外（for-in, for-of, for文のinit部分）
    (varDecl.parent && isLoopStatement(varDecl.parent)) ||
    // React Hooks（useXxxで始まる関数）で初期化される変数は対象外
    (node.init && node.init.type === 'CallExpression' && node.init.callee.type === 'Identifier' && node.init.callee.name.startsWith('use')) ||
    // await式を含む変数は対象外（非同期処理の実行タイミングが変わるため）
    (node.init && containsAwait(node.init))
  ) {
    return true
  }

  return false
}

/**
 * 変数が移動対象かどうかを判定
 */
function analyzeVariable(sourceCode, node) {
  if (shouldSkipVariable(node)) return null

  const varName = node.id.name
  const usages = getVariableUsages(sourceCode, varName, node)

  // 使用箇所がない場合はスキップ
  if (usages.length === 0) return null

  // 宣言のスコープを取得
  const variableDeclaration = node.parent
  let declarationScope = variableDeclaration.parent

  // BlockStatementまたはProgramまで遡る
  while (declarationScope && declarationScope.type !== 'Program' && declarationScope.type !== 'BlockStatement') {
    declarationScope = declarationScope.parent
  }

  if (!declarationScope) return null

  // 優先度1: 早期終了後への移動をチェック
  const earlyExitResult = checkEarlyExitMove(sourceCode, node, varName, usages, variableDeclaration, declarationScope)
  if (earlyExitResult) return earlyExitResult

  // 優先度2: 最小スコープの先頭への移動（既存ロジック）
  // 各使用箇所について、到達できる条件分岐bodyを探す
  const bodyInfos = []
  for (const usageNode of usages) {
    const bodyInfo = findConditionalBodyForUsage(usageNode)
    if (!bodyInfo) {
      // どれか1つでも条件分岐bodyに到達できない使用箇所があれば対象外
      return null
    }
    bodyInfos.push(bodyInfo)
  }

  // 使用箇所が1つだけで、その使用箇所がバリアを超えている場合は対象外
  // （元のルール：関数スコープ内やループ内のみで使用される場合は移動しない）
  if (usages.length === 1 && bodyInfos[0].crossedBarrier) {
    return null
  }

  // すべての使用箇所が到達できる最小共通祖先bodyを見つける
  const commonAncestorBody = findCommonAncestorBody(bodyInfos)
  if (!commonAncestorBody) return null

  const targetBody = commonAncestorBody.body

  // 変数宣言がtargetBodyの外側にあるかチェック
  if (containsNode(targetBody, variableDeclaration)) {
    // 既にtargetBody内にある場合は移動不要
    return null
  }

  // 変数宣言からtargetBodyまでの間にバリア（関数スコープやループ）がないかチェック
  let current = commonAncestorBody.conditional
  while (current && current !== declarationScope) {
    // 関数スコープやループがあったら対象外
    if (isFunctionScope(current) || isLoopStatement(current)) {
      return null
    }
    current = current.parent
  }

  // 宣言と条件文の間の位置関係をチェック
  const statements = getStatements(declarationScope)
  const declarationIndex = statements.indexOf(variableDeclaration)

  // 条件文が宣言スコープ直下にある場合
  if (statements.includes(commonAncestorBody.conditional)) {
    const conditionalIndex = statements.indexOf(commonAncestorBody.conditional)
    if (conditionalIndex <= declarationIndex) return null
  } else {
    // 条件文がネストしている場合、宣言より後にある必要がある
    let conditionalIndex = -1
    for (let i = 0; i < statements.length; i++) {
      if (containsNode(statements[i], commonAncestorBody.conditional)) {
        conditionalIndex = i
        break
      }
    }
    if (conditionalIndex === -1 || conditionalIndex <= declarationIndex) return null
  }

  // targetBody内で最初に使用されるstatementを見つける
  const firstUsageStatement = findFirstUsageStatement(targetBody, usages)

  return {
    node,
    varName,
    variableDeclaration,
    targetBody,
    firstUsageStatement, // 最初の使用箇所（スコープ変更の場合に使用）
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
        const analysis = analyzeVariable(sourceCode, node)
        if (!analysis) return

        context.report({
          node: analysis.node,
          messageId: 'moveToLazy',
          data: { name: analysis.varName },
          fix: createMoveFixer(
            sourceCode,
            analysis.variableDeclaration,
            analysis.targetBody,
            analysis.insertBeforeStatement,
            analysis.firstUsageStatement
          ),
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
