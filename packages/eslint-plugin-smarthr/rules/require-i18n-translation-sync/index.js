const fs = require('fs')
const path = require('path')

const SCHEMA = [
  {
    type: 'object',
    properties: {
      targetFileName: {
        type: 'string',
        default: 'ja.ts',
      },
      indent: {
        type: 'number',
        default: 2,
      },
      endOfLine: {
        type: 'string',
        enum: ['lf', 'crlf'],
        default: 'lf',
      },
    },
    additionalProperties: false,
  },
]

/**
 * オブジェクトリテラルから翻訳データを抽出
 * @param {import('estree').ObjectExpression} node
 * @param {import('@typescript-eslint/utils').TSESLint.SourceCode} sourceCode
 * @returns {{ translations: Record<string, string>, errors: Array<{ node: any, message: string }> }}
 */
function extractTranslations(node, sourceCode) {
  const translations = {}
  const errors = []

  for (const prop of node.properties) {
    // SpreadElementは不許可
    if (prop.type === 'SpreadElement') {
      errors.push({
        node: prop,
        message: 'スプレッド構文は使用できません。翻訳ファイルはフラットなオブジェクトである必要があります。',
      })
      continue
    }

    // キーの取得
    let key
    switch (prop.key.type) {
      case 'Identifier':
        key = prop.key.name
        break
      case 'Literal':
        key = String(prop.key.value)
        break
      default:
        errors.push({
          node: prop.key,
          message: 'キーは文字列リテラルまたは識別子である必要があります。',
        })
        continue
    }

    // 値の検証
    switch (prop.value.type) {
      case 'Literal':
        if (typeof prop.value.value !== 'string') {
          errors.push({
            node: prop.value,
            message: `キー "${key}" の値は文字列である必要があります。数値、真偽値などは使用できません。`,
          })
          continue
        }
        translations[key] = prop.value.value
        break
      case 'TemplateLiteral':
        // テンプレートリテラルで式がない場合のみ許可
        if (prop.value.expressions.length === 0) {
          translations[key] = prop.value.quasis[0].value.cooked
        } else {
          errors.push({
            node: prop.value,
            message: `キー "${key}" の値は静的な文字列である必要があります。テンプレートリテラルに式を含めることはできません。`,
          })
        }
        break
      case 'ObjectExpression':
        errors.push({
          node: prop.value,
          message: `キー "${key}" の値はネストされたオブジェクトです。翻訳ファイルはフラットな構造である必要があります。`,
        })
        break
      default:
        errors.push({
          node: prop.value,
          message: `キー "${key}" の値は文字列リテラルである必要があります。`,
        })
    }
  }

  return { translations, errors }
}

/**
 * export文からオブジェクトを探す
 * @param {import('estree').Program} program
 * @returns {import('estree').ObjectExpression | null}
 */
function findExportedObject(program) {
  let exportCount = 0
  let exportedObject = null

  for (const node of program.body) {
    // export const translations = { ... }
    if (node.type === 'ExportNamedDeclaration' && node.declaration && node.declaration.type === 'VariableDeclaration') {
      for (const decl of node.declaration.declarations) {
        exportCount++
        if (decl.init) {
          switch (decl.init.type) {
            case 'ObjectExpression':
              exportedObject = decl.init
              break
            case 'TSAsExpression':
              if (decl.init.expression.type === 'ObjectExpression') {
                // as const などの型アサーション
                exportedObject = decl.init.expression
              }
              break
          }
        }
      }
    }

    // export default { ... }
    if (node.type === 'ExportDefaultDeclaration') {
      exportCount++
      switch (node.declaration.type) {
        case 'ObjectExpression':
          exportedObject = node.declaration
          break
        case 'TSAsExpression':
          if (node.declaration.expression.type === 'ObjectExpression') {
            exportedObject = node.declaration.expression
          }
          break
      }
    }
  }

  return { exportCount, exportedObject }
}

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<'multipleExports' | 'noExport' | 'notObject' | 'invalidValue' | 'notSync'>}
 */
module.exports = {
  meta: {
    type: 'problem',
    fixable: 'code',
    schema: SCHEMA,
    messages: {
      multipleExports: '翻訳ファイルは1つのオブジェクトのみをexportする必要があります。現在{{count}}個のexportがあります。',
      noExport: '翻訳ファイルはオブジェクトをexportする必要があります。',
      notObject: 'exportする値はオブジェクトリテラルである必要があります。',
      invalidValue: '{{message}}',
      notSync: '翻訳ファイル（{{tsFile}}）とJSONファイル（{{jsonFile}}）の内容が一致しません。autofixで同期できます。',
    },
  },
  create(context) {
    const options = context.options[0] || {}
    const targetFileName = options.targetFileName || 'ja.ts'

    const filename = context.getFilename()
    const basename = path.basename(filename)

    // 対象ファイル以外はスキップ
    if (basename !== targetFileName) {
      return {}
    }

    return {
      Program(node) {
        const { exportCount, exportedObject } = findExportedObject(node)

        // exportが複数ある場合
        if (exportCount > 1) {
          context.report({
            node,
            messageId: 'multipleExports',
            data: { count: exportCount },
          })
          return
        }

        // exportがない場合
        if (exportCount === 0) {
          context.report({
            node,
            messageId: 'noExport',
          })
          return
        }

        // exportがオブジェクトでない場合
        if (!exportedObject) {
          context.report({
            node,
            messageId: 'notObject',
          })
          return
        }

        // オブジェクトから翻訳データを抽出
        const sourceCode = context.getSourceCode()
        const { translations, errors } = extractTranslations(exportedObject, sourceCode)

        // 構造エラーを報告
        for (const error of errors) {
          context.report({
            node: error.node,
            messageId: 'invalidValue',
            data: { message: error.message },
          })
        }

        // エラーがある場合はJSONとの比較をスキップ
        if (errors.length > 0) {
          return
        }

        // JSONファイルのパス
        const tsFilePath = filename
        const parsed = path.parse(tsFilePath)
        const jsonFilePath = path.join(parsed.dir, parsed.name + '.json')

        // JSON文字列を生成
        const indent = options.indent || 2
        const endOfLine = options.endOfLine || 'lf'
        const newline = endOfLine === 'crlf' ? '\r\n' : '\n'
        const jsonString = JSON.stringify(translations, null, indent) + newline

        // JSONファイルを読み込んで比較
        let existingJsonString = ''
        try {
          if (fs.existsSync(jsonFilePath)) {
            existingJsonString = fs.readFileSync(jsonFilePath, 'utf8')
          }
        } catch (error) {
          // ファイル読み込みエラーは無視（新規作成として扱う）
        }

        // 内容が一致しない場合
        if (existingJsonString !== jsonString) {
          const tsFile = path.basename(tsFilePath)
          const jsonFile = path.basename(jsonFilePath)

          context.report({
            node,
            messageId: 'notSync',
            data: { tsFile, jsonFile },
            fix(fixer) {
              // autofixer: JSONファイルを書き込む
              // ESLintのfixerはファイル書き込みをサポートしないため、
              // ここでは直接ファイルを書き込む
              fs.writeFileSync(jsonFilePath, jsonString, 'utf8')
              // fixerは何も返さない（ファイル外の変更のため）
              return []
            },
          })
        }
      },
    }
  },
}

module.exports.schema = SCHEMA
