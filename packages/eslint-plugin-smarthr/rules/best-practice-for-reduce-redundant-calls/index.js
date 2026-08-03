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
      const { callee } = node
      switch (callee.type) {
        case 'Identifier':
          return callee.name
        case 'MemberExpression':
          // メソッドチェーン全体のテキストを返す
          return sourceCode.getText(callee)
      }

      return null
    }

    /**
     * JSXElementからコンポーネント名を取得
     */
    function getJSXElementName(node) {
      const openingElement = node.openingElement

      switch (openingElement.name.type) {
        case 'JSXIdentifier':
          return openingElement.name.name
        case 'JSXMemberExpression':
          return sourceCode.getText(openingElement.name)
      }

      return null
    }

    /**
     * JSX要素の配列を検証し、必要に応じてレポート
     */
    function checkJSXElements(jsxElements, node) {
      const firstComponentName = getJSXElementName(jsxElements[0])

      // React.FragmentまたはFragmentは除外
      if (
        !firstComponentName ||
        firstComponentName === 'Fragment' ||
        firstComponentName === 'React.Fragment'
      ) {
        return
      }

      const firstSelfClosing = jsxElements[0].openingElement.selfClosing
      const firstAttrs = jsxElements[0].openingElement.attributes

      // Spread attributesがある場合は厳密比較のみ
      const hasSpread = firstAttrs.some((a) => a.type === 'JSXSpreadAttribute')
      if (hasSpread) {
        const firstOpeningTag = sourceCode.getText(jsxElements[0].openingElement)

        for (let i = 1; i < jsxElements.length; i++) {
          // Spreadがある場合は完全一致のみ許可、片方だけSpreadがある場合は除外
          if (
            jsxElements[i].openingElement.selfClosing !== firstSelfClosing ||
            getJSXElementName(jsxElements[i]) !== firstComponentName ||
            !jsxElements[i].openingElement.attributes.some((a) => a.type === 'JSXSpreadAttribute') ||
            sourceCode.getText(jsxElements[i].openingElement) !== firstOpeningTag
          ) {
            return
          }
        }

        context.report({
          node,
          messageId: 'consolidateJSXElement',
          data: { componentName: firstComponentName },
        })
        return
      }

      // 最初の要素の属性Mapを作成（1回のみ）
      const firstAttrMap = new Map()
      for (const attr of firstAttrs) {
        if (attr.type === 'JSXAttribute') {
          const name = attr.name.name
          const value = attr.value ? sourceCode.getText(attr.value) : 'true'
          firstAttrMap.set(name, value)
        }
      }

      // 各要素と比較
      for (let i = 1; i < jsxElements.length; i++) {
        if (
          jsxElements[i].openingElement.selfClosing !== firstSelfClosing ||
          getJSXElementName(jsxElements[i]) !== firstComponentName
        ) {
          return
        }

        const currentAttrs = jsxElements[i].openingElement.attributes

        // Spreadがある場合は除外
        if (currentAttrs.some((a) => a.type === 'JSXSpreadAttribute')) {
          return
        }

        // 差分カウント（2以上で早期リターン）
        let diffCount = 0
        const checkedKeys = new Set()

        // 現在の要素の属性を走査
        for (const attr of currentAttrs) {
          if (attr.type === 'JSXAttribute') {
            const name = attr.name.name
            const value = attr.value ? sourceCode.getText(attr.value) : 'true'
            checkedKeys.add(name)

            if (!firstAttrMap.has(name) || firstAttrMap.get(name) !== value) {
              diffCount++
              if (diffCount >= 2) {
                return // 差分2以上 → 意図的に分けている
              }
            }
          }
        }

        // 最初の要素にしかない属性もカウント
        for (const key of firstAttrMap.keys()) {
          if (!checkedKeys.has(key)) {
            diffCount++
            if (diffCount >= 2) {
              return
            }
          }
        }
      }

      context.report({
        node,
        messageId: 'consolidateJSXElement',
        data: { componentName: firstComponentName },
      })
    }

    /**
     * ExpressionStatementまたはReturnStatementからCallExpressionを取得
     */
    function getCallExpression(statement) {
      switch (statement.type) {
        case 'CallExpression':
          // 三項演算子の場合、直接CallExpressionが渡される
          return statement
        case 'AwaitExpression':
          // 三項演算子でawaitが使われる場合、直接AwaitExpressionが渡される
          return statement.argument?.type === 'CallExpression' ? statement.argument : null
        case 'ExpressionStatement': {
          let expr = statement.expression
          // AwaitExpressionをアンラップ
          if (expr.type === 'AwaitExpression') {
            expr = expr.argument
          }
          return expr?.type === 'CallExpression' ? expr : null
        }
        case 'ReturnStatement': {
          let arg = statement.argument
          // AwaitExpressionをアンラップ
          if (arg?.type === 'AwaitExpression') {
            arg = arg.argument
          }
          return arg?.type === 'CallExpression' ? arg : null
        }
      }

      return null
    }

    /**
     * ExpressionStatementまたはReturnStatementからJSXElementを取得
     */
    function getJSXElement(statement) {
      switch (statement.type) {
        case 'JSXElement':
          // 三項演算子の場合、直接JSXElementが渡される
          return statement
        case 'ReturnStatement': {
          let arg = statement.argument
          // AwaitExpressionをアンラップ（通常JSXではawaitしないが念のため）
          if (arg?.type === 'AwaitExpression') {
            arg = arg.argument
          }
          return arg?.type === 'JSXElement' ? arg : null
        }
      }

      return null
    }

    /**
     * BlockStatementから実行される単一のステートメントを取得
     */
    function getSingleStatement(block) {
      if (block.type === 'BlockStatement') {
        // ブロック内に1つのステートメントのみ
        return block.body.length === 1 ? block.body[0] : null
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

      switch (lastStmt.type) {
        case 'ReturnStatement':
        case 'ThrowStatement':
          // それが唯一のステートメント
          return consequent.length === 1 ? lastStmt : null
        case 'BreakStatement':
        case 'ContinueStatement':
          // その前のステートメントが1つのみ
          return consequent.length === 2 ? consequent[0] : null
        default:
          // 最後のcase（defaultなど）で、breakがない場合
          // ステートメントが1つのみならそれを返す
          if (isLastCase && consequent.length === 1) {
            return lastStmt
          }
          // 上記以外（fall-throughなど）は対象外
          return null
      }
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

              if (prevStmt.type === 'IfStatement' && !prevStmt.alternate && getSingleStatement(prevStmt.consequent)?.type === 'ReturnStatement') {
                return
              }
            }

            // 次のステートメントもif文（alternateなし、returnで終わる）の場合、
            // 連続するif文パターンに該当する可能性があるのでスキップ
            if (ifIndex + 1 < parent.body.length) {
              const nextStmt = parent.body[ifIndex + 1]

              if (nextStmt.type === 'IfStatement' && !nextStmt.alternate && getSingleStatement(nextStmt.consequent)?.type === 'ReturnStatement') {
                return
              }
            }
          }
        }
      }

      // alternateを再帰的に収集
      let allCasesReturn = true
      let hasElse = false
      let current = node
      while (current) {
        const consequent = getSingleStatement(current.consequent)
        if (!consequent) return

        branches.push(consequent)
        if (allCasesReturn && consequent.type !== 'ReturnStatement') {
          allCasesReturn = false
        }

        if (current.alternate) {
          if (current.alternate.type === 'IfStatement') {
            // else if
            current = current.alternate
          } else {
            // else
            hasElse = true
            const alternate = getSingleStatement(current.alternate)
            if (!alternate) return
            branches.push(alternate)
            if (allCasesReturn && alternate.type !== 'ReturnStatement') {
              allCasesReturn = false
            }
            break
          }
        } else {
          // alternateがない場合、early returnパターンをチェック
          // すべてのbranchesがreturnで終わっている場合のみ、次のreturn文を追加
          if (allCasesReturn) {
            const parent = node.parent
            // BlockStatement内にない場合は検証対象外
            if (!parent || parent.type !== 'BlockStatement') {
              return
            }

            const ifIndex = parent.body.indexOf(node)
            // 次のステートメントがない場合は検証対象外
            if (ifIndex === -1 || ifIndex + 1 >= parent.body.length) {
              return
            }

            const nextStmt = parent.body[ifIndex + 1]
            // 次のreturn文がある場合のみ、early returnパターンとして扱う
            if (nextStmt.type === 'ReturnStatement') {
              branches.push(nextStmt)
              hasElse = true // early returnパターンはelse句と同等に扱う
            }
          }
          break
        }
      }

      // else句がない（かつearly returnパターンでもない）場合は検証対象外
      // すべてのケースをカバーしていないため
      if (!hasElse) {
        return
      }

      // 分岐が2つ未満の場合は検証不要
      if (branches.length < 2) return

      // 最初の要素で型を判定
      const firstCallExpr = getCallExpression(branches[0])
      if (firstCallExpr) {
        const firstName = getFunctionName(firstCallExpr)
        if (!firstName) return

        // すべてが同じ関数名のCallExpressionかチェック
        for (let i = 1; i < branches.length; i++) {
          const callExpr = getCallExpression(branches[i])
          if (!callExpr || getFunctionName(callExpr) !== firstName) {
            return
          }
        }

        context.report({
          node,
          messageId: 'consolidateFunctionCall',
          data: { functionName: firstName },
        })
        return
      }

      // CallExpressionでない場合、JSXElementをチェック
      const firstJsx = getJSXElement(branches[0])
      if (firstJsx) {
        const jsxElements = [firstJsx]

        // すべてがJSXElementかチェック
        for (let i = 1; i < branches.length; i++) {
          const jsx = getJSXElement(branches[i])
          if (!jsx) return
          jsxElements.push(jsx)
        }

        checkJSXElements(jsxElements, node)
      }
    }

    /**
     * switch文を検証（early returnパターンも含む）
     */
    function checkSwitchStatement(node) {
      const branches = []
      let hasDefault = false

      // 後ろから前に処理して各caseのステートメントを解決（O(N)）
      const caseStatements = new Array(node.cases.length)
      let lastStmt = null

      for (let i = node.cases.length - 1; i >= 0; i--) {
        const consequent = node.cases[i].consequent

        if (consequent.length > 0) {
          lastStmt = getExecutableStatementFromCase(consequent, i === node.cases.length - 1, node)
        }
        // 空のconsequentはfall-throughなので、前のステートメントを継承
        caseStatements[i] = lastStmt
      }

      // 前から順にdefaultチェックとbranches構築
      let allCasesReturn = true
      for (let i = 0; i < node.cases.length; i++) {
        if (node.cases[i].test === null) {
          hasDefault = true
        }

        const stmt = caseStatements[i]
        if (!stmt) return
        branches.push(stmt)

        if (allCasesReturn && stmt.type !== 'ReturnStatement') {
          allCasesReturn = false
        }
      }

      // defaultがない場合、early returnパターンをチェック
      // すべてのcaseがreturnで終わっている場合のみ、次のreturn文を追加
      if (!hasDefault) {
        let hasEarlyReturn = false

        if (allCasesReturn) {
          const parent = node.parent
          // BlockStatement内にない場合は検証対象外
          if (!parent || parent.type !== 'BlockStatement') {
            return
          }

          const switchIndex = parent.body.indexOf(node)
          // 次のステートメントがない場合は検証対象外
          if (switchIndex === -1 || switchIndex + 1 >= parent.body.length) {
            return
          }

          const nextStmt = parent.body[switchIndex + 1]
          // 次のreturn文がある場合のみ、early returnパターンとして扱う
          if (nextStmt.type === 'ReturnStatement') {
            branches.push(nextStmt)
            hasEarlyReturn = true
          }
        }

        // defaultがない（かつearly returnパターンでもない）場合は検証対象外
        // すべてのケースをカバーしていないため
        if (!hasEarlyReturn) {
          return
        }
      }

      // 分岐が2つ未満の場合は検証不要
      if (branches.length < 2) return

      // 最初の要素で型を判定
      const firstCallExpr = getCallExpression(branches[0])
      if (firstCallExpr) {
        const firstName = getFunctionName(firstCallExpr)
        if (!firstName) return

        // すべてが同じ関数名のCallExpressionかチェック
        for (let i = 1; i < branches.length; i++) {
          const callExpr = getCallExpression(branches[i])
          if (!callExpr || getFunctionName(callExpr) !== firstName) {
            return
          }
        }

        context.report({
          node,
          messageId: 'consolidateFunctionCall',
          data: { functionName: firstName },
        })
        return
      }

      // CallExpressionでない場合、JSXElementをチェック
      const firstJsx = getJSXElement(branches[0])
      if (firstJsx) {
        const jsxElements = [firstJsx]

        // すべてがJSXElementかチェック
        for (let i = 1; i < branches.length; i++) {
          const jsx = getJSXElement(branches[i])
          if (!jsx) return
          jsxElements.push(jsx)
        }

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

      // 最初の要素で型を判定
      const firstCallExpr = getCallExpression(branches[0])
      if (firstCallExpr) {
        const firstName = getFunctionName(firstCallExpr)
        if (!firstName) return

        // すべてが同じ関数名のCallExpressionかチェック
        for (let i = 1; i < branches.length; i++) {
          const callExpr = getCallExpression(branches[i])
          if (!callExpr || getFunctionName(callExpr) !== firstName) {
            return
          }
        }

        context.report({
          node,
          messageId: 'consolidateFunctionCall',
          data: { functionName: firstName },
        })
        return
      }

      // CallExpressionでない場合、JSXElementをチェック
      const firstJsx = getJSXElement(branches[0])
      if (firstJsx) {
        const jsxElements = [firstJsx]

        // すべてがJSXElementかチェック
        for (let i = 1; i < branches.length; i++) {
          const jsx = getJSXElement(branches[i])
          if (!jsx) return
          jsxElements.push(jsx)
        }

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

            // 最初の要素で型を判定
            const firstCallExpr = getCallExpression(branches[0])
            if (firstCallExpr) {
              const firstName = getFunctionName(firstCallExpr)
              if (!firstName) return false

              // すべてが同じ関数名のCallExpressionかチェック
              for (let k = 1; k < branches.length; k++) {
                const callExpr = getCallExpression(branches[k])
                if (!callExpr || getFunctionName(callExpr) !== firstName) {
                  return false
                }
              }

              context.report({
                node: reportNode || statements[i],
                messageId: 'consolidateFunctionCall',
                data: { functionName: firstName },
              })
              return true
            }

            // CallExpressionでない場合、JSXElementをチェック
            const firstJsx = getJSXElement(branches[0])
            if (firstJsx) {
              const jsxElements = [firstJsx]

              // すべてがJSXElementかチェック
              for (let k = 1; k < branches.length; k++) {
                const jsx = getJSXElement(branches[k])
                if (!jsx) return false
                jsxElements.push(jsx)
              }

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
      SwitchStatement: checkSwitchStatement,
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
