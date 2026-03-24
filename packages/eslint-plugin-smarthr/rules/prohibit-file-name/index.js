const SCHEMA = [{
  type: 'object',
  patternProperties: {
    '.+': {
      type: 'string',
    },
  },
  additionalProperties: true,
}]


/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    schema: SCHEMA,
  },
  create(context) {
    const options = context.options[0]
    const targetPaths = []
    for (const regex in options) {
      const regexObj = new RegExp(regex)
      if (regexObj.test(context.filename)) {
        targetPaths.push([regex, regexObj])
      }
    }


    if (targetPaths.length === 0) {
      return {}
    }

    const messages = []

    for (const [path, pathRegex] of targetPaths) {
      const message = options[path]

      const matcher = context.filename.match(pathRegex)

      if (matcher) {
        let finalMessage = `${message}
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/prohibit-file-name`
        for (let index = 0; index < matcher.length; index++) {
          const regex = new RegExp(`\\$${index}`, 'g')
          finalMessage = finalMessage.replace(regex, matcher[index])
        }
        messages.push(finalMessage)
      }
    }

    if (messages.length === 0) {
      return {}
    }

    return {
      Program: (node) => {
        for (const message of messages) {
          context.report({
            node,
            message,
          })
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
