const rule = require('../rules/design-system-guideline-prohibit-disabled-while-pending')
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

const DETAIL_LINK_MESSAGE = `
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-prohibit-disabled-while-pending`

const buttonMessage = (name) => `disabled属性に処理中を表すと思われる変数(${name})が指定されています。処理中であることが伝わるよう、loading属性を使用してください。${DETAIL_LINK_MESSAGE}
 - 参考: https://smarthr.design/products/components/button/
 - 例: disabled={${name}} を loading={${name}} に変更してください
 - 他の無効化理由と混在している場合、pending以外の条件のみdisabledに残してください
   - 例: disabled={${name} || isRouteRefetching} → loading={${name}} disabled={isRouteRefetching}`

const dialogMessage = (name) => `actionButtonのdisabledに処理中を表すと思われる変数(${name})が指定されています。処理中であることが伝わるよう、responseStatus属性を使用してください。${DETAIL_LINK_MESSAGE}
 - 参考: https://smarthr.design/products/design-patterns/feedback/
 - 例: actionButtonのdisabledを削除し、responseStatus={${name} ? { status: 'processing' } : responseStatus} を設定してください
 - closeButtonのdisabledはこのルールの対象外です(閉じる操作にloading概念はないため)`

ruleTester.run('design-system-guideline-prohibit-disabled-while-pending', rule, {
  valid: [
    // type="submit"ではないButtonはpending変数があっても対象外
    { code: `<Button disabled={isPending}>送信</Button>` },
    // pending系以外の変数名は対象外
    { code: `<Button type="submit" disabled={isRouteRefetching}>送信</Button>` },
    // &&は「pendingかつ他の条件を満たす場合のみdisabled」という別の意図のため対象外
    { code: `<Button type="submit" disabled={isPending && isRouteRefetching}>送信</Button>` },
    { code: `<Button type="submit" disabled={selectedUsers.length === 0}>送信</Button>` },
    // 既にloadingを使っている場合はOK
    { code: `<Button type="submit" loading={isPending}>送信</Button>` },
    { code: `<Button type="submit" loading={isPending} disabled={isRouteRefetching}>送信</Button>` },
    // loading属性が既に設定されている場合はチェック自体をスキップする
    { code: `<Button type="submit" loading={isSaving} disabled={isPending}>送信</Button>` },
    // button html要素は対象外(BUTTON_REGEXはコンポーネント名のみ対象)
    { code: `<button type="submit" disabled={isPending}>送信</button>` },
    // pending等を含むが単語境界が異なる(誤検知しない)変数名
    { code: `<Button type="submit" disabled={isDepending}>送信</Button>` },
    { code: `<Button type="submit" disabled={isAppending}>送信</Button>` },
    { code: `<Button type="submit" disabled={isSpending}>送信</Button>` },

    // Dialogのactionbuttonにpending系以外のキーの場合は対象外
    { code: `<ActionDialog actionButton={{ text: '削除', theme: 'danger' }} />` },
    { code: `<ActionDialog actionButton={{ text: '削除', disabled: selectedUsers.length === 0 }} />` },
    { code: `<ActionDialog actionButton={{ text: '削除', disabled: isPending && isRouteRefetching }} />` },
    // closeButtonは対象外
    { code: `<ActionDialog closeButton={{ text: undefined, disabled: isPending }} />` },
    // actionButtonがオブジェクトでない(ReactNode)場合は対象外
    { code: `<ActionDialog actionButton={<FormattedMessage id="save" />} />` },
  ],
  invalid: [
    { code: `<Button type="submit" disabled={isPending}>送信</Button>`, errors: [ { message: buttonMessage('isPending') } ] },
    { code: `<Button type="submit" disabled={pending}>送信</Button>`, errors: [ { message: buttonMessage('pending') } ] },
    { code: `<Button type="submit" disabled={isSubmitting}>送信</Button>`, errors: [ { message: buttonMessage('isSubmitting') } ] },
    { code: `<Button type="submit" disabled={isPending || isRouteRefetching}>送信</Button>`, errors: [ { message: buttonMessage('isPending') } ] },
    { code: `<Button type="submit" disabled={disabled || pending}>送信</Button>`, errors: [ { message: buttonMessage('pending') } ] },
    { code: `<Button type="submit" disabled={formIsPending}>送信</Button>`, errors: [ { message: buttonMessage('formIsPending') } ] },
    { code: `<Button type="submit" disabled={deletePending}>送信</Button>`, errors: [ { message: buttonMessage('deletePending') } ] },
    { code: `<Button type="submit" disabled={isSubmit}>送信</Button>`, errors: [ { message: buttonMessage('isSubmit') } ] },
    { code: `<Button type="submit" disabled={submit}>送信</Button>`, errors: [ { message: buttonMessage('submit') } ] },
    { code: `<Button type="submit" disabled={isLoading}>送信</Button>`, errors: [ { message: buttonMessage('isLoading') } ] },
    { code: `<Button type="submit" disabled={loading}>送信</Button>`, errors: [ { message: buttonMessage('loading') } ] },
    { code: `<AnyButton type="submit" disabled={isPending}>送信</AnyButton>`, errors: [ { message: buttonMessage('isPending') } ] },

    { code: `<ActionDialog actionButton={{ text: '削除', disabled: isPending }} />`, errors: [ { message: dialogMessage('isPending') } ] },
    { code: `<FormDialog actionButton={{ text: '保存', disabled: isPending || selectedUsers.length === 0 }} />`, errors: [ { message: dialogMessage('isPending') } ] },
    { code: `<ControlledActionDialog actionButton={{ text: '削除', disabled: isPending }} />`, errors: [ { message: dialogMessage('isPending') } ] },
  ]
})
