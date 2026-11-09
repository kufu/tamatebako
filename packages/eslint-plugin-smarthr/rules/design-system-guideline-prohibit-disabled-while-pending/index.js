// smarthr-ui/Buttonはloading属性を持つがhtmlのbutton要素は持たないため、小文字のbuttonタグは対象外とする
const BUTTON_REGEX = /Button$/
const DIALOG_REGEX = /Dialog(WithTrigger)?$/
// isPending, pending, formIsPending, deletePending のように、先頭が小文字始まりの単語、
// もしくは語中にキャメルケースで現れる単語のどちらも対象にする(全て大文字のPENDING等は対象外)
const PENDING_WORDS = ['Pending', 'Submit', 'Submitting', 'Sending', 'Saving', 'Processing', 'Loading']
const PENDING_NAME_REGEX = new RegExp(
  `(^(${PENDING_WORDS.map((w) => w[0].toLowerCase() + w.slice(1)).join('|')})|(${PENDING_WORDS.join('|')}))`
)

const DETAIL_LINK_MESSAGE = `
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-prohibit-disabled-while-pending`

const findPendingIdentifier = (expr) => {
  if (!expr) {
    return null
  }

  switch (expr.type) {
    case 'Identifier':
      return PENDING_NAME_REGEX.test(expr.name) ? expr : null
    case 'LogicalExpression':
      // "&&"は「pendingかつ他の条件も満たす場合のみdisabled」という別の意図のため対象外とする
      // (例: isPending && isRouteRefetching は isPending単体では無効化されないため、loadingへの置き換えを強制しない)
      return expr.operator === '||'
        ? findPendingIdentifier(expr.left) || findPendingIdentifier(expr.right)
        : null
    default:
      return null
  }
}

const buttonMessage = (name) => `disabled属性に処理中を表すと思われる変数(${name})が指定されています。処理中であることが伝わるよう、loading属性を使用してください。${DETAIL_LINK_MESSAGE}
 - 参考: https://smarthr.design/products/components/button/
 - 例: disabled={${name}} を loading={${name}} に変更してください
 - 他の無効化理由と混在している場合、pending以外の条件のみdisabledに残してください
   - 例: disabled={${name} || isRouteRefetching} → loading={${name}} disabled={isRouteRefetching}`

const dialogMessage = (name) => `actionButtonのdisabledに処理中を表すと思われる変数(${name})が指定されています。処理中であることが伝わるよう、responseStatus属性を使用してください。${DETAIL_LINK_MESSAGE}
 - 参考: https://smarthr.design/products/design-patterns/feedback/
 - 例: actionButtonのdisabledを削除し、responseStatus={${name} ? { status: 'processing' } : responseStatus} を設定してください
 - closeButtonのdisabledはこのルールの対象外です(閉じる操作にloading概念はないため)`

const SCHEMA = []

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
  },
  create(context) {
    return {
      [`JSXOpeningElement[name.name=${BUTTON_REGEX}]:has(JSXAttribute[name.name="type"][value.value="submit"]):not(:has(JSXAttribute[name.name="loading"])) > JSXAttribute[name.name="disabled"]`]: (node) => {
        const expr = node.value?.type === 'JSXExpressionContainer' ? node.value.expression : null
        const pendingId = findPendingIdentifier(expr)

        if (!pendingId) {
          return
        }

        context.report({
          node,
          message: buttonMessage(pendingId.name),
        })
      },
      [`JSXOpeningElement[name.name=${DIALOG_REGEX}] > JSXAttribute[name.name="actionButton"] > JSXExpressionContainer > ObjectExpression > Property[key.name="disabled"]`]: (node) => {
        const pendingId = findPendingIdentifier(node.value)

        if (!pendingId) {
          return
        }

        context.report({
          node,
          message: dialogMessage(pendingId.name),
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
