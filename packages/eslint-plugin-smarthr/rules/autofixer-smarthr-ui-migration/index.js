const v90ToV91 = require('./versions/v90-to-v91')

const VERSION_MODULES = {
  'v90-v91': v90ToV91,
}

module.exports = {
  meta: {
    type: 'problem',
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          from: {
            type: 'string',
            pattern: '^v[0-9]+$',
          },
          to: {
            type: 'string',
            pattern: '^v[0-9]+$',
          },
        },
        required: ['from', 'to'],
        additionalProperties: false,
      },
    ],
    messages: {
      missingOptions: 'オプションで from と to を指定してください。例: { "from": "v90", "to": "v91" }',
      unsupportedVersion: 'サポートされていないバージョンです: {{from}} to {{to}}',
      skippedVersion: 'v{{version}} の自動修正ルールが実装されていません。変更内容は https://github.com/kufu/smarthr-ui/releases から対応するversionの情報を確認してください',
      ...v90ToV91.messages,
    },
  },
  create(context) {
    const options = context.options[0]

    // オプション必須チェック
    if (!options || !options.from || !options.to) {
      return {
        Program(node) {
          context.report({
            node,
            messageId: 'missingOptions',
          })
        },
      }
    }

    const { from, to } = options
    const sourceCode = context.getSourceCode()

    // バージョン間の移行パスを生成
    const migrationResult = getMigrationPath(from, to)

    if (!migrationResult) {
      // サポートされていないバージョン
      return {
        Program(node) {
          context.report({
            node,
            messageId: 'unsupportedVersion',
            data: { from, to },
          })
        },
      }
    }

    const { path, skipped } = migrationResult

    // 各ステップのチェッカーを収集してマージ
    const checkersList = path.map((stepKey) => {
      const module = VERSION_MODULES[stepKey]
      return module.createCheckers(context, sourceCode)
    })

    const merged = mergeCheckers(checkersList)

    // スキップされたバージョンがある場合は通知
    if (skipped.length > 0) {
      const existingProgram = merged.Program
      merged.Program = function (node) {
        if (existingProgram) {
          existingProgram.call(this, node)
        }
        skipped.forEach((version) => {
          context.report({
            node,
            messageId: 'skippedVersion',
            data: { version: `v${version}` },
          })
        })
      }
    }

    return merged
  },
}

function getMigrationPath(from, to) {
  const fromNum = parseInt(from.replace('v', ''))
  const toNum = parseInt(to.replace('v', ''))

  if (fromNum >= toNum || isNaN(fromNum) || isNaN(toNum)) {
    return null
  }

  const path = []
  const skipped = []

  for (let i = fromNum; i < toNum; i++) {
    const stepKey = `v${i}-v${i + 1}`
    if (VERSION_MODULES[stepKey]) {
      path.push(stepKey)
    } else {
      // 存在しない場合はスキップ（breaking changes がないバージョン）
      skipped.push(i + 1)
    }
  }

  // 適用可能なステップが1つもない場合はエラー
  if (path.length === 0) {
    return null
  }

  return { path, skipped }
}

function mergeCheckers(checkersList) {
  const merged = {}

  checkersList.forEach((checkers) => {
    Object.keys(checkers).forEach((selector) => {
      if (!merged[selector]) {
        merged[selector] = checkers[selector]
      } else {
        // 既存のハンドラーと新しいハンドラーを両方実行
        const existing = merged[selector]
        const additional = checkers[selector]
        merged[selector] = function (node) {
          existing.call(this, node)
          additional.call(this, node)
        }
      }
    })
  })

  return merged
}
