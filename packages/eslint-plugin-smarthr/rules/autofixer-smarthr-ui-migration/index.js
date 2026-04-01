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

    // バージョンモジュールを取得
    const versionKey = `${from}-${to}`
    const versionModule = VERSION_MODULES[versionKey]

    if (versionModule) {
      return versionModule.createCheckers(context, sourceCode)
    }

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
  },
}
