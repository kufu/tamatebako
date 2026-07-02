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
        'すべての分岐で同じ関数 "{{functionName}}" を呼び出しています。引数のみを条件分岐にすることを検討してください。\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-reduce-redundant-calls',
      consolidateJSXElement:
        'すべての分岐で同じコンポーネント <{{componentName}}> を使用しています。子要素のみを条件分岐にすることを検討してください。\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-reduce-redundant-calls',
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
      switch (callee.type) {
        case 'Identifier':
          return callee.name
        case 'MemberExpression':
          // メソッドチェーン全体のテキストを返す
          return sourceCode.getText(callee)
        default:
          return null
      }
    }

    /**
     * JSXElementからコンポーネント名を取得
     */
    function getJSXElementName(node) {
      if (node.type !== 'JSXElement') return null
      const openingElement = node.openingElement
      switch (openingElement.name.type) {
        case 'JSXIdentifier':
          return openingElement.name.name
        case 'JSXMemberExpression':
          return sourceCode.getText(openingElement.name)
        default:
          return null
      }
    }

    /**
     * JSXElementが子要素を持つか判定
     */
    function hasChildren(node) {
      return node.children && node.children.length > 0
    }

    /**
     * JSX要素の配列を検証し、必要に応じてレポート
     */
    function checkJSXElements(jsxElements, node) {
      const componentNames = jsxElements.map(getJSXElementName)
      const firstComponentName = componentNames[0]

      if (!firstComponentName || !componentNames.every((name) => name === firstComponentName)) {
        return
      }

      // React.FragmentまたはFragmentは除外
      if (firstComponentName === 'Fragment' || firstComponentName === 'React.Fragment') {
        return
      }

      // 子要素の有無を確認
      const firstHasChildren = hasChildren(jsxElements[0])

      if (!firstHasChildren) {
        // 子要素がない場合：すべての要素が子要素を持たない場合のみ検出
        if (jsxElements.every((el) => !hasChildren(el))) {
          context.report({
            node,
            messageId: 'consolidateJSXElement',
            data: { componentName: firstComponentName },
          })
        }
      } else {
        // 子要素がある場合：属性も比較（既存の挙動）
        const attributes = jsxElements.map((el) =>
          el.openingElement.attributes.map((attr) => sourceCode.getText(attr)).join(' '),
        )
        const firstAttrs = attributes[0]
        if (attributes.every((attrs) => attrs === firstAttrs)) {
          context.report({
            node,
            messageId: 'consolidateJSXElement',
            data: { componentName: firstComponentName },
          })
        }
      }
    }

    /**
     * ExpressionStatementまたはReturnStatementからCallExpressionを取得
     */
    function getCallExpression(statement) {
      if (!statement) return null
      switch (statement.type) {
        case 'CallExpression':
          // 三項演算子の場合、直接CallExpressionが渡される
          return statement
        case 'ExpressionStatement':
          if (statement.expression.type === 'CallExpression') {
            return statement.expression
          }
          return null
        case 'ReturnStatement':
          if (statement.argument?.type === 'CallExpression') {
            return statement.argument
          }
          return null
        default:
          return null
      }
    }

    /**
     * ExpressionStatementまたはReturnStatementからJSXElementを取得
     */
    function getJSXElement(statement) {
      if (!statement) return null
      switch (statement.type) {
        case 'JSXElement':
          // 三項演算子の場合、直接JSXElementが渡される
          return statement
        case 'ReturnStatement':
          if (statement.argument?.type === 'JSXElement') {
            return statement.argument
          }
          return null
        default:
          return null
      }
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
     * switch文のcaseから実行可能なステートメントを取得
     */
    function getExecutableStatementFromCase(consequent, isLastCase, switchNode) {
      if (consequent.length === 0) return null

      // consequentが波括弧で囲まれている場合（BlockStatement）
      if (consequent.length === 1 && consequent[0].type === 'BlockStatement') {
        // BlockStatementの中身を使う
        return getExecutableStatementFromCase(consequent[0].body, isLastCase, switchNode)
      }

      // 連続するif文 + 最後のreturnパターンをチェック
      // reportNodeはnullにして、case内の最初のif文をエラー位置にする
      checkConsecutiveIfs(consequent, null)

      const lastStmt = consequent[consequent.length - 1]

      // return/throwの場合：それが唯一のステートメント
      if (lastStmt.type === 'ReturnStatement' || lastStmt.type === 'ThrowStatement') {
        if (consequent.length !== 1) return null
        return lastStmt
      }

      // break/continueの場合：その前のステートメントが1つのみ
      if (lastStmt.type === 'BreakStatement' || lastStmt.type === 'ContinueStatement') {
        if (consequent.length !== 2) return null
        return consequent[0]
      }

      // 最後のcase（defaultなど）で、breakがない場合
      // ステートメントが1つのみならそれを返す
      if (isLastCase && consequent.length === 1) {
        return lastStmt
      }

      // 上記以外（fall-throughなど）は対象外
      return null
    }

    /**
     * switch文のfall-throughを考慮して実行ステートメントを解決
     */
    function resolveExecutableStatement(cases, startIndex, switchNode) {
      // startIndexから順に探して、最初に見つかった実行可能なステートメントを返す
      for (let i = startIndex; i < cases.length; i++) {
        const consequent = cases[i].consequent

        // consequent が空なら次のcaseにfall-through
        if (consequent.length === 0) continue

        // 最後のcaseかどうか
        const isLastCase = i === cases.length - 1

        // 実行可能なステートメントを抽出
        const stmt = getExecutableStatementFromCase(consequent, isLastCase, switchNode)
        return stmt
      }

      // 最後まで見つからなければnull
      return null
    }

    /**
     * if-else文を検証（early returnパターンも含む）
     */
    function checkIfStatement(node) {
      const branches = []

      // consequent（if部分）
      const consequentStmt = getSingleStatement(node.consequent)
      if (!consequentStmt) return

      // alternateがなく、親がBlockStatementの場合、連続するif文パターンをチェック
      if (!node.alternate && consequentStmt.type === 'ReturnStatement') {
        const parent = node.parent
        if (parent && parent.type === 'BlockStatement') {
          const ifIndex = parent.body.indexOf(node)
          if (ifIndex !== -1) {
            // 前のステートメントがif文（alternateなし、returnで終わる）の場合、
            // 連続するif文パターンの一部なのでスキップ
            if (ifIndex > 0) {
              const prevStmt = parent.body[ifIndex - 1]
              if (prevStmt.type === 'IfStatement' && !prevStmt.alternate) {
                const prevConsequent = getSingleStatement(prevStmt.consequent)
                if (prevConsequent && prevConsequent.type === 'ReturnStatement') {
                  return
                }
              }
            }

            // 次のステートメントもif文（alternateなし、returnで終わる）の場合、
            // 連続するif文パターンに該当する可能性があるのでスキップ
            if (ifIndex + 1 < parent.body.length) {
              const nextStmt = parent.body[ifIndex + 1]
              if (nextStmt.type === 'IfStatement' && !nextStmt.alternate) {
                const nextConsequent = getSingleStatement(nextStmt.consequent)
                if (nextConsequent && nextConsequent.type === 'ReturnStatement') {
                  return
                }
              }
            }
          }
        }
      }

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
          // すべてのbranchesがreturnで終わっている場合のみ、次のreturn文を追加
          const allBranchesReturn = branches.every((stmt) => stmt.type === 'ReturnStatement')

          if (allBranchesReturn) {
            const parent = node.parent
            if (parent && parent.type === 'BlockStatement') {
              const ifIndex = parent.body.indexOf(node)
              if (ifIndex !== -1 && ifIndex + 1 < parent.body.length) {
                const nextStmt = parent.body[ifIndex + 1]
                // 次のステートメントがReturnStatementの場合のみ追加
                if (nextStmt.type === 'ReturnStatement') {
                  branches.push(nextStmt)
                } else {
                  // 次のreturn文がない場合は検証対象外
                  return
                }
              } else {
                // 次のステートメントがない場合も検証対象外
                return
              }
            } else {
              // BlockStatement内にない場合も検証対象外
              return
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
        checkJSXElements(jsxElements, node)
      }
    }

    /**
     * switch文を検証（early returnパターンも含む）
     */
    function checkSwitchStatement(node) {
      const branches = []
      let hasDefault = false

      // 各caseについて、実際に実行されるステートメントを解決
      for (let i = 0; i < node.cases.length; i++) {
        const switchCase = node.cases[i]

        if (switchCase.test === null) {
          hasDefault = true
        }

        // fall-throughを考慮して実行ステートメントを解決
        const stmt = resolveExecutableStatement(node.cases, i, node)
        if (!stmt) return // 解決できない = 対象外

        branches.push(stmt)
      }

      // defaultがない場合、early returnパターンをチェック
      // すべてのcaseがreturnで終わっている場合のみ、次のreturn文を追加
      if (!hasDefault) {
        const allCasesReturn = branches.every((stmt) => stmt.type === 'ReturnStatement')

        if (allCasesReturn) {
          const parent = node.parent
          if (parent && parent.type === 'BlockStatement') {
            const switchIndex = parent.body.indexOf(node)
            if (switchIndex !== -1 && switchIndex + 1 < parent.body.length) {
              const nextStmt = parent.body[switchIndex + 1]
              // 次のステートメントがReturnStatementの場合のみ追加
              if (nextStmt.type === 'ReturnStatement') {
                branches.push(nextStmt)
              } else {
                // 次のreturn文がない場合は検証対象外
                return
              }
            } else {
              // 次のステートメントがない場合も検証対象外
              return
            }
          } else {
            // BlockStatement内にない場合も検証対象外
            return
          }
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
        checkJSXElements(jsxElements, node)
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
        checkJSXElements(jsxElements, node)
      }
    }

    /**
     * ステートメント配列内の連続するif文（すべてreturnで終わる）+ 最後のreturn文を検証
     * @returns {boolean} 検出した場合はtrue
     */
    function checkConsecutiveIfs(statements, reportNode) {
      if (statements.length < 3) return false

      // 連続するif文（alternateなし、returnで終わる）のグループを探す
      for (let i = 0; i < statements.length - 1; i++) {
        const branches = []
        let j = i

        // 連続するif文を収集
        while (j < statements.length) {
          const stmt = statements[j]

          // if文でない、またはalternateがある場合は終了
          if (stmt.type !== 'IfStatement' || stmt.alternate !== null) {
            break
          }

          // consequentが単一のreturn文でない場合は終了
          const consequent = getSingleStatement(stmt.consequent)
          if (!consequent || consequent.type !== 'ReturnStatement') {
            break
          }

          branches.push(consequent)
          j++
        }

        // 2つ以上のif文が連続し、その後にreturn文がある場合
        if (branches.length >= 2 && j < statements.length) {
          const nextStmt = statements[j]
          if (nextStmt.type === 'ReturnStatement') {
            branches.push(nextStmt)

            // すべてのreturn文からCallExpressionを取得
            const callExpressions = branches.map(getCallExpression).filter(Boolean)
            if (callExpressions.length === branches.length) {
              const functionNames = callExpressions.map(getFunctionName)
              const firstFunctionName = functionNames[0]
              if (firstFunctionName && functionNames.every((name) => name === firstFunctionName)) {
                context.report({
                  node: reportNode || statements[i],
                  messageId: 'consolidateFunctionCall',
                  data: { functionName: firstFunctionName },
                })
                return true
              }
            }

            // すべてのreturn文からJSXElementを取得
            const jsxElements = branches.map(getJSXElement).filter(Boolean)
            if (jsxElements.length === branches.length) {
              checkJSXElements(jsxElements, reportNode || statements[i])
              return true
            }
          }
        }

        // 次のグループを探す
        if (j > i) {
          i = j - 1
        }
      }

      return false
    }

    return {
      IfStatement(node) {
        // 最上位のif文のみ検証（ネストしたif文は親で処理される）
        if (node.parent.type !== 'IfStatement' || node.parent.alternate !== node) {
          checkIfStatement(node)
        }
      },
      SwitchStatement(node) {
        checkSwitchStatement(node)
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
      BlockStatement(node) {
        // 関数本体の場合のみチェック（switch caseはgetExecutableStatementFromCaseで処理される）
        const parent = node.parent
        if (
          parent &&
          (parent.type === 'FunctionDeclaration' ||
            parent.type === 'FunctionExpression' ||
            parent.type === 'ArrowFunctionExpression')
        ) {
          checkConsecutiveIfs(node.body, node)
        }
      },
    }
  },
}
