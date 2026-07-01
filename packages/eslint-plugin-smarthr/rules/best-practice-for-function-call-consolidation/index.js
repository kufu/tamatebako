module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'すべての分岐で同じ関数を呼び出している場合、引数のみを条件分岐にすることを推奨します',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      consolidateFunctionCall:
        'すべての分岐で同じ関数 "{{functionName}}" を呼び出しています。引数のみを条件分岐にすることを検討してください。\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-function-call-consolidation',
      consolidateJSXElement:
        'すべての分岐で同じコンポーネント <{{componentName}}> を使用しています。子要素のみを条件分岐にすることを検討してください。\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-function-call-consolidation',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode()

    /**
     * CallExpressionから関数名を取得
     */
    function getFunctionName(node) {
      if (node.type !== 'CallExpression') return null

      const { callee } = node
      if (callee.type === 'Identifier') {
        return callee.name
      }
      if (callee.type === 'MemberExpression') {
        // メソッドチェーン全体のテキストを返す
        return sourceCode.getText(callee)
      }
      return null
    }

    /**
     * JSXElementからコンポーネント名を取得
     */
    function getJSXElementName(node) {
      if (node.type !== 'JSXElement') return null
      const openingElement = node.openingElement
      if (openingElement.name.type === 'JSXIdentifier') {
        return openingElement.name.name
      }
      if (openingElement.name.type === 'JSXMemberExpression') {
        return sourceCode.getText(openingElement.name)
      }
      return null
    }

    /**
     * JSXElementから属性を抽出（spread含む全属性をテキスト化）
     */
    function extractJSXAttributes(node) {
      return node.openingElement.attributes.map((attr) => sourceCode.getText(attr))
    }

    /**
     * 2つの属性配列が等しいか比較
     */
    function areAttributesEqual(attrs1, attrs2) {
      if (attrs1.length !== attrs2.length) return false
      for (let i = 0; i < attrs1.length; i++) {
        if (attrs1[i] !== attrs2[i]) {
          return false
        }
      }
      return true
    }

    /**
     * ExpressionStatementまたはReturnStatementからCallExpressionを取得
     */
    function getCallExpression(statement) {
      if (!statement) return null
      if (statement.type === 'ExpressionStatement' && statement.expression.type === 'CallExpression') {
        return statement.expression
      }
      if (statement.type === 'ReturnStatement' && statement.argument?.type === 'CallExpression') {
        return statement.argument
      }
      return null
    }

    /**
     * ExpressionStatementまたはReturnStatementからJSXElementを取得
     */
    function getJSXElement(statement) {
      if (!statement) return null
      if (statement.type === 'ReturnStatement' && statement.argument?.type === 'JSXElement') {
        return statement.argument
      }
      return null
    }

    /**
     * BlockStatementから実行される単一のステートメントを取得
     */
    function getSingleStatement(block) {
      if (!block) return null
      if (block.type === 'BlockStatement') {
        // ブロック内に1つのステートメントのみ
        if (block.body.length === 1) {
          return block.body[0]
        }
        return null
      }
      // BlockStatementでない場合はそのまま返す
      return block
    }

    /**
     * if-else文を検証（early returnパターンも含む）
     */
    function checkIfStatement(node) {
      const branches = []

      // consequent（if部分）
      const consequentStmt = getSingleStatement(node.consequent)
      if (!consequentStmt) return

      // alternateを再帰的に収集
      let current = node
      while (current) {
        const consequent = getSingleStatement(current.consequent)
        if (!consequent) return

        branches.push(consequent)

        if (current.alternate) {
          if (current.alternate.type === 'IfStatement') {
            // else if
            current = current.alternate
          } else {
            // else
            const alternate = getSingleStatement(current.alternate)
            if (!alternate) return
            branches.push(alternate)
            break
          }
        } else {
          // alternateがない場合、early returnパターンをチェック
          // if文の次のステートメントがreturnかどうか
          const parent = current.parent
          if (parent && parent.type === 'BlockStatement') {
            const ifIndex = parent.body.indexOf(current)
            if (ifIndex !== -1 && ifIndex + 1 < parent.body.length) {
              const nextStmt = parent.body[ifIndex + 1]
              branches.push(nextStmt)
            }
          }
          break
        }
      }

      // 分岐が2つ未満の場合は検証不要
      if (branches.length < 2) return

      // すべての分岐からCallExpressionを取得
      const callExpressions = branches.map(getCallExpression).filter(Boolean)
      if (callExpressions.length === branches.length) {
        // すべて関数呼び出し
        const functionNames = callExpressions.map(getFunctionName)
        const firstFunctionName = functionNames[0]
        if (firstFunctionName && functionNames.every((name) => name === firstFunctionName)) {
          context.report({
            node,
            messageId: 'consolidateFunctionCall',
            data: { functionName: firstFunctionName },
          })
          return
        }
      }

      // すべての分岐からJSXElementを取得
      const jsxElements = branches.map(getJSXElement).filter(Boolean)
      if (jsxElements.length === branches.length) {
        // すべてJSX要素
        const componentNames = jsxElements.map(getJSXElementName)
        const firstComponentName = componentNames[0]
        if (firstComponentName && componentNames.every((name) => name === firstComponentName)) {
          // コンポーネント名が同じ場合、属性も比較
          const attributes = jsxElements.map(extractJSXAttributes)
          const firstAttrs = attributes[0]
          if (attributes.every((attrs) => areAttributesEqual(attrs, firstAttrs))) {
            context.report({
              node,
              messageId: 'consolidateJSXElement',
              data: { componentName: firstComponentName },
            })
          }
        }
      }
    }

    /**
     * 三項演算子を検証（ネストも含む）
     */
    function checkConditionalExpression(node) {
      const branches = []

      // consequentとalternateを収集
      function collectBranches(expr) {
        if (expr.type === 'ConditionalExpression') {
          collectBranches(expr.consequent)
          collectBranches(expr.alternate)
        } else {
          branches.push(expr)
        }
      }

      collectBranches(node)

      // 分岐が2つ未満の場合は検証不要
      if (branches.length < 2) return

      // すべての分岐がCallExpressionか確認
      const callExpressions = branches.filter((b) => b.type === 'CallExpression')
      if (callExpressions.length === branches.length) {
        const functionNames = callExpressions.map(getFunctionName)
        const firstFunctionName = functionNames[0]
        if (firstFunctionName && functionNames.every((name) => name === firstFunctionName)) {
          context.report({
            node,
            messageId: 'consolidateFunctionCall',
            data: { functionName: firstFunctionName },
          })
          return
        }
      }

      // すべての分岐がJSXElementか確認
      const jsxElements = branches.filter((b) => b.type === 'JSXElement')
      if (jsxElements.length === branches.length) {
        const componentNames = jsxElements.map(getJSXElementName)
        const firstComponentName = componentNames[0]
        if (firstComponentName && componentNames.every((name) => name === firstComponentName)) {
          // コンポーネント名が同じ場合、属性も比較
          const attributes = jsxElements.map(extractJSXAttributes)
          const firstAttrs = attributes[0]
          if (attributes.every((attrs) => areAttributesEqual(attrs, firstAttrs))) {
            context.report({
              node,
              messageId: 'consolidateJSXElement',
              data: { componentName: firstComponentName },
            })
          }
        }
      }
    }

    return {
      IfStatement(node) {
        // 最上位のif文のみ検証（ネストしたif文は親で処理される）
        if (node.parent.type !== 'IfStatement' || node.parent.alternate !== node) {
          checkIfStatement(node)
        }
      },
      ConditionalExpression(node) {
        // 最上位の三項演算子のみ検証（ネストした三項演算子は親で処理される）
        if (
          node.parent.type !== 'ConditionalExpression' ||
          (node.parent.consequent !== node && node.parent.alternate !== node)
        ) {
          checkConditionalExpression(node)
        }
      },
    }
  },
}
