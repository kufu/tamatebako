/**
 * smarthr-ui v99 → v100 移行ルール テストケース
 */

const v99ToV100Options = [{ from: '99', to: '100' }]

const README_URL =
  'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v99-to-v100/README.md'

// ============================================================
// validテストケース（エラーにならないコード）
// ============================================================

const valid = [
  // ============================================================
  // 移行後の書き方
  // ============================================================
  {
    code: `<NotificationBar paneled type="info">お知らせ</NotificationBar>`,
    options: v99ToV100Options,
  },
  {
    code: `<NotificationBar paneled={false} type="info">お知らせ</NotificationBar>`,
    options: v99ToV100Options,
  },
  {
    code: `<NotificationBar type="info">お知らせ</NotificationBar>`,
    options: v99ToV100Options,
  },

  // ============================================================
  // 他コンポーネントの同名属性（誤検出防止）
  // ============================================================
  {
    code: `<OtherComponent base="foo">content</OtherComponent>`,
    options: v99ToV100Options,
  },
]

// ============================================================
// invalidテストケース（エラーになるコード）
// ============================================================

const invalid = [
  // ============================================================
  // base 属性のみ指定
  // ============================================================
  {
    code: `<NotificationBar base type="info">お知らせ</NotificationBar>`,
    output: `<NotificationBar paneled type="info">お知らせ</NotificationBar>`,
    options: v99ToV100Options,
    errors: [
      {
        messageId: 'renameNotificationBarBase',
        data: { component: 'NotificationBar', to: 'v100', readmeUrl: README_URL },
      },
    ],
  },

  // ============================================================
  // base 属性に式を指定（値はそのまま引き継がれる）
  // ============================================================
  {
    code: `<NotificationBar base={isPaneled} type="info">お知らせ</NotificationBar>`,
    output: `<NotificationBar paneled={isPaneled} type="info">お知らせ</NotificationBar>`,
    options: v99ToV100Options,
    errors: [
      {
        messageId: 'renameNotificationBarBase',
        data: { component: 'NotificationBar', to: 'v100', readmeUrl: README_URL },
      },
    ],
  },

  // ============================================================
  // base と他の属性を併用
  // ============================================================
  {
    code: `<NotificationBar base type="error" role="alert">お知らせ</NotificationBar>`,
    output: `<NotificationBar paneled type="error" role="alert">お知らせ</NotificationBar>`,
    options: v99ToV100Options,
    errors: [
      {
        messageId: 'renameNotificationBarBase',
        data: { component: 'NotificationBar', to: 'v100', readmeUrl: README_URL },
      },
    ],
  },
]

module.exports = { valid, invalid }
