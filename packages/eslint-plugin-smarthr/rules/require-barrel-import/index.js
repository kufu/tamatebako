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
      additionalBarrelFileNames: { type: 'array', items: { type: 'string' }, default: [] },
    },
    additionalProperties: false,
  }
]

const CWD = process.cwd()
const REGEX_UNNECESSARY_SLASH = /(\/)+/g
const REGEX_ROOT_PATH = new RegExp(`^${rootPath}/index\.`)
const REGEX_INDEX_FILE = /\/index\.(ts|js)x?$/
const TARGET_EXTS = ['ts', 'tsx', 'js', 'jsx']

// Path aliasの情報を事前計算してキャッシュ
const REPLACE_PATHS_INFO = Object.entries(replacePaths).map(([key, values]) => {
  const resolvedPaths = values.map(v => path.resolve(`${CWD}/${v.replace(/\/\*$/, '')}`))
  return {
    key,
    values,
    keyRegex: new RegExp(`^${key}(.+)$`),
    resolvedPaths,
    valueRegexes: resolvedPaths.map(p => new RegExp(`^${p}(.+)$`))
  }
})

// @/ と ~/ のパスのみをrootとする（READMEの仕様通り）
const ALL_ROOT_PATHS = (() => {
  const rootKeys = ['@/', '~/']
  return REPLACE_PATHS_INFO
    .filter(info => rootKeys.includes(info.key))
    .flatMap(info => info.resolvedPaths)
})()

/**
 * Path aliasを絶対パスに変換する
 * @param {string} importPath - import文のパス（例: '@/components/Button'）
 * @returns {string} 絶対パス（例: '/path/to/src/components/Button'）
 */
const resolvePathAlias = (importPath) => {
  if (importPath[0] === '/') {
    return importPath
  }

  for (const { keyRegex, resolvedPaths } of REPLACE_PATHS_INFO) {
    if (keyRegex.test(importPath)) {
      return importPath.replace(keyRegex, `${resolvedPaths[0]}/$1`)
    }
  }

  return importPath
}

/**
 * 絶対パスをPath aliasに変換する
 * @param {string} absolutePath - 絶対パス（例: '/path/to/src/components/Button'）
 * @returns {string} Path alias（例: '@/components/Button'）
 */
const convertToPathAlias = (absolutePath) => {
  for (const { key, valueRegexes } of REPLACE_PATHS_INFO) {
    for (const regexp of valueRegexes) {
      if (regexp.test(absolutePath)) {
        return absolutePath.replace(regexp, `${key}/$1`).replace(REGEX_UNNECESSARY_SLASH, '/')
      }
    }
  }

  return absolutePath
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
 * 2つのパスの共通の親ディレクトリを見つける
 * @param {string} path1 - パス1
 * @param {string} path2 - パス2
 * @returns {string} 共通の親ディレクトリの絶対パス
 */
const findCommonParent = (path1, path2) => {
  const segments1 = path1.split('/')
  const segments2 = path2.split('/')

  let i = 0
  while (i < segments1.length && i < segments2.length && segments1[i] === segments2[i]) {
    i++
  }

  return segments1.slice(0, i).join('/')
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
 * @param {Array<string>} additionalBarrelFileNames - 追加でbarrelファイルとして扱うファイル名（拡張子なし、例: ['client', 'server']）
 * @returns {string|undefined} 見つかったbarrelファイルのパス
 */
const findBarrelFile = (importedPath, importerDir, additionalBarrelFileNames = []) => {
  const pathSegments = importedPath.split('/')
  let currentPath = importedPath
  let barrel = undefined

  // 優先順位: 追加指定されたファイル名 > index
  const barrelFileNames = [...additionalBarrelFileNames, 'index']

  // import元とimport先の共通の親ディレクトリを見つける
  // 共通の親のbarrelファイルは除外する（同じディレクトリツリー内の相対importには適用されない）
  const commonParent = findCommonParent(importerDir, importedPath)

  // ディレクトリ指定の場合、またはファイルが存在しない場合は親ディレクトリから探索
  if (!fs.existsSync(currentPath) || fs.statSync(currentPath).isDirectory()) {
    pathSegments.pop()
    currentPath = pathSegments.join('/')
  }

  while (pathSegments.length > 0) {
    // 以下の場合は探索終了
    // 1. 共通の親ディレクトリに到達した場合（commonParent自体のbarrelは除外）
    // 2. いずれかのreplacePathsのルートに到達した場合
    if (currentPath === commonParent || ALL_ROOT_PATHS.includes(currentPath)) {
      break
    }

    // 現在のパスにbarrelファイルがあるかチェック
    // 優先順位に従って探索（additionalBarrelFileNames → index）
    const foundBarrel = barrelFileNames
      .flatMap(name => TARGET_EXTS.map(ext => `${currentPath}/${name}.${ext}`))
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
        const additionalBarrelFileNames = option.additionalBarrelFileNames || []
        const barrelPath = findBarrelFile(importedPath, importerDir, additionalBarrelFileNames)

        // barrel が見つからない、またはroot pathのindex.tsの場合はスキップ
        if (!barrelPath || REGEX_ROOT_PATH.test(barrelPath)) {
          return
        }

        // barrelファイル自体からimportしている場合はスキップ
        const importedPathWithExts = TARGET_EXTS.map(ext => `${importedPath}.${ext}`)
        if (importedPathWithExts.includes(barrelPath)) {
          return
        }

        // barrel パスをPath aliasに変換
        const barrelWithAlias = convertToPathAlias(barrelPath)
        const barrelDirWithAlias = barrelWithAlias.replace(REGEX_INDEX_FILE, '')
        const uniqueDeniedModules = [...new Set(deniedModules.flat())]

        // importしているモジュール名を取得
        const importedModules = node.specifiers
          .map(s => s.imported?.name || s.local?.name)
          .filter(Boolean)
          .join(', ')

        // 推奨されるimportパスを生成（元の記法に合わせる）
        let suggestedImportPath = barrelDirWithAlias
        if (node.source.value[0] === '.') {
          // 相対パスの場合、barrelDirへの相対パスを計算
          const barrelDirAbsolute = resolvePathAlias(barrelDirWithAlias)
          const relativePath = path.relative(importerDir, barrelDirAbsolute)
          suggestedImportPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`
        }

        // エラーを報告
        context.report({
          node,
          message: uniqueDeniedModules.length
            ? `${uniqueDeniedModules.join(', ')} は ${barrelDirWithAlias} からimportしてください`
            : `バレルファイルを経由してimportしてください

検出されたバレル: ${barrelWithAlias}
現在のimport:      import { ${importedModules} } from '${node.source.value}'
推奨されるimport:  import { ${importedModules} } from '${suggestedImportPath}'

注意: バレルファイルに ${importedModules} のexportが必要です。
      存在しない場合は ${path.basename(barrelPath)} に追加してください。

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
