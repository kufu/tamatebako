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
    const targetPaths = Object.keys(options).reduce((acc, regex) => {
      const regexObj = new RegExp(regex)
      if (regexObj.test(context.filename)) {
        acc.push([regex, regexObj])
      }
      return acc
    }, [])


    if (targetPaths.length === 0) {
      return {}
    }

    const messages = []

    for (const [path, pathRegex] of targetPaths) {
      const message = options[path]

      matcher = context.filename.match(pathRegex)

      if (matcher) {
        messages.push([...matcher].reduce(((prev, k, index) => prev.replace(new RegExp(`\\$${index}`, 'g'), k)), `${message}
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/prohibit-file-name`))
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
