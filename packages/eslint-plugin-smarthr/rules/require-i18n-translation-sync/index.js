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
 * @returns {{ objectExportCount: number, exportedObject: import('estree').ObjectExpression | null }}
 */
function findExportedObject(program) {
  let objectExportCount = 0
  let exportedObject = null

  for (const node of program.body) {
    // export const translations = { ... }
    if (node.type === 'ExportNamedDeclaration' && node.declaration && node.declaration.type === 'VariableDeclaration') {
      for (const decl of node.declaration.declarations) {
        if (decl.init) {
          switch (decl.init.type) {
            case 'ObjectExpression':
              objectExportCount++
              exportedObject = decl.init
              break
            case 'TSAsExpression':
              if (decl.init.expression.type === 'ObjectExpression') {
                // as const などの型アサーション
                objectExportCount++
                exportedObject = decl.init.expression
              }
              break
            case 'TSSatisfiesExpression':
              if (decl.init.expression.type === 'ObjectExpression') {
                // satisfies Type
                objectExportCount++
                exportedObject = decl.init.expression
              } else if (decl.init.expression.type === 'TSAsExpression' &&
                         decl.init.expression.expression.type === 'ObjectExpression') {
                // as const satisfies Type のパターン
                objectExportCount++
                exportedObject = decl.init.expression.expression
              }
              break
          }
        }
      }
    }

    // export default { ... }
    if (node.type === 'ExportDefaultDeclaration') {
      switch (node.declaration.type) {
        case 'ObjectExpression':
          objectExportCount++
          exportedObject = node.declaration
          break
        case 'TSAsExpression':
          if (node.declaration.expression.type === 'ObjectExpression') {
            objectExportCount++
            exportedObject = node.declaration.expression
          }
          break
        case 'TSSatisfiesExpression':
          if (node.declaration.expression.type === 'ObjectExpression') {
            // satisfies Type
            objectExportCount++
            exportedObject = node.declaration.expression
          } else if (node.declaration.expression.type === 'TSAsExpression' &&
                     node.declaration.expression.expression.type === 'ObjectExpression') {
            // as const satisfies Type のパターン
            objectExportCount++
            exportedObject = node.declaration.expression.expression
          }
          break
      }
    }
  }

  return { objectExportCount, exportedObject }
}

/**
 * 同じディレクトリにある他言語のJSONファイル一覧を取得する
 *
 * 他言語ファイル（en.json, zh.json など）は翻訳ツールで管理され、
 * targetFileNameに対応するJSONファイル（例: ja.json）がSSOTとなる。
 *
 * @param {string} dir - 翻訳ファイルが置かれているディレクトリ
 * @param {string} targetJsonBasename - 除外するSSOTのJSONファイル名（例: ja.json）
 * @returns {string[]} 他言語JSONファイルのファイル名一覧
 */
function findOtherLocaleJsonFiles(dir, targetJsonBasename) {
  let entries
  try {
    entries = fs.readdirSync(dir)
  } catch (error) {
    return []
  }

  return entries.filter((entry) => entry.endsWith('.json') && entry !== targetJsonBasename)
}

/**
 * 他言語のJSONファイルに、SSOT（ja.tsなど）に存在しないキーがないかチェックする
 *
 * SSOT側にあって他言語側にないキーは「未翻訳」として許容するが、
 * 他言語側にあってSSOT側にないキーは、SSOT側でのキーのリネームや削除の際に
 * 他言語ファイルの追従を忘れている可能性が高いためエラーとする。
 *
 * @param {Record<string, string>} translations - SSOT（ja.tsなど）から抽出した翻訳データ
 * @param {string} dir - 翻訳ファイルが置かれているディレクトリ
 * @param {string} targetJsonBasename - SSOTのJSONファイル名（例: ja.json）
 * @returns {Array<{ localeFile: string, key: string }>} 孤立キーの一覧
 */
function findOrphanKeysInOtherLocales(translations, dir, targetJsonBasename) {
  const orphans = []

  for (const localeFile of findOtherLocaleJsonFiles(dir, targetJsonBasename)) {
    let localeTranslations
    try {
      localeTranslations = JSON.parse(fs.readFileSync(path.join(dir, localeFile), 'utf8'))
    } catch (error) {
      // JSONとして不正なファイルはこのルールの対象外
      continue
    }

    if (!localeTranslations || typeof localeTranslations !== 'object' || Array.isArray(localeTranslations)) {
      continue
    }

    for (const key of Object.keys(localeTranslations)) {
      if (!(key in translations)) {
        orphans.push({ localeFile, key })
      }
    }
  }

  return orphans
}

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<'multipleExports' | 'noExport' | 'notObject' | 'invalidValue' | 'notSync' | 'orphanKeyInOtherLocale'>}
 */
module.exports = {
  meta: {
    type: 'problem',
    fixable: 'code',
    schema: SCHEMA,
    messages: {
      multipleExports: '翻訳ファイルはオブジェクトリテラルを1つのみexportする必要があります。現在{{count}}個のオブジェクトがexportされています。',
      noExport: '翻訳ファイルはオブジェクトリテラルをexportする必要があります。',
      notObject: 'exportする値はオブジェクトリテラルである必要があります。',
      invalidValue: '{{message}}',
      notSync: '翻訳ファイル（{{tsFile}}）とJSONファイル（{{jsonFile}}）の内容が一致しません。autofixで同期できます。',
      orphanKeyInOtherLocale: '{{localeFile}} にキー "{{key}}" が存在しますが、{{tsFile}} に対応するキーがありません。{{tsFile}} でキーが削除またはリネームされた際に、{{localeFile}} 側の追従を忘れている可能性があります。',
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
        const { objectExportCount, exportedObject } = findExportedObject(node)

        // オブジェクトのexportが複数ある場合
        if (objectExportCount > 1) {
          context.report({
            node,
            messageId: 'multipleExports',
            data: { count: objectExportCount },
          })
          return
        }

        // オブジェクトのexportがない場合
        if (objectExportCount === 0) {
          context.report({
            node,
            messageId: 'noExport',
          })
          return
        }

        // exportがオブジェクトでない場合（念のためのチェック）
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

        // 他言語ファイルに、SSOT（ja.tsなど）側で削除・リネームされたキーが
        // 残っていないかチェックする（SSOT側にしかないキーは未翻訳として許容する）
        const jsonFileBasename = path.basename(jsonFilePath)
        const tsFile = path.basename(tsFilePath)

        for (const orphan of findOrphanKeysInOtherLocales(translations, parsed.dir, jsonFileBasename)) {
          context.report({
            node,
            messageId: 'orphanKeyInOtherLocale',
            data: { localeFile: orphan.localeFile, key: orphan.key, tsFile },
          })
        }
      },
    }
  },
}

module.exports.schema = SCHEMA
