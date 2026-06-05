const {
  isFunctionScope,
  isLoopStatement,
  getStatements,
  containsAwait,
  containsNode,
  calculateComplexity,
  needsParentheses,
} = require('../../libs/ast-utils')

const SCHEMA = [
  {
    type: 'object',
    properties: {
      maxComplexity: {
        type: 'integer',
        minimum: 0,
        default: 5,
      },
    },
    additionalProperties: false,
  },
]

/**
 * 複雑さ以外の理由でスキップすべきかを判定
 */
function shouldSkipVariableExceptComplexity(node) {
  if (
    // const/let のみ対象（varは除外）
    node.parent.kind === 'var' ||
    // 分割代入は除外（将来的に対応予定: ArrayPattern, ObjectPattern）
    node.id.type !== 'Identifier' ||
    // 初期化なしは除外
    !node.init ||
    // ループ変数は対象外（for-in, for-of, for文のinit部分）
    (node.parent.parent && isLoopStatement(node.parent.parent)) ||
    // await式を含む変数は対象外（非同期処理の実行タイミングが変わるため）
    containsAwait(node.init)
  ) {
    return true
  }

  switch (node.init.type) {
    case 'CallExpression': {
      // React Hooks（useXxxで始まる関数）で初期化される変数は対象外
      if (node.init.callee.type === 'Identifier' && node.init.callee.name.startsWith('use')) {
        return true
      }

      break
    }
    // 関数式は除外（インライン化時に括弧が必要になり、可読性が下がるため）
    case 'ArrowFunctionExpression':
    case 'FunctionExpression':
    // TaggedTemplateExpressionは除外（styled componentなど）
    case 'TaggedTemplateExpression':
      return true
  }

  // export宣言された変数は除外（他のファイルから使用される可能性があるため）
  let current = node.parent
  while (current) {
    switch (current.type) {
      case 'ExportNamedDeclaration':
      case 'ExportDefaultDeclaration':
        return true
    }

    current = current.parent
  }

  return false
}

/**
 * 型注釈のテキストを取得
 * @param {object} sourceCode - SourceCode
 * @param {object} node - VariableDeclaratorノード
 * @returns {string|null} 型注釈のテキスト（`: Type`の形式から`Type`部分のみ）
 */
function getTypeAnnotationText(sourceCode, node) {
  if (node.id.typeAnnotation) {
    const typeAnnotation = node.id.typeAnnotation
    const typeText = sourceCode.getText(typeAnnotation)
    // `: Type` の形式から `: ` を除去
    return typeText.replace(/^:\s*/, '')
  }
  return null
}

/**
 * 使用箇所の複雑さを計算
 * @param {object} usageNode - 使用箇所のノード
 * @param {number} [maxComplexity] - 最大複雑さ（この値に達したら計算を中断）
 */
function calculateUsageComplexity(usageNode, maxComplexity) {
  // 使用箇所が含まれるステートメントを探す
  let current = usageNode.parent
  while (current) {
    switch (current.type) {
      case 'ExpressionStatement':
      case 'ReturnStatement':
      case 'IfStatement':
      case 'SwitchStatement':
      case 'VariableDeclaration':
        return calculateComplexity(current, maxComplexity)
    }

    current = current.parent
  }
  return 0
}

/**
 * 変数がreturn文で単一の変数として使用されているかを判定
 * return x → true
 * return x.property → false
 * return func(x) → false
 */
function isUsedInReturnStatement(usageNode) {
  let current = usageNode.parent
  while (current) {
    if (current.type === 'ReturnStatement') {
      // return文の引数が単一の変数（Identifier）である場合のみtrue
      return current.argument && current.argument.type === 'Identifier' && current.argument === usageNode
    } else if (isFunctionScope(current)) {
      // 関数スコープを超えたら終了
      return false
    }

    current = current.parent
  }

  return false
}

/**
 * 同一スコープ内で変数が使用される回数をカウント
 * ループ内、関数スコープ内で使用される場合はバリアとして除外
 */
function getVariableUsagesInScope(sourceCode, varName, declarationNode) {
  const usages = []
  const variableDeclaration = declarationNode.parent
  let scopeNode = variableDeclaration.parent

  // BlockStatementまたはProgramまで遡る
  while (scopeNode && scopeNode.type !== 'Program' && scopeNode.type !== 'BlockStatement') {
    scopeNode = scopeNode.parent
  }

  if (!scopeNode) return { usages: [], crossedBarrier: false }

  let crossedBarrier = false

  /**
   * ノードが宣言の初期化式の中にあるかチェック
   */
  function isInsideInit(node) {
    let current = node
    while (current) {
      if (current === declarationNode.init) return true
      if (current === declarationNode) return false

      current = current.parent
    }
    return false
  }

  /**
   * 同一スコープ内のみを探索（ループ・関数スコープはバリア）
   */
  function traverse(node) {
    if (!node || typeof node !== 'object') return

    // バリアを検出
    if (isFunctionScope(node) || isLoopStatement(node)) {
      crossedBarrier = true
      return
    }

    // 変数名が一致するIdentifierを収集（宣言自体と初期化式内は除外）
    if (node.type === 'Identifier' && node.name === varName && node !== declarationNode.id && !isInsideInit(node)) {
      usages.push(node)
      return
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

  if (declarationIndex === -1) return { usages: [], crossedBarrier: false }

  for (let i = declarationIndex + 1; i < statements.length; i++) {
    traverse(statements[i])
  }

  return { usages, crossedBarrier }
}

/**
 * インライン化のfixer関数を生成
 */
function createInlineFixer(sourceCode, declarationNode, usage, typeAnnotation) {
  return function(fixer) {
    const variableDeclaration = declarationNode.parent
    let initText = sourceCode.getText(declarationNode.init)

    // 使用箇所が単項演算子の引数の場合は括弧が必要
    const usageNeedsParentheses = usage.parent && usage.parent.type === 'UnaryExpression' && usage.parent.argument === usage

    // 型注釈がある場合は as Type を追加
    if (typeAnnotation) {
      initText = `(${initText} as ${typeAnnotation})`
    } else if (needsParentheses(declarationNode.init) || usageNeedsParentheses) {
      // 括弧が必要な式の場合は括弧で囲む
      initText = `(${initText})`
    }

    // 使用箇所がExpressionStatementの先頭にある場合、セミコロンを前置
    // （前の文とのメソッドチェーンを防ぐため）
    const isAtStart = isAtStartOfExpressionStatement(usage)
    if (isAtStart) {
      initText = `;${initText}`
    }

    // VariableDeclarationに含まれるdeclaratorが1つだけの場合は行全体を削除
    if (variableDeclaration.declarations.length === 1) {
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

      return [
        fixer.removeRange([lineStart, removeEnd]),
        fixer.replaceText(usage, initText)
      ]
    }

    // 複数のdeclaratorがある場合は、このdeclaratorのみを削除
    // const x = 1, y = 2 のようなケース
    const declarators = variableDeclaration.declarations
    const index = declarators.indexOf(declarationNode)

    if (index === -1) return []

    // 最初のdeclarator
    if (index === 0) {
      // 次のdeclaratorの前のカンマまで削除
      const nextDeclarator = declarators[1]
      return [
        fixer.removeRange([declarationNode.range[0], nextDeclarator.range[0]]),
        fixer.replaceText(usage, initText)
      ]
    }

    // 最後以外のdeclarator: カンマを含めて削除
    const prevDeclarator = declarators[index - 1]
    return [
      fixer.removeRange([prevDeclarator.range[1], declarationNode.range[1]]),
      fixer.replaceText(usage, initText)
    ]
  }
}

/**
 * 使用箇所がExpressionStatementの式の先頭（左端）にあるかチェック
 * 例: input.setSelectionRange(0, 0) のinputは先頭
 *     console.log(x) のxは先頭ではない（consoleが先頭）
 */
function isAtStartOfExpressionStatement(usageNode) {
  let current = usageNode
  let parent = usageNode.parent

  // 親を辿って、ExpressionStatementに到達するまでチェック
  while (parent) {
    if (parent.type === 'ExpressionStatement') {
      // ExpressionStatementの式が現在のノードである場合、先頭
      return parent.expression === current
    }

    // 親ノードのタイプによって、currentが左端（先頭）にあるかチェック
    if (parent.type === 'MemberExpression') {
      // obj.property の場合、objが左端
      if (parent.object !== current) {
        return false
      }
    } else if (parent.type === 'CallExpression') {
      // func(arg) の場合、funcが左端（argは先頭ではない）
      if (parent.callee !== current) {
        return false
      }
    } else if (parent.type === 'UnaryExpression') {
      // !x の場合、xが左端（単項演算子の引数）
      // これは先頭と見なす
    } else if (parent.type === 'TSAsExpression' || parent.type === 'TSTypeAssertion') {
      // (x as Type) の場合、xが左端
      if (parent.expression !== current) {
        return false
      }
    } else {
      // それ以外の構造（BinaryExpression、LogicalExpressionなど）
      // これらは先頭ではない
      return false
    }

    current = parent
    parent = parent.parent
  }
  return false
}

/**
 * 変数が不要な変数化かどうかを判定
 */
function analyzeVariable(sourceCode, node, options = {}) {
  const maxComplexity = options.maxComplexity ?? 5

  // 複雑さ以外の理由でスキップ
  if (shouldSkipVariableExceptComplexity(node)) return null

  const varName = node.id.name
  const { usages, crossedBarrier } = getVariableUsagesInScope(sourceCode, varName, node)

  // バリアを超えている場合は対象外
  if (crossedBarrier) return null

  // 使用回数が1回のみ
  if (usages.length === 1) {
    const usage = usages[0]
    const isReturnUsage = isUsedInReturnStatement(usage)

    // 型注釈がある場合は複雑度+1
    const typeAnnotation = getTypeAnnotationText(sourceCode, node)
    const typeComplexity = typeAnnotation ? 1 : 0

    // return文の場合は、移動元の複雑さチェックをスキップ
    const sourceComplexity = isReturnUsage ? 0 : calculateComplexity(node.init, maxComplexity + 1) + typeComplexity

    // sourceComplexityがmaxComplexityを超えている場合は早期終了
    if (sourceComplexity > maxComplexity) {
      return null
    }

    // 残りの許容複雑さを計算
    const remainingComplexity = maxComplexity - sourceComplexity + 1
    const targetComplexity = calculateUsageComplexity(usage, remainingComplexity)
    const totalComplexity = sourceComplexity + targetComplexity

    // 合計の複雑さがmaxComplexityを超える場合はスキップ
    if (totalComplexity > maxComplexity) {
      return null
    }

    return {
      node,
      varName,
      usage,
      typeAnnotation,
    }
  }

  return null
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
      inlineVariable: '変数"{{name}}"は一度しか使用されていません。直接使用してください。',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode()
    const options = context.options[0] || {}

    return {
      'VariableDeclarator': (node) => {
        const analysis = analyzeVariable(sourceCode, node, options)
        if (!analysis) return

        context.report({
          node: analysis.node,
          messageId: 'inlineVariable',
          data: { name: analysis.varName },
          fix: createInlineFixer(sourceCode, analysis.node, analysis.usage, analysis.typeAnnotation),
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
