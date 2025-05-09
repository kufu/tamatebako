const path = require('path')
const { getParentDir } = require('../../libs/util')

const SCHEMA = [{
  type: 'object',
  patternProperties: {
    '.+': {
      type: 'object',
      patternProperties: {
        '.+': {
          type: 'object',
          required: [
            'imported',
          ],
          properties: {
            imported: {
              type: ['boolean', 'array'],
              items: {
                type: 'string',
              }
            },
            reportMessage: {
              type: 'string',
            },
          },
          additionalProperties: false,
        }
      },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
}]

const defaultReportMessage = (moduleName, exportName) => `${moduleName}${typeof exportName == 'string' ? `/${exportName}`: ''} をimportしてください`
const filterImportDeclaration = (item) => item.type === 'ImportDeclaration'

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

    const CWD = process.cwd()

    return {
      Program: (node) => {
        const importDeclarations = node.body.filter(filterImportDeclaration)
        const parentDir = getParentDir(context.filename)

        targetRequires.forEach((requireKey) => {
          const option = options[requireKey]

          Object.keys(option).forEach((targetModule) => {
            const { imported, reportMessage, targetRegex } = Object.assign({imported: true}, option[targetModule])

            if (targetRegex && !(new RegExp(targetRegex)).test(context.filename)) {
              return
            }

            const actualTarget = targetModule[0] !== '.' ? targetModule : path.resolve(`${CWD}/${targetModule}`)
            const importDeclaration = importDeclarations.find(
              actualTarget[0] !== '/' ? (
                (id) => id.source.value === actualTarget
              ) : (
                (id) => path.resolve(`${parentDir}/${id.source.value}`) === actualTarget
              )
            )
            const reporter = (item) => {
              context.report({
                node,
                message: reportMessage ? reportMessage.replaceAll('{{module}}', actualTarget).replaceAll('{{export}}', item) : defaultReportMessage(actualTarget, item)
              })
            }

            if (!importDeclaration) {
              if (Array.isArray(imported)) {
                imported.forEach((i) => {
                  reporter(i)
                })
              } else if (imported) {
                reporter()
              }
            } else if (Array.isArray(imported)) {
              imported.forEach((i) => {
                if (!importDeclaration.specifiers.find((s) => s.imported && s.imported.name === i)) {
                  reporter(i)
                }
              })
            }
          })
        })
      },
    }
  },
}

module.exports.schema = SCHEMA
