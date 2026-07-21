const path = require('path')
const fs = require('fs')
const { getParentDir } = require('../../libs/util')

// 定数
const REGEX_BARREL_FILE_EXT = /\.(ts|js)x?$/
const TARGET_EXTS = ['ts', 'tsx', 'js', 'jsx']

/**
 * バレルファイル名のパターンにマッチするかチェック
 * @param {string} filePath - ファイルパス
 * @param {Array<string>} barrelFileNames - バレルファイル名のリスト（index, client, server等）
 * @returns {boolean}
 */
const isBarrelFile = (filePath, barrelFileNames) => barrelFileNames.includes(path.basename(filePath, path.extname(filePath)))

/**
 * バレルファイルの純粋性をチェックするビジター
 * バレルファイルは re-export のみを行うべきで、以下は禁止:
 * - import文
 * - 変数定義（const, let, var）
 * - 関数定義（export function含む）
 * - クラス定義（export class含む）
 *
 * @param {object} context - ESLintコンテキスト
 * @param {Array<string>} barrelFileNames - バレルファイル名のリスト
 * @returns {object} ビジターオブジェクト
 */
const createBarrelPurityVisitor = (context, barrelFileNames) => {
  // このファイルがバレルファイルでなければチェックしない
  if (!isBarrelFile(context.filename, barrelFileNames)) {
    return {}
  }

  // エラー報告の共通処理
  const reportPurityError = (node) => {
    context.report({
      node,
      message: `バレルファイルは設置されたディレクトリ外へのexportが責務です。
実装などexport以外の記述は別ファイルに書き出してください。

許可されるパターン:
  export { ... } from '...'
  export type { ... } from '...'
  export { default } from '...'
  export { Foo as default } from '...'

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
    })
  }

  return {
    // 禁止パターン
    'ImportDeclaration, VariableDeclaration, FunctionDeclaration, ClassDeclaration, TSTypeAliasDeclaration, TSInterfaceDeclaration':
      reportPurityError,
  }
}

/**
 * パスからファイル名（拡張子なし）を抽出する
 * @param {string} filePath - ファイルパス
 * @returns {string} ファイル名（拡張子なし）
 */
const extractFileName = (filePath) => filePath.split('/').pop().replace(REGEX_BARREL_FILE_EXT, '')

/**
 * 指定されたbarrelファイル名の候補パスを生成する
 * @param {string} dir - ディレクトリパス
 * @param {Array<string>} fileNames - barrelファイル名の配列
 * @returns {Array<string>} パス候補の配列
 */
const generateBarrelFilePaths = (dir, fileNames) => fileNames.flatMap((name) => TARGET_EXTS.map((ext) => `${dir}/${name}.${ext}`))

/**
 * 同じディレクトリ内の他のバレルファイルを取得
 * @param {string} currentBarrelPath - 現在のバレルファイルの絶対パス
 * @param {Array<string>} barrelFileNames - バレルファイル名のリスト
 * @returns {Array<string>} 他のバレルファイルのパスの配列
 */
const getSiblingBarrelFiles = (currentBarrelPath, barrelFileNames) => {
  const currentFileName = extractFileName(currentBarrelPath)

  return generateBarrelFilePaths(getParentDir(currentBarrelPath), barrelFileNames).filter(
    (barrelPath) =>
      barrelPath !== currentBarrelPath && extractFileName(barrelPath) !== currentFileName && fs.existsSync(barrelPath),
  )
}

// export { A, B } from './file' パターン
const NAMED_EXPORT_PATTERN_REGEX = /export\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)['"]/g
const EXPORT_AS_REGEX = /^(.+?)\s+as\s+(.+)$/

/**
 * バレルファイルからexportされている情報を抽出
 * @param {string} barrelFilePath - バレルファイルのパス
 * @returns {Array<{sourceFile: string, importedName: string, exportedName: string}>} exportされている情報の配列
 */
const extractExportsFromBarrel = (barrelFilePath) => {
  const exports = []
  const barrelDir = getParentDir(barrelFilePath)

  try {
    const content = fs.readFileSync(barrelFilePath, 'utf-8')

    let match
    while ((match = NAMED_EXPORT_PATTERN_REGEX.exec(content)) !== null) {
      const sourceRelative = match[2] // from './file' の './file' 部分
      let sourceFile = path.resolve(barrelDir, sourceRelative) // 絶対パスに変換

      // 拡張子がない場合、実際に存在するファイルを探す
      if (!path.extname(sourceFile)) {
        for (const ext of TARGET_EXTS) {
          const candidate = `${sourceFile}.${ext}`
          if (fs.existsSync(candidate)) {
            sourceFile = candidate
            break
          }
        }
      }

      const exportedItems = match[1].split(',').map((name) => {
        const trimmed = name.trim()
        // "as" を使っている場合: "Button as MyButton" → importedName: Button, exportedName: MyButton
        const asMatch = trimmed.match(EXPORT_AS_REGEX)
        if (asMatch) {
          return {
            importedName: asMatch[1].trim(),
            exportedName: asMatch[2].trim(),
          }
        }
        // "as" がない場合: "Button" → importedName: Button, exportedName: Button
        return {
          importedName: trimmed,
          exportedName: trimmed,
        }
      })

      exportedItems.forEach(({ importedName, exportedName }) => {
        exports.push({
          sourceFile,
          importedName,
          exportedName,
        })
      })
    }

    // export * from './file' パターン（すべてをre-exportするので、重複チェック対象外とする）
    // export * as namespace from './file' は含まない
  } catch (err) {
    // ファイル読み込みエラーは無視（存在チェックは呼び出し側で行う）
  }

  return exports
}

/**
 * 重複するexportを検出する
 * 同じファイルから同じものをre-exportしている場合に重複と判定する
 * @param {string} currentFilePath - 現在のバレルファイルのパス
 * @param {Array<{node: object, exportedName: string, sourceFile: string, importedName: string}>} currentBarrelExports - 現在のバレルファイルのexport一覧
 * @param {Array<string>} barrelFileNames - バレルファイル名のリスト
 * @returns {Array<{node: object, exportedName: string, siblingPath: string, sourceFile: string, importedName: string}>} 重複しているexportの配列
 */
const findDuplicateExports = (currentFilePath, currentBarrelExports, barrelFileNames) => {
  if (currentBarrelExports.length === 0) {
    return []
  }

  const siblingBarrels = getSiblingBarrelFiles(currentFilePath, barrelFileNames)
  if (siblingBarrels.length === 0) {
    return []
  }

  // 各兄弟バレルファイルのexportを取得
  const siblingExportsMap = new Map()
  for (const siblingPath of siblingBarrels) {
    const exports = extractExportsFromBarrel(siblingPath)
    if (exports.length > 0) {
      siblingExportsMap.set(siblingPath, exports)
    }
  }

  // 重複をチェック
  // 同じsourceFileから同じimportedNameをexportしている場合に重複と判定
  const duplicates = []
  for (const { node, exportedName, sourceFile, importedName } of currentBarrelExports) {
    for (const [siblingPath, siblingExports] of siblingExportsMap) {
      const duplicate = siblingExports.find((exp) => exp.sourceFile === sourceFile && exp.importedName === importedName)
      if (duplicate) {
        duplicates.push({
          node,
          exportedName,
          siblingPath,
          sourceFile,
          importedName,
        })
      }
    }
  }

  return duplicates
}

/**
 * 重複exportのエラーメッセージを生成する
 * @param {string} exportedName - export識別子名
 * @param {string} currentFilePath - 現在のファイルパス
 * @param {string} siblingPath - 重複が検出された兄弟ファイルパス
 * @param {string} sourceFile - importしているソースファイル（絶対パス）
 * @param {string} importedName - importしている元の識別子名
 * @returns {string} エラーメッセージ
 */
const createDuplicateExportMessage = (exportedName, currentFilePath, siblingPath, sourceFile, importedName) => {
  const siblingFileName = path.basename(siblingPath)
  const sourceFileName = path.basename(sourceFile)

  // export { A as B } の場合と export { A } の場合でメッセージを変える
  const exportInfo = exportedName !== importedName ? `'${importedName}' (as ${exportedName})` : `'${exportedName}'`

  return `${sourceFileName} の ${exportInfo} は ${siblingFileName} でも export されています。同じファイルから同じものを複数のバレルファイルで re-export することは禁止されています。

現在のファイル: ${path.basename(currentFilePath)}
重複が検出されたファイル: ${siblingFileName}
ソースファイル: ${sourceFileName}
export している識別子: ${importedName}

解決方法:
  - どちらか一方のバレルファイルから ${sourceFileName} の export を削除してください
  - または、${extractFileName(currentFilePath)} と ${extractFileName(siblingPath)} で異なるモジュールを export するように整理してください

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`
}

module.exports = {
  // 定数
  REGEX_BARREL_FILE_EXT,
  TARGET_EXTS,
  // 関数
  isBarrelFile,
  createBarrelPurityVisitor,
  extractFileName,
  generateBarrelFilePaths,
  getSiblingBarrelFiles,
  extractExportsFromBarrel,
  findDuplicateExports,
  createDuplicateExportMessage,
}
