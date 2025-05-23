const path = require('path')
const { replacePaths } = require('../../libs/common')
const { BASE_SCHEMA_PROPERTIES, calculateDomainContext, calculateDomainNode } = require('../../libs/common_domain')

const SCHEMA_FORMAT_PROPERTY = { type: 'string', pattern: '^(none|absolute|relative|auto)$', default: 'none'}
const SCHEMA = [
  {
    type: 'object',
    properties: {
      ...BASE_SCHEMA_PROPERTIES,
      format: {
        all: SCHEMA_FORMAT_PROPERTY,
        outside: SCHEMA_FORMAT_PROPERTY,
        globalModule: SCHEMA_FORMAT_PROPERTY,
        module: SCHEMA_FORMAT_PROPERTY,
        domain: SCHEMA_FORMAT_PROPERTY,
        lower: SCHEMA_FORMAT_PROPERTY,
      },
    },
    additionalProperties: false,
  }
]

const CWD = process.cwd()
const REPLACE_PATH_ENTRIES = Object.entries(replacePaths)
const REPLACE_PATH_KEY_REGEX = new RegExp(`^(${Object.keys(replacePaths).join('|')})`)
const DIR_SEPARATE_REGEX = /\//g
const MULTIPLE_DIR_SEPARATE_REGEX =/(\/)+/g

const dirCount = (dir) => dir.match(DIR_SEPARATE_REGEX).length

const convertType = (calcContext, calcDomainNode) => {
  const { option: { format: { all, outside, globalModule, module, domain, lower } } } = calcContext
  const { isGlobalModuleImport, isModuleImport, isDomainImport, isLowerImport } = calcDomainNode

  if (lower && lower !== 'none' && isLowerImport) {
    return lower
  }
  if (domain && domain !== 'none' && isDomainImport) {
    return domain
  }
  if (globalModule && globalModule !== 'none' && isGlobalModuleImport) {
    return globalModule
  }
  if (module && module !== 'none' && isModuleImport) {
    return module
  }
  if (outside && outside !== 'none' && !isLowerImport) {
    return outside
  }

  return all || 'none'
}

const calculateAbsoluteImportPath = ({ importPath, resolvedImportPath }) => {
  if (importPath[0] !== '.') {
    return importPath
  }

  return REPLACE_PATH_ENTRIES.reduce((prev, [key, values]) => {
    if (resolvedImportPath === prev) {
      return values.reduce((p, v) => {
        if (prev === p) {
          const regexp = new RegExp(`^${path.resolve(`${CWD}/${v}`)}(.+)$`)

          if (regexp.test(prev)) {
            return p.replace(regexp, `${key}/$1`).replace(MULTIPLE_DIR_SEPARATE_REGEX, '/')
          }
        }

        return p
      }, prev)
    }

    return prev
  }, resolvedImportPath)
}
const calculateRelativeImportPath = ({ importPath, filteredDirs, filteredPaths }) => {
  // HINT: 相対パスの場合でも、余計にさかのぼっていたりする場合もあるので修正対象とする
  if (
    importPath[0] !== '.' &&
    !REPLACE_PATH_KEY_REGEX.test(importPath)
  ) {
    return importPath
  }

  return `${filteredDirs.length === 0 ? './' : [...Array(filteredDirs.length)].reduce((prev) => `${prev}../`, '')}${filteredPaths.join('/')}`.replace(/^(.+?)\/$/, '$1')
}

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
    if (!calcContext.isTarget) {
      return {}
    }

    return {
      ImportDeclaration: (node) => {
        const calcDomainNode = calculateDomainNode(calcContext, node)
        const { importPath } = calcDomainNode

        const fixedImportPath = (() => {
          switch (convertType(calcContext, calcDomainNode)) {
            case 'absolute':
              return calculateAbsoluteImportPath(calcDomainNode)
            case 'relative':
              return calculateRelativeImportPath(calcDomainNode)
            case 'auto':
              const absoluted = calculateAbsoluteImportPath(calcDomainNode)
              const relatived = calculateRelativeImportPath(calcDomainNode)

              // HINT: 記述するdirの数でより近い方を選択する。
              // 相対・絶対記法が同一の場合、おそらくimport元から距離はあるため、たどりやすくするために絶対記法を選択する
              return (dirCount(absoluted) <= dirCount(relatived)) ? absoluted : relatived
          }

          return importPath
        })()

        if (importPath !== fixedImportPath) {
          context.report({
            node,
            message: `${fixedImportPath} に修正してください`,
            fix: (fixer) => fixer.replaceText(
              node,
              context.sourceCode.getText(node).replace(new RegExp(`from '${importPath}'$`), `from '${fixedImportPath}'`)
            ),
          })
        }
      },
    };
  },
}
module.exports.schema = SCHEMA
