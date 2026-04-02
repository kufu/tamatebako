const v90ToV91Options = [{ from: '90', to: '91' }]

// ============================================================
// ヘルパー関数: テストケース生成
// ============================================================

/**
 * Dialogコンポーネントのリネームテストケースを生成
 */
function createDialogRenameTests(oldName, newName) {
  return {
    import: {
      code: `import { ${oldName} } from 'smarthr-ui'`,
      output: `import { ${newName} } from 'smarthr-ui'`,
      options: v90ToV91Options,
      errors: [{ messageId: 'renameDialog', data: { old: oldName, new: newName, to: 'v91' } }],
    },
    jsx: {
      code: `<${oldName}>Xxxx</${oldName}>`,
      output: `<${newName}>Xxxx</${newName}>`,
      options: v90ToV91Options,
      errors: [{ messageId: 'renameDialog', data: { old: oldName, new: newName, to: 'v91' } }],
    },
  }
}

/**
 * ResponseMessageのiconGap移行テストケースを生成（Heading内）
 */
function createIconGapMigrationTest(status, iconName) {
  return {
    code: `<Heading><ResponseMessage status="${status}" iconGap={0.5}>Xxxx</ResponseMessage></Heading>`,
    output: `<Heading icon={{ prefix: <${iconName} />, gap: 0.5 }}>Xxxx</Heading>`,
    options: v90ToV91Options,
    errors: [{ messageId: 'removeIconGap' }],
  }
}

// ============================================================
// テストケース
// ============================================================

module.exports = {
  valid: [
    // v91形式は正常
    { code: `import { ControlledActionDialog } from 'smarthr-ui'`, options: v90ToV91Options },
    { code: `<ControlledActionDialog>Xxxx</ControlledActionDialog>`, options: v90ToV91Options },
    { code: `<ResponseMessage status="success">Xxxx</ResponseMessage>`, options: v90ToV91Options },
    { code: `<Heading icon={{ prefix: <FaCheckIcon />, gap: 0.5 }}>Xxxx</Heading>`, options: v90ToV91Options },
    { code: `<AppHeader email="test@example.com" />`, options: v90ToV91Options },
  ],

  invalid: [
    // ============================================================
    // 1. Dialogコンポーネントのリネーム
    // ============================================================

    // import文
    createDialogRenameTests('ActionDialog', 'ControlledActionDialog').import,
    createDialogRenameTests('FormDialog', 'ControlledFormDialog').import,

    // 複数import
    {
      code: `import { ActionDialog, FormDialog } from 'smarthr-ui'`,
      output: `import { ControlledActionDialog, ControlledFormDialog } from 'smarthr-ui'`,
      options: v90ToV91Options,
      errors: [
        { messageId: 'renameDialog', data: { old: 'ActionDialog', new: 'ControlledActionDialog', to: 'v91' } },
        { messageId: 'renameDialog', data: { old: 'FormDialog', new: 'ControlledFormDialog', to: 'v91' } },
      ],
    },

    // JSX要素
    createDialogRenameTests('ActionDialog', 'ControlledActionDialog').jsx,
    createDialogRenameTests('MessageDialog', 'ControlledMessageDialog').jsx,

    // 自己閉じタグ
    {
      code: `<ActionDialog />`,
      output: `<ControlledActionDialog />`,
      options: v90ToV91Options,
      errors: [{ messageId: 'renameDialog', data: { old: 'ActionDialog', new: 'ControlledActionDialog', to: 'v91' } }],
    },

    // ============================================================
    // 2. ResponseMessageのtype→status
    // ============================================================
    {
      code: `<ResponseMessage type="success">Xxxx</ResponseMessage>`,
      output: `<ResponseMessage status="success">Xxxx</ResponseMessage>`,
      options: v90ToV91Options,
      errors: [{ messageId: 'renameType' }],
    },

    // ============================================================
    // 3. ResponseMessageのright削除（エラーのみ）
    // ============================================================
    {
      code: `<ResponseMessage right>Xxxx</ResponseMessage>`,
      output: null,
      options: v90ToV91Options,
      errors: [{ messageId: 'removeRight' }],
    },

    // ============================================================
    // 4. ResponseMessageのiconGap移行
    // ============================================================

    // パターンC: 適切な親がない → iconGapのみ削除
    {
      code: `<div><ResponseMessage iconGap={0.5}>Xxxx</ResponseMessage></div>`,
      output: `<div><ResponseMessage>Xxxx</ResponseMessage></div>`,
      options: v90ToV91Options,
      errors: [{ messageId: 'removeIconGap' }],
    },
    {
      code: `<ResponseMessage status="success" iconGap={0.5}>Xxxx</ResponseMessage>`,
      output: `<ResponseMessage status="success">Xxxx</ResponseMessage>`,
      options: v90ToV91Options,
      errors: [{ messageId: 'removeIconGap' }],
    },

    // パターンB: 親にiconなし → iconを追加
    createIconGapMigrationTest('success', 'FaCircleCheckIcon'),
    createIconGapMigrationTest('warning', 'WarningIcon'),

    // パターンA: 親にiconあり → エラーのみ
    {
      code: `<Heading icon={<FaUserIcon />}><ResponseMessage iconGap={0.5}>Xxxx</ResponseMessage></Heading>`,
      output: null,
      options: v90ToV91Options,
      errors: [{ messageId: 'removeIconGapWithParentIcon' }],
    },

    // FormControl/Fieldset
    {
      code: `<FormControl label={<ResponseMessage status="success" iconGap={0.5}>Xxxx</ResponseMessage>} />`,
      output: `<FormControl label={{ text: Xxxx, icon: { prefix: <FaCircleCheckIcon />, gap: 0.5 } }} />`,
      options: v90ToV91Options,
      errors: [{ messageId: 'removeIconGap' }],
    },
    {
      code: `<Fieldset legend={<ResponseMessage status="error" iconGap={0.5}>Xxxx</ResponseMessage>} />`,
      output: `<Fieldset legend={{ text: Xxxx, icon: { prefix: <FaCircleExclamationIcon />, gap: 0.5 } }} />`,
      options: v90ToV91Options,
      errors: [{ messageId: 'removeIconGap' }],
    },

    // ネストが深い場合
    {
      code: `<Heading><div><span><ResponseMessage status="success" iconGap={0.5}>Xxxx</ResponseMessage></span></div></Heading>`,
      output: `<Heading icon={{ prefix: <FaCircleCheckIcon />, gap: 0.5 }}><div><span>Xxxx</span></div></Heading>`,
      options: v90ToV91Options,
      errors: [{ messageId: 'removeIconGap' }],
    },
    {
      code: `<Heading icon={<FaUserIcon />}><div><ResponseMessage iconGap={0.5}>Xxxx</ResponseMessage></div></Heading>`,
      output: null,
      options: v90ToV91Options,
      errors: [{ messageId: 'removeIconGapWithParentIcon' }],
    },

    // FormControlにiconがある場合
    {
      code: `<FormControl label={{ text: <ResponseMessage status="success" iconGap={0.5}>Xxxx</ResponseMessage>, icon: <FaUserIcon /> }} />`,
      output: null,
      options: v90ToV91Options,
      errors: [{ messageId: 'removeIconGapWithParentIcon' }],
    },

    // ============================================================
    // 5. AppHeaderのarbitraryDisplayName削除
    // ============================================================
    {
      code: `<AppHeader arbitraryDisplayName="山田太郎" email="test@example.com" />`,
      output: `<AppHeader email="test@example.com" />`,
      options: v90ToV91Options,
      errors: [{ messageId: 'removeArbitraryDisplayName' }],
    },
  ],
}
