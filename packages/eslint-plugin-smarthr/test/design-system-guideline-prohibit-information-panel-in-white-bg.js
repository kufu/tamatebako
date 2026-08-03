const rule = require('../rules/design-system-guideline-prohibit-information-panel-in-white-bg')
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

ruleTester.run('design-system-guideline-prohibit-information-panel-in-white-bg', rule, {
  valid: [
    // InformationPanel単体（Base外）
    {
      code: '<InformationPanel>情報</InformationPanel>',
    },

    // Base > BaseColumn > InformationPanel
    {
      code: '<Base><BaseColumn><InformationPanel>情報</InformationPanel></BaseColumn></Base>',
    },

    // Stack内
    {
      code: '<Stack><InformationPanel>情報</InformationPanel></Stack>',
    },

    // Cluster内
    {
      code: '<Cluster><InformationPanel>情報</InformationPanel></Cluster>',
    },

    // Base > BaseColumn > div > InformationPanel
    {
      code: '<Base><BaseColumn><div><InformationPanel>情報</InformationPanel></div></BaseColumn></Base>',
    },

    // ActionDialog with contentBgColor="COLUMN"
    {
      code: '<ActionDialog contentBgColor="COLUMN"><InformationPanel>情報</InformationPanel></ActionDialog>',
    },

    // FormDialog with contentBgColor="OVER_BACKGROUND"
    {
      code: '<FormDialog contentBgColor="OVER_BACKGROUND"><InformationPanel>情報</InformationPanel></FormDialog>',
    },

    // MessageDialog with contentBgColor="COLUMN"
    {
      code: '<MessageDialog contentBgColor="COLUMN"><InformationPanel>情報</InformationPanel></MessageDialog>',
    },

    // StepFormDialog with contentBgColor="OVER_BACKGROUND"
    {
      code: '<StepFormDialog contentBgColor="OVER_BACKGROUND"><InformationPanel>情報</InformationPanel></StepFormDialog>',
    },

    // Dialog > BaseColumn > InformationPanel
    {
      code: '<ActionDialog><BaseColumn><InformationPanel>情報</InformationPanel></BaseColumn></ActionDialog>',
    },

    // Panel > BaseColumn > InformationPanel
    {
      code: '<Panel><BaseColumn><InformationPanel>情報</InformationPanel></BaseColumn></Panel>',
    },

    // Panel > BaseColumn > div > InformationPanel
    {
      code: '<Panel><BaseColumn><div><InformationPanel>情報</InformationPanel></div></BaseColumn></Panel>',
    },
  ],

  invalid: [
    // Base直下
    {
      code: '<Base><InformationPanel>情報</InformationPanel></Base>',
      errors: [{ messageId: 'inWhiteBg' }],
    },

    // Base > div > InformationPanel
    {
      code: '<Base><div><InformationPanel>情報</InformationPanel></div></Base>',
      errors: [{ messageId: 'inWhiteBg' }],
    },

    // Base > Stack > InformationPanel
    {
      code: '<Base><Stack><InformationPanel>情報</InformationPanel></Stack></Base>',
      errors: [{ messageId: 'inWhiteBg' }],
    },

    // Base > BaseColumn > Base > InformationPanel
    {
      code: '<Base><BaseColumn><Base><InformationPanel>情報</InformationPanel></Base></BaseColumn></Base>',
      errors: [{ messageId: 'inWhiteBg' }],
    },

    // ActionDialog（contentBgColor未指定）
    {
      code: '<ActionDialog><InformationPanel>情報</InformationPanel></ActionDialog>',
      errors: [{ messageId: 'inWhiteBg' }],
    },

    // FormDialog（contentBgColor="WHITE"）
    {
      code: '<FormDialog contentBgColor="WHITE"><InformationPanel>情報</InformationPanel></FormDialog>',
      errors: [{ messageId: 'inWhiteBg' }],
    },

    // MessageDialog（contentBgColor未指定）
    {
      code: '<MessageDialog><InformationPanel>情報</InformationPanel></MessageDialog>',
      errors: [{ messageId: 'inWhiteBg' }],
    },

    // StepFormDialog（contentBgColor="WHITE"）
    {
      code: '<StepFormDialog contentBgColor="WHITE"><InformationPanel>情報</InformationPanel></StepFormDialog>',
      errors: [{ messageId: 'inWhiteBg' }],
    },

    // ActionDialog > div > InformationPanel（contentBgColor未指定）
    {
      code: '<ActionDialog><div><InformationPanel>情報</InformationPanel></div></ActionDialog>',
      errors: [{ messageId: 'inWhiteBg' }],
    },

    // ネスト: Base > div > Base > InformationPanel
    {
      code: '<Base><div><Base><InformationPanel>情報</InformationPanel></Base></div></Base>',
      errors: [{ messageId: 'inWhiteBg' }],
    },

    // Panel直下
    {
      code: '<Panel><InformationPanel>情報</InformationPanel></Panel>',
      errors: [{ messageId: 'inWhiteBg' }],
    },

    // Panel > div > InformationPanel
    {
      code: '<Panel><div><InformationPanel>情報</InformationPanel></div></Panel>',
      errors: [{ messageId: 'inWhiteBg' }],
    },

    // Panel > Stack > InformationPanel
    {
      code: '<Panel><Stack><InformationPanel>情報</InformationPanel></Stack></Panel>',
      errors: [{ messageId: 'inWhiteBg' }],
    },

    // Panel > BaseColumn > Panel > InformationPanel
    {
      code: '<Panel><BaseColumn><Panel><InformationPanel>情報</InformationPanel></Panel></BaseColumn></Panel>',
      errors: [{ messageId: 'inWhiteBg' }],
    },

    // ネスト: Panel > div > Panel > InformationPanel
    {
      code: '<Panel><div><Panel><InformationPanel>情報</InformationPanel></Panel></div></Panel>',
      errors: [{ messageId: 'inWhiteBg' }],
    },
  ],
})
