const fs = require('fs')
const os = require('os')
const path = require('path')

const rule = require('../rules/require-i18n-translation-sync')
const RuleTester = require('eslint').RuleTester

// テスト用の一時ディレクトリ
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-sync-test-'))

/**
 * テスト用のJSONファイルを作成
 */
function setupTestFile(basename, translations, options = {}) {
  const tsPath = path.join(tmpDir, basename)
  const jsonPath = path.join(tmpDir, basename.replace(/\.ts$/, '.json'))

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
  return path.join(tmpDir, basename)
}

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
})

const defaultOptions = [{}]

ruleTester.run('require-i18n-translation-sync', rule, {
  valid: [
    // 対象ファイル名でない場合はスキップ
    {
      code: 'export const translations = { "key1": "value1" }',
      filename: createTestPath('en.ts'),
      options: defaultOptions,
    },

    // ja.ts と ja.json が一致している場合
    {
      code: 'export const translations = { "key1": "value1", "key2": "value2" }',
      filename: setupTestFile('valid-sync.ts', { key1: 'value1', key2: 'value2' }),
      options: defaultOptions,
    },

    // export default でも OK
    {
      code: 'export default { "key1": "value1" }',
      filename: setupTestFile('valid-default.ts', { key1: 'value1' }),
      options: defaultOptions,
    },

    // Identifierキーでも OK
    {
      code: 'export const translations = { key1: "value1", key2: "value2" }',
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
      code: 'export const translations = { "key1": "value1" }',
      filename: setupTestFile('en_us.ts', { key1: 'value1' }),
      options: [{ targetFileName: 'en_us.ts' }],
    },
  ],

  invalid: [
    // 複数のexport
    {
      code: 'export const a = { "key1": "value1" }; export const b = { "key2": "value2" }',
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'multipleExports' }],
    },

    // exportがない
    {
      code: 'const translations = { "key1": "value1" }',
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'noExport' }],
    },

    // オブジェクト以外をexport
    {
      code: 'export const translations = "not an object"',
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'notObject' }],
    },

    // 配列をexport
    {
      code: 'export const translations = ["array"]',
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'notObject' }],
    },

    // 値が文字列以外（数値）
    {
      code: 'export const translations = { "key1": 123 }',
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'invalidValue' }],
    },

    // 値が文字列以外（真偽値）
    {
      code: 'export const translations = { "key1": true }',
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'invalidValue' }],
    },

    // 値が文字列以外（null）
    {
      code: 'export const translations = { "key1": null }',
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'invalidValue' }],
    },

    // ネストされたオブジェクト
    {
      code: 'export const translations = { "key1": { "nested": "value" } }',
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'invalidValue' }],
    },

    // スプレッド構文
    {
      code: 'const base = { "key1": "value1" }; export const translations = { ...base, "key2": "value2" }',
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
      code: 'export const translations = { "key1": "value1" }',
      filename: createTestPath('ja.ts'),
      options: defaultOptions,
      errors: [{ messageId: 'notSync' }],
    },

    // ja.ts と ja.json が不一致
    {
      code: 'export const translations = { "key1": "new value" }',
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
  ],
})
