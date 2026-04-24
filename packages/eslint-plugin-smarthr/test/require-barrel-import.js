const fs = require('fs')
const path = require('path')
const rule = require('../rules/require-barrel-import')
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

// テストフィクスチャのルートディレクトリ
const fixturesRoot = path.join(__dirname, '..', 'test-fixtures')

/**
 * テスト用のファイル構造を作成するヘルパー
 * @param {string} testName - テスト名（ディレクトリ名として使用）
 * @param {Object} structure - ファイル構造定義
 * @returns {string} 作成したディレクトリのパス
 */
function createFixture(testName, structure) {
  const fixtureDir = path.join(fixturesRoot, testName)

  // ディレクトリが既に存在する場合は削除
  if (fs.existsSync(fixtureDir)) {
    fs.rmSync(fixtureDir, { recursive: true, force: true })
  }

  // ディレクトリとファイルを再帰的に作成
  function createStructure(dir, struct) {
    fs.mkdirSync(dir, { recursive: true })

    for (const [name, content] of Object.entries(struct)) {
      const fullPath = path.join(dir, name)

      if (typeof content === 'object' && content !== null) {
        // ディレクトリ
        createStructure(fullPath, content)
      } else {
        // ファイル
        fs.writeFileSync(fullPath, content || '')
      }
    }
  }

  createStructure(fixtureDir, structure)
  return fixtureDir
}

/**
 * テスト終了後のクリーンアップ
 */
function cleanupFixtures() {
  if (fs.existsSync(fixturesRoot)) {
    const entries = fs.readdirSync(fixturesRoot)
    for (const entry of entries) {
      const fullPath = path.join(fixturesRoot, entry)
      if (fs.statSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true })
      }
    }
  }
}

// テスト終了後にクリーンアップ
afterAll(() => {
  cleanupFixtures()
})

ruleTester.run('require-barrel-import', rule, {
  valid: [
    // 同階層・サブディレクトリからのimport（エラーにならない）
    {
      code: `import { useMenu } from './hooks/useMenu'`,
      filename: (() => {
        createFixture('same-level-import', {
          'Menu': {
            'MenuItem.tsx': '',
            'index.tsx': 'export {}',
            'hooks': {
              'useMenu.ts': '',
            },
          },
        })
        return `${fixturesRoot}/same-level-import/Menu/MenuItem.tsx`
      })(),
    },

    // additionalBarrelFileNames - client.tsからimport（エラーにならない）
    {
      code: `import { fetchUser } from './api/client'`,
      filename: (() => {
        createFixture('barrel-file-names-valid', {
          'components': {
            'Page.tsx': '',
            'api': {
              'client.ts': 'export {}',
              'user.ts': '',
            },
          },
        })
        return `${fixturesRoot}/barrel-file-names-valid/components/Page.tsx`
      })(),
      options: [
        {
          additionalBarrelFileNames: ['client', 'server'],
        },
      ],
    },

    // additionalBarrelFileNames - 同じディレクトリにindex.tsとclient.tsがある場合、index.tsからimportもOK
    {
      code: `import { fetchUser } from './api'`,
      filename: (() => {
        createFixture('barrel-file-names-both-index', {
          'components': {
            'Page.tsx': '',
            'api': {
              'index.ts': 'export {}',
              'client.ts': 'export {}',
              'user.ts': '',
            },
          },
        })
        return `${fixturesRoot}/barrel-file-names-both-index/components/Page.tsx`
      })(),
      options: [
        {
          additionalBarrelFileNames: ['client', 'server'],
        },
      ],
    },

    // additionalBarrelFileNames - 同じディレクトリにindex.tsとclient.tsがある場合、client.tsからimportもOK
    {
      code: `import { fetchUser } from './api/client'`,
      filename: (() => {
        createFixture('barrel-file-names-both-client', {
          'components': {
            'Page.tsx': '',
            'api': {
              'index.ts': 'export {}',
              'client.ts': 'export {}',
              'user.ts': '',
            },
          },
        })
        return `${fixturesRoot}/barrel-file-names-both-client/components/Page.tsx`
      })(),
      options: [
        {
          additionalBarrelFileNames: ['client', 'server'],
        },
      ],
    },

    // 同じディレクトリで非バレルファイルをimport（エラーにならない）
    {
      code: `import { ButtonProps } from './types'`,
      filename: (() => {
        createFixture('same-dir-non-barrel', {
          'Button': {
            'index.tsx': 'export {}',
            'Button.tsx': '',
            'types.ts': '',
          },
        })
        return `${fixturesRoot}/same-dir-non-barrel/Button/Button.tsx`
      })(),
    },

    // Next.js App Router特殊文字パス - 同階層import
    {
      code: `import { useUsers } from './hooks/useUsers'`,
      filename: (() => {
        createFixture('nextjs-special-chars', {
          'app': {
            '(private)': {
              'settings': {
                'user_roles': {
                  '_components': {
                    'index.tsx': 'export {}',
                    'AddUserRoleDialog': {
                      'index.tsx': 'export {}',
                      'AddUserRoleDialog.tsx': '',
                      'hooks': {
                        'useUsers.ts': '',
                      },
                    },
                  },
                },
              },
            },
          },
        })
        return `${fixturesRoot}/nextjs-special-chars/app/(private)/settings/user_roles/_components/AddUserRoleDialog/AddUserRoleDialog.tsx`
      })(),
    },

    // Dynamic Routes - [id]パス（同階層）
    {
      code: `import { useDetail } from './hooks/useDetail'`,
      filename: (() => {
        createFixture('nextjs-dynamic-route', {
          'app': {
            'items': {
              '[id]': {
                'index.tsx': 'export {}',
                'DetailPage.tsx': '',
                'hooks': {
                  'useDetail.ts': '',
                },
              },
            },
          },
        })
        return `${fixturesRoot}/nextjs-dynamic-route/app/items/[id]/DetailPage.tsx`
      })(),
    },

    // barrel が存在しない場合（同階層サブディレクトリ）
    {
      code: `import { helper } from './utils/helper'`,
      filename: (() => {
        createFixture('no-barrel', {
          'components': {
            'Button': {
              'Button.tsx': '',
              'utils': {
                'helper.ts': '',
              },
            },
          },
        })
        return `${fixturesRoot}/no-barrel/components/Button/Button.tsx`
      })(),
    },

    // 親階層からのimport + barrelなし（エラーにならない）
    {
      code: `import { helper } from '../utils/helper'`,
      filename: (() => {
        createFixture('parent-import-no-barrel', {
          // index.tsx なし（barrelなし）
          'Button': {
            'Button.tsx': '',
          },
          'utils': {
            'helper.ts': '',
          },
        })
        return `${fixturesRoot}/parent-import-no-barrel/Button/Button.tsx`
      })(),
    },

    // Next.js特殊文字パス - 親階層からのimport + barrelなし
    {
      code: `import { createUserRole } from '../hooks/createUserRoleAction'`,
      filename: (() => {
        createFixture('nextjs-parent-no-barrel', {
          // index.tsx なし（barrelなし）
          'AddUserRoleDialog': {
            'AddUserRoleDialog.tsx': '',
          },
          'hooks': {
            'createUserRoleAction.ts': '',
          },
        })
        return `${fixturesRoot}/nextjs-parent-no-barrel/AddUserRoleDialog/AddUserRoleDialog.tsx`
      })(),
    },

    // Dynamic Routes - 親階層からのimport + barrelなし
    {
      code: `import { api } from '../api/client'`,
      filename: (() => {
        createFixture('dynamic-route-parent-no-barrel', {
          // index.tsx なし（barrelなし）
          '[id]': {
            'DetailPage.tsx': '',
          },
          'api': {
            'client.ts': '',
          },
        })
        return `${fixturesRoot}/dynamic-route-parent-no-barrel/[id]/DetailPage.tsx`
      })(),
    },

    // ============================================================
    // Path alias - 同階層からのimport（エラーにならない）
    // ============================================================
    {
      code: `import { useMenu } from '~/path-alias-same-level/Menu/hooks/useMenu'`,
      filename: (() => {
        createFixture('path-alias-same-level', {
          'Menu': {
            'MenuItem.tsx': '',
            'index.tsx': 'export {}',
            'hooks': {
              'useMenu.ts': '',
            },
          },
        })
        return `${fixturesRoot}/path-alias-same-level/Menu/MenuItem.tsx`
      })(),
    },

    // Path alias - 同階層サブディレクトリ + barrelなし
    {
      code: `import { helper } from '~/path-alias-no-barrel/components/Button/utils/helper'`,
      filename: (() => {
        createFixture('path-alias-no-barrel', {
          'components': {
            'Button': {
              'Button.tsx': '',
              'utils': {
                'helper.ts': '',
              },
            },
          },
        })
        return `${fixturesRoot}/path-alias-no-barrel/components/Button/Button.tsx`
      })(),
    },

    // Path alias - 親階層からのimport + barrelなし
    {
      code: `import { helper } from '~/path-alias-parent-no-barrel/utils/helper'`,
      filename: (() => {
        createFixture('path-alias-parent-no-barrel', {
          // index.tsx なし（barrelなし）
          'Button': {
            'Button.tsx': '',
          },
          'utils': {
            'helper.ts': '',
          },
        })
        return `${fixturesRoot}/path-alias-parent-no-barrel/Button/Button.tsx`
      })(),
    },

    // 親階層からのimport（commonParentにbarrelがある場合）
    {
      code: `import { createUserRole } from '../hooks/createUserRoleAction'`,
      filename: (() => {
        createFixture('parent-import-common-parent-barrel', {
          'components': {
            'index.tsx': 'export {}',  // commonParentのbarrelは除外される
            'AddDialog': {
              'AddDialog.tsx': '',
            },
            'hooks': {
              'createUserRoleAction.ts': '',
            },
          },
        })
        return `${fixturesRoot}/parent-import-common-parent-barrel/components/AddDialog/AddDialog.tsx`
      })(),
    },

    // 複雑なネスト - commonParentのbarrelは除外される
    {
      code: `import type { RequestStepActionNotSkipped } from '../utils/withSkipped'`,
      filename: (() => {
        createFixture('nested-common-parent-barrel', {
          'Nodes': {
            'index.tsx': 'export {}',  // commonParentより上のbarrel（除外される）
            'StepNodeRequestView': {
              'index.tsx': 'export {}',  // commonParent（除外される）
              'Approvers': {
                'ApproverRow': {
                  'buildUserRowsProps.ts': '',
                },
                'utils': {
                  'withSkipped': {
                    'index.ts': 'export {}',  // import先のbarrel（valid）
                  },
                },
              },
            },
          },
        })
        return `${fixturesRoot}/nested-common-parent-barrel/Nodes/StepNodeRequestView/Approvers/ApproverRow/buildUserRowsProps.ts`
      })(),
      languageOptions: {
        parser: require('typescript-eslint').parser,
      },
    },

    // ========================================
    // バレルファイルの純粋性チェック - 許可されるパターン
    // ========================================

    // バレルファイルでexport { ... } from '...' は許可
    {
      code: `export { Button } from './Button'`,
      filename: (() => {
        createFixture('barrel-purity-valid-export-named', {
          'components': {
            'index.tsx': '',
            'Button.tsx': '',
          },
        })
        return `${fixturesRoot}/barrel-purity-valid-export-named/components/index.tsx`
      })(),
    },

    // バレルファイルでexport * from '...' は許可
    {
      code: `export * from './Button'`,
      filename: (() => {
        createFixture('barrel-purity-valid-export-all', {
          'components': {
            'index.tsx': '',
            'Button.tsx': '',
          },
        })
        return `${fixturesRoot}/barrel-purity-valid-export-all/components/index.tsx`
      })(),
    },

    // バレルファイルで複数のre-exportは許可
    {
      code: `
        export { Button } from './Button'
        export { Input } from './Input'
        export * from './utils'
      `,
      filename: (() => {
        createFixture('barrel-purity-valid-multiple', {
          'components': {
            'index.tsx': '',
            'Button.tsx': '',
            'Input.tsx': '',
            'utils': {
              'index.ts': '',
            },
          },
        })
        return `${fixturesRoot}/barrel-purity-valid-multiple/components/index.tsx`
      })(),
    },

    // additionalBarrelFileNames（client.ts）でもre-exportは許可
    {
      code: `export { api } from './api'`,
      filename: (() => {
        createFixture('barrel-purity-valid-client', {
          'services': {
            'client.ts': '',
            'api.ts': '',
          },
        })
        return `${fixturesRoot}/barrel-purity-valid-client/services/client.ts`
      })(),
      options: [{ additionalBarrelFileNames: ['client', 'server'] }],
    },

    // TypeScript型のre-exportは許可
    {
      code: `export type { ButtonProps } from './Button'`,
      filename: (() => {
        createFixture('barrel-purity-valid-type-reexport', {
          'components': {
            'index.tsx': '',
            'Button.tsx': '',
          },
        })
        return `${fixturesRoot}/barrel-purity-valid-type-reexport/components/index.tsx`
      })(),
      languageOptions: {
        parser: require('typescript-eslint').parser,
      },
    },

    // default exportのre-exportは許可
    {
      code: `export { default } from './Component'`,
      filename: (() => {
        createFixture('barrel-purity-valid-default-reexport', {
          'components': {
            'index.ts': '',
            'Component.tsx': '',
          },
        })
        return `${fixturesRoot}/barrel-purity-valid-default-reexport/components/index.ts`
      })(),
    },

    // default exportのre-export（as付き）は許可
    {
      code: `export { default as Button } from './Button'`,
      filename: (() => {
        createFixture('barrel-purity-valid-default-as-reexport', {
          'components': {
            'index.ts': '',
            'Button.tsx': '',
          },
        })
        return `${fixturesRoot}/barrel-purity-valid-default-as-reexport/components/index.ts`
      })(),
    },
  ],

  invalid: [
    // 親階層からのimport（import先の親にbarrelがある場合）
    {
      code: `import { api } from '../api/client'`,
      filename: (() => {
        createFixture('parent-import-with-barrel', {
          'components': {
            'AddDialog': {
              'AddDialog.tsx': '',
            },
            'api': {
              'index.tsx': 'export {}',  // import先の親にbarrel
              'client.ts': '',
            },
          },
        })
        return `${fixturesRoot}/parent-import-with-barrel/components/AddDialog/AddDialog.tsx`
      })(),
      errors: [
        {
          message: /バレルファイルを経由してimportしてください/,
        },
      ],
    },

    // Next.js特殊文字パス - import先の親にbarrel
    {
      code: `import { api } from '../api/client'`,
      filename: (() => {
        createFixture('nextjs-import-parent-barrel', {
          'app': {
            '(private)': {
              'settings': {
                'user_roles': {
                  '_components': {
                    'AddUserRoleDialog': {
                      'AddUserRoleDialog.tsx': '',
                    },
                    'api': {
                      'index.tsx': 'export {}',  // import先の親にbarrel
                      'client.ts': '',
                    },
                  },
                },
              },
            },
          },
        })
        return `${fixturesRoot}/nextjs-import-parent-barrel/app/(private)/settings/user_roles/_components/AddUserRoleDialog/AddUserRoleDialog.tsx`
      })(),
      errors: [
        {
          message: /バレルファイルを経由してimportしてください/,
        },
      ],
    },

    // Path alias - import先の親にbarrel
    {
      code: `import { api } from '@/path-alias-import-parent-barrel/components/api/client'`,
      filename: (() => {
        createFixture('path-alias-import-parent-barrel', {
          'components': {
            'AddDialog': {
              'AddDialog.tsx': '',
            },
            'api': {
              'index.tsx': 'export {}',  // import先の親にbarrel
              'client.ts': '',
            },
          },
        })
        return `${fixturesRoot}/path-alias-import-parent-barrel/components/AddDialog/AddDialog.tsx`
      })(),
      errors: [
        {
          message: /バレルファイルを経由してimportしてください/,
        },
      ],
    },

    // additionalBarrelFileNames - index.tsとclient.tsが両方ある場合、複数の選択肢を表示
    {
      code: `import { fetchUser } from './api/user'`,
      filename: (() => {
        createFixture('barrel-file-names-multiple-options', {
          'components': {
            'Page.tsx': '',
            'api': {
              'index.ts': 'export {}',
              'client.ts': 'export {}',
              'user.ts': '',
            },
          },
        })
        return `${fixturesRoot}/barrel-file-names-multiple-options/components/Page.tsx`
      })(),
      options: [
        {
          additionalBarrelFileNames: ['client'],
        },
      ],
      errors: [
        {
          message: /推奨されるimport（以下のいずれか）[\s\S]*index\.ts[\s\S]*client\.ts/,
        },
      ],
    },

    // additionalBarrelFileNames - index.tsのみ存在する場合、存在しないclient.tsも選択肢に表示
    {
      code: `import { fetchUser } from './api/user'`,
      filename: (() => {
        createFixture('barrel-file-names-with-missing-client', {
          'components': {
            'Page.tsx': '',
            'api': {
              'index.ts': 'export {}',
              'user.ts': '',
            },
          },
        })
        return `${fixturesRoot}/barrel-file-names-with-missing-client/components/Page.tsx`
      })(),
      options: [
        {
          additionalBarrelFileNames: ['client'],
        },
      ],
      errors: [
        {
          message: /推奨されるimport（以下のいずれか）[\s\S]*index\.ts[\s\S]*client\.ts \(作成が必要\)[\s\S]*※ 存在しないバレルファイルは必要に応じて作成してください。/,
        },
      ],
    },

    // additionalBarrelFileNames - client.tsのみ存在する場合、存在しないindex.tsも選択肢に表示
    {
      code: `import { fetchUser } from './api/user'`,
      filename: (() => {
        createFixture('barrel-file-names-with-missing-index', {
          'components': {
            'Page.tsx': '',
            'api': {
              'client.ts': 'export {}',
              'user.ts': '',
            },
          },
        })
        return `${fixturesRoot}/barrel-file-names-with-missing-index/components/Page.tsx`
      })(),
      options: [
        {
          additionalBarrelFileNames: ['client'],
        },
      ],
      errors: [
        {
          message: /推奨されるimport（以下のいずれか）[\s\S]*index\.ts \(作成が必要\)[\s\S]*client\.ts[\s\S]*※ 存在しないバレルファイルは必要に応じて作成してください。/,
        },
      ],
    },

    // additionalBarrelFileNames - client.tsをbarrelとして扱う
    {
      code: `import { fetchUser } from './api/user'`,
      filename: (() => {
        createFixture('barrel-file-names-client', {
          'components': {
            'Page.tsx': '',
            'api': {
              'client.ts': 'export {}',  // client.tsがbarrel
              'user.ts': '',
            },
          },
        })
        return `${fixturesRoot}/barrel-file-names-client/components/Page.tsx`
      })(),
      options: [
        {
          additionalBarrelFileNames: ['client', 'server'],
        },
      ],
      errors: [
        {
          message: /バレルファイルを経由してimportしてください/,
        },
      ],
    },

    // additionalBarrelFileNames - server.tsをbarrelとして扱う
    {
      code: `import { getServerData } from './server-api/data'`,
      filename: (() => {
        createFixture('barrel-file-names-server', {
          'lib': {
            'App.tsx': '',
            'server-api': {
              'server.ts': 'export {}',  // server.tsがbarrel
              'data.ts': '',
            },
          },
        })
        return `${fixturesRoot}/barrel-file-names-server/lib/App.tsx`
      })(),
      options: [
        {
          additionalBarrelFileNames: ['client', 'server'],
        },
      ],
      errors: [
        {
          message: /バレルファイルを経由してimportしてください/,
        },
      ],
    },

    // additionalBarrelFileNames - client.tsがindexより優先される（同じディレクトリ内）
    {
      code: `import { fetchUser } from './api/user'`,
      filename: (() => {
        createFixture('barrel-file-names-priority', {
          'components': {
            'Page.tsx': '',
            'api': {
              'client.ts': 'export {}',  // client.tsが優先
              'index.ts': 'export {}',
              'user.ts': '',
            },
          },
        })
        return `${fixturesRoot}/barrel-file-names-priority/components/Page.tsx`
      })(),
      options: [
        {
          additionalBarrelFileNames: ['client'],
        },
      ],
      errors: [
        {
          message: /client\.ts/,  // client.tsが検出される
        },
      ],
    },

    // additionalBarrelFileNames - 異なるファイル名の場合は最も近いbarrelを優先
    {
      code: `import { useFormContext } from './route/edit/_hooks/useFormContext'`,
      filename: (() => {
        createFixture('barrel-file-names-nearest-priority', {
          'Page.tsx': '',  // importer
          'route': {
            'client.ts': 'export {}',  // 親のclient.ts
            'edit': {
              'index.ts': 'export {}',  // より近いindex.tsが優先される
              '_hooks': {
                'useFormContext.ts': '',
              },
            },
          },
        })
        return `${fixturesRoot}/barrel-file-names-nearest-priority/Page.tsx`
      })(),
      options: [
        {
          additionalBarrelFileNames: ['client', 'server'],
        },
      ],
      errors: [
        {
          message: /route\/edit/,  // 最も近いindex.ts（route/edit）が検出される
        },
      ],
    },

    // additionalBarrelFileNames - より親のclient.tsを優先
    {
      code: `import { useFormContext } from './route/edit/_hooks/useFormContext'`,
      filename: (() => {
        createFixture('barrel-file-names-parent-priority', {
          'Page.tsx': '',  // importer
          'route': {
            'client.ts': 'export {}',  // 親のclient.tsが優先される
            'edit': {
              'client.ts': 'export {}',  // こちらではなく親が検出される
              '_hooks': {
                'useFormContext.ts': '',
              },
            },
          },
        })
        return `${fixturesRoot}/barrel-file-names-parent-priority/Page.tsx`
      })(),
      options: [
        {
          additionalBarrelFileNames: ['client', 'server'],
        },
      ],
      errors: [
        {
          message: /route\/client\.ts/,  // より親のclient.tsが検出される
        },
      ],
    },

    // additionalBarrelFileNames - 親にclient.tsがなくindex.tsのみの場合、client.ts作成を促す
    {
      code: `import { useFormContext } from './route/edit/_hooks/useFormContext'`,
      filename: (() => {
        createFixture('barrel-file-names-missing-client', {
          'Page.tsx': '',  // importer
          'route': {
            'index.ts': 'export {}',  // index.tsのみ
            // client.ts なし
            'edit': {
              'client.ts': 'export {}',  // 子にはclient.tsがある
              '_hooks': {
                'useFormContext.ts': '',
              },
            },
          },
        })
        return `${fixturesRoot}/barrel-file-names-missing-client/Page.tsx`
      })(),
      options: [
        {
          additionalBarrelFileNames: ['client', 'server'],
        },
      ],
      errors: [
        {
          message: /route\/client\.ts を作成して.*edit\/client のexportをまとめてください/,
        },
      ],
    },

    // additionalBarrelFileNames - 複雑なネスト: 子=index, 中間=client, 親=index
    {
      code: `import { Component } from './route/edit/components/Component'`,
      filename: (() => {
        createFixture('barrel-file-names-nested-mixed', {
          'Page.tsx': '',  // importer
          'route': {
            'index.ts': 'export {}',  // 親 (index)
            'edit': {
              'client.ts': 'export {}',  // 中間 (client)
              'components': {
                'index.ts': 'export {}',  // 子 (index) - 最も近い
                'Component.tsx': '',
              },
            },
          },
        })
        return `${fixturesRoot}/barrel-file-names-nested-mixed/Page.tsx`
      })(),
      options: [
        {
          additionalBarrelFileNames: ['client', 'server'],
        },
      ],
      errors: [
        {
          message: /route\/edit\/components/,  // 最も近いindex.ts（components）が検出される
        },
      ],
    },

    // additionalBarrelFileNames - 複雑なネスト: 全てclient.ts
    {
      code: `import { Component } from './route/edit/components/Component'`,
      filename: (() => {
        createFixture('barrel-file-names-nested-all-client', {
          'Page.tsx': '',  // importer
          'route': {
            'client.ts': 'export {}',  // 親 (client)
            'edit': {
              'client.ts': 'export {}',  // 中間 (client)
              'components': {
                'client.ts': 'export {}',  // 子 (client) - 同名なので探索を続ける
                'Component.tsx': '',
              },
            },
          },
        })
        return `${fixturesRoot}/barrel-file-names-nested-all-client/Page.tsx`
      })(),
      options: [
        {
          additionalBarrelFileNames: ['client', 'server'],
        },
      ],
      errors: [
        {
          message: /route\/client/,  // より親のclient.tsが検出される
        },
      ],
    },

    // additionalBarrelFileNames - 複雑なネスト: 子=client, 中間=index, 親=なし
    {
      code: `import { Component } from './route/edit/components/Component'`,
      filename: (() => {
        createFixture('barrel-file-names-nested-reverse', {
          'Page.tsx': '',  // importer
          'route': {
            // barrelなし
            'edit': {
              'index.ts': 'export {}',  // 中間 (index)
              'components': {
                'client.ts': 'export {}',  // 子 (client) - 最も近い
                'Component.tsx': '',
              },
            },
          },
        })
        return `${fixturesRoot}/barrel-file-names-nested-reverse/Page.tsx`
      })(),
      options: [
        {
          additionalBarrelFileNames: ['client', 'server'],
        },
      ],
      errors: [
        {
          message: /route\/edit\/components\/client/,  // 最も近いclient.tsが検出される
        },
      ],
    },

    // ============================================================
    // 【新規】同じディレクトリまたは子階層からバレルファイルを経由するimport
    // ============================================================

    // 1. 同じディレクトリでバレルファイルを経由（from '.'）
    {
      code: `import { Button } from '.'`,
      filename: (() => {
        createFixture('same-dir-barrel-dot', {
          'Button': {
            'index.tsx': 'export { Button } from "./Button"',
            'Button.tsx': '',
          },
        })
        return `${fixturesRoot}/same-dir-barrel-dot/Button/Button.tsx`
      })(),
      errors: [
        {
          message: /バレルファイルからのimportは、そのディレクトリ外部からのみ許可されています/,
        },
      ],
    },

    // 2. 同じディレクトリでバレルファイルを経由（from './index'）
    {
      code: `import { Button } from './index'`,
      filename: (() => {
        createFixture('same-dir-barrel-index', {
          'Button': {
            'index.tsx': 'export { Button } from "./Button"',
            'Button.tsx': '',
          },
        })
        return `${fixturesRoot}/same-dir-barrel-index/Button/Button.tsx`
      })(),
      errors: [
        {
          message: /バレルファイルからのimportは、そのディレクトリ外部からのみ許可されています/,
        },
      ],
    },

    // 3. 同じディレクトリでclient.tsを経由（from './client'）
    {
      code: `import { ButtonPresentation } from './client'`,
      filename: (() => {
        createFixture('same-dir-barrel-client', {
          'Button': {
            'Button.container.tsx': '',
            'Button.presentation.tsx': '',
            'client.ts': 'export { ButtonPresentation } from "./Button.presentation"',
          },
        })
        return `${fixturesRoot}/same-dir-barrel-client/Button/Button.container.tsx`
      })(),
      options: [
        {
          additionalBarrelFileNames: ['client'],
        },
      ],
      errors: [
        {
          message: /バレルファイルからのimportは、そのディレクトリ外部からのみ許可されています/,
        },
      ],
    },

    // 4. 親ディレクトリのバレルを子階層から経由（from '..'）
    {
      code: `import { Button } from '..'`,
      filename: (() => {
        createFixture('child-dir-parent-barrel-dot', {
          'Button': {
            'index.tsx': 'export { Button } from "./Button"',
            'Button.tsx': '',
            '_utils': {
              'helper.ts': '',
            },
          },
        })
        return `${fixturesRoot}/child-dir-parent-barrel-dot/Button/_utils/helper.ts`
      })(),
      errors: [
        {
          message: /バレルファイルからのimportは、そのディレクトリ外部からのみ許可されています/,
        },
      ],
    },

    // 5. 親ディレクトリのバレルを子階層から経由（from '../index'）
    {
      code: `import { Button } from '../index'`,
      filename: (() => {
        createFixture('child-dir-parent-barrel-index', {
          'Button': {
            'index.tsx': 'export { Button } from "./Button"',
            'Button.tsx': '',
            '_utils': {
              'helper.ts': '',
            },
          },
        })
        return `${fixturesRoot}/child-dir-parent-barrel-index/Button/_utils/helper.ts`
      })(),
      errors: [
        {
          message: /バレルファイルからのimportは、そのディレクトリ外部からのみ許可されています/,
        },
      ],
    },

    // 6. path aliasで同じディレクトリのバレルを経由
    {
      code: `import { Button } from '@/same-dir-path-alias-barrel/Button'`,
      filename: (() => {
        createFixture('same-dir-path-alias-barrel', {
          'Button': {
            'index.tsx': 'export { Button } from "./Button"',
            'Button.tsx': '',
          },
        })
        return `${fixturesRoot}/same-dir-path-alias-barrel/Button/Button.tsx`
      })(),
      errors: [
        {
          message: /バレルファイルからのimportは、そのディレクトリ外部からのみ許可されています/,
        },
      ],
    },

    // 7. path aliasでバレルディレクトリの子階層から経由
    {
      code: `import { Button } from '@/child-dir-path-alias-barrel/Button'`,
      filename: (() => {
        createFixture('child-dir-path-alias-barrel', {
          'Button': {
            'index.tsx': 'export { Button } from "./Button"',
            'Button.tsx': '',
            '_utils': {
              'helper.ts': '',
            },
          },
        })
        return `${fixturesRoot}/child-dir-path-alias-barrel/Button/_utils/helper.ts`
      })(),
      errors: [
        {
          message: /バレルファイルからのimportは、そのディレクトリ外部からのみ許可されています/,
        },
      ],
    },

    // 8. 孫ディレクトリからバレルを経由（from '../../index'）
    {
      code: `import { Button } from '../../index'`,
      filename: (() => {
        createFixture('grandchild-dir-barrel', {
          'Button': {
            'index.tsx': 'export { Button } from "./Button"',
            'Button.tsx': '',
            '_utils': {
              '_helpers': {
                'deep.ts': '',
              },
            },
          },
        })
        return `${fixturesRoot}/grandchild-dir-barrel/Button/_utils/_helpers/deep.ts`
      })(),
      errors: [
        {
          message: /バレルファイルからのimportは、そのディレクトリ外部からのみ許可されています/,
        },
      ],
    },

    // ========================================
    // バレルファイルの純粋性チェック
    // ========================================

    // 9. バレルファイル内でimport文を使用
    {
      code: `import { Button } from './Button'`,
      filename: (() => {
        createFixture('barrel-purity-import', {
          'components': {
            'index.tsx': '',
            'Button.tsx': '',
          },
        })
        return `${fixturesRoot}/barrel-purity-import/components/index.tsx`
      })(),
      errors: [
        {
          message: /バレルファイルは設置されたディレクトリ外へのexportが責務です/,
        },
      ],
    },

    // 10. バレルファイル内で変数定義
    {
      code: `const foo = 'bar'`,
      filename: (() => {
        createFixture('barrel-purity-const', {
          'components': {
            'index.tsx': '',
          },
        })
        return `${fixturesRoot}/barrel-purity-const/components/index.tsx`
      })(),
      errors: [
        {
          message: /バレルファイルは設置されたディレクトリ外へのexportが責務です/,
        },
      ],
    },

    // 11. バレルファイル内で関数定義
    {
      code: `function helper() { return 'test' }`,
      filename: (() => {
        createFixture('barrel-purity-function', {
          'utils': {
            'index.ts': '',
          },
        })
        return `${fixturesRoot}/barrel-purity-function/utils/index.ts`
      })(),
      errors: [
        {
          message: /バレルファイルは設置されたディレクトリ外へのexportが責務です/,
        },
      ],
    },

    // 12. バレルファイル内でexport function
    {
      code: `export function helper() { return 'test' }`,
      filename: (() => {
        createFixture('barrel-purity-export-function', {
          'utils': {
            'index.ts': '',
          },
        })
        return `${fixturesRoot}/barrel-purity-export-function/utils/index.ts`
      })(),
      errors: [
        {
          message: /バレルファイルは設置されたディレクトリ外へのexportが責務です/,
        },
      ],
    },

    // 13. バレルファイル内でクラス定義
    {
      code: `class MyClass {}`,
      filename: (() => {
        createFixture('barrel-purity-class', {
          'models': {
            'index.ts': '',
          },
        })
        return `${fixturesRoot}/barrel-purity-class/models/index.ts`
      })(),
      errors: [
        {
          message: /バレルファイルは設置されたディレクトリ外へのexportが責務です/,
        },
      ],
    },

    // 14. バレルファイル内でexport class
    {
      code: `export class MyClass {}`,
      filename: (() => {
        createFixture('barrel-purity-export-class', {
          'models': {
            'index.ts': '',
          },
        })
        return `${fixturesRoot}/barrel-purity-export-class/models/index.ts`
      })(),
      errors: [
        {
          message: /バレルファイルは設置されたディレクトリ外へのexportが責務です/,
        },
      ],
    },

    // 15. バレルファイル内で変数定義とexport { foo }
    // export { foo } は定義（const foo）が禁止されているため、実質的に発生しない
    {
      code: `const foo = 'bar'`,
      filename: (() => {
        createFixture('barrel-purity-export-local', {
          'utils': {
            'index.ts': '',
          },
        })
        return `${fixturesRoot}/barrel-purity-export-local/utils/index.ts`
      })(),
      errors: [
        {
          message: /バレルファイルは設置されたディレクトリ外へのexportが責務です/,
        },
      ],
    },

    // 17. additionalBarrelFileNames（client.ts）でもpurityチェック
    {
      code: `import { api } from './api'`,
      filename: (() => {
        createFixture('barrel-purity-client', {
          'services': {
            'client.ts': '',
            'api.ts': '',
          },
        })
        return `${fixturesRoot}/barrel-purity-client/services/client.ts`
      })(),
      options: [{ additionalBarrelFileNames: ['client', 'server'] }],
      errors: [
        {
          message: /バレルファイルは設置されたディレクトリ外へのexportが責務です/,
        },
      ],
    },

    // 18. バレルファイル内で型エイリアス定義
    {
      code: `export type Size = 'small' | 'medium' | 'large'`,
      filename: (() => {
        createFixture('barrel-purity-type-alias', {
          'components': {
            'index.ts': '',
          },
        })
        return `${fixturesRoot}/barrel-purity-type-alias/components/index.ts`
      })(),
      languageOptions: {
        parser: require('typescript-eslint').parser,
      },
      errors: [
        {
          message: /バレルファイルは設置されたディレクトリ外へのexportが責務です/,
        },
      ],
    },

    // 19. バレルファイル内でインターフェース定義
    {
      code: `export interface ComponentAPI { render: () => void }`,
      filename: (() => {
        createFixture('barrel-purity-interface', {
          'components': {
            'index.ts': '',
          },
        })
        return `${fixturesRoot}/barrel-purity-interface/components/index.ts`
      })(),
      languageOptions: {
        parser: require('typescript-eslint').parser,
      },
      errors: [
        {
          message: /バレルファイルは設置されたディレクトリ外へのexportが責務です/,
        },
      ],
    },

    // 20. 【検証用】バレルファイル内でexport default function（禁止）
    {
      code: `export default function Page() { return null }`,
      filename: (() => {
        createFixture('barrel-purity-export-default-function', {
          'components': {
            'index.tsx': '',
          },
        })
        return `${fixturesRoot}/barrel-purity-export-default-function/components/index.tsx`
      })(),
      errors: [
        {
          message: /バレルファイルは設置されたディレクトリ外へのexportが責務です/,
        },
      ],
    },

    // 21. 【検証用】バレルファイル内でexport default class（禁止）
    {
      code: `export default class MyComponent {}`,
      filename: (() => {
        createFixture('barrel-purity-export-default-class', {
          'components': {
            'index.tsx': '',
          },
        })
        return `${fixturesRoot}/barrel-purity-export-default-class/components/index.tsx`
      })(),
      errors: [
        {
          message: /バレルファイルは設置されたディレクトリ外へのexportが責務です/,
        },
      ],
    },
  ],
})
