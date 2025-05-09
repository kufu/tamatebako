const rule = require('../rules/best-practice-for-remote-trigger-dialog')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})
ruleTester.run('best-practice-for-remote-trigger-dialog', rule, {
  valid: [
    { code: '<RemoteDialogTrigger targetId="hoge">open.</RemoteDialogTrigger>' },
    { code: '<StyledRemoteDialogTrigger targetId="fuga">open.</StyledRemoteDialogTrigger>' },
    { code: '<RemoteTriggerActionDialog {...args} id="hoge">content.</RemoteTriggerActionDialog>' },
    { code: '<RemoteTriggerHogeDialog {...args} id="hoge">content.</RemoteTriggerHogeDialog>' },
  ],
  invalid: [
    { code: '<RemoteDialogTrigger targetId={hoge}>open.</RemoteDialogTrigger>', errors: [ { message: `RemoteDialogTriggerのtargetId属性には直接文字列を指定してください。
  - 変数などは利用できません（これは関連するTriggerとDialogを検索しやすくするためです）
  - RemoteTriggerActionDialogはループやDropdown内にTriggerが存在する場合に利用してください
  - ループやDropdown以外にTriggerが設定されている場合、TriggerAndActionDialogを利用してください` } ] },
    { code: '<StyledRemoteDialogTrigger targetId={"fuga"}>open.</StyledRemoteDialogTrigger>', errors: [ { message: `StyledRemoteDialogTriggerのtargetId属性には直接文字列を指定してください。
  - 変数などは利用できません（これは関連するTriggerとDialogを検索しやすくするためです）
  - RemoteTriggerActionDialogはループやDropdown内にTriggerが存在する場合に利用してください
  - ループやDropdown以外にTriggerが設定されている場合、TriggerAndActionDialogを利用してください` } ] },
    { code: '<StyldRemoteTriggerActionDialog {...args} id={"fuga"}>content.</StyldRemoteTriggerActionDialog>', errors: [ { message: `StyldRemoteTriggerActionDialogのid属性には直接文字列を指定してください。
  - 変数などは利用できません（これは関連するTriggerとDialogを検索しやすくするためです）
  - RemoteTriggerActionDialogはループやDropdown内にTriggerが存在する場合に利用してください
  - ループやDropdown以外にTriggerが設定されている場合、TriggerAndActionDialogを利用してください` } ] },
  ]
})
