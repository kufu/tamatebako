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
const isBarrelFile = (filePath, barrelFileNames) => {
  const fileName = path.basename(filePath, path.extname(filePath))
  return barrelFileNames.includes(fileName)
}

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
const extractFileName = (filePath) => {
  return filePath.split('/').pop().replace(REGEX_BARREL_FILE_EXT, '')
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
 * 同じディレクトリ内の他のバレルファイルを取得
 * @param {string} currentBarrelPath - 現在のバレルファイルの絶対パス
 * @param {Array<string>} barrelFileNames - バレルファイル名のリスト
 * @returns {Array<string>} 他のバレルファイルのパスの配列
 */
const getSiblingBarrelFiles = (currentBarrelPath, barrelFileNames) => {
  const dir = getParentDir(currentBarrelPath)
  const currentFileName = extractFileName(currentBarrelPath)

  return generateBarrelFilePaths(dir, barrelFileNames)
    .filter(barrelPath => {
      return barrelPath !== currentBarrelPath &&
             extractFileName(barrelPath) !== currentFileName &&
             fs.existsSync(barrelPath)
    })
}

/**
 * バレルファイルからexportされている識別子を抽出
 * @param {string} barrelFilePath - バレルファイルのパス
 * @returns {Set<string>} exportされている識別子のSet
 */
const extractExportsFromBarrel = (barrelFilePath) => {
  const exports = new Set()

  try {
    const content = fs.readFileSync(barrelFilePath, 'utf-8')

    // export { A, B } from './file' パターン
    const namedExportPattern = /export\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)['"]/g
    let match
    while ((match = namedExportPattern.exec(content)) !== null) {
      const exportedNames = match[1].split(',').map(name => {
        // "as" を使っている場合は、asの後の名前を取得
        const asMatch = name.trim().match(/^(.+?)\s+as\s+(.+)$/)
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
}
