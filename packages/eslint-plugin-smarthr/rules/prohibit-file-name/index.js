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
    const targetPaths = Object.keys(options).filter((regex) => (new RegExp(regex)).test(context.filename))


    if (targetPaths.length === 0) {
      return {}
    }

    const messages = []

    targetPaths.forEach((path) => {
      const message = options[path]

      matcher = context.filename.match(new RegExp(path))

      if (matcher) {
        messages.push([...matcher].reduce(((prev, k, index) => prev.replaceAll(`\$${index}`, k)), `${message}
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/prohibit-file-name`))
      }
    })

    if (messages.length === 0) {
      return {}
    }

    return {
      Program: (node) => {
        messages.forEach((message) => {
          context.report({
            node,
            message,
          })
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
