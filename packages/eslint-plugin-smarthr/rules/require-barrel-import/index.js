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
const REGEX_BARREL_FILE_EXT = /\.(ts|js)x?$/
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
 * 指定されたbarrelファイル名の候補パスを生成する
 * @param {string} dir - ディレクトリパス
 * @param {Array<string>} fileNames - barrelファイル名の配列
 * @returns {Array<string>} パス候補の配列
 */
const generateBarrelFilePaths = (dir, fileNames) => {
  return fileNames.flatMap(name => TARGET_EXTS.map(ext => `${dir}/${name}.${ext}`))
}

/**
 * パスからファイル名（拡張子なし）を抽出する
 * @param {string} filePath - ファイルパス
 * @returns {string} ファイル名（拡張子なし）
 */
const extractFileName = (filePath) => {
  return filePath.split('/').pop().replace(REGEX_BARREL_FILE_EXT, '')
}

/**
 * import先が直接バレルファイルを指しているか検出する
 * @param {string} importedPath - import先の絶対パス
 * @param {Array<string>} barrelFileNames - バレルファイル名のリスト（index, client, server等）
 * @returns {string|undefined} バレルファイルのパス、またはundefined
 */
const detectDirectBarrelImport = (importedPath, barrelFileNames) => {
  // ディレクトリ指定の場合（'.'、'..'、'@/components/Button'など）
  if (fs.existsSync(importedPath) && fs.statSync(importedPath).isDirectory()) {
    const indexFile = TARGET_EXTS
      .map(ext => `${importedPath}/index.${ext}`)
      .find(f => fs.existsSync(f))
    return indexFile
  }

  // ファイル指定の場合（'./index'、'./client'、'@/components/Button/client'など）
  const fileWithExt = TARGET_EXTS
    .map(ext => `${importedPath}.${ext}`)
    .find(f => fs.existsSync(f))

  if (!fileWithExt) {
    return undefined
  }

  // バレルファイル名のパターンにマッチするかチェック
  const barrelPattern = `\\/(${barrelFileNames.join('|')})\\.(ts|tsx|js|jsx)$`
  if (new RegExp(barrelPattern).test(fileWithExt)) {
    return fileWithExt
  }

  return undefined
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
 * @returns {{ barrelPath: string|undefined, missingBarrel: { fileName: string, parentDir: string }|null }} 見つかったbarrelファイルのパスと、作成すべきbarrelファイル情報
 */
const findBarrelFile = (importedPath, importerDir, additionalBarrelFileNames = []) => {
  const pathSegments = importedPath.split('/')
  let currentPath = importedPath
  let barrel
  let missingBarrel = null

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

  // 見つかったbarrelのファイル名を記録
  // additionalBarrelFileNames（client, server等）が見つかった場合のみ、親方向には同じファイル名のみ探索
  // index.tsが見つかった場合は、親方向にもadditionalBarrelFileNamesを探し続ける
  let foundBarrelFileName = null

  while (pathSegments.length > 0) {
    // 以下の場合は探索終了
    // 1. 共通の親ディレクトリに到達した場合（commonParent自体のbarrelは除外）
    // 2. いずれかのreplacePathsのルートに到達した場合
    if (currentPath === commonParent || ALL_ROOT_PATHS.includes(currentPath)) {
      break
    }

    // 探索するファイル名を決定
    // - まだ見つかっていない、またはindexが見つかった → 全てのbarrelFileNamesを探す
    // - additionalBarrelFileNames（client, server）が見つかった → 同じファイル名のみ探す
    const searchFileNames = (foundBarrelFileName && additionalBarrelFileNames.includes(foundBarrelFileName))
      ? [foundBarrelFileName]
      : barrelFileNames

    // 現在のパスにbarrelファイルがあるかチェック
    const foundBarrel = generateBarrelFilePaths(currentPath, searchFileNames)
      .find(filePath => fs.existsSync(filePath))

    if (foundBarrel) {
      const fileName = extractFileName(foundBarrel)

      if (!foundBarrelFileName) {
        // 最初に見つかったbarrel
        barrel = foundBarrel
        foundBarrelFileName = fileName
      } else if (fileName === foundBarrelFileName) {
        // 同じファイル名の場合は、より親を優先（上書き）
        barrel = foundBarrel
      } else if (foundBarrelFileName && additionalBarrelFileNames.includes(foundBarrelFileName) && fileName === 'index') {
        // client.tsを探していたが、親でindex.tsしか見つからなかった場合
        // client.tsを作成してexportをまとめるよう促す
        missingBarrel = {
          fileName: foundBarrelFileName,
          parentDir: currentPath,
        }
      }
      // 異なるファイル名の場合は上書きしない（最も近いbarrelを維持）
    } else if (foundBarrelFileName && additionalBarrelFileNames.includes(foundBarrelFileName)) {
      // client.tsを探していたが見つからなかった場合、index.tsがあるかチェック
      const indexBarrel = generateBarrelFilePaths(currentPath, ['index'])
        .find(filePath => fs.existsSync(filePath))

      if (indexBarrel && !missingBarrel) {
        // index.tsは見つかったが、client.tsがない
        missingBarrel = {
          fileName: foundBarrelFileName,
          parentDir: currentPath,
        }
      }
    }

    // 一階層上に移動
    pathSegments.pop()
    currentPath = pathSegments.join('/')
  }

  return { barrelPath: barrel, missingBarrel }
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
      const ignorePatterns = option.ignores.map(pattern => new RegExp(pattern))
      const isIgnored = ignorePatterns.some(regex => regex.test(context.filename))
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

        // バレルファイル名のリストを作成（index + 追加指定されたファイル名）
        const additionalBarrelFileNames = option.additionalBarrelFileNames || []
        const barrelFileNames = [...additionalBarrelFileNames, 'index']

        // ========================================
        // 同階層・子階層からのバレルimportチェック
        // ========================================
        // import文が直接バレルファイル（index.ts、client.ts等）を指している場合、
        // import元の位置関係をチェックする
        const directBarrelPath = detectDirectBarrelImport(importedPath, barrelFileNames)

        if (directBarrelPath) {
          const barrelDir = path.dirname(directBarrelPath)

          // import元がバレルと同階層、またはバレルディレクトリ以下にある場合はNG
          const isSameLevelOrChild = importerDir === barrelDir || importerDir.startsWith(barrelDir + '/')

          if (isSameLevelOrChild) {
            const barrelWithAlias = convertToPathAlias(directBarrelPath)

            context.report({
              node,
              message: `バレルファイルからのimportは、そのディレクトリ外部からのみ許可されています。

検出されたバレル: ${barrelWithAlias}
現在のimport:     import from '${node.source.value}'

バレルファイルはディレクトリ外部へのエクスポートにのみ使用してください。
同じディレクトリまたは子ディレクトリ内では、直接相対パスでimportしてください。

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
            })
            return
          }
        }

        // ========================================
        // バレルファイルを探索
        // ========================================
        // import先のパスから親方向にバレルファイルを探索
        const { barrelPath, missingBarrel } = findBarrelFile(importedPath, importerDir, additionalBarrelFileNames)

        // barrel が見つからない、またはroot pathのindex.tsの場合はスキップ
        if (!barrelPath || REGEX_ROOT_PATH.test(barrelPath)) {
          return
        }

        // 親階層でclient.ts/server.tsが見つからず、index.tsのみ見つかった場合
        // barrelファイル自体からのimportでも一貫性チェックは実行
        if (missingBarrel) {
          const missingBarrelWithAlias = convertToPathAlias(`${missingBarrel.parentDir}/${missingBarrel.fileName}`)
          const existingBarrelWithAlias = convertToPathAlias(barrelPath).replace(REGEX_BARREL_FILE_EXT, '')

          context.report({
            node,
            message: `${missingBarrelWithAlias}.ts を作成して、${existingBarrelWithAlias} のexportをまとめてください

親ディレクトリに ${missingBarrel.fileName}.ts が存在しないため、一貫性のあるbarrel構造を保つために作成が必要です。

作成例:
// ${missingBarrelWithAlias}.ts
export * from '${existingBarrelWithAlias}'

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
          })
          return
        }

        // barrelファイル自体、または同じディレクトリの他のbarrelファイルからimportしている場合はスキップ
        // 同じディレクトリに index.ts と client.ts がある場合、どちらからのimportも許容する
        const barrelDir = barrelPath.substring(0, barrelPath.lastIndexOf('/'))
        const allBarrelsInSameDir = generateBarrelFilePaths(barrelDir, barrelFileNames)
          .filter(filePath => fs.existsSync(filePath))

        const importedPathWithExts = TARGET_EXTS.map(ext => `${importedPath}.${ext}`)
        const isImportingFromBarrel = importedPathWithExts.some(p => allBarrelsInSameDir.includes(p))
        if (isImportingFromBarrel) {
          return
        }

        // barrel パスをPath aliasに変換
        const barrelWithAlias = convertToPathAlias(barrelPath)
        // barrelファイルの拡張子を除去（index.ts → ディレクトリパス、client.ts → client）
        const barrelDirWithAlias = REGEX_INDEX_FILE.test(barrelWithAlias)
          ? barrelWithAlias.replace(REGEX_INDEX_FILE, '')
          : barrelWithAlias.replace(REGEX_BARREL_FILE_EXT, '')
        const uniqueDeniedModules = [...new Set(deniedModules.flat())]

        // ========================================
        // エラーメッセージ生成の準備
        // ========================================
        // importしているモジュール名を取得
        const importedModules = node.specifiers.reduce((acc, s) => {
          const name = s.imported?.name || s.local?.name
          return name ? (acc ? `${acc}, ${name}` : name) : acc
        }, '')

        // additionalBarrelFileNamesが設定されている場合は、
        // 存在しないファイルも含めて全ての選択肢を表示する
        const hasAdditionalBarrels = option?.additionalBarrelFileNames?.length > 0

        // エラーメッセージに表示するbarrelファイルのリストを作成
        const barrelFilesToShow = hasAdditionalBarrels
          ? barrelFileNames.map(name => {
              // 各barrelファイル名について、存在する拡張子を優先、なければ.tsを使用
              const candidates = TARGET_EXTS.map(ext => `${barrelDir}/${name}.${ext}`)
              return candidates.find(filePath => fs.existsSync(filePath)) || `${barrelDir}/${name}.ts`
            })
          : allBarrelsInSameDir

        // barrelファイルをエラーメッセージ用に変換
        // （path alias変換、import path生成、存在チェック）
        const barrelSuggestions = barrelFilesToShow.map(filePath => {
          const pathWithAlias = convertToPathAlias(filePath)
          const dirWithAlias = REGEX_INDEX_FILE.test(pathWithAlias)
            ? pathWithAlias.replace(REGEX_INDEX_FILE, '')
            : pathWithAlias.replace(REGEX_BARREL_FILE_EXT, '')

          // 元のimport記法（相対パス or path alias）に合わせたimportパスを生成
          let importPath = dirWithAlias
          if (node.source.value[0] === '.') {
            const dirAbsolute = resolvePathAlias(dirWithAlias)
            const relativePath = path.relative(importerDir, dirAbsolute)
            importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`
          }

          return {
            barrelFile: pathWithAlias,
            importPath,
            fileName: path.basename(filePath),
            exists: fs.existsSync(filePath)
          }
        })

        // 推奨されるimportパスを生成（元の記法に合わせる）
        let suggestedImportPath = barrelDirWithAlias
        if (node.source.value[0] === '.') {
          // 相対パスの場合、barrelDirへの相対パスを計算
          const barrelDirAbsolute = resolvePathAlias(barrelDirWithAlias)
          const relativePath = path.relative(importerDir, barrelDirAbsolute)
          suggestedImportPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`
        }

        // ========================================
        // エラーメッセージを生成
        // ========================================
        // barrelファイルが複数ある、またはadditionalBarrelFileNamesが設定されている場合は
        // 複数選択肢形式で表示（存在しないファイルも含む）
        const shouldShowAllSuggestions = barrelSuggestions.length > 1 || hasAdditionalBarrels

        let suggestionsMessage = ''
        if (shouldShowAllSuggestions) {
          // index.ts を優先的に表示するためにソート
          const sortedSuggestions = [...barrelSuggestions].sort((a, b) => {
            const isAIndex = a.fileName.startsWith('index.')
            const isBIndex = b.fileName.startsWith('index.')
            if (isAIndex && !isBIndex) return -1
            if (!isAIndex && isBIndex) return 1
            return 0
          })

          suggestionsMessage = '\n推奨されるimport（以下のいずれか）:\n' +
            sortedSuggestions.map(({ importPath, fileName, exists }) =>
              `  - import { ${importedModules} } from '${importPath}' // ${fileName}${exists ? '' : ' (作成が必要)'}`
            ).join('\n')

          // 存在しないファイルがある場合は注意メッセージを追加
          const missingBarrels = barrelSuggestions.filter(({ exists }) => !exists)
          if (missingBarrels.length > 0) {
            suggestionsMessage += '\n\n※ 存在しないバレルファイルは必要に応じて作成してください。'
          }
        } else {
          suggestionsMessage = `\n推奨されるimport:  import { ${importedModules} } from '${suggestedImportPath}'`
        }

        // 「検出されたバレル」には実際に存在するファイルのみを表示
        const existingBarrels = barrelSuggestions.filter(({ exists }) => exists)
        const barrelFilesInfo = existingBarrels.length > 1
          ? existingBarrels.map(({ barrelFile }) => barrelFile).join(', ')
          : barrelWithAlias

        // ========================================
        // エラーを報告
        // ========================================
        context.report({
          node,
          message: uniqueDeniedModules.length
            ? `${uniqueDeniedModules.join(', ')} は ${barrelDirWithAlias} からimportしてください`
            : `バレルファイルを経由してimportしてください

検出されたバレル: ${barrelFilesInfo}
現在のimport:      import { ${importedModules} } from '${node.source.value}'${suggestionsMessage}

注意: バレルファイルに ${importedModules} のexportが必要です。
      存在しない場合は対象のファイルに追加してください。

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
