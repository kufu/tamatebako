const v91ToV92Options = [{ from: '91', to: '92' }]

// ============================================================
// ヘルパー関数: テストケース生成
// ============================================================

/**
 * RemoteTriggerダイアログのリネームテストケースを生成
 */
function createRemoteTriggerDialogRenameTests(oldName, newName) {
  return {
    import: {
      code: `import { ${oldName} } from 'smarthr-ui'`,
      output: `import { ${newName} } from 'smarthr-ui'`,
      options: v91ToV92Options,
      errors: [{ messageId: 'renameRemoteTriggerDialog', data: { old: oldName, new: newName, to: 'v92' } }],
    },
    jsx: {
      code: `<${oldName}>Xxxx</${oldName}>`,
      output: `<${newName}>Xxxx</${newName}>`,
      options: v91ToV92Options,
      errors: [{ messageId: 'renameRemoteTriggerDialog', data: { old: oldName, new: newName, to: 'v92' } }],
    },
  }
}

/**
 * サイズ値変換テストケースを生成
 */
function createSizeConversionTest(component, oldValue, newValue) {
  return {
    code: `<${component} size="${oldValue}" />`,
    output: `<${component} size="${newValue}" />`,
    options: v91ToV92Options,
    errors: [{ messageId: 'convertSizeValue', data: { old: oldValue, new: newValue, to: 'v92' } }],
  }
}

// ============================================================
// テストケース
// ============================================================

module.exports = {
  valid: [
    // v92形式は正常
    { code: `import { ActionDialog } from 'smarthr-ui'`, options: v91ToV92Options },
    { code: `import { FormDialog } from 'smarthr-ui'`, options: v91ToV92Options },
    { code: `<ActionDialog>Xxxx</ActionDialog>`, options: v91ToV92Options },
    { code: `<Button size="M" />`, options: v91ToV92Options },
    { code: `<Button size="S" />`, options: v91ToV92Options },
    { code: `<Loader size="M" />`, options: v91ToV92Options },
    { code: `<MultiCombobox items={[]} />`, options: v91ToV92Options },

    // Controlled版は変更なし
    { code: `import { ControlledActionDialog } from 'smarthr-ui'`, options: v91ToV92Options },
    { code: `<ControlledActionDialog>Xxxx</ControlledActionDialog>`, options: v91ToV92Options },

    // size属性がない、または変数の場合はスキップ
    { code: `<Button />`, options: v91ToV92Options },
    { code: `<Button size={dynamicSize} />`, options: v91ToV92Options },

    // 対象外のコンポーネント
    { code: `<CustomButton size="default" />`, options: v91ToV92Options },
    { code: `<Text size="s" />`, options: v91ToV92Options },

    // smarthrUiAliasオプション: aliasファイル外では置換しない
    {
      code: `export const RemoteTriggerActionDialog = (props) => <div>{props.children}</div>`,
      filename: '/Users/test/src/features/custom/RemoteTriggerActionDialog.tsx',
      options: [{ from: '91', to: '92', smarthrUiAlias: '@/components/parts/smarthr-ui' }],
    },

    // smarthrUiAliasオプション: v92形式は正常
    {
      code: `import { ActionDialog } from '@/components/parts/smarthr-ui'`,
      options: [{ from: '91', to: '92', smarthrUiAlias: '@/components/parts/smarthr-ui' }],
    },
    {
      code: `export const ActionDialog = (props) => <div>{props.children}</div>`,
      filename: '/Users/test/src/components/parts/smarthr-ui/ActionDialog.tsx',
      options: [{ from: '91', to: '92', smarthrUiAlias: '@/components/parts/smarthr-ui' }],
    },
  ],

  invalid: [
    // ============================================================
    // 1. RemoteTriggerダイアログのリネーム
    // ============================================================

    // import文
    createRemoteTriggerDialogRenameTests('RemoteTriggerActionDialog', 'ActionDialog').import,
    createRemoteTriggerDialogRenameTests('RemoteTriggerFormDialog', 'FormDialog').import,
    createRemoteTriggerDialogRenameTests('RemoteTriggerMessageDialog', 'MessageDialog').import,
    createRemoteTriggerDialogRenameTests('RemoteTriggerStepFormDialog', 'StepFormDialog').import,

    // 複数import
    {
      code: `import { RemoteTriggerActionDialog, RemoteTriggerFormDialog } from 'smarthr-ui'`,
      output: `import { ActionDialog, FormDialog } from 'smarthr-ui'`,
      options: v91ToV92Options,
      errors: [
        { messageId: 'renameRemoteTriggerDialog', data: { old: 'RemoteTriggerActionDialog', new: 'ActionDialog', to: 'v92' } },
        { messageId: 'renameRemoteTriggerDialog', data: { old: 'RemoteTriggerFormDialog', new: 'FormDialog', to: 'v92' } },
      ],
    },

    // re-export
    {
      code: `export { RemoteTriggerActionDialog } from 'smarthr-ui'`,
      output: `export { ActionDialog } from 'smarthr-ui'`,
      options: v91ToV92Options,
      errors: [{ messageId: 'renameRemoteTriggerDialog', data: { old: 'RemoteTriggerActionDialog', new: 'ActionDialog', to: 'v92' } }],
    },

    // re-export with alias
    {
      code: `export { RemoteTriggerActionDialog as MyDialog } from 'smarthr-ui'`,
      output: `export { ActionDialog as MyDialog } from 'smarthr-ui'`,
      options: v91ToV92Options,
      errors: [{ messageId: 'renameRemoteTriggerDialog', data: { old: 'RemoteTriggerActionDialog', new: 'ActionDialog', to: 'v92' } }],
    },

    // JSX要素
    createRemoteTriggerDialogRenameTests('RemoteTriggerActionDialog', 'ActionDialog').jsx,
    createRemoteTriggerDialogRenameTests('RemoteTriggerFormDialog', 'FormDialog').jsx,

    // self-closing
    {
      code: `<RemoteTriggerActionDialog />`,
      output: `<ActionDialog />`,
      options: v91ToV92Options,
      errors: [{ messageId: 'renameRemoteTriggerDialog', data: { old: 'RemoteTriggerActionDialog', new: 'ActionDialog', to: 'v92' } }],
    },

    // ============================================================
    // 2. サイズ指定の大文字統一
    // ============================================================

    // Button
    createSizeConversionTest('Button', 'default', 'M'),
    createSizeConversionTest('Button', 's', 'S'),
    createSizeConversionTest('AnchorButton', 'default', 'M'),

    // Select
    createSizeConversionTest('Select', 's', 'S'),
    createSizeConversionTest('Select', 'm', 'M'),

    // Loader
    createSizeConversionTest('Loader', 's', 'S'),
    createSizeConversionTest('Loader', 'm', 'M'),
    createSizeConversionTest('LoaderSpinner', 'm', 'M'),

    // SideNav
    createSizeConversionTest('SideNav', 's', 'S'),
    createSizeConversionTest('SideNavItemButton', 's', 'S'),

    // InputFile
    createSizeConversionTest('InputFile', 'default', 'M'),

    // ============================================================
    // 3. decorators属性削除（自動修正あり）
    // ============================================================

    // Combobox: noResultTextのみ（文字列リテラル）
    {
      code: `<MultiCombobox decorators={{ noResultText: () => 'No results' }} items={[]} />`,
      output: `<MultiCombobox noResultText="No results" items={[]} />`,
      options: v91ToV92Options,
      errors: [{ messageId: 'removeDecorators', data: { component: 'MultiCombobox', to: 'v92' } }],
    },
    {
      code: `<SingleCombobox decorators={{ noResultText: () => "該当なし" }} items={[]} />`,
      output: `<SingleCombobox noResultText="該当なし" items={[]} />`,
      options: v91ToV92Options,
      errors: [{ messageId: 'removeDecorators', data: { component: 'SingleCombobox', to: 'v92' } }],
    },

    // Combobox: noResultText + 他のプロパティ（noResultTextのみ移行、他は削除）
    {
      code: `<MultiCombobox decorators={{ noResultText: () => '該当なし', selectedListAriaLabel: () => '選択済み' }} items={[]} />`,
      output: `<MultiCombobox noResultText="該当なし" items={[]} />`,
      options: v91ToV92Options,
      errors: [{ messageId: 'removeDecorators', data: { component: 'MultiCombobox', to: 'v92' } }],
    },

    // Combobox: noResultTextが変数参照
    {
      code: `<MultiCombobox decorators={{ noResultText: () => message }} items={[]} />`,
      output: `<MultiCombobox noResultText={message} items={[]} />`,
      options: v91ToV92Options,
      errors: [{ messageId: 'removeDecorators', data: { component: 'MultiCombobox', to: 'v92' } }],
    },

    // Combobox: noResultTextが関数呼び出し
    {
      code: `<SingleCombobox decorators={{ noResultText: () => getMessage() }} items={[]} />`,
      output: `<SingleCombobox noResultText={getMessage()} items={[]} />`,
      options: v91ToV92Options,
      errors: [{ messageId: 'removeDecorators', data: { component: 'SingleCombobox', to: 'v92' } }],
    },

    // Combobox: noResultTextがテンプレートリテラル
    {
      code: `<MultiCombobox decorators={{ noResultText: () => \`\${count}件該当\` }} items={[]} />`,
      output: `<MultiCombobox noResultText={\`\${count}件該当\`} items={[]} />`,
      options: v91ToV92Options,
      errors: [{ messageId: 'removeDecorators', data: { component: 'MultiCombobox', to: 'v92' } }],
    },

    // Combobox: noResultTextがない場合（decorators削除のみ）
    {
      code: `<MultiCombobox decorators={{ selectedListAriaLabel: () => '選択済み' }} items={[]} />`,
      output: `<MultiCombobox items={[]} />`,
      options: v91ToV92Options,
      errors: [{ messageId: 'removeDecorators', data: { component: 'MultiCombobox', to: 'v92' } }],
    },

    // Combobox: noResultTextにreturnがある場合（エラーのみ、手動対応）
    {
      code: `<MultiCombobox decorators={{ noResultText: () => { return '該当なし' } }} items={[]} />`,
      options: v91ToV92Options,
      errors: [{ messageId: 'migrateNoResultTextManually', data: { component: 'MultiCombobox', to: 'v92' } }],
    },

    // Combobox: noResultTextに引数がある場合（エラーのみ、手動対応）
    {
      code: `<MultiCombobox decorators={{ noResultText: (defaultText) => defaultText }} items={[]} />`,
      options: v91ToV92Options,
      errors: [{ messageId: 'migrateNoResultTextManually', data: { component: 'MultiCombobox', to: 'v92' } }],
    },

    // Combobox: spread syntaxがある場合（エラーのみ、手動対応）
    {
      code: `<MultiCombobox decorators={{ ...baseDecorators, noResultText: () => '該当なし' }} items={[]} />`,
      options: v91ToV92Options,
      errors: [{ messageId: 'migrateNoResultTextManually', data: { component: 'MultiCombobox', to: 'v92' } }],
    },
    {
      code: `<SingleCombobox decorators={{ noResultText: () => '該当なし', ...otherDecorators }} items={[]} />`,
      options: v91ToV92Options,
      errors: [{ messageId: 'migrateNoResultTextManually', data: { component: 'SingleCombobox', to: 'v92' } }],
    },

    // 他のコンポーネント: decorators削除のみ（現状通り）
    {
      code: `<SearchInput decorators={{ clearButtonLabel: () => 'Clear' }} />`,
      output: `<SearchInput />`,
      options: v91ToV92Options,
      errors: [{ messageId: 'removeDecorators', data: { component: 'SearchInput', to: 'v92' } }],
    },
    {
      code: `<Textarea decorators={{ visibleWordLength: () => '0/100' }} />`,
      output: `<Textarea />`,
      options: v91ToV92Options,
      errors: [{ messageId: 'removeDecorators', data: { component: 'Textarea', to: 'v92' } }],
    },
    {
      code: `<InformationPanel decorators={{ openButtonLabel: () => 'Open' }} />`,
      output: `<InformationPanel />`,
      options: v91ToV92Options,
      errors: [{ messageId: 'removeDecorators', data: { component: 'InformationPanel', to: 'v92' } }],
    },

    // decorators属性が複数属性の間にある場合（noResultTextあり）
    {
      code: `<MultiCombobox name="test" decorators={{ noResultText: () => 'No results' }} items={[]} />`,
      output: `<MultiCombobox noResultText="No results" name="test" items={[]} />`,
      options: v91ToV92Options,
      errors: [{ messageId: 'removeDecorators', data: { component: 'MultiCombobox', to: 'v92' } }],
    },

    // ============================================================
    // smarthrUiAliasオプション
    // ============================================================

    // aliasからのimport
    {
      code: `import { RemoteTriggerActionDialog } from '@/components/parts/smarthr-ui'`,
      output: `import { ActionDialog } from '@/components/parts/smarthr-ui'`,
      options: [{ from: '91', to: '92', smarthrUiAlias: '@/components/parts/smarthr-ui' }],
      errors: [{ messageId: 'renameRemoteTriggerDialog', data: { old: 'RemoteTriggerActionDialog', new: 'ActionDialog', to: 'v92' } }],
    },

    // aliasファイル内のexport変数名
    {
      code: `export const RemoteTriggerActionDialog = (props) => <div>{props.children}</div>`,
      output: `export const ActionDialog = (props) => <div>{props.children}</div>`,
      filename: '/Users/test/src/components/parts/smarthr-ui/RemoteTriggerActionDialog.tsx',
      options: [{ from: '91', to: '92', smarthrUiAlias: '@/components/parts/smarthr-ui' }],
      errors: [
        { messageId: 'renameAliasFile', data: { old: 'RemoteTriggerActionDialog', new: 'ActionDialog', to: 'v92', oldFile: 'RemoteTriggerActionDialog.tsx', newFile: 'ActionDialog.tsx' } },
        { messageId: 'renameRemoteTriggerDialog', data: { old: 'RemoteTriggerActionDialog', new: 'ActionDialog', to: 'v92' } },
      ],
    },

    // 単一ファイル形式
    {
      code: `export const RemoteTriggerFormDialog = (props) => <div>{props.children}</div>`,
      output: `export const FormDialog = (props) => <div>{props.children}</div>`,
      filename: '/Users/test/src/components/parts/smarthr-ui.tsx',
      options: [{ from: '91', to: '92', smarthrUiAlias: '@/components/parts/smarthr-ui' }],
      errors: [{ messageId: 'renameRemoteTriggerDialog', data: { old: 'RemoteTriggerFormDialog', new: 'FormDialog', to: 'v92' } }],
    },

    // re-export from alias
    {
      code: `export { RemoteTriggerMessageDialog } from '@/components/parts/smarthr-ui'`,
      output: `export { MessageDialog } from '@/components/parts/smarthr-ui'`,
      options: [{ from: '91', to: '92', smarthrUiAlias: '@/components/parts/smarthr-ui' }],
      errors: [{ messageId: 'renameRemoteTriggerDialog', data: { old: 'RemoteTriggerMessageDialog', new: 'MessageDialog', to: 'v92' } }],
    },
  ],
}
