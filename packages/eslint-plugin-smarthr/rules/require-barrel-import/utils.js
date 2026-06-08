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
    'ImportDeclaration, VariableDeclaration, FunctionDeclaration, ClassDeclaration, TSTypeAliasDeclaration, TSInterfaceDeclaration': reportPurityError,
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
const generateBarrelFilePaths = (dir, fileNames) => fileNames.flatMap(name => TARGET_EXTS.map(ext => `${dir}/${name}.${ext}`))

/**
 * 同じディレクトリ内の他のバレルファイルを取得
 * @param {string} currentBarrelPath - 現在のバレルファイルの絶対パス
 * @param {Array<string>} barrelFileNames - バレルファイル名のリスト
 * @returns {Array<string>} 他のバレルファイルのパスの配列
 */
const getSiblingBarrelFiles = (currentBarrelPath, barrelFileNames) => {
  const currentFileName = extractFileName(currentBarrelPath)

  return generateBarrelFilePaths(getParentDir(currentBarrelPath), barrelFileNames)
    .filter(
      barrelPath =>
        barrelPath !== currentBarrelPath &&
        extractFileName(barrelPath) !== currentFileName &&
        fs.existsSync(barrelPath)
    )
}

// export { A, B } from './file' パターン
const NAMED_EXPORT_PATTERN_REGEX = /export\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)['"]/g
const EXPORT_AS_REGEX = /^(.+?)\s+as\s+(.+)$/

/**
 * バレルファイルからexportされている識別子を抽出
 * @param {string} barrelFilePath - バレルファイルのパス
 * @returns {Set<string>} exportされている識別子のSet
 */
const extractExportsFromBarrel = (barrelFilePath) => {
  const exports = new Set()

  try {
    const content = fs.readFileSync(barrelFilePath, 'utf-8')

    let match
    while ((match = NAMED_EXPORT_PATTERN_REGEX.exec(content)) !== null) {
      const exportedNames = match[1].split(',').map(name => {
        // "as" を使っている場合は、asの後の名前を取得
        const asMatch = name.trim().match(EXPORT_AS_REGEX)
        return asMatch ? asMatch[2].trim() : name.trim()
      })
      exportedNames.forEach(name => exports.add(name))
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
 * @param {string} currentFilePath - 現在のバレルファイルのパス
 * @param {Array<{node: object, exportedName: string}>} currentBarrelExports - 現在のバレルファイルのexport一覧
 * @param {Array<string>} barrelFileNames - バレルファイル名のリスト
 * @returns {Array<{node: object, exportedName: string, siblingPath: string}>} 重複しているexportの配列
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
    if (exports.size > 0) {
      siblingExportsMap.set(siblingPath, exports)
    }
  }

  // 重複をチェック
  const duplicates = []
  for (const { node, exportedName } of currentBarrelExports) {
    for (const [siblingPath, siblingExports] of siblingExportsMap) {
      if (siblingExports.has(exportedName)) {
        duplicates.push({ node, exportedName, siblingPath })
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
 * @returns {string} エラーメッセージ
 */
const createDuplicateExportMessage = (exportedName, currentFilePath, siblingPath) => {
  const siblingFileName = path.basename(siblingPath)

  return `'${exportedName}' は ${siblingFileName} でも export されています。同じディレクトリの複数のバレルファイルから同じ識別子を export することは禁止されています。

現在のファイル: ${path.basename(currentFilePath)}
重複が検出されたファイル: ${siblingFileName}

解決方法:
  - どちらか一方のバレルファイルから '${exportedName}' の export を削除してください
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
