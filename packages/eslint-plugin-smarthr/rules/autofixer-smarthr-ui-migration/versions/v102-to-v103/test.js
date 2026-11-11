/**
 * smarthr-ui v102 → v103 移行ルール テストケース
 */

const v102ToV103Options = [{ from: '102', to: '103' }]

const README_URL =
  'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v102-to-v103/README.md'

// ============================================================
// validテストケース（エラーにならないコード）
// ============================================================

const valid = [
  // ============================================================
  // 移行後の書き方
  // ============================================================
  {
    code: `<SingleCombobox items={items} selectedItem={selectedItem} onChangeInput={onChangeInput} />`,
    options: v102ToV103Options,
  },
  {
    code: `<MultiCombobox items={items} selectedItems={selectedItems} onChangeInput={onChangeInput} />`,
    options: v102ToV103Options,
  },

  // ============================================================
  // 他コンポーネントの同名属性（誤検出防止）
  // ============================================================
  {
    code: `<input onChange={onChange} />`,
    options: v102ToV103Options,
  },
  {
    code: `<OtherCombobox onChange={onChange} />`,
    options: v102ToV103Options,
  },
]

// ============================================================
// invalidテストケース（エラーになるコード）
// ============================================================

const invalid = [
  // ============================================================
  // SingleCombobox: onChange → onChangeInput
  // ============================================================
  {
    code: `<SingleCombobox items={items} selectedItem={selectedItem} onChange={onChangeInput} />`,
    output: `<SingleCombobox items={items} selectedItem={selectedItem} onChangeInput={onChangeInput} />`,
    options: v102ToV103Options,
    errors: [
      {
        messageId: 'renameAttribute',
        data: {
          component: 'SingleCombobox',
          oldName: 'onChange',
          newName: 'onChangeInput',
          to: 'v103',
          readmeUrl: README_URL,
        },
      },
    ],
  },

  // ============================================================
  // MultiCombobox: onChange → onChangeInput
  // ============================================================
  {
    code: `<MultiCombobox items={items} selectedItems={selectedItems} onChange={onChangeInput} />`,
    output: `<MultiCombobox items={items} selectedItems={selectedItems} onChangeInput={onChangeInput} />`,
    options: v102ToV103Options,
    errors: [
      {
        messageId: 'renameAttribute',
        data: {
          component: 'MultiCombobox',
          oldName: 'onChange',
          newName: 'onChangeInput',
          to: 'v103',
          readmeUrl: README_URL,
        },
      },
    ],
  },
]

module.exports = { valid, invalid }
