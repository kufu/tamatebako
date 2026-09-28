/**
 * smarthr-ui v98 → v99 移行ルール テストケース
 */

const v98ToV99Options = [{ from: '98', to: '99' }]

const README_URL =
  'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v98-to-v99/README.md'

// ============================================================
// validテストケース（エラーにならないコード）
// ============================================================

const valid = [
  // ============================================================
  // 移行後の書き方
  // ============================================================
  {
    code: `import { useDateFormat } from 'smarthr-ui'
const { formatDate } = useDateFormat()`,
    options: v98ToV99Options,
  },
  {
    code: `import { useAvailableLocales } from 'smarthr-ui'
const availableLocales = useAvailableLocales()`,
    options: v98ToV99Options,
  },

  // ============================================================
  // useIntl() に残るプロパティのみを使用している場合
  // ============================================================
  {
    code: `import { useIntl } from 'smarthr-ui'
const { localize } = useIntl()`,
    options: v98ToV99Options,
  },
  {
    code: `import { useIntl } from 'smarthr-ui'
const { localize, locale } = useIntl()`,
    options: v98ToV99Options,
  },
  {
    code: `import { useIntl } from 'smarthr-ui'
const intl = useIntl()
intl.localize('key')`,
    options: v98ToV99Options,
  },
  {
    code: `import { useIntl } from 'smarthr-ui'
useIntl().localize('key')`,
    options: v98ToV99Options,
  },

  // ============================================================
  // smarthr-ui 以外の useIntl は対象外（react-intl等）
  // ============================================================
  {
    code: `import { useIntl } from 'react-intl'
const { formatDate } = useIntl()`,
    options: v98ToV99Options,
  },
  {
    code: `const { formatDate } = useIntl()`,
    options: v98ToV99Options,
  },
]

// ============================================================
// invalidテストケース
// ============================================================

const invalid = [
  // ============================================================
  // 1. 日付フォーマット関数のみの分割代入: 自動修正あり
  // ============================================================

  {
    code: `import { useIntl } from 'smarthr-ui'
const { formatDate } = useIntl()`,
    output: `import { useDateFormat } from 'smarthr-ui'
const { formatDate } = useDateFormat()`,
    options: v98ToV99Options,
    errors: [
      {
        messageId: 'migrateUseIntlDateFormat',
        data: { to: 'v99', props: 'formatDate', readmeUrl: README_URL },
      },
    ],
  },

  {
    code: `import { useIntl } from 'smarthr-ui'
const { formatDate, formatTime, formatTimestamp, getWeekStartDay } = useIntl()`,
    output: `import { useDateFormat } from 'smarthr-ui'
const { formatDate, formatTime, formatTimestamp, getWeekStartDay } = useDateFormat()`,
    options: v98ToV99Options,
    errors: [
      {
        messageId: 'migrateUseIntlDateFormat',
        data: {
          to: 'v99',
          props: 'formatDate, formatTime, formatTimestamp, getWeekStartDay',
          readmeUrl: README_URL,
        },
      },
    ],
  },

  // 他のimportがある場合は useIntl のみを置き換える
  {
    code: `import { Button, useIntl } from 'smarthr-ui'
const { formatTime } = useIntl()`,
    output: `import { Button, useDateFormat } from 'smarthr-ui'
const { formatTime } = useDateFormat()`,
    options: v98ToV99Options,
    errors: [
      {
        messageId: 'migrateUseIntlDateFormat',
        data: { to: 'v99', props: 'formatTime', readmeUrl: README_URL },
      },
    ],
  },

  // useIntl が他でも使われている場合は import を追加する
  {
    code: `import { useIntl } from 'smarthr-ui'
const { formatDate } = useIntl()
const { localize } = useIntl()`,
    output: `import { useIntl, useDateFormat } from 'smarthr-ui'
const { formatDate } = useDateFormat()
const { localize } = useIntl()`,
    options: v98ToV99Options,
    errors: [
      {
        messageId: 'migrateUseIntlDateFormat',
        data: { to: 'v99', props: 'formatDate', readmeUrl: README_URL },
      },
    ],
  },

  // 移行先が既にimport済みの場合は import を変更しない
  {
    code: `import { useIntl, useDateFormat } from 'smarthr-ui'
const { formatDate } = useIntl()
const { formatTime } = useDateFormat()`,
    output: `import { useIntl, useDateFormat } from 'smarthr-ui'
const { formatDate } = useDateFormat()
const { formatTime } = useDateFormat()`,
    options: v98ToV99Options,
    errors: [
      {
        messageId: 'migrateUseIntlDateFormat',
        data: { to: 'v99', props: 'formatDate', readmeUrl: README_URL },
      },
    ],
  },

  // リネームを伴う分割代入
  {
    code: `import { useIntl } from 'smarthr-ui'
const { formatDate: format } = useIntl()`,
    output: `import { useDateFormat } from 'smarthr-ui'
const { formatDate: format } = useDateFormat()`,
    options: v98ToV99Options,
    errors: [
      {
        messageId: 'migrateUseIntlDateFormat',
        data: { to: 'v99', props: 'formatDate', readmeUrl: README_URL },
      },
    ],
  },

  // ============================================================
  // 2. availableLocales のみの分割代入: 自動修正あり
  // ============================================================

  {
    code: `import { useIntl } from 'smarthr-ui'
const { availableLocales } = useIntl()`,
    output: `import { useAvailableLocales } from 'smarthr-ui'
const availableLocales = useAvailableLocales()`,
    options: v98ToV99Options,
    errors: [
      {
        messageId: 'migrateUseIntlAvailableLocales',
        data: { to: 'v99', props: 'availableLocales', readmeUrl: README_URL },
      },
    ],
  },

  // リネームを伴う分割代入
  {
    code: `import { useIntl } from 'smarthr-ui'
const { availableLocales: locales } = useIntl()`,
    output: `import { useAvailableLocales } from 'smarthr-ui'
const locales = useAvailableLocales()`,
    options: v98ToV99Options,
    errors: [
      {
        messageId: 'migrateUseIntlAvailableLocales',
        data: { to: 'v99', props: 'availableLocales', readmeUrl: README_URL },
      },
    ],
  },

  // ============================================================
  // 3. 混在している場合: 検出のみ（自動修正なし）
  // ============================================================

  {
    code: `import { useIntl } from 'smarthr-ui'
const { localize, formatDate } = useIntl()`,
    options: v98ToV99Options,
    errors: [
      {
        messageId: 'migrateUseIntlMixed',
        data: { to: 'v99', props: 'formatDate', readmeUrl: README_URL },
      },
    ],
  },

  {
    code: `import { useIntl } from 'smarthr-ui'
const { localize, availableLocales } = useIntl()`,
    options: v98ToV99Options,
    errors: [
      {
        messageId: 'migrateUseIntlMixed',
        data: { to: 'v99', props: 'availableLocales', readmeUrl: README_URL },
      },
    ],
  },

  // 日付フォーマット関数と availableLocales の併用も移行先が異なるため自動修正しない
  {
    code: `import { useIntl } from 'smarthr-ui'
const { formatDate, availableLocales } = useIntl()`,
    options: v98ToV99Options,
    errors: [
      {
        messageId: 'migrateUseIntlMixed',
        data: { to: 'v99', props: 'formatDate, availableLocales', readmeUrl: README_URL },
      },
    ],
  },

  // rest要素がある場合は何が使われるか判断できない
  {
    code: `import { useIntl } from 'smarthr-ui'
const { formatDate, ...rest } = useIntl()`,
    options: v98ToV99Options,
    errors: [
      {
        messageId: 'migrateUseIntlMixed',
        data: { to: 'v99', props: 'formatDate', readmeUrl: README_URL },
      },
    ],
  },

  // ============================================================
  // 4. 分割代入以外: 検出のみ（自動修正なし）
  // ============================================================

  {
    code: `import { useIntl } from 'smarthr-ui'
useIntl().formatDate(date)`,
    options: v98ToV99Options,
    errors: [
      {
        messageId: 'migrateUseIntlIndirect',
        data: { to: 'v99', readmeUrl: README_URL },
      },
    ],
  },

  {
    code: `import { useIntl } from 'smarthr-ui'
const intl = useIntl()
intl.formatDate(date)`,
    options: v98ToV99Options,
    errors: [
      {
        messageId: 'migrateUseIntlIndirect',
        data: { to: 'v99', readmeUrl: README_URL },
      },
    ],
  },

  {
    code: `import { useIntl } from 'smarthr-ui'
const intl = useIntl()
intl.availableLocales.forEach(() => {})`,
    options: v98ToV99Options,
    errors: [
      {
        messageId: 'migrateUseIntlIndirect',
        data: { to: 'v99', readmeUrl: README_URL },
      },
    ],
  },
]

module.exports = { valid, invalid }
