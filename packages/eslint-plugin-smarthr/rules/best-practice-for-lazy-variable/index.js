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
 * ノードから最も近い条件分岐ノードを取得
 * 条件部分（test）で使用される場合は、その条件分岐自体を返す
 * body内で使用される場合も、その条件分岐を返す
 */
function getNearestConditional(node) {
  let current = node.parent
  while (current) {
    if (CONDITIONAL_TYPES.has(current.type)) {
      return current
    }
    // 関数スコープを超えたら終了
    if (current.type === 'FunctionDeclaration' ||
        current.type === 'FunctionExpression' ||
        current.type === 'ArrowFunctionExpression') {
      return null
    }
    // ループは条件分岐として扱わない（事前計算を許可）
    if (current.type === 'ForStatement' ||
        current.type === 'ForInStatement' ||
        current.type === 'ForOfStatement' ||
        current.type === 'WhileStatement' ||
        current.type === 'DoWhileStatement') {
      return null
    }
    current = current.parent
  }
  return null
}

/**
 * ノードが条件部分で使用されているか（test, left, rightなど）
 * body内ではなく、条件分岐の判定部分で使われているか
 */
function isUsedInConditionalTest(identifier) {
  let current = identifier
  while (current) {
    const parent = current.parent
    if (!parent) return false

    // IfStatement, ConditionalExpression, LogicalExpression, SwitchStatement
    if (parent.type === 'IfStatement') {
      // testの中にいるか
      return containsNode(parent.test, identifier)
    }
    if (parent.type === 'ConditionalExpression') {
      // test, consequent, alternateのいずれか → testの場合のみtrue
      return containsNode(parent.test, identifier)
    }
    if (parent.type === 'LogicalExpression') {
      // left, rightのいずれか → これは条件部分として扱う
      return true
    }
    if (parent.type === 'SwitchStatement') {
      // discriminantの中にいるか
      return containsNode(parent.discriminant, identifier)
    }

    // 条件分岐ノードに到達したら終了
    if (CONDITIONAL_TYPES.has(parent.type)) {
      return false
    }

    current = parent
  }
  return false
}

/**
 * ノードが条件分岐の内部にあるかチェック
 */
function isInsideConditional(node) {
  return getNearestConditional(node) !== null
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
 * 変数の全ての参照（Identifier）を取得
 */
function getVariableReferences(sourceCode, varName, declarationNode) {
  const references = []
  const ast = sourceCode.ast

  function traverse(node, parent) {
    if (!node || typeof node !== 'object') return

    // Identifierで変数名が一致するもの
    if (node.type === 'Identifier' && node.name === varName) {
      // 宣言自体は除外
      if (node !== declarationNode.id) {
        references.push({ identifier: node, parent })
      }
    }

    // 関数スコープを超えない（ネストした関数内は探索しない）
    if (node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression') {
      // 関数のbodyは探索しない
      return
    }

    // ブロックスコープで再宣言されている場合はスキップ
    if (node.type === 'VariableDeclarator' && node !== declarationNode) {
      if (node.id.type === 'Identifier' && node.id.name === varName) {
        return
      }
    }

    // 子ノードを再帰的に探索
    for (const key in node) {
      if (key === 'parent') continue // 親ノードへの参照は無視
      const child = node[key]
      if (Array.isArray(child)) {
        child.forEach(c => traverse(c, node))
      } else if (child && typeof child === 'object' && child.type) {
        traverse(child, node)
      }
    }
  }

  // 宣言ノードの親（VariableDeclaration）から探索開始
  // 宣言より前の参照は対象外
  const variableDeclaration = declarationNode.parent
  let current = variableDeclaration.parent

  // BlockStatement, Program などのスコープを探す
  while (current && current.type !== 'Program' && current.type !== 'BlockStatement') {
    current = current.parent
  }

  if (current) {
    // 宣言以降のノードのみを探索
    const statements = current.body || current.statements || []
    const declarationIndex = statements.indexOf(variableDeclaration)

    for (let i = declarationIndex + 1; i < statements.length; i++) {
      traverse(statements[i], current)
    }
  }

  return references
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

        // 変数名を取得
        if (node.id.type !== 'Identifier') return
        const varName = node.id.name

        // 変数の全参照を取得
        const references = getVariableReferences(sourceCode, varName, node)

        // 参照がない場合はスキップ
        if (references.length === 0) return

        // 各参照について、条件分岐との関係を調べる
        const refInfo = references.map(ref => ({
          identifier: ref.identifier,
          conditional: getNearestConditional(ref.identifier),
          isInTest: isUsedInConditionalTest(ref.identifier),
        }))

        // 条件分岐と関係ない参照がある場合は対象外
        if (refInfo.some(info => info.conditional === null)) return

        // 複数の異なる条件分岐で使用される場合は対象外
        const uniqueConditionals = new Set(refInfo.map(info => info.conditional))
        if (uniqueConditionals.size > 1) return

        // 単一の条件分岐内のみで使用される
        const targetConditional = refInfo[0].conditional

        // 宣言と条件分岐の間に他のコードがあるか確認
        const variableDeclaration = node.parent
        const declarationParent = variableDeclaration.parent

        if (!declarationParent || !declarationParent.body) return

        const statements = declarationParent.body
        const declarationIndex = statements.indexOf(variableDeclaration)

        // 条件分岐を含む文を探す
        let conditionalStatementIndex = -1
        for (let i = declarationIndex + 1; i < statements.length; i++) {
          if (containsNode(statements[i], targetConditional)) {
            conditionalStatementIndex = i
            break
          }
        }

        if (conditionalStatementIndex === -1) return

        // 間に他のコードがあるかチェック
        const hasCodeBetween = conditionalStatementIndex > declarationIndex + 1

        if (hasCodeBetween) {
          context.report({
            node,
            messageId: 'moveToLazy',
            data: { name: varName },
            fix(fixer) {
              // 条件部分で使用されているか確認
              const usedInTest = refInfo.some(info => info.isInTest)

              // 元の宣言文を取得
              const declarationText = sourceCode.getText(variableDeclaration)

              // 元の宣言を削除
              const fixes = [fixer.remove(variableDeclaration)]

              if (usedInTest) {
                // 条件部分で使用 → 条件文の直前に移動
                const conditionalStatement = statements[conditionalStatementIndex]
                fixes.push(fixer.insertTextBefore(conditionalStatement, declarationText + '\n'))
              } else {
                // body内で使用 → body内の最初の使用直前に移動
                const body = getConditionalBody(targetConditional)

                if (body && body.length > 0) {
                  // bodyの最初の文の前に挿入
                  fixes.push(fixer.insertTextBefore(body[0], declarationText + '\n'))
                } else {
                  // bodyが空の場合は条件文の直前に移動
                  const conditionalStatement = statements[conditionalStatementIndex]
                  fixes.push(fixer.insertTextBefore(conditionalStatement, declarationText + '\n'))
                }
              }

              return fixes
            }
          })
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
