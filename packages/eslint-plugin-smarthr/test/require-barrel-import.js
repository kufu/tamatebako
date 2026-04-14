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

    // additionalBarrelFileNames - index.tsを見つけた後も親のclient.tsを探索
    {
      code: `import { useFormContext } from './route/edit/_hooks/useFormContext'`,
      filename: (() => {
        createFixture('barrel-file-names-index-then-client', {
          'Page.tsx': '',  // importer
          'route': {
            'client.ts': 'export {}',  // 親のclient.tsが優先される
            'edit': {
              'index.ts': 'export {}',  // index.tsを見つけた後も探索を続ける
              '_hooks': {
                'useFormContext.ts': '',
              },
            },
          },
        })
        return `${fixturesRoot}/barrel-file-names-index-then-client/Page.tsx`
      })(),
      options: [
        {
          additionalBarrelFileNames: ['client', 'server'],
        },
      ],
      errors: [
        {
          message: /route\/client\.ts/,  // client.tsが検出される（index.tsではない）
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
  ],
})
