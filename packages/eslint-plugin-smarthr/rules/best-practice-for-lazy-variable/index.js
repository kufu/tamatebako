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
 * 変数の全ての使用箇所を取得（宣言と同じスコープ内のみ）
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
   * ASTを再帰的に探索（関数スコープを超えない）
   */
  function traverse(node, insideFunctionScope = false) {
    if (!node || typeof node !== 'object') return

    // 関数スコープに入ったらフラグを立てる
    if (isFunctionScope(node)) {
      insideFunctionScope = true
    }

    // 変数名が一致するIdentifierを収集（宣言自体は除外）
    if (node.type === 'Identifier' &&
        node.name === varName &&
        node !== declarationNode.id) {
      // 関数スコープ内の参照は収集しない
      if (!insideFunctionScope) {
        usages.push(node)
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
        child.forEach(c => traverse(c, insideFunctionScope))
      } else if (child && typeof child === 'object' && child.type) {
        traverse(child, insideFunctionScope)
      }
    }
  }

  // 宣言以降のノードのみを探索
  const statements = scopeNode.body || scopeNode.statements || []
  const declarationIndex = statements.indexOf(variableDeclaration)

  for (let i = declarationIndex + 1; i < statements.length; i++) {
    traverse(statements[i], false)
  }

  return usages
}

/**
 * ノードの親を辿って、if/else if/elseを探す
 * 途中で関数スコープを超えたらnullを返す
 */
function findParentIfStatement(node, declarationScope) {
  let current = node.parent

  while (current) {
    // 関数スコープを超えたら探索終了
    if (isFunctionScope(current)) {
      return null
    }

    // if文を見つけた
    if (current.type === 'IfStatement') {
      // if文が宣言と同じ階層にあるかチェック
      let ifParent = current.parent
      while (ifParent && ifParent.type !== 'Program' && ifParent.type !== 'BlockStatement') {
        ifParent = ifParent.parent
      }

      if (ifParent === declarationScope) {
        return current
      }

      // 同じ階層にない（ネストしている）場合は探索終了
      return null
    }

    current = current.parent
  }

  return null
}

/**
 * 使用箇所がif文のどこにあるかを判定
 */
function getUsageLocation(ifStatement, usageNode) {
  if (ifStatement.type === 'IfStatement') {
    // test（条件部分）に含まれているか
    if (containsNode(ifStatement.test, usageNode)) {
      return { type: 'test', body: null }
    }

    // consequent（then節）に含まれているか
    if (containsNode(ifStatement.consequent, usageNode)) {
      // consequent直下かチェック（別関数スコープを経由していないか）
      if (isDirectChild(ifStatement.consequent, usageNode)) {
        return { type: 'consequent', body: ifStatement.consequent }
      }
    }

    // alternate（else節）に含まれているか
    if (ifStatement.alternate) {
      // else if の場合
      if (ifStatement.alternate.type === 'IfStatement') {
        const elseIfResult = getUsageLocation(ifStatement.alternate, usageNode)
        if (elseIfResult) {
          return elseIfResult
        }
      } else {
        // else の場合
        if (containsNode(ifStatement.alternate, usageNode)) {
          if (isDirectChild(ifStatement.alternate, usageNode)) {
            return { type: 'alternate', body: ifStatement.alternate }
          }
        }
      }
    }
  }

  return null
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
function createMoveFixer(sourceCode, variableDeclaration, targetBody) {
  return function(fixer) {
    const text = sourceCode.text
    const declarationText = sourceCode.getText(variableDeclaration)

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

    // 移動先に挿入
    if (Array.isArray(targetBody)) {
      // Switch caseのconsequent（配列）の場合
      if (targetBody.length > 0) {
        // 先頭のstatementの前に挿入
        const targetIndent = getIndent(sourceCode, targetBody[0])
        fixes.push(fixer.insertTextBefore(targetBody[0], declarationText + '\n' + targetIndent))
      }
    } else if (targetBody.type === 'BlockStatement') {
      // ブロックがある場合はbodyの先頭に挿入
      if (targetBody.body.length > 0) {
        // 移動先のインデントを取得
        const targetIndent = getIndent(sourceCode, targetBody.body[0])
        fixes.push(fixer.insertTextBefore(targetBody.body[0], declarationText + '\n' + targetIndent))
      } else {
        // 空のブロックの場合は、開き括弧の後に挿入
        const openBrace = sourceCode.getFirstToken(targetBody)
        fixes.push(fixer.insertTextAfter(openBrace, '\n' + declarationText))
      }
    } else {
      // ブロックがない場合（単一文）はブロック化する
      const statementText = sourceCode.getText(targetBody)
      fixes.push(fixer.replaceText(targetBody, `{\n${declarationText}\n${statementText}\n}`))
    }

    return fixes
  }
}

/**
 * 変数が移動対象かどうかを判定
 */
function analyzeVariable(sourceCode, node) {
  // const/let のみ対象（varは除外）
  if (node.parent.kind === 'var') return null
  if (node.id.type !== 'Identifier') return null

  const varName = node.id.name
  const usages = getVariableUsages(sourceCode, varName, node)

  // 使用箇所が1回でない場合はスキップ
  if (usages.length !== 1) return null

  const usageNode = usages[0]

  // 宣言のスコープを取得
  const variableDeclaration = node.parent
  let declarationScope = variableDeclaration.parent

  // BlockStatementまたはProgramまで遡る
  while (declarationScope && declarationScope.type !== 'Program' && declarationScope.type !== 'BlockStatement') {
    declarationScope = declarationScope.parent
  }

  if (!declarationScope) return null

  // 使用箇所を含むif文を探す
  const ifStatement = findParentIfStatement(usageNode, declarationScope)
  if (!ifStatement) return null

  // 使用箇所がif文のどこにあるか判定
  const usageLocation = getUsageLocation(ifStatement, usageNode)

  // 条件部分で使用されている場合は対象外（body直下でない）
  if (!usageLocation || !usageLocation.body) return null

  // 移動先のbodyを取得
  const targetBody = usageLocation.body

  // 宣言と使用箇所の間にコードがあるかチェック
  const statements = declarationScope.body || declarationScope.statements || []
  const declarationIndex = statements.indexOf(variableDeclaration)

  // if文のインデックスを探す
  let ifStatementIndex = -1
  for (let i = 0; i < statements.length; i++) {
    if (containsNode(statements[i], ifStatement)) {
      ifStatementIndex = i
      break
    }
  }

  if (ifStatementIndex === -1 || ifStatementIndex <= declarationIndex) return null

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
            analysis.targetBody
          ),
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
