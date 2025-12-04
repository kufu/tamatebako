const path = require('path')
const fs = require('fs')
const { replacePaths, rootPath } = require('../../libs/common')
const { BASE_SCHEMA_PROPERTIES, calculateDomainContext, calculateDomainNode } = require('../../libs/common_domain')

const SCHEMA = [
  {
    type: 'object',
    properties: {
      ...BASE_SCHEMA_PROPERTIES,
      allowedImports: {
        type: 'object',
        patternProperties: {
          '.+': {
            type: 'object',
            patternProperties: {
              '.+': {
                type: ['boolean', 'array' ],
                items: {
                  type: 'string',
                },
                additionalProperties: false
              }
            }
          },
        },
        additionalProperties: true,
      },
      ignores: { type: 'array', items: { type: 'string' }, default: [] },
      analyticsMode: { type: 'string', default: 'none' }, // 'none' | 'all' | 'same-domain' | 'another-domain'
    },
    additionalProperties: false,
  }
]

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    schema: SCHEMA,
  },
  create(context) {
    const calcContext = calculateDomainContext(context)

    // 対象外ファイル
    if (!calcContext.isTarget || calcContext.option.ignores && calcContext.option.ignores.some((i) => (new RegExp(i)).test(calcContext.filename))) {
      return {}
    }

    const {
      option,
      humanizeParentDir,
    } = calcContext

    const targetPathRegexs = option?.allowedImports ? Object.keys(option.allowedImports) : []
    const targetAllowedImports = targetPathRegexs.filter((regex) => (new RegExp(regex)).test(calcContext.filename))

    return {
      ImportDeclaration: (node) => {
        let isDenyPath = false
        let deniedModules = []

        targetAllowedImports.forEach((allowedKey) => {
          const allowedOption = option.allowedImports[allowedKey]
          const targetModules = Object.keys(allowedOption)

          targetModules.forEach((targetModule) => {
            const allowedModules = allowedOption[targetModule] || true
            const actualTarget = targetModule[0] !== '.' ? targetModule : path.resolve(`${process.cwd()}/${targetModule}`)
            let sourceValue = node.source.value

            if (actualTarget[0] === '/') {
              sourceValue = path.resolve(`${calcContext.parentDir}/${sourceValue}`)
            }

            if (actualTarget !== sourceValue) {
              return
            }


            if (!Array.isArray(allowedModules)) {
              isDenyPath = true
              deniedModules.push(true)
            } else {
              deniedModules.push(node.specifiers.map((s) => s.imported?.name).filter(i => allowedModules.indexOf(i) == -1))
            }
          })
        })

        if (isDenyPath) {
          if (deniedModules[0] === true) {
            return
          }
        } else if (deniedModules.length === 1 && deniedModules[0].length === 0) {
          return
        }

        const { importPath, dirs, paths, humanizeImportPath, isGlobalModuleImport, isModuleImport, isDomainImport } = calculateDomainNode(calcContext, node)
        const hit = !isGlobalModuleImport && !isModuleImport && !isDomainImport

        if (
          option.analyticsMode === 'all' ||
          option.analyticsMode === 'same-domain' && !hit ||
          option.analyticsMode === 'another-domain' && hit
        ) {
          console.log('対象ディレクトリ', humanizeParentDir)
          console.log('importファイル', humanizeImportPath)
          console.log('対象ファイルのドメイン', dirs.join('/') || '--')
          console.log('importファイルのドメイン', paths.join('/') || '--')
          console.log('ドメイン判定', hit ? '別ドメイン' : '同一ドメイン')
          console.log('global module import: ', isGlobalModuleImport)
          console.log('module import: ', isModuleImport)
          console.log('domain import: ', isDomainImport)
          console.log('----------------------------------------------------')
        }

        if (hit) {
          deniedModules = [...new Set(deniedModules.flat())]

          context.report({
            node,
            message: `別ドメインから ${importPath}${deniedModules.length ? ` の ${deniedModules.join(', ')}` : ''} がimportされています。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/no-import-other-domain`,
          })
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
