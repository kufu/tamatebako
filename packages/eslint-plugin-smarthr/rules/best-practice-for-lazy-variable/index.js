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
 * ノードの親を辿って、if/else if/elseまたはswitchを探す
 * 途中で関数スコープを超えたらnullを返す
 */
function findParentConditional(node, declarationScope) {
  let current = node.parent

  while (current) {
    // 関数スコープを超えたら探索終了
    if (isFunctionScope(current)) {
      return null
    }

    // if文またはswitch文を見つけた
    if (current.type === 'IfStatement' || current.type === 'SwitchStatement') {
      // 条件文が宣言と同じ階層にあるかチェック
      let conditionalParent = current.parent
      while (conditionalParent && conditionalParent.type !== 'Program' && conditionalParent.type !== 'BlockStatement') {
        conditionalParent = conditionalParent.parent
      }

      if (conditionalParent === declarationScope) {
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
function createMoveFixer(sourceCode, variableDeclaration, targetBody) {
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

  // 使用箇所を含む条件文を探す
  const conditional = findParentConditional(usageNode, declarationScope)
  if (!conditional) return null

  // 使用箇所が条件文のどこにあるか判定
  const usageLocation = getUsageLocation(conditional, usageNode)

  // 条件部分で使用されている場合は対象外（body直下でない）
  if (!usageLocation || !usageLocation.body) return null

  // 移動先のbodyを取得
  const targetBody = usageLocation.body

  // 宣言と使用箇所の間にコードがあるかチェック
  const statements = declarationScope.body || declarationScope.statements || []
  const declarationIndex = statements.indexOf(variableDeclaration)

  // 条件文のインデックスを探す
  let conditionalIndex = -1
  for (let i = 0; i < statements.length; i++) {
    if (containsNode(statements[i], conditional)) {
      conditionalIndex = i
      break
    }
  }

  if (conditionalIndex === -1 || conditionalIndex <= declarationIndex) return null

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
