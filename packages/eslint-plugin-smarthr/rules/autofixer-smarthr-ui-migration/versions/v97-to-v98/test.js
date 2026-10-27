/**
 * smarthr-ui v97 → v98 移行ルール テストケース
 */

const v97ToV98Options = [{ from: '97', to: '98' }]

// ============================================================
// validテストケース（エラーにならないコード）
// ============================================================

const valid = [
  // ============================================================
  // useDevice: importなし
  // ============================================================
  { code: "import { useTheme } from 'smarthr-ui'", options: v97ToV98Options },
  { code: "import { Button } from 'smarthr-ui'", options: v97ToV98Options },

  // ============================================================
  // Th: decorators propなし
  // ============================================================
  { code: '<Th>Header</Th>', options: v97ToV98Options },
  { code: '<Th align="center">Header</Th>', options: v97ToV98Options },

  // 対象外のコンポーネント
  { code: '<OtherComponent decorators={() => {}} />', options: v97ToV98Options },

  // ============================================================
  // useDecorator: importなし
  // ============================================================
  { code: "import { useTranslation } from 'react-i18next'", options: v97ToV98Options },
]

// ============================================================
// invalidテストケース（エラーになるが、自動修正されないコード）
// ============================================================

const invalid = [
  // ============================================================
  // useDevice の削除: 検出のみ（自動修正なし）
  // ============================================================

  {
    code: "import { useDevice } from 'smarthr-ui'",
    options: v97ToV98Options,
    errors: [
      {
        messageId: 'migrateUseDevice',
        data: {
          to: 'v98',
          readmeUrl:
            'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v97-to-v98/README.md',
        },
      },
    ],
  },

  {
    code: "import { Button, useDevice } from 'smarthr-ui'",
    options: v97ToV98Options,
    errors: [
      {
        messageId: 'migrateUseDevice',
        data: {
          to: 'v98',
          readmeUrl:
            'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v97-to-v98/README.md',
        },
      },
    ],
  },

  {
    code: "import { useDevice, useTheme } from 'smarthr-ui'",
    options: v97ToV98Options,
    errors: [
      {
        messageId: 'migrateUseDevice',
        data: {
          to: 'v98',
          readmeUrl:
            'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v97-to-v98/README.md',
        },
      },
    ],
  },

  // ============================================================
  // Th の decorators prop の削除: 検出のみ（自動修正なし）
  // ============================================================

  {
    code: '<Th decorators={() => {}}>Header</Th>',
    options: v97ToV98Options,
    errors: [
      {
        messageId: 'migrateThDecorators',
        data: {
          to: 'v98',
          readmeUrl:
            'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v97-to-v98/README.md',
        },
      },
    ],
  },

  {
    code: '<Th decorators={decorators}>Header</Th>',
    options: v97ToV98Options,
    errors: [
      {
        messageId: 'migrateThDecorators',
        data: {
          to: 'v98',
          readmeUrl:
            'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v97-to-v98/README.md',
        },
      },
    ],
  },

  {
    code: '<Th align="center" decorators={decorators}>Header</Th>',
    options: v97ToV98Options,
    errors: [
      {
        messageId: 'migrateThDecorators',
        data: {
          to: 'v98',
          readmeUrl:
            'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v97-to-v98/README.md',
        },
      },
    ],
  },

  {
    code: `<Th
  decorators={(text) => {
    return text.toUpperCase()
  }}
>
  Header
</Th>`,
    options: v97ToV98Options,
    errors: [
      {
        messageId: 'migrateThDecorators',
        data: {
          to: 'v98',
          readmeUrl:
            'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v97-to-v98/README.md',
        },
      },
    ],
  },

  // ============================================================
  // useDecorator の削除: 検出のみ（自動修正なし）
  // ============================================================

  {
    code: "import { useDecorator } from 'smarthr-ui'",
    options: v97ToV98Options,
    errors: [
      {
        messageId: 'migrateUseDecorator',
        data: {
          to: 'v98',
          readmeUrl:
            'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v97-to-v98/README.md',
        },
      },
    ],
  },

  {
    code: "import { Button, useDecorator } from 'smarthr-ui'",
    options: v97ToV98Options,
    errors: [
      {
        messageId: 'migrateUseDecorator',
        data: {
          to: 'v98',
          readmeUrl:
            'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v97-to-v98/README.md',
        },
      },
    ],
  },

  {
    code: "import { useDecorator, useTheme } from 'smarthr-ui'",
    options: v97ToV98Options,
    errors: [
      {
        messageId: 'migrateUseDecorator',
        data: {
          to: 'v98',
          readmeUrl:
            'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v97-to-v98/README.md',
        },
      },
    ],
  },
]

module.exports = { valid, invalid }
