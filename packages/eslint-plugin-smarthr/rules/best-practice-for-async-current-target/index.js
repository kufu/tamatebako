const SCHEMA = []

const FUNCTION_EXPRESSION_REGEX = /FunctionExpression$/
const CURRENT_TARGET_AFTER_AWAIT_REGEX = /(\s|\(|;|^)await\s.+\.currentTarget(\.|;|\?|\s|\)|$)/
const NL_REGEX = /\n/g

const checkFunctionTopVariable = (node, eventObjectName, getSourceCodeText) => {
  if (FUNCTION_EXPRESSION_REGEX.test(node.type)) {
    if (node.params.find((p) => p.name === eventObjectName)) {
      // HINT: currentTargetの参照より前にawait宣言がある場合はエラー
      return CURRENT_TARGET_AFTER_AWAIT_REGEX.test(getSourceCodeText(node.body).replace(NL_REGEX, ';')) ? 1 : 0
    }

    return 2
  }

  const nextNode = node.parent

  // HINT: 0の場合はrootまで検索して見つからない場合となる
  // パターンとしてはe.currentTargetがイベントハンドラ外で定義されている場合があり得る
  return nextNode ? checkFunctionTopVariable(nextNode, eventObjectName, getSourceCodeText) : 0
}

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
  },
  create(context) {
    const getSourceCodeText = (node) => context.sourceCode.getText(node)

    return {
      [`:matches(FunctionExpression, ArrowFunctionExpression) MemberExpression[property.name="currentTarget"][object.name]`]: (node) => {
        switch (checkFunctionTopVariable(node.parent, node.object.name, getSourceCodeText)) {
          case 1:
            context.report({
              node,
              message: `currentTargetはイベント処理中以外に参照するとnullになる場合があります。awaitの宣言より前にcurrentTarget、もしくはcurrentTarget以下の属性を含む値を変数として宣言してください
 - 参考: https://developer.mozilla.org/ja/docs/Web/API/Event/currentTarget
 - NG例:
    const onChange = async (e) => {
      await hoge()
      fuga(e.currentTarget.value)
    }
 - 修正例:
    const onChange = async (e) => {
      const value = e.currentTarget.value
      await hoge()
      fuga(value)
    }`,
            })

            break
          case 2:
            context.report({
              node,
              message: `currentTargetはイベント処理中以外に参照するとnullになる場合があります。イベントハンドラ用関数のスコープ直下でcurrentTarget、もしくはcurrentTarget以下の属性を含む値を変数として宣言してください
 - 参考: https://developer.mozilla.org/ja/docs/Web/API/Event/currentTarget
 - React/useStateのsetterは第一引数に関数を渡すと非同期処理になるためこの問題が起きる可能性があります
 - イベントハンドラ内で関数を定義すると参照タイミングがずれる可能性があるため、イベントハンドラ直下のスコープ内にcurrentTarget関連の参照を変数に残すことをオススメします
 - NG例:
    const onSelect = (e) => {
      setItem((current) => ({ ...current, value: e.currentTarget.value }))
    }
 - 修正例:
    const onSelect = (e) => {
      const value = e.currentTarget.value
      setItem((current) => ({ ...current, value }))
    }`,
            })

            break
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
