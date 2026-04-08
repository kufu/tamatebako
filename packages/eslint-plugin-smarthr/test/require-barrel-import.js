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

// ============================================================
// Fixtureの作成
// ============================================================

// 同階層・サブディレクトリからのimport
const sameLevelImportFixture = createFixture('same-level-import', {
  'Menu': {
    'MenuItem.tsx': '',
    'index.tsx': 'export {}',
    'hooks': {
      'useMenu.ts': '',
    },
  },
})

// Next.js App Router特殊文字パス - 同階層import
const nextjsSpecialCharsFixture = createFixture('nextjs-special-chars', {
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

// Dynamic Routes - [id]パス
const nextjsDynamicRouteFixture = createFixture('nextjs-dynamic-route', {
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

// barrel が存在しない場合
const noBarrelFixture = createFixture('no-barrel', {
  'components': {
    'Button': {
      'Button.tsx': '',
      'utils': {
        'helper.ts': '',
      },
    },
  },
})

// 親階層からのimport（barrelが存在する場合）
const parentImportWithBarrelFixture = createFixture('parent-import-with-barrel', {
  'components': {
    'index.tsx': 'export {}',
    'AddDialog': {
      'AddDialog.tsx': '',
    },
    'hooks': {
      'createUserRoleAction.ts': '',
    },
  },
})

// Next.js特殊文字パス - 親階層からのimport
const nextjsParentImportFixture = createFixture('nextjs-parent-import', {
  'app': {
    '(private)': {
      'settings': {
        'user_roles': {
          '_components': {
            'index.tsx': 'export {}',
            'AddUserRoleDialog': {
              'AddUserRoleDialog.tsx': '',
            },
            'hooks': {
              'createUserRoleAction.ts': '',
            },
          },
        },
      },
    },
  },
})

// [id] Dynamic Routes - 親階層からのimport
const dynamicRouteParentImportFixture = createFixture('dynamic-route-parent-import', {
  'app': {
    'items': {
      'index.tsx': 'export {}',
      '[id]': {
        'DetailPage.tsx': '',
      },
      'api': {
        'client.ts': '',
      },
    },
  },
})

// ============================================================
// テストケース
// ============================================================

ruleTester.run('require-barrel-import', rule, {
  valid: [
    // 同階層・サブディレクトリからのimport（エラーにならない）
    {
      code: `import { useMenu } from './hooks/useMenu'`,
      filename: `${sameLevelImportFixture}/Menu/MenuItem.tsx`,
    },

    // Next.js App Router特殊文字パス - 同階層import
    {
      code: `import { useUsers } from './hooks/useUsers'`,
      filename: `${nextjsSpecialCharsFixture}/app/(private)/settings/user_roles/_components/AddUserRoleDialog/AddUserRoleDialog.tsx`,
    },

    // Dynamic Routes - [id]パス
    {
      code: `import { useDetail } from './hooks/useDetail'`,
      filename: `${nextjsDynamicRouteFixture}/app/items/[id]/DetailPage.tsx`,
    },

    // barrel が存在しない場合
    {
      code: `import { helper } from './utils/helper'`,
      filename: `${noBarrelFixture}/components/Button/Button.tsx`,
    },
  ],

  invalid: [
    // 親階層からのimport（barrelが存在する場合）
    {
      code: `import { createUserRole } from '../hooks/createUserRoleAction'`,
      filename: `${parentImportWithBarrelFixture}/components/AddDialog/AddDialog.tsx`,
      errors: [
        {
          message: /からimportするか、.*のbarrelファイルを削除して直接import可能にしてください/,
        },
      ],
    },

    // Next.js特殊文字パス - 親階層からのimport
    {
      code: `import { createUserRole } from '../hooks/createUserRoleAction'`,
      filename: `${nextjsParentImportFixture}/app/(private)/settings/user_roles/_components/AddUserRoleDialog/AddUserRoleDialog.tsx`,
      errors: [
        {
          message: /からimportするか、.*のbarrelファイルを削除して直接import可能にしてください/,
        },
      ],
    },

    // [id] Dynamic Routes - 親階層からのimport
    {
      code: `import { api } from '../api/client'`,
      filename: `${dynamicRouteParentImportFixture}/app/items/[id]/DetailPage.tsx`,
      errors: [
        {
          message: /からimportするか、.*のbarrelファイルを削除して直接import可能にしてください/,
        },
      ],
    },
  ],
})
