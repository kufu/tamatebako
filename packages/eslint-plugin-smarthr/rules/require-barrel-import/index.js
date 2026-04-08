const path = require('path')
const fs = require('fs')
const { replacePaths, rootPath } = require('../../libs/common')
const { getParentDir } = require('../../libs/util')

const SCHEMA = [
  {
    type: 'object',
    properties: {
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
    },
    additionalProperties: false,
  }
]

const CWD = process.cwd()
const REGEX_UNNECESSARY_SLASH = /(\/)+/g
const REGEX_ROOT_PATH = new RegExp(`^${rootPath}/index\.`)
const REGEX_INDEX_FILE = /\/index\.(ts|js)x?$/
const TARGET_EXTS = ['ts', 'tsx', 'js', 'jsx']

// Path aliasの正規表現を事前生成してキャッシュ
const entriedReplacePathsWithRegex = Object.entries(replacePaths).map(([key, values]) => [
  key,
  values,
  new RegExp(`^${key}(.+)$`),
  values.map(v => new RegExp(`^${path.resolve(`${CWD}/${v}`)}(.+)$`))
])

/**
 * Path aliasを絶対パスに変換する
 * @param {string} importPath - import文のパス（例: '@/components/Button'）
 * @returns {string} 絶対パス（例: '/path/to/src/components/Button'）
 */
const resolvePathAlias = (importPath) => {
  if (importPath[0] === '/') {
    return importPath
  }

  return entriedReplacePathsWithRegex.reduce((result, [key, values, keyRegex]) => {
    if (result === importPath) {
      return values.reduce((resolved, value) => {
        if (resolved === result && keyRegex.test(result)) {
          return resolved.replace(keyRegex, `${path.resolve(`${CWD}/${value}`)}/$1`)
        }
        return resolved
      }, result)
    }
    return result
  }, importPath)
}

/**
 * 絶対パスをPath aliasに変換する
 * @param {string} absolutePath - 絶対パス（例: '/path/to/src/components/Button'）
 * @returns {string} Path alias（例: '@/components/Button'）
 */
const convertToPathAlias = (absolutePath) => {
  return entriedReplacePathsWithRegex.reduce((result, [key, values, keyRegex, valueRegexes]) => {
    if (result === absolutePath) {
      return values.reduce((converted, value, index) => {
        if (converted === result) {
          const regexp = valueRegexes[index]
          if (regexp.test(converted)) {
            return converted.replace(regexp, `${key}/$1`).replace(REGEX_UNNECESSARY_SLASH, '/')
          }
        }
        return converted
      }, result)
    }
    return result
  }, absolutePath)
}

/**
 * import先がimport元の内部にあるかチェック（同階層・サブディレクトリからのimport）
 * （Next.js App Routerの特殊文字パスにも対応）
 * @param {string} importerDir - import元のディレクトリ
 * @param {string} importedPath - import先のパス
 * @returns {boolean}
 */
const isImportedInsideImporter = (importerDir, importedPath) => {
  return importedPath === importerDir || importedPath.startsWith(importerDir + '/')
}

/**
 * allowedImportsオプションに基づいて、特定のimportが許可されているかチェックする
 * @param {object} node - ImportDeclaration node
 * @param {string} importerDir - import元のディレクトリ
 * @param {Array} targetAllowedImports - 適用されるallowedImportsのキー配列
 * @param {object} allowedImportsConfig - allowedImportsの設定
 * @returns {{ shouldSkip: boolean, deniedModules: Array }} チェック結果
 */
const checkAllowedImports = (node, importerDir, targetAllowedImports, allowedImportsConfig) => {
  let isDenyPath = false
  let deniedModules = []

  for (const allowedKey of targetAllowedImports) {
    const allowedOption = allowedImportsConfig[allowedKey]

    for (const targetModule in allowedOption) {
      const actualTarget = targetModule[0] !== '.'
        ? targetModule
        : path.resolve(`${CWD}/${targetModule}`)

      let importSource = node.source.value

      // 絶対パスの場合は、import元ディレクトリを基準に解決
      if (actualTarget[0] === '/') {
        importSource = path.resolve(`${importerDir}/${importSource}`)
      }

      if (actualTarget !== importSource) {
        continue
      }

      const allowedModules = allowedOption[targetModule] || true

      if (!Array.isArray(allowedModules)) {
        isDenyPath = true
        deniedModules.push(true)
      } else {
        const importedNames = node.specifiers.map(s => s.imported?.name)
        const notAllowedModules = importedNames.filter(name => !allowedModules.includes(name))
        deniedModules.push(notAllowedModules)
      }
    }
  }

  // 完全に許可されている場合はスキップ
  const shouldSkip =
    (isDenyPath && deniedModules[0] === true) ||
    (!isDenyPath && deniedModules.length === 1 && deniedModules[0].length === 0)

  return { shouldSkip, deniedModules }
}

/**
 * import先のパスから親方向に barrel ファイルを探索する
 * @param {string} importedPath - import先の絶対パス
 * @param {string} importerDir - import元のディレクトリ
 * @returns {string|undefined} 見つかったbarrelファイルのパス
 */
const findBarrelFile = (importedPath, importerDir) => {
  const pathSegments = importedPath.split('/')
  let currentPath = importedPath
  let barrel = undefined

  // ディレクトリ指定の場合、そのindex.tsを指していることは自明なので一階層上から探索
  if (fs.existsSync(currentPath) && fs.statSync(currentPath).isDirectory()) {
    pathSegments.pop()
    currentPath = pathSegments.join('/')
  }

  while (pathSegments.length > 0) {
    // 以下の場合は探索終了
    // 1. root pathに到達した場合
    // 2. import先がimport元の内部にある場合（同階層・サブディレクトリからのimport）
    if (importerDir === rootPath || isImportedInsideImporter(importerDir, currentPath)) {
      break
    }

    // 現在のパスにbarrelファイルがあるかチェック
    const foundBarrel = TARGET_EXTS
      .map(ext => `${currentPath}/index.${ext}`)
      .find(filePath => fs.existsSync(filePath))

    if (foundBarrel) {
      barrel = foundBarrel
    }

    // 一階層上に移動
    pathSegments.pop()
    currentPath = pathSegments.join('/')
  }

  return barrel
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
    const option = context.options[0] || {}

    // ignoresオプションでスキップ対象のファイルかチェック
    if (option.ignores) {
      const isIgnored = option.ignores.some(pattern =>
        new RegExp(pattern).test(context.filename)
      )
      if (isIgnored) {
        return {}
      }
    }

    const importerDir = getParentDir(context.filename)

    // このファイルに適用されるallowedImportsのキーを収集
    const targetAllowedImports = []
    if (option?.allowedImports) {
      for (const pattern in option.allowedImports) {
        if (new RegExp(pattern).test(context.filename)) {
          targetAllowedImports.push(pattern)
        }
      }
    }

    return {
      ImportDeclaration: (node) => {
        // allowedImportsチェック
        const { shouldSkip, deniedModules } = checkAllowedImports(
          node,
          importerDir,
          targetAllowedImports,
          option.allowedImports || {}
        )
        if (shouldSkip) {
          return
        }

        // import先のパスを絶対パスに変換
        let importedPath = node.source.value

        // 相対パスの場合、絶対パスに変換
        if (importedPath[0] === '.') {
          importedPath = path.resolve(`${importerDir}/${importedPath}`)
        }

        // Path alias（@/, ~/など）を絶対パスに変換
        importedPath = resolvePathAlias(importedPath)

        // 絶対パスでない場合（node_modulesなど）はスキップ
        if (importedPath[0] !== '/') {
          return
        }

        // barrel ファイルを探索
        const barrelPath = findBarrelFile(importedPath, importerDir)

        // barrel が見つからない、またはroot pathのindex.tsの場合はスキップ
        if (!barrelPath || REGEX_ROOT_PATH.test(barrelPath)) {
          return
        }

        // barrel パスをPath aliasに変換
        const barrelWithAlias = convertToPathAlias(barrelPath)
        const barrelDirWithAlias = barrelWithAlias.replace(REGEX_INDEX_FILE, '')
        const uniqueDeniedModules = [...new Set(deniedModules.flat())]

        // エラーを報告
        context.report({
          node,
          message: uniqueDeniedModules.length
            ? `${uniqueDeniedModules.join(', ')} は ${barrelDirWithAlias} からimportしてください`
            : `${barrelDirWithAlias} からimportするか、${barrelWithAlias} のbarrelファイルを削除して直接import可能にしてください`
              + '\n - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import',
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
