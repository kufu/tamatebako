/**
 * smarthr-ui v96 → v97 移行ルール テストケース
 */

const v96ToV97Options = [{ from: '96', to: '97' }]

// ============================================================
// validテストケース（エラーにならないコード）
// ============================================================

const valid = [
  // onClick属性なし
  { code: '<TabItem>label</TabItem>', options: v96ToV97Options },

  // 他の属性のみ
  { code: '<TabItem id="tab1">label</TabItem>', options: v96ToV97Options },
  { code: '<TabItem selected>label</TabItem>', options: v96ToV97Options },

  // 対象外のコンポーネント（TabItemで終わらない）
  { code: '<OtherComponent onClick={() => {}} />', options: v96ToV97Options },
  { code: '<Tab onClick={() => {}} />', options: v96ToV97Options },
  { code: '<TabItemContainer onClick={() => {}} />', options: v96ToV97Options },
]

// ============================================================
// invalidテストケース（エラーになるが、自動修正されないコード）
// ============================================================

const invalid = [
  // ============================================================
  // TabItem の onClick: 検出のみ（自動修正なし）
  // ============================================================

  // 基本的な使用例
  {
    code: '<TabItem onClick={(tabId) => console.log(tabId)}>label</TabItem>',
    // output なし = 自動修正なし
    options: v96ToV97Options,
    errors: [
      {
        messageId: 'migrateTabItemOnClick',
        data: {
          to: 'v97',
          readmeUrl:
            'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v96-to-v97/README.md',
        },
      },
    ],
  },

  // セルフクロージングタグ
  {
    code: '<TabItem onClick={handleClick} />',
    options: v96ToV97Options,
    errors: [
      {
        messageId: 'migrateTabItemOnClick',
        data: {
          to: 'v97',
          readmeUrl:
            'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v96-to-v97/README.md',
        },
      },
    ],
  },

  // 複数の属性がある場合
  {
    code: '<TabItem id="tab1" onClick={(id) => setActive(id)} selected>label</TabItem>',
    options: v96ToV97Options,
    errors: [
      {
        messageId: 'migrateTabItemOnClick',
        data: {
          to: 'v97',
          readmeUrl:
            'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v96-to-v97/README.md',
        },
      },
    ],
  },

  // 複数行
  {
    code: `<TabItem
  onClick={(tabId) => {
    console.log(tabId)
    setActiveTab(tabId)
  }}
>
  label
</TabItem>`,
    options: v96ToV97Options,
    errors: [
      {
        messageId: 'migrateTabItemOnClick',
        data: {
          to: 'v97',
          readmeUrl:
            'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v96-to-v97/README.md',
        },
      },
    ],
  },

  // ラップコンポーネント（TabItemで終わる名前）
  {
    code: '<CustomTabItem onClick={(id) => handleClick(id)}>label</CustomTabItem>',
    options: v96ToV97Options,
    errors: [
      {
        messageId: 'migrateTabItemOnClick',
        data: {
          to: 'v97',
          readmeUrl:
            'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v96-to-v97/README.md',
        },
      },
    ],
  },
  {
    code: '<MyTabItem onClick={onClick} />',
    options: v96ToV97Options,
    errors: [
      {
        messageId: 'migrateTabItemOnClick',
        data: {
          to: 'v97',
          readmeUrl:
            'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v96-to-v97/README.md',
        },
      },
    ],
  },
]

module.exports = { valid, invalid }
