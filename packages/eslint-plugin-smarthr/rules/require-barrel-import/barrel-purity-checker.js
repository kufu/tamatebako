const path = require('path')

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

module.exports = {
  isBarrelFile,
  createBarrelPurityVisitor,
}
