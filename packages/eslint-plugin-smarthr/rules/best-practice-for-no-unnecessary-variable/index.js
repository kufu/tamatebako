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
      fix: {
        type: 'boolean',
        default: false,
      },
    },
    additionalProperties: false,
  },
]

// 定数定義
const UPPER_SNAKE_CASE_PATTERN = /^[A-Z0-9_]+$/
const STATEMENT_TYPES = ['ExpressionStatement', 'ReturnStatement', 'IfStatement', 'SwitchStatement', 'VariableDeclaration']
const EXPORT_TYPES = ['ExportNamedDeclaration', 'ExportDefaultDeclaration']
const EXCLUDED_INIT_TYPES = ['ArrowFunctionExpression', 'FunctionExpression', 'TaggedTemplateExpression']

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
    containsAwait(node.init) ||
    // UPPER_SNAKE_CASE形式の定数は除外（慣習的な定数命名）
    UPPER_SNAKE_CASE_PATTERN.test(node.id.name) ||
    // 関数式、TaggedTemplateExpressionは除外
    EXCLUDED_INIT_TYPES.includes(node.init.type)
  ) {
    return true
  }

  // export宣言された変数は除外（他のファイルから使用される可能性があるため）
  let current = node.parent
  while (current) {
    if (EXPORT_TYPES.includes(current.type)) {
      return true
    }
    current = current.parent
  }

  return false
}

/**
 * React Hooksで初期化されているかを判定
 */
function isReactHookCall(node) {
  return node.init &&
         node.init.type === 'CallExpression' &&
         node.init.callee.type === 'Identifier' &&
         node.init.callee.name.startsWith('use')
}

/**
 * 型注釈のテキストを取得
 * @param {object} sourceCode - SourceCode
 * @param {object} node - VariableDeclaratorノード
 * @returns {string|null} 型注釈のテキスト（`: Type`の形式から`Type`部分のみ）
 */
function getTypeAnnotationText(sourceCode, node) {
  return node.id.typeAnnotation
    // `: Type` の形式から `: ` を除去
    ? sourceCode.getText(node.id.typeAnnotation).replace(/^:\s*/, '')
    : null
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
    if (STATEMENT_TYPES.includes(current.type)) {
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
  while (scopeNode && scopeNode.type !== 'BlockStatement' && scopeNode.type !== 'Program') {
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
      switch (current) {
        case declarationNode: {
          return false
        }
        case declarationNode.init: {
          return true
        }
      }

      current = current.parent
    }

    return false
  }

  /**
   * 変数の使用箇所として収集すべきIdentifierかチェック
   */
  function isTargetIdentifier(node) {
    return node.type === 'Identifier' &&
           node.name === varName &&
           node !== declarationNode.id &&
           !isInsideInit(node)
  }

  /**
   * 同名変数の再宣言かチェック
   */
  function isRedeclaration(node) {
    return node.type === 'VariableDeclarator' &&
           node !== declarationNode &&
           node.id.type === 'Identifier' &&
           node.id.name === varName
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
    if (isTargetIdentifier(node)) {
      usages.push(node)
      return
    }

    // 同名変数の再宣言がある場合はその先を探索しない
    if (isRedeclaration(node)) {
      return
    }

    // 子ノードを再帰的に探索
    for (const key in node) {
      if (key !== 'parent') {
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
 * 行全体を削除する範囲を取得
 */
function getLineRemovalRange(sourceCode, variableDeclaration) {
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

  return [lineStart, removeEnd]
}

/**
 * 複数declaratorから特定のものを削除する範囲を取得
 */
function getDeclaratorRemovalRange(declarationNode, variableDeclaration) {
  const declarators = variableDeclaration.declarations
  const index = declarators.indexOf(declarationNode)

  switch (index) {
    case -1:
      return null
    // 最初のdeclarator: 次のdeclaratorの前のカンマまで削除
    case 0:
      return [declarationNode.range[0], declarators[1].range[0]]
  }

  // 最後以外のdeclarator: カンマを含めて削除
  return [declarators[index - 1].range[1], declarationNode.range[1]]
}

/**
 * インライン化用のテキストを準備
 */
function prepareInlineText(sourceCode, declarationNode, usage, typeAnnotation) {
  let initText = sourceCode.getText(declarationNode.init)

  // 型注釈がある場合は as Type を追加
  if (typeAnnotation) {
    initText = `(${initText} as ${typeAnnotation})`
  } else if (
    needsParentheses(declarationNode.init) ||
    // 使用箇所が単項演算子の引数の場合は括弧が必要
    usage.parent && usage.parent.type === 'UnaryExpression' && usage.parent.argument === usage
  ) {
    // 括弧が必要な式の場合は括弧で囲む
    initText = `(${initText})`
  }

  // 使用箇所がExpressionStatementの先頭にある場合、セミコロンを前置
  if (isAtStartOfExpressionStatement(usage)) {
    initText = `;${initText}`
  }

  return initText
}

/**
 * インライン化のfixer関数を生成
 */
function createInlineFixer(sourceCode, declarationNode, usage, typeAnnotation) {
  return function(fixer) {
    const variableDeclaration = declarationNode.parent

    // 単一declaratorの場合は行全体を削除
    if (variableDeclaration.declarations.length === 1) {
      return [
        fixer.removeRange(getLineRemovalRange(sourceCode, variableDeclaration)),
        fixer.replaceText(usage, prepareInlineText(sourceCode, declarationNode, usage, typeAnnotation))
      ]
    }

    // 複数declaratorの場合は該当部分のみを削除
    const range = getDeclaratorRemovalRange(declarationNode, variableDeclaration)

    return range
      ? [
          fixer.removeRange(range),
          fixer.replaceText(usage, prepareInlineText(sourceCode, declarationNode, usage, typeAnnotation))
        ]
      : []
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
    switch (parent.type) {
      case 'ExpressionStatement':
        return parent.expression === current
      // ここから下のcaseで親ノードのタイプによって、currentが左端（先頭）にあるかチェック
      case 'MemberExpression':
        // obj.property の場合、objが左端
        if (parent.object !== current) return false
        break
      case 'CallExpression':
        // func(arg) の場合、funcが左端（argは先頭ではない）
        if (parent.callee !== current) return false
        break
      case 'UnaryExpression':
        // !x の場合、xが左端（単項演算子の引数）
        // これは先頭と見なす
        break
      case 'TSAsExpression':
      case 'TSTypeAssertion':
        // (x as Type) の場合、xが左端
        if (parent.expression !== current) return false
        break
      default:
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
 * 使用箇所がexport { xxx as yyy }のExportSpecifierの中にあるかチェック
 */
function isInExportSpecifier(usageNode) {
  let current = usageNode.parent
  while (current) {
    if (current.type === 'ExportSpecifier') {
      return true
    }
    // ExportNamedDeclarationまで到達したら終了
    if (current.type === 'ExportNamedDeclaration') {
      return false
    }
    current = current.parent
  }
  return false
}

/**
 * 複雑さをチェックしてインライン化可能かを判定
 */
function checkComplexity(sourceCode, node, usage, typeAnnotation, maxComplexity) {
  const isReturnUsage = isUsedInReturnStatement(usage)
  const typeComplexity = typeAnnotation ? 1 : 0

  // return文の場合は、移動元の複雑さチェックをスキップ
  const sourceComplexity = isReturnUsage ? 0 : calculateComplexity(node.init, maxComplexity + 1) + typeComplexity

  // sourceComplexityがmaxComplexityを超えている場合は早期終了
  if (sourceComplexity > maxComplexity) {
    return false
  }

  // 残りの許容複雑さを計算
  const remainingComplexity = maxComplexity - sourceComplexity + 1
  const targetComplexity = calculateUsageComplexity(usage, remainingComplexity)
  const totalComplexity = sourceComplexity + targetComplexity

  // 合計の複雑さがmaxComplexityを超える場合はスキップ
  return totalComplexity <= maxComplexity
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

  // 以下の条件に該当する場合は対象外
  if (crossedBarrier || usages.length !== 1) {
    return null
  }

  const usage = usages[0]
  const isExportSpec = isInExportSpecifier(usage)

  // React Hooks呼び出しは対象外（ただしexport { xxx as yyy }パターンは対象）
  if (!isExportSpec && isReactHookCall(node)) {
    return null
  }

  const typeAnnotation = getTypeAnnotationText(sourceCode, node)

  // 複雑さチェック
  if (!checkComplexity(sourceCode, node, usage, typeAnnotation, maxComplexity)) {
    return null
  }

  return {
    node,
    varName,
    usage,
    typeAnnotation,
    isExportSpecifier: isExportSpec,
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
      inlineVariable: '変数"{{name}}"は一度しか使用されていません。直接使用してください。',
      exportDirectly: '変数"{{name}}"は一度しか使用されていません。export const {{exportedName}} = ... の形式で直接エクスポートしてください。',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode()
    const options = context.options[0] || {}
    const fix = options.fix

    return {
      'VariableDeclarator': (node) => {
        const analysis = analyzeVariable(sourceCode, node, options)

        if (analysis) {
          // export { xxx as yyy } パターンの場合は異なるメッセージを使用
          if (analysis.isExportSpecifier) {
            // ExportSpecifierからエクスポート名を取得
            let exportedName = analysis.varName
            let current = analysis.usage.parent
            while (current && current.type !== 'ExportSpecifier') {
              current = current.parent
            }
            if (current && current.type === 'ExportSpecifier' && current.exported) {
              exportedName = current.exported.name
            }

            context.report({
              node: analysis.node,
              messageId: 'exportDirectly',
              data: {
                name: analysis.varName,
                exportedName,
              },
              fix: fix ? createInlineFixer(sourceCode, analysis.node, analysis.usage, analysis.typeAnnotation) : null,
            })
          } else {
            context.report({
              node: analysis.node,
              messageId: 'inlineVariable',
              data: { name: analysis.varName },
              fix: fix ? createInlineFixer(sourceCode, analysis.node, analysis.usage, analysis.typeAnnotation) : null,
            })
          }
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
