const SCHEMA = [{
  type: 'object',
  patternProperties: {
    '.+': {
      type: 'array',
      items: { type: 'string' },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
}]

const fetchEdgeDeclaration = (node) => {
  const { declaration } = node

  return declaration ? fetchEdgeDeclaration(declaration) : node
}

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
    const targetPathRegexs = Object.keys(options)
    const targetRequires = targetPathRegexs.filter((regex) => (new RegExp(regex)).test(context.filename))

    if (targetRequires.length === 0) {
      return {}
    }

    return {
      Program: (node) => {
        targetRequires.forEach((requireKey) => {
          const option = options[requireKey]
          let existDefault = false

          const exports = []

          for (let i of node.body) {
            if (i.type == 'ExportDefaultDeclaration') {
              existDefault = true

              continue
            }

            if (i.type === 'ExportNamedDeclaration') {
              const declaration = fetchEdgeDeclaration(i)

              if (declaration.id) {
                exports.push(declaration.id.name)
              }
              if (declaration.specifiers) {
                declaration.specifiers.forEach((s) => {
                  exports.push(s.exported.name)
                })
              }
              if (declaration.declarations) {
                declaration.declarations.forEach((d) => {
                  if (d.id.name) {
                    exports.push(d.id.name)
                  } else {
                    d.id.properties.forEach((p) => {
                      exports.push(p.key.name)
                    })
                  }
                })
              }
            }
          }

          const exportsRegex = new RegExp(`^(default|${exports.join('|')})$`)
          const notExistsExports = (!existDefault && option.includes('default') ? ['default'] : []).concat(option.filter((o) => !exportsRegex.test(o)))

          if (notExistsExports.length) {
            context.report({
              node,
              message: `${notExistsExports.join(', ')} をexportしてください`,
            })
          }
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
