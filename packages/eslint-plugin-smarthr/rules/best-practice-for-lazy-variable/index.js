const SCHEMA = []

/**
 * ノードが関数スコープかどうか判定
 */
function isFunctionScope(node) {
  return node.type === 'FunctionDeclaration' ||
         node.type === 'FunctionExpression' ||
         node.type === 'ArrowFunctionExpression'
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

    // 変数名が一致するIdentifierを収集（宣言自体は除外）
    if (node.type === 'Identifier' &&
        node.name === varName &&
        node !== declarationNode.id) {
      usages.push(node)
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
        child.forEach(c => traverse(c))
      } else if (child && typeof child === 'object' && child.type) {
        traverse(child)
      }
    }
  }

  // 宣言以降のノードのみを探索
  const statements = scopeNode.body || scopeNode.statements || []
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
  return node.type === 'ForStatement' ||
         node.type === 'ForInStatement' ||
         node.type === 'ForOfStatement' ||
         node.type === 'WhileStatement' ||
         node.type === 'DoWhileStatement'
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

    // if文のbody内にいるか確認
    if (current.type === 'IfStatement') {
      // consequent (then節) に含まれているか
      if (containsNode(current.consequent, usageNode)) {
        return { type: 'if-body', body: current.consequent, conditional: current, crossedBarrier }
      }

      // alternate (else節) に含まれているか
      if (current.alternate) {
        if (current.alternate.type === 'IfStatement') {
          // else if の場合は次のループで処理される
        } else {
          // else の場合
          if (containsNode(current.alternate, usageNode)) {
            return { type: 'if-body', body: current.alternate, conditional: current, crossedBarrier }
          }
        }
      }
    }

    // switch文のcase内にいるか確認
    if (current.type === 'SwitchStatement') {
      for (const caseNode of current.cases) {
        for (const statement of caseNode.consequent) {
          if (containsNode(statement, usageNode)) {
            return { type: 'case-body', body: caseNode.consequent, conditional: current, crossedBarrier }
          }
        }
      }
    }

    current = current.parent
  }

  return null
}

/**
 * 複数の条件分岐bodyの最小共通祖先bodyを見つける
 * @param {Array} bodyInfos - findConditionalBodyForUsageの結果の配列
 * @returns {Object|null} { body: Node, type: 'if-body'|'case-body' }
 */
function findCommonAncestorBody(bodyInfos) {
  if (bodyInfos.length === 0) return null
  if (bodyInfos.length === 1) return bodyInfos[0]

  // すべてのbodyが同じかチェック
  const firstBody = bodyInfos[0].body
  const allSame = bodyInfos.every(info => info.body === firstBody)
  if (allSame) {
    return bodyInfos[0]
  }

  // bodyの親を辿って最小共通祖先を探す
  // まず、最初のbodyの祖先チェーンを取得
  const firstAncestors = []
  let current = bodyInfos[0].conditional
  while (current) {
    if (isFunctionScope(current) || isLoopStatement(current)) {
      break
    }

    // currentが条件分岐なら、そのbodyを候補に追加
    if (current.type === 'IfStatement') {
      // consequent, alternateをチェック
      if (current.consequent.type === 'BlockStatement') {
        firstAncestors.push({ type: 'if-body', body: current.consequent, conditional: current })
      }
      if (current.alternate && current.alternate.type !== 'IfStatement' && current.alternate.type === 'BlockStatement') {
        firstAncestors.push({ type: 'if-body', body: current.alternate, conditional: current })
      }
    } else if (current.type === 'SwitchStatement') {
      // switch文の各caseをチェック
      for (const caseNode of current.cases) {
        if (caseNode.consequent.length > 0) {
          firstAncestors.push({ type: 'case-body', body: caseNode.consequent, conditional: current })
        }
      }
    }

    current = current.parent
  }

  // 他のすべてのbodyについて、firstAncestorsの中で共通のものを探す
  for (const ancestorInfo of firstAncestors) {
    const allContained = bodyInfos.every(info => {
      // ancestorInfoのbodyがinfoのbodyまたはinfoのconditionalを含んでいるか
      return containsNode(ancestorInfo.body, info.body) || containsNode(ancestorInfo.body, info.conditional)
    })
    if (allContained) {
      return ancestorInfo
    }
  }

  return null
}

/**
 * 使用箇所が条件文のどこにあるかを判定
 */
function getUsageLocation(conditional, usageNode) {
  if (conditional.type === 'IfStatement') {
    // test（条件部分）に含まれているか
    if (containsNode(conditional.test, usageNode)) {
      return { type: 'test', body: null }
    }

    // consequent（then節）に含まれているか
    if (containsNode(conditional.consequent, usageNode)) {
      // consequent直下かチェック（別関数スコープを経由していないか）
      if (isDirectChild(conditional.consequent, usageNode)) {
        return { type: 'consequent', body: conditional.consequent }
      }
    }

    // alternate（else節）に含まれているか
    if (conditional.alternate) {
      // else if の場合
      if (conditional.alternate.type === 'IfStatement') {
        const elseIfResult = getUsageLocation(conditional.alternate, usageNode)
        if (elseIfResult) {
          return elseIfResult
        }
      } else {
        // else の場合
        if (containsNode(conditional.alternate, usageNode)) {
          if (isDirectChild(conditional.alternate, usageNode)) {
            return { type: 'alternate', body: conditional.alternate }
          }
        }
      }
    }
  } else if (conditional.type === 'SwitchStatement') {
    // discriminant（条件部分）に含まれているか
    if (containsNode(conditional.discriminant, usageNode)) {
      return { type: 'discriminant', body: null }
    }

    // どのcase/defaultに含まれているか探す
    for (const caseNode of conditional.cases) {
      for (const statement of caseNode.consequent) {
        if (containsNode(statement, usageNode)) {
          // 直下かチェック（別関数スコープを経由していないか）
          if (isDirectChildInArray(caseNode.consequent, usageNode)) {
            return { type: 'case', body: caseNode.consequent }
          }
        }
      }
    }
  }

  return null
}

/**
 * 使用箇所が配列型のbody直下にあるか（別関数スコープを経由していないか）
 */
function isDirectChildInArray(bodyArray, usageNode) {
  let current = usageNode.parent

  while (current) {
    // 関数スコープを経由したら直下ではない
    if (isFunctionScope(current)) {
      return false
    }

    // bodyArray内のstatementに到達したら直下
    if (bodyArray.includes(current)) {
      return true
    }

    current = current.parent
  }

  return false
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
 * 使用箇所がbody直下にあるか（別関数スコープを経由していないか）
 */
function isDirectChild(bodyNode, usageNode) {
  let current = usageNode.parent

  while (current && current !== bodyNode) {
    // 関数スコープを経由したら直下ではない
    if (isFunctionScope(current)) {
      return false
    }
    current = current.parent
  }

  return current === bodyNode
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
 * 変数宣言を移動するfixer関数を生成
 */
function createMoveFixer(sourceCode, variableDeclaration, targetBody, insertBeforeStatement) {
  return function(fixer) {
    const text = sourceCode.text
    const declarationText = sourceCode.getText(variableDeclaration)

    // 変数宣言の削除範囲を計算
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

    // 早期終了後への移動の場合
    if (insertBeforeStatement) {
      const targetIndent = getIndent(sourceCode, insertBeforeStatement)
      return [
        fixer.removeRange([lineStart, removeEnd]),
        fixer.insertTextBefore(insertBeforeStatement, declarationText + '\n' + targetIndent)
      ]
    }

    // 移動先に挿入
    if (Array.isArray(targetBody)) {
      // Switch caseのconsequent（配列）の場合
      if (targetBody.length > 0) {
        const firstStatement = targetBody[0]
        const targetIndent = getIndent(sourceCode, firstStatement)

        // 挿入位置 = firstStatementの行の先頭（インデント開始位置）
        const insertPos = firstStatement.range[0] - targetIndent.length

        // 削除範囲が挿入位置より前にある場合
        if (removeEnd <= insertPos) {
          // 削除範囲から挿入位置までを置換
          const middleText = text.substring(removeEnd, insertPos)
          const newText = middleText + targetIndent + declarationText + '\n'

          return [
            fixer.replaceTextRange([lineStart, insertPos], newText)
          ]
        } else {
          // 挿入位置が削除範囲より前にある場合（通常はこのケースはないはず）
          return []
        }
      }
    } else if (targetBody.type === 'BlockStatement') {
      // ブロックがある場合はbodyの先頭に挿入
      if (targetBody.body.length > 0) {
        // 移動先のインデントを取得
        const targetIndent = getIndent(sourceCode, targetBody.body[0])
        return [
          fixer.removeRange([lineStart, removeEnd]),
          fixer.insertTextBefore(targetBody.body[0], declarationText + '\n' + targetIndent)
        ]
      } else {
        // 空のブロックの場合は、開き括弧の後に挿入
        const openBrace = sourceCode.getFirstToken(targetBody)
        return [
          fixer.removeRange([lineStart, removeEnd]),
          fixer.insertTextAfter(openBrace, '\n' + declarationText)
        ]
      }
    } else {
      // ブロックがない場合（単一文）はブロック化する
      const statementText = sourceCode.getText(targetBody)
      return [
        fixer.removeRange([lineStart, removeEnd]),
        fixer.replaceText(targetBody, `{\n${declarationText}\n${statementText}\n}`)
      ]
    }

    return []
  }
}

/**
 * ノードがreturn/throw文かどうか判定
 */
function isEarlyExitStatement(node) {
  return node.type === 'ReturnStatement' || node.type === 'ThrowStatement'
}

/**
 * try-catchブロックを検出（throw文を含む場合）
 */
function findTryCatchWithThrow(node) {
  let current = node.parent

  while (current) {
    if (current.type === 'TryStatement') {
      // try内にthrowがあるかチェック
      const hasThrowInTry = containsThrow(current.block)
      const hasThrowInCatch = current.handler && containsThrow(current.handler.body)

      if (hasThrowInTry || hasThrowInCatch) {
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
function containsThrow(node) {
  if (!node || typeof node !== 'object') return false
  if (node.type === 'ThrowStatement') return true

  // 関数スコープを超えない
  if (isFunctionScope(node)) return false

  for (const key in node) {
    if (key === 'parent') continue
    const child = node[key]
    if (Array.isArray(child)) {
      if (child.some(c => containsThrow(c))) return true
    } else if (child && typeof child === 'object') {
      if (containsThrow(child)) return true
    }
  }

  return false
}

/**
 * 宣言スコープ内の早期終了（return/throw、またはtry-catch）を検出
 */
function findEarlyExits(declarationScope, variableDeclaration) {
  const statements = declarationScope.body || declarationScope.statements || []
  const declarationIndex = statements.indexOf(variableDeclaration)
  const earlyExits = []

  // 宣言より後のstatementを探索
  for (let i = declarationIndex + 1; i < statements.length; i++) {
    const statement = statements[i]

    // try-catchブロック（throw含む）を検出
    if (statement.type === 'TryStatement') {
      const hasThrowInTry = containsThrow(statement.block)
      const hasThrowInCatch = statement.handler && containsThrow(statement.handler.body)

      if (hasThrowInTry || hasThrowInCatch) {
        earlyExits.push({
          type: 'try-catch',
          node: statement,
          index: i,
        })
        continue
      }
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
  if (!node || typeof node !== 'object') return

  // 関数スコープを超えない
  if (isFunctionScope(node)) return

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
    if (Array.isArray(child)) {
      child.forEach(c => collectEarlyExitsFromNode(c, earlyExits, statementIndex))
    } else if (child && typeof child === 'object') {
      collectEarlyExitsFromNode(child, earlyExits, statementIndex)
    }
  }
}

/**
 * 変数が早期終了前で使用されているかチェック
 */
function isUsedBeforeEarlyExit(varName, declarationNode, earlyExit, declarationScope) {
  const variableDeclaration = declarationNode.parent
  const statements = declarationScope.body || declarationScope.statements || []
  const declarationIndex = statements.indexOf(variableDeclaration)

  // 早期終了のインデックスを取得
  let earlyExitIndex
  if (earlyExit.type === 'try-catch') {
    earlyExitIndex = earlyExit.index
  } else {
    earlyExitIndex = earlyExit.statementIndex
  }

  // 宣言から早期終了までのstatementをチェック
  for (let i = declarationIndex + 1; i <= earlyExitIndex; i++) {
    const statement = statements[i]

    if (earlyExit.type === 'try-catch' && statement === earlyExit.node) {
      // try-catchブロック内での使用をチェック
      if (containsVariableUsage(earlyExit.node.block, varName, declarationNode)) {
        return true
      }
      if (earlyExit.node.handler && containsVariableUsage(earlyExit.node.handler.body, varName, declarationNode)) {
        return true
      }
      if (earlyExit.node.finalizer && containsVariableUsage(earlyExit.node.finalizer, varName, declarationNode)) {
        return true
      }
    } else if (earlyExit.type !== 'try-catch') {
      // 早期終了文を含むstatement内での使用をチェック
      if (containsVariableUsageBeforeEarlyExit(statement, varName, declarationNode, earlyExit.node)) {
        return true
      }
    }
  }

  return false
}

/**
 * 早期終了文より前で変数が使用されているかチェック
 */
function containsVariableUsageBeforeEarlyExit(node, varName, declarationNode, earlyExitNode) {
  if (!node || typeof node !== 'object') return false
  if (node === earlyExitNode) return false // 早期終了文自体は除外

  // 変数の使用を検出
  if (node.type === 'Identifier' && node.name === varName && node !== declarationNode.id) {
    return true
  }

  // 関数スコープを超えない
  if (isFunctionScope(node)) return false

  for (const key in node) {
    if (key === 'parent') continue
    const child = node[key]
    if (Array.isArray(child)) {
      if (child.some(c => containsVariableUsageBeforeEarlyExit(c, varName, declarationNode, earlyExitNode))) {
        return true
      }
    } else if (child && typeof child === 'object') {
      if (containsVariableUsageBeforeEarlyExit(child, varName, declarationNode, earlyExitNode)) {
        return true
      }
    }
  }

  return false
}

/**
 * ノード内で変数が使用されているかチェック
 */
function containsVariableUsage(node, varName, declarationNode) {
  if (!node || typeof node !== 'object') return false

  if (node.type === 'Identifier' && node.name === varName && node !== declarationNode.id) {
    return true
  }

  for (const key in node) {
    if (key === 'parent') continue
    const child = node[key]
    if (Array.isArray(child)) {
      if (child.some(c => containsVariableUsage(c, varName, declarationNode))) return true
    } else if (child && typeof child === 'object') {
      if (containsVariableUsage(child, varName, declarationNode)) return true
    }
  }

  return false
}

/**
 * 早期終了後への移動をチェック
 */
function checkEarlyExitMove(sourceCode, node, varName, usages, variableDeclaration, declarationScope) {
  const earlyExits = findEarlyExits(declarationScope, variableDeclaration)
  if (earlyExits.length === 0) return null

  const statements = declarationScope.body || declarationScope.statements || []
  const declarationIndex = statements.indexOf(variableDeclaration)

  // 各早期終了について、変数が早期終了前で使用されているかチェック
  for (const earlyExit of earlyExits) {
    // 早期終了前で変数が使用されている場合はスキップ
    if (isUsedBeforeEarlyExit(varName, node, earlyExit, declarationScope)) {
      continue
    }

    // 早期終了の位置を取得
    let earlyExitIndex
    if (earlyExit.type === 'try-catch') {
      earlyExitIndex = earlyExit.index
    } else {
      earlyExitIndex = earlyExit.statementIndex
    }

    // すべての使用箇所が早期終了の後にあるかチェック
    const allUsagesAfterEarlyExit = usages.every(usage => {
      // 使用箇所が含まれるstatementのインデックスを探す
      for (let i = 0; i < statements.length; i++) {
        if (containsNode(statements[i], usage)) {
          return i > earlyExitIndex
        }
      }
      return false
    })

    if (allUsagesAfterEarlyExit && usages.length > 0) {
      // 最初の使用箇所を見つける
      let firstUsageIndex = statements.length
      for (const usage of usages) {
        for (let i = 0; i < statements.length; i++) {
          if (containsNode(statements[i], usage)) {
            firstUsageIndex = Math.min(firstUsageIndex, i)
            break
          }
        }
      }

      // 早期終了の直後、最初の使用箇所の前に移動
      if (firstUsageIndex > earlyExitIndex) {
        return {
          node,
          varName,
          variableDeclaration,
          targetBody: null, // 早期終了後への移動の場合、targetBodyではなく挿入位置を使う
          insertBeforeStatement: statements[firstUsageIndex],
          moveType: 'after-early-exit',
        }
      }
    }
  }

  return null
}

/**
 * 変数が移動対象かどうかを判定
 */
function analyzeVariable(sourceCode, node) {
  // const/let のみ対象（varは除外）
  if (node.parent.kind === 'var') return null
  if (node.id.type !== 'Identifier') return null

  // ループ変数は対象外（for-in, for-of, for文のinit部分）
  const varDecl = node.parent
  if (varDecl.parent && isLoopStatement(varDecl.parent)) {
    return null
  }

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
    // 関数スコープがあったら対象外
    if (isFunctionScope(current)) {
      return null
    }
    // ループがあったら対象外
    if (isLoopStatement(current)) {
      return null
    }
    current = current.parent
  }

  // 宣言と条件文の間の位置関係をチェック
  const statements = declarationScope.body || declarationScope.statements || []
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

  return {
    node,
    varName,
    variableDeclaration,
    targetBody,
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
            analysis.insertBeforeStatement
          ),
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
