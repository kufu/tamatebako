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

        for (const requireKey of targetRequires) {
          const option = options[requireKey]

          for (const targetModule in option) {
            const moduleOption = option[targetModule]
            const targetRegex = moduleOption.targetRegex

            if (targetRegex && !(new RegExp(targetRegex)).test(context.filename)) {
              continue
            }

            const { imported, reportMessage } = Object.assign({imported: true}, moduleOption)
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
                message: `${reportMessage ? reportMessage.replace(/\{\{module\}\}/g, actualTarget).replace(/\{\{export\}\}/g, item) : defaultReportMessage(actualTarget, item)}
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-import`
              })
            }

            if (!importDeclaration) {
              if (Array.isArray(imported)) {
                for (const i of imported) {
                  reporter(i)
                }
              } else if (imported) {
                reporter()
              }
            } else if (Array.isArray(imported)) {
              for (const i of imported) {
                if (!importDeclaration.specifiers.find((s) => s.imported && s.imported.name === i)) {
                  reporter(i)
                }
              }
            }
          }
        }
      },
    }
  },
}

module.exports.schema = SCHEMA
