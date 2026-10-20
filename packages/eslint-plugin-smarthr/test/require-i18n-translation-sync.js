const fs = require('fs')
const os = require('os')
const path = require('path')

const rule = require('../rules/require-i18n-translation-sync')
const RuleTester = require('eslint').RuleTester

// テスト用の一時ディレクトリ
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-sync-test-'))

// 他言語ファイル検出（同じディレクトリ内の他の.jsonファイルをスキャンする）が
// 無関係なテストケース同士で誤検出しないよう、呼び出しごとに専用ディレクトリを発行する
let fixtureCounter = 0
function createFixtureDir() {
  const dir = path.join(tmpDir, `fixture-${fixtureCounter++}`)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

/**
 * テスト用のJSONファイルを作成
 */
function setupTestFile(basename, translations, options = {}) {
  const dir = createFixtureDir()
  const tsPath = path.join(dir, basename)
  const parsed = path.parse(basename)
  const jsonPath = path.join(dir, parsed.name + '.json')

  // JSONファイルを作成
  const indent = options.indent || 2
  const endOfLine = options.endOfLine || 'lf'
  const newline = endOfLine === 'crlf' ? '\r\n' : '\n'
  const jsonString = JSON.stringify(translations, null, indent) + newline

  fs.writeFileSync(jsonPath, jsonString, 'utf8')

  return tsPath
}

/**
 * テスト用のファイルパスを生成（JSONなし）
 */
function createTestPath(basename) {
  return path.join(createFixtureDir(), basename)
}

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
})

const defaultOptions = [{}]

ruleTester.run('require-i18n-translation-sync', rule, {
  valid: [
    // 対象ファイル名でない場合はスキップ
    {
      code: "export const translations = { key1: 'value1' }",
      filename: createTestPath('en.ts'),
      options: defaultOptions,
    },

    // ja.ts と ja.json が一致している場合
    {
      code: "export const translations = { key1: 'value1', key2: 'value2' }",
      filename: setupTestFile('valid-sync.ts', { key1: 'value1', key2: 'value2' }),
      options: defaultOptions,
    },

    // export default でも OK
    {
      code: "export default { key1: 'value1' }",
      filename: setupTestFile('valid-default.ts', { key1: 'value1' }),
      options: defaultOptions,
    },

    // Identifierキーでも OK
    {
      code: "export const translations = { key1: 'value1', key2: 'value2' }",
      filename: setupTestFile('valid-identifier.ts', { key1: 'value1', key2: 'value2' }),
      options: defaultOptions,
    },

    // テンプレートリテラル（式なし）
    {
      code: 'export const translations = { key1: `value1` }',
      filename: setupTestFile('valid-template.ts', { key1: 'value1' }),
      options: defaultOptions,
    },

    // カスタムファイル名
    {
      code: "export const translations = { key1: 'value1' }",
      filename: setupTestFile('en_us.ts', { key1: 'value1' }),
      options: [{ targetFileName: 'en_us.ts' }],
    },

    // カスタムファイル名: .js拡張子
    {
      code: "export const translations = { key1: 'value1' }",
      filename: setupTestFile('custom.js', { key1: 'value1' }),
      options: [{ targetFileName: 'custom.js' }],
    },

    // カスタムファイル名: .tsx拡張子
    {
      code: "export const translations = { key1: 'value1' }",
      filename: setupTestFile('custom.tsx', { key1: 'value1' }),
      options: [{ targetFileName: 'custom.tsx' }],
    },

    // カスタムファイル名: .jsx拡張子
    {
      code: "export const translations = { key1: 'value1' }",
      filename: setupTestFile('custom.jsx', { key1: 'value1' }),
      options: [{ targetFileName: 'custom.jsx' }],
    },

    // エスケープ: ダブルクォートを含む（シングルクォート文字列）
    {
      code: "export const translations = { key1: 'hogefuga\"piyo\".' }",
      filename: setupTestFile('valid-escape-double.ts', { key1: 'hogefuga"piyo".' }),
      options: defaultOptions,
    },

    // エスケープ: シングルクォートを含む（ダブルクォート文字列）
    {
      code: "export const translations = { key1: \"hoge'fuga'.\" }",
      filename: setupTestFile('valid-escape-single.ts', { key1: "hoge'fuga'." }),
      options: defaultOptions,
    },

    // エスケープ: バックスラッシュを含む
    {
      code: "export const translations = { key1: '円記号\\\\あり' }",
      filename: setupTestFile('valid-escape-backslash.ts', { key1: '円記号\\あり' }),
      options: defaultOptions,
    },

    // エスケープ: 改行を含む
    {
      code: "export const translations = { key1: '改行\\nあり' }",
      filename: setupTestFile('valid-escape-newline.ts', { key1: '改行\nあり' }),
      options: defaultOptions,
    },

    // エスケープ: タブを含む
    {
      code: "export const translations = { key1: 'タブ\\tあり' }",
      filename: setupTestFile('valid-escape-tab.ts', { key1: 'タブ\tあり' }),
      options: defaultOptions,
    },

    // 特殊パターン: プレースホルダーを含む
    {
      code: "export const translations = { greeting: 'こんにちは、{name}さん' }",
      filename: setupTestFile('valid-placeholder.ts', { greeting: 'こんにちは、{name}さん' }),
      options: defaultOptions,
    },

    // 特殊パターン: HTMLタグを含む
    {
      code: "export const translations = { message: 'これは改行<br></br>のテストです' }",
      filename: setupTestFile('valid-br-tag.ts', { message: 'これは改行<br></br>のテストです' }),
      options: defaultOptions,
    },

    // 特殊パターン: 複数のプレースホルダーを含む
    {
      code: "export const translations = { count: '{count}件のうち{total}件を表示' }",
      filename: setupTestFile('valid-multi-placeholder.ts', { count: '{count}件のうち{total}件を表示' }),
      options: defaultOptions,
    },

    // 特殊パターン: 改行変数を含む
    {
      code: "export const translations = { error: 'エラーが発生しました。{br}再度お試しください。' }",
      filename: setupTestFile('valid-br-variable.ts', { error: 'エラーが発生しました。{br}再度お試しください。' }),
      options: defaultOptions,
    },

    // 特殊パターン: 複合的なパターン
    {
      code: "export const translations = { complex: '{user}さん、<strong>重要</strong>なお知らせです。{br}詳細は{link}をご確認ください。' }",
      filename: setupTestFile('valid-complex.ts', { complex: '{user}さん、<strong>重要</strong>なお知らせです。{br}詳細は{link}をご確認ください。' }),
      options: defaultOptions,
    },

    // 特殊パターン: 空のオブジェクト
    {
      code: "export const translations = {}",
      filename: setupTestFile('valid-empty.ts', {}),
      options: defaultOptions,
    },

    // 複数のexport: 型とオブジェクトを両方export
    {
      code: "export type TranslationKeys = string; export const translations = { key1: 'value1' }",
      filename: setupTestFile('valid-with-type.ts', { key1: 'value1' }),
      options: defaultOptions,
    },

    // 複数のexport: 型定義が複数ある場合
    {
      code: "export type Foo = string; export type Bar = number; export const translations = { key1: 'value1' }",
      filename: setupTestFile('valid-with-multiple-types.ts', { key1: 'value1' }),
      options: defaultOptions,
    },

    // as const satisfies パターン
    {
      code: "export const translations = { key1: 'value1' } as const satisfies Record<string, string>",
      filename: setupTestFile('valid-as-const-satisfies.ts', { key1: 'value1' }),
      options: defaultOptions,
    },

    // satisfies as const パターン
    {
      code: "export const translations = { key1: 'value1' } satisfies Record<string, string> as const",
      filename: setupTestFile('valid-satisfies-as-const.ts', { key1: 'value1' }),
      options: defaultOptions,
    },

    // satisfies のみのパターン
    {
      code: "export const translations = { key1: 'value1' } satisfies Record<string, string>",
      filename: setupTestFile('valid-satisfies-only.ts', { key1: 'value1' }),
      options: defaultOptions,
    },

    // export default with satisfies
    {
      code: "export default { key1: 'value1' } satisfies Record<string, string>",
      filename: setupTestFile('valid-default-satisfies.ts', { key1: 'value1' }),
      options: defaultOptions,
    },

    // export default with as const satisfies
    {
      code: "export default { key1: 'value1' } as const satisfies Record<string, string>",
      filename: setupTestFile('valid-default-as-const-satisfies.ts', { key1: 'value1' }),
      options: defaultOptions,
    },

    // 他言語ファイルがja側のキーの一部しか持たない（未翻訳）場合はOK
    {
      code: "export const translations = { key1: 'value1', key2: 'value2' }",
      filename: (() => {
        const tsPath = path.join(tmpDir, 'locale-subset', 'ja.ts')
        fs.mkdirSync(path.dirname(tsPath), { recursive: true })
        fs.writeFileSync(path.join(tmpDir, 'locale-subset', 'ja.json'), '{\n  "key1": "value1",\n  "key2": "value2"\n}\n', 'utf8')
        fs.writeFileSync(path.join(tmpDir, 'locale-subset', 'en.json'), '{\n  "key1": "value1"\n}\n', 'utf8')
        return tsPath
      })(),
      options: defaultOptions,
    },

    // 他言語ファイルが不正なJSONの場合はこのチェックの対象外
    {
      code: "export const translations = { key1: 'value1' }",
      filename: (() => {
        const tsPath = path.join(tmpDir, 'locale-invalid-json', 'ja.ts')
        fs.mkdirSync(path.dirname(tsPath), { recursive: true })
        fs.writeFileSync(path.join(tmpDir, 'locale-invalid-json', 'ja.json'), '{\n  "key1": "value1"\n}\n', 'utf8')
        fs.writeFileSync(path.join(tmpDir, 'locale-invalid-json', 'en.json'), 'not valid json', 'utf8')
        return tsPath
      })(),
      options: defaultOptions,
    },
  ],

  invalid: [
    // 複数のオブジェクトをexport
    {
      code: "export const a = { key1: 'value1' }; export const b = { key2: 'value2' }",
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'multipleExports' }],
    },

    // オブジェクトのexportがない
    {
      code: "const translations = { key1: 'value1' }",
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'noExport' }],
    },

    // オブジェクト以外をexport（文字列）
    {
      code: "export const translations = 'not an object'",
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'noExport' }],
    },

    // オブジェクト以外をexport（配列）
    {
      code: "export const translations = ['array']",
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'noExport' }],
    },

    // 値が文字列以外（数値）
    {
      code: "export const translations = { key1: 123 }",
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'invalidValue' }],
    },

    // 値が文字列以外（真偽値）
    {
      code: "export const translations = { key1: true }",
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'invalidValue' }],
    },

    // 値が文字列以外（null）
    {
      code: "export const translations = { key1: null }",
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'invalidValue' }],
    },

    // ネストされたオブジェクト
    {
      code: "export const translations = { key1: { nested: 'value' } }",
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'invalidValue' }],
    },

    // スプレッド構文
    {
      code: "const base = { key1: 'value1' }; export const translations = { ...base, key2: 'value2' }",
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'invalidValue' }],
    },

    // テンプレートリテラルに式を含む
    {
      code: 'export const translations = { key1: `value${1}` }',
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'invalidValue' }],
    },

    // JSONファイルが存在しない
    {
      code: "export const translations = { key1: 'value1' }",
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'notSync' }],
    },

    // ja.ts と ja.json が不一致
    {
      code: "export const translations = { key1: 'new value' }",
      filename: (() => {
        const tsPath = path.join(tmpDir, 'sub1', 'ja.ts')
        const jsonPath = path.join(tmpDir, 'sub1', 'ja.json')
        fs.mkdirSync(path.dirname(tsPath), { recursive: true })
        fs.writeFileSync(jsonPath, '{\n  "key1": "old value"\n}\n', 'utf8')
        return tsPath
      })(),
      options: defaultOptions,
      errors: [{ messageId: 'notSync' }],
    },

    // 他言語ファイルにjaにないキーが残っている（リネーム/削除の追従漏れ）
    {
      code: "export const translations = { key1: 'value1' }",
      filename: (() => {
        const tsPath = path.join(tmpDir, 'locale-orphan', 'ja.ts')
        fs.mkdirSync(path.dirname(tsPath), { recursive: true })
        fs.writeFileSync(path.join(tmpDir, 'locale-orphan', 'ja.json'), '{\n  "key1": "value1"\n}\n', 'utf8')
        fs.writeFileSync(path.join(tmpDir, 'locale-orphan', 'en.json'), '{\n  "key1": "value1",\n  "oldKey": "old value"\n}\n', 'utf8')
        return tsPath
      })(),
      options: defaultOptions,
      errors: [
        {
          messageId: 'orphanKeyInOtherLocale',
          data: { localeFile: 'en.json', key: 'oldKey', tsFile: 'ja.ts' },
        },
      ],
    },

    // 複数の他言語ファイルで、複数の孤立キーがある場合
    {
      code: "export const translations = { key1: 'value1' }",
      filename: (() => {
        const tsPath = path.join(tmpDir, 'locale-multi-orphan', 'ja.ts')
        fs.mkdirSync(path.dirname(tsPath), { recursive: true })
        fs.writeFileSync(path.join(tmpDir, 'locale-multi-orphan', 'ja.json'), '{\n  "key1": "value1"\n}\n', 'utf8')
        fs.writeFileSync(path.join(tmpDir, 'locale-multi-orphan', 'en.json'), '{\n  "key1": "value1",\n  "oldKey": "old value"\n}\n', 'utf8')
        fs.writeFileSync(path.join(tmpDir, 'locale-multi-orphan', 'zh.json'), '{\n  "key1": "value1",\n  "removedKey": "removed"\n}\n', 'utf8')
        return tsPath
      })(),
      options: defaultOptions,
      errors: [
        {
          messageId: 'orphanKeyInOtherLocale',
          data: { localeFile: 'en.json', key: 'oldKey', tsFile: 'ja.ts' },
        },
        {
          messageId: 'orphanKeyInOtherLocale',
          data: { localeFile: 'zh.json', key: 'removedKey', tsFile: 'ja.ts' },
        },
      ],
    },
  ],
})
