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
              },
            },
            reportMessage: {
              type: 'string',
            },
          },
          additionalProperties: false
        }
      }
    },
  },
  additionalProperties: true,
}]

const CWD = process.cwd()

const defaultReportMessage = (moduleName, exportName) => `${moduleName}${typeof exportName == 'string' ? `/${exportName}`: ''} は利用しないでください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/prohibit-import`

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
    const parentDir = getParentDir(context.filename)
    const targetPathRegexs = Object.keys(options)
    const targetProhibits = targetPathRegexs.filter((regex) => (new RegExp(regex)).test(context.filename))

    if (targetProhibits.length === 0) {
      return {}
    }

    return {
      ImportDeclaration: (node) => {
        for (const prohibitKey of targetProhibits) {
          const option = options[prohibitKey]

          for (const targetModule in option) {
            const actualTarget = targetModule[0] !== '.' ? targetModule : path.resolve(`${CWD}/${targetModule}`)
            let sourceValue = node.source.value

            if (actualTarget[0] === '/') {
              sourceValue = path.resolve(`${parentDir}/${sourceValue}`)
            }

            if (actualTarget === sourceValue) {
              const moduleOption = option[targetModule]
              const { imported, reportMessage } = Object.assign({imported: true}, moduleOption)
              let useImported = false

              if (!Array.isArray(imported)) {
                useImported = !!imported
              } else {
                const specifier = node.specifiers.find((s) => s.imported && imported.includes(s.imported.name))

                if (specifier) {
                  useImported = specifier.imported.name
                }
              }

              if (useImported) {
                context.report({
                  node,
                  message: reportMessage ? `${reportMessage.replace(/\{\{module\}\}/g, node.source.value).replace(/\{\{export\}\}/g, useImported)}
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/prohibit-import` : defaultReportMessage(node.source.value, useImported)
                });
              }
            }
          }
        }
      },
    }
  },
}

module.exports.schema = SCHEMA
