const rule = require('../rules/best-practice-for-object-props')
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

const buildMessage = (prop, mainKey) => `"${prop}"に{ ${mainKey}: ... }のみを指定する場合はobject形式ではなく値を直接指定してください（例: ${prop}="値"）。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-object-props
 - 詳細な設定が必要な場合のみobject形式を使用してください`

ruleTester.run('best-practice-for-object-props', rule, {
  valid: [
    // ReactNodeを直接指定
    { code: `<DropdownMenuButton trigger="メニュー">{children}</DropdownMenuButton>` },
    { code: `<DropdownMenuButton trigger={<span>メニュー</span>}>{children}</DropdownMenuButton>` },

    // 必須キー以外の追加プロパティを伴う場合は許容
    { code: `<DropdownMenuButton trigger={{ children: 'メニュー', size: 's' }}>{children}</DropdownMenuButton>` },
    { code: `<DropdownMenuButton trigger={{ children: 'メニュー', onlyIcon: true }}>{children}</DropdownMenuButton>` },

    // spread構文を含む場合は対象外
    { code: `<DropdownMenuButton trigger={{ ...triggerProps }}>{children}</DropdownMenuButton>` },
    { code: `<DropdownMenuButton trigger={{ ...triggerProps, children: 'メニュー' }}>{children}</DropdownMenuButton>` },

    // 対象コンポーネント以外は対象外
    { code: `<OtherButton trigger={{ children: 'メニュー' }}>{children}</OtherButton>` },

    // 対象prop以外は対象外
    { code: `<DropdownMenuButton other={{ children: 'メニュー' }}>{children}</DropdownMenuButton>` },

    // FilterDropdown: trigger (mainKey: text)
    { code: `<FilterDropdown trigger="絞り込み" />` },
    { code: `<FilterDropdown trigger={{ text: '絞り込み', size: 's' }} />` },

    // FormControl: label (mainKey: text)
    { code: `<FormControl label="名前">{children}</FormControl>` },
    { code: `<FormControl label={{ text: '名前', styleType: 'subBlockTitle' }}>{children}</FormControl>` },

    // Fieldset: legend (mainKey: text)
    { code: `<Fieldset legend="名前">{children}</Fieldset>` },
    { code: `<Fieldset legend={{ text: '名前', styleType: 'subBlockTitle' }}>{children}</Fieldset>` },

    // DefinitionListItem: term (mainKey: text)
    { code: `<DefinitionListItem term="項目名">{children}</DefinitionListItem>` },
    { code: `<DefinitionListItem term={{ text: '項目名', styleType: 'blockTitle' }}>{children}</DefinitionListItem>` },

    // InformationPanel: heading (mainKey: text)
    { code: `<InformationPanel heading="お知らせ">{children}</InformationPanel>` },
    { code: `<InformationPanel heading={{ text: 'お知らせ', unrecommendedTag: 'h3' }}>{children}</InformationPanel>` },

    // Text: maxLines (mainKey: max)
    { code: `<Text maxLines={3}>{children}</Text>` },
    { code: `<Text maxLines={{ max: 3, tooltip: true }}>{children}</Text>` },

    // Text: icon (mainKey: prefix)
    { code: `<Text icon={<Icon />}>{children}</Text>` },
    { code: `<Text icon={{ prefix: <Icon />, gap: 0.5 }}>{children}</Text>` },

    // ActionDialog: heading/actionButton/closeButton (mainKey: text)
    { code: `<ActionDialog heading="確認" actionButton="送信" closeButton="閉じる">{children}</ActionDialog>` },
    { code: `<ControlledActionDialog heading={{ text: '確認', sub: '補足' }} actionButton={{ text: '送信', theme: 'danger' }} closeButton={{ text: '閉じる', disabled: true }}>{children}</ControlledActionDialog>` },

    // FormDialog: heading/actionButton/closeButton (mainKey: text)
    { code: `<FormDialog heading="確認" actionButton="送信" closeButton="閉じる">{children}</FormDialog>` },
    { code: `<ControlledFormDialog heading={{ text: '確認', sub: '補足' }} actionButton={{ text: '送信', disabled: true }} closeButton={{ text: '閉じる', disabled: true }}>{children}</ControlledFormDialog>` },

    // MessageDialog: heading (mainKey: text)
    { code: `<MessageDialog heading="確認">{children}</MessageDialog>` },
    { code: `<ControlledMessageDialog heading={{ text: '確認', sub: '補足' }}>{children}</ControlledMessageDialog>` },

    // StepFormDialog: heading/submitButton/closeButton/backButton (mainKey: text)
    { code: `<StepFormDialog heading="確認" submitButton="送信" closeButton="閉じる" backButton="戻る">{children}</StepFormDialog>` },
    { code: `<ControlledStepFormDialog heading={{ text: '確認', sub: '補足' }} submitButton={{ text: '送信', hidden: true }} closeButton={{ text: '閉じる', disabled: true }} backButton={{ text: '戻る', theme: 'secondary' }}>{children}</ControlledStepFormDialog>` },

    // Button: disabledReason (mainKey: message)
    { code: `<Button disabledReason="権限がありません">保存</Button>` },
    { code: `<Button disabledReason={{ message: '権限がありません', icon: FaLockIcon }}>保存</Button>` },

    // AnchorButton: inactiveReason (mainKey: message)
    { code: `<AnchorButton inactiveReason="権限がありません">保存</AnchorButton>` },
    { code: `<AnchorButton inactiveReason={{ message: '権限がありません', icon: FaLockIcon }}>保存</AnchorButton>` },
  ],
  invalid: [
    {
      code: `<DropdownMenuButton trigger={{ children: 'メニュー' }}>{children}</DropdownMenuButton>`,
      output: `<DropdownMenuButton trigger={'メニュー'}>{children}</DropdownMenuButton>`,
      errors: [{ message: buildMessage('trigger', 'children') }],
    },
    {
      code: `<DropdownMenuButton trigger={{ children: <span>メニュー</span> }}>{children}</DropdownMenuButton>`,
      output: `<DropdownMenuButton trigger={<span>メニュー</span>}>{children}</DropdownMenuButton>`,
      errors: [{ message: buildMessage('trigger', 'children') }],
    },
    {
      code: `<FugaDropdownMenuButton trigger={{ children: label }}>{children}</FugaDropdownMenuButton>`,
      output: `<FugaDropdownMenuButton trigger={label}>{children}</FugaDropdownMenuButton>`,
      errors: [{ message: buildMessage('trigger', 'children') }],
    },

    // FilterDropdown: trigger
    {
      code: `<FilterDropdown trigger={{ text: '絞り込み' }} />`,
      output: `<FilterDropdown trigger={'絞り込み'} />`,
      errors: [{ message: buildMessage('trigger', 'text') }],
    },

    // FormControl: label
    {
      code: `<FormControl label={{ text: '名前' }}>{children}</FormControl>`,
      output: `<FormControl label={'名前'}>{children}</FormControl>`,
      errors: [{ message: buildMessage('label', 'text') }],
    },

    // Fieldset: legend
    {
      code: `<Fieldset legend={{ text: '名前' }}>{children}</Fieldset>`,
      output: `<Fieldset legend={'名前'}>{children}</Fieldset>`,
      errors: [{ message: buildMessage('legend', 'text') }],
    },

    // DefinitionListItem: term
    {
      code: `<DefinitionListItem term={{ text: '項目名' }}>{children}</DefinitionListItem>`,
      output: `<DefinitionListItem term={'項目名'}>{children}</DefinitionListItem>`,
      errors: [{ message: buildMessage('term', 'text') }],
    },

    // InformationPanel: heading
    {
      code: `<InformationPanel heading={{ text: 'お知らせ' }}>{children}</InformationPanel>`,
      output: `<InformationPanel heading={'お知らせ'}>{children}</InformationPanel>`,
      errors: [{ message: buildMessage('heading', 'text') }],
    },

    // Text: maxLines
    {
      code: `<Text maxLines={{ max: 3 }}>{children}</Text>`,
      output: `<Text maxLines={3}>{children}</Text>`,
      errors: [{ message: buildMessage('maxLines', 'max') }],
    },

    // Text: icon
    {
      code: `<Text icon={{ prefix: <Icon /> }}>{children}</Text>`,
      output: `<Text icon={<Icon />}>{children}</Text>`,
      errors: [{ message: buildMessage('icon', 'prefix') }],
    },

    // ActionDialog: heading/actionButton/closeButton
    {
      code: `<ControlledActionDialog heading={{ text: '確認' }} actionButton={{ text: '送信' }} closeButton={{ text: '閉じる' }}>{children}</ControlledActionDialog>`,
      output: `<ControlledActionDialog heading={'確認'} actionButton={'送信'} closeButton={'閉じる'}>{children}</ControlledActionDialog>`,
      errors: [
        { message: buildMessage('heading', 'text') },
        { message: buildMessage('actionButton', 'text') },
        { message: buildMessage('closeButton', 'text') },
      ],
    },

    // FormDialog: heading
    {
      code: `<RemoteTriggerFormDialog heading={{ text: '確認' }}>{children}</RemoteTriggerFormDialog>`,
      output: `<RemoteTriggerFormDialog heading={'確認'}>{children}</RemoteTriggerFormDialog>`,
      errors: [{ message: buildMessage('heading', 'text') }],
    },

    // MessageDialog: heading
    {
      code: `<ControlledMessageDialog heading={{ text: '確認' }}>{children}</ControlledMessageDialog>`,
      output: `<ControlledMessageDialog heading={'確認'}>{children}</ControlledMessageDialog>`,
      errors: [{ message: buildMessage('heading', 'text') }],
    },

    // StepFormDialog: submitButton/closeButton/backButton
    {
      code: `<ControlledStepFormDialog submitButton={{ text: '送信' }} closeButton={{ text: '閉じる' }} backButton={{ text: '戻る' }}>{children}</ControlledStepFormDialog>`,
      output: `<ControlledStepFormDialog submitButton={'送信'} closeButton={'閉じる'} backButton={'戻る'}>{children}</ControlledStepFormDialog>`,
      errors: [
        { message: buildMessage('submitButton', 'text') },
        { message: buildMessage('closeButton', 'text') },
        { message: buildMessage('backButton', 'text') },
      ],
    },

    // StepFormDialogはFormDialogで終わる名称でもあるため、heading検出が二重報告されないことを確認
    {
      code: `<ControlledStepFormDialog heading={{ text: '確認' }}>{children}</ControlledStepFormDialog>`,
      output: `<ControlledStepFormDialog heading={'確認'}>{children}</ControlledStepFormDialog>`,
      errors: [{ message: buildMessage('heading', 'text') }],
    },

    // Button: disabledReason
    {
      code: `<Button disabledReason={{ message: '権限がありません' }}>保存</Button>`,
      output: `<Button disabledReason={'権限がありません'}>保存</Button>`,
      errors: [{ message: buildMessage('disabledReason', 'message') }],
    },

    // AnchorButton: inactiveReason
    {
      code: `<AnchorButton inactiveReason={{ message: '権限がありません' }}>保存</AnchorButton>`,
      output: `<AnchorButton inactiveReason={'権限がありません'}>保存</AnchorButton>`,
      errors: [{ message: buildMessage('inactiveReason', 'message') }],
    },
  ],
})
