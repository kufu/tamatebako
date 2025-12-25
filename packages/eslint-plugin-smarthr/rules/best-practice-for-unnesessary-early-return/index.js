const SCHEMA = []

const EARLY_RETURN_IF_STATEMENT = `:matches(ArrowFunctionExpression,FunctionExpression,FunctionDeclaration)>BlockStatement>IfStatement[alternate=null]:matches([consequent.type='ReturnStatement'],[consequent.body.length=1])>`
const NULL_RETURN_STATEMENT = 'ReturnStatement[argument=null]'

const FUNCTION_REGEX = /^(Arrow)?Function(Expression|Declaration)$/

const searchFunction = (node) => FUNCTION_REGEX.test(node.type) ? node : searchFunction(node.parent)

const getEarlyReturn = (b) => {
  let ret = null
  switch (b.consequent.type) {
    case 'ReturnStatement':
      ret = b.consequent

      break
    case 'BlockStatement':
      if (b.consequent.body.length === 1 && b.consequent.body[0].type === 'ReturnStatement') {
        ret = b.consequent.body[0]
      }

      break
  }

  return ret?.argument === null ? ret : null
}

const DETAIL_LINK = `
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-unnesessary-early-return`

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    schema: SCHEMA,
  },
  create(context) {
    const action = (node) => {
      const fn = searchFunction(node).body.body
      // 0: 最初の早期returnを検索中
      // 1: 最初の早期returnを発見、その後も連続して早期returnが存在する場合
      // 2: 1の後、早期returnの連続が途切れた場合
      let flg = 0

      for (let i = 0; i < fn.length; i++) {
        const b = fn[i]

        if (!flg) {
          if (b.type === 'IfStatement' && getEarlyReturn(b)) {
            flg = 1
          }

          continue
        }

        switch (b.type) {
          case 'VariableDeclaration':
          case 'ReturnStatement':
          case 'SwitchStatement':
          case 'TryStatement':
            return
          case 'IfStatement':
            if (flg === 1 && node === getEarlyReturn(b)) {
              context.report({
                node,
                message: `早期returnのifが分割されています${DETAIL_LINK}
 - 一つのifにまとめるよう、条件を調整してください`,
              })
            }
            return
        }

        flg = 2
      }

      context.report({
        node,
        message: `後続の処理の逆の条件の早期returnのため修正してください。${DETAIL_LINK}
 - 本質的に行いたい処理の条件とは逆がifに記述されているため、ロジックを確認する際条件を逆転させて考える余計な手間が発生しています
 - 条件を逆転させたうえで後続の処理をifの内部に移動してください`,
      })
    }

    return {
      [`${EARLY_RETURN_IF_STATEMENT}BlockStatement>${NULL_RETURN_STATEMENT}`]: action,
      [`${EARLY_RETURN_IF_STATEMENT}${NULL_RETURN_STATEMENT}`]: action,
    }
  },
}
module.exports.schema = SCHEMA
