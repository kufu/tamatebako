/**
 * smarthr-ui v101 → v102 移行ルール テストケース
 */

const v101ToV102Options = [{ from: '101', to: '102' }]

const README_URL =
  'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v101-to-v102/README.md'

// ============================================================
// validテストケース（エラーにならないコード）
// ============================================================

const valid = [
  // ============================================================
  // 移行後の書き方
  // ============================================================
  {
    code: `<FilterDropdown filtered={{ alt: '適用中' }} onApply={onApply}>hoge</FilterDropdown>`,
    options: v101ToV102Options,
  },
  {
    code: `<DropdownMenuButton trigger={{ text: 'その他の操作', size: 'S' }}>hoge</DropdownMenuButton>`,
    options: v101ToV102Options,
  },

  // ============================================================
  // オブジェクト形式でない場合（対象外）
  // ============================================================
  {
    code: `<FilterDropdown filtered={true} onApply={onApply}>hoge</FilterDropdown>`,
    options: v101ToV102Options,
  },
  {
    code: `<DropdownMenuButton trigger="その他の操作">hoge</DropdownMenuButton>`,
    options: v101ToV102Options,
  },

  // ============================================================
  // 他コンポーネントの同名属性（誤検出防止）
  // ============================================================
  {
    code: `<OtherFilterDropdown filtered={{ iconAlt: '適用中' }} />`,
    options: v101ToV102Options,
  },
]

// ============================================================
// invalidテストケース（エラーになるコード）
// ============================================================

const invalid = [
  // ============================================================
  // FilterDropdown: filtered.iconAlt → filtered.alt
  // ============================================================
  {
    code: `<FilterDropdown filtered={{ iconAlt: '適用中' }} onApply={onApply}>hoge</FilterDropdown>`,
    output: `<FilterDropdown filtered={{ alt: '適用中' }} onApply={onApply}>hoge</FilterDropdown>`,
    options: v101ToV102Options,
    errors: [
      {
        messageId: 'renameObjectKey',
        data: {
          component: 'FilterDropdown',
          attribute: 'filtered',
          oldKey: 'iconAlt',
          newKey: 'alt',
          to: 'v102',
          readmeUrl: README_URL,
        },
      },
    ],
  },

  // ============================================================
  // DropdownMenuButton: trigger.children → trigger.text
  // ============================================================
  {
    code: `<DropdownMenuButton trigger={{ children: 'その他の操作', size: 'S' }}>hoge</DropdownMenuButton>`,
    output: `<DropdownMenuButton trigger={{ text: 'その他の操作', size: 'S' }}>hoge</DropdownMenuButton>`,
    options: v101ToV102Options,
    errors: [
      {
        messageId: 'renameObjectKey',
        data: {
          component: 'DropdownMenuButton',
          attribute: 'trigger',
          oldKey: 'children',
          newKey: 'text',
          to: 'v102',
          readmeUrl: README_URL,
        },
      },
    ],
  },
]

module.exports = { valid, invalid }
