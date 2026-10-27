/**
 * smarthr-ui v100 → v101 移行ルール テストケース
 */

const v100ToV101Options = [{ from: '100', to: '101' }]

const README_URL =
  'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v100-to-v101/README.md'

// ============================================================
// validテストケース（エラーにならないコード）
// ============================================================

const valid = [
  // ============================================================
  // 移行後の書き方
  // ============================================================
  {
    code: `<SingleCombobox items={items} selectedItem={selectedItem} emptySelectionFallbackItem={items[0]} />`,
    options: v100ToV101Options,
  },
  {
    code: `<SingleCombobox items={items} selectedItem={selectedItem} />`,
    options: v100ToV101Options,
  },
  {
    code: `<Badge color="red">3</Badge>`,
    options: v100ToV101Options,
  },
  {
    code: `<Badge>3</Badge>`,
    options: v100ToV101Options,
  },

  // ============================================================
  // 他コンポーネントの同名属性（誤検出防止）
  // ============================================================
  {
    code: `<button type="submit">送信</button>`,
    options: v100ToV101Options,
  },
  {
    code: `<OtherCombobox defaultItem={items[0]} />`,
    options: v100ToV101Options,
  },
]

// ============================================================
// invalidテストケース（エラーになるコード）
// ============================================================

const invalid = [
  // ============================================================
  // SingleCombobox: defaultItem → emptySelectionFallbackItem
  // ============================================================
  {
    code: `<SingleCombobox items={items} selectedItem={selectedItem} defaultItem={items[0]} />`,
    output: `<SingleCombobox items={items} selectedItem={selectedItem} emptySelectionFallbackItem={items[0]} />`,
    options: v100ToV101Options,
    errors: [
      {
        messageId: 'renameAttribute',
        data: {
          component: 'SingleCombobox',
          oldName: 'defaultItem',
          newName: 'emptySelectionFallbackItem',
          to: 'v101',
          readmeUrl: README_URL,
        },
      },
    ],
  },

  // ============================================================
  // Badge: type → color
  // ============================================================
  {
    code: `<Badge type="red">3</Badge>`,
    output: `<Badge color="red">3</Badge>`,
    options: v100ToV101Options,
    errors: [
      {
        messageId: 'renameAttribute',
        data: { component: 'Badge', oldName: 'type', newName: 'color', to: 'v101', readmeUrl: README_URL },
      },
    ],
  },
  {
    code: `<Badge type="red" dot>3</Badge>`,
    output: `<Badge color="red" dot>3</Badge>`,
    options: v100ToV101Options,
    errors: [
      {
        messageId: 'renameAttribute',
        data: { component: 'Badge', oldName: 'type', newName: 'color', to: 'v101', readmeUrl: README_URL },
      },
    ],
  },
]

module.exports = { valid, invalid }
