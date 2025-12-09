/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    schema: [],
  },
  create(context) {
    const checker = (node) => {
      context.report({
        node,
        message: `${node.parent.name.name}の${node.name.name}属性には直接文字列を指定してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-remote-trigger-dialog
 - 変数などは利用できません（これは関連するTriggerとDialogを検索しやすくするためです）`,
      })
    }

    return {
      'JSXOpeningElement[name.name=/RemoteTrigger(Action|Form|Message|Modeless)Dialog$/] JSXAttribute[name.name="id"]:not([value.type="Literal"])': checker,
      'JSXOpeningElement[name.name=/RemoteDialogTrigger$/] JSXAttribute[name.name="targetId"]:not([value.type="Literal"])': checker,
    }
  },
}
