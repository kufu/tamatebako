const REGEX_REMOTE_TRIGGER_DIALOG = /RemoteTrigger(Action|Form|Message|Modeless)Dialog$/
const REGEX_REMOTE_DIALOG_TRIGGER = /RemoteDialogTrigger$/

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement: (node) => {
        const nodeName = node.name.name || '';

        const regexRemoteTriggerDialog = REGEX_REMOTE_TRIGGER_DIALOG.test(nodeName)

        if (regexRemoteTriggerDialog || REGEX_REMOTE_DIALOG_TRIGGER.test(nodeName)) {
          const attrName = regexRemoteTriggerDialog ? 'id' : 'targetId'
          const id = node.attributes.find((a) => a.name?.name === attrName)

          if (id && id.value.type !== 'Literal') {
            context.report({
              node: id,
              message: `${nodeName}の${attrName}属性には直接文字列を指定してください。
  - 変数などは利用できません（これは関連するTriggerとDialogを検索しやすくするためです）
  - RemoteTriggerActionDialogはループやDropdown内にTriggerが存在する場合に利用してください
  - ループやDropdown以外にTriggerが設定されている場合、TriggerAndActionDialogを利用してください`,
            })
          }
        }
      }
    }
  },
}
