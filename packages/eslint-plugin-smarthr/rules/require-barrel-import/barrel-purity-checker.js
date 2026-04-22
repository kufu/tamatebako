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
 * エラーメッセージ（全ノードタイプ共通）
 */
const PURITY_ERROR_MESSAGE = `バレルファイルは設置されたディレクトリ外へのexportが責務です。
実装などexport以外の記述は別ファイルに書き出してください。

許可: export { ... } from '...'
      export type { ... } from '...'

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`

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

  // export default declaration内の宣言かどうかを追跡
  let insideExportDefault = false

  return {
    // 単純禁止パターン（条件なしで禁止）
    'ImportDeclaration, VariableDeclaration, TSTypeAliasDeclaration, TSInterfaceDeclaration'(node) {
      context.report({
        node,
        message: PURITY_ERROR_MESSAGE,
      })
    },

    // 条件付き禁止パターン: 関数定義
    FunctionDeclaration(node) {
      // export default function() {} の場合、ExportDefaultDeclarationで既にエラーが出るのでスキップ
      if (insideExportDefault) {
        return
      }
      context.report({
        node,
        message: PURITY_ERROR_MESSAGE,
      })
    },

    // 条件付き禁止パターン: クラス定義
    ClassDeclaration(node) {
      // export default class {} の場合、ExportDefaultDeclarationで既にエラーが出るのでスキップ
      if (insideExportDefault) {
        return
      }
      context.report({
        node,
        message: PURITY_ERROR_MESSAGE,
      })
    },

    // export default の禁止
    'ExportDefaultDeclaration'(node) {
      insideExportDefault = true
      context.report({
        node,
        message: PURITY_ERROR_MESSAGE,
      })
    },
    'ExportDefaultDeclaration:exit'() {
      insideExportDefault = false
    },

    // sourceなしのexport（export { foo }）の禁止
    ExportNamedDeclaration(node) {
      // export ... from '...' の形式はOK（sourceがある場合）
      if (node.source) {
        return
      }

      // 宣言付きexport（export const, export function等）はすでに他のルールで検出
      if (node.declaration) {
        return
      }

      // export { foo } の形式は禁止
      context.report({
        node,
        message: PURITY_ERROR_MESSAGE,
      })
    },
  }
}

module.exports = {
  isBarrelFile,
  createBarrelPurityVisitor,
}
