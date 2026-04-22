const path = require('path')

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

  // export default declaration内の宣言かどうかを追跡
  let insideExportDefault = false

  return {
    // import文の禁止
    ImportDeclaration(node) {
      context.report({
        node,
        message: `バレルファイル内で import 文は禁止されています。

バレルファイルは re-export のみを行うべきです。
禁止: import文、変数定義、関数定義、クラス定義
許可: export { ... } from '...'
      export * from '...'

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
      })
    },

    // 変数定義の禁止（const, let, var）
    VariableDeclaration(node) {
      context.report({
        node,
        message: `バレルファイル内で変数定義は禁止されています。

バレルファイルは re-export のみを行うべきです。
禁止: import文、変数定義、関数定義、クラス定義
許可: export { ... } from '...'
      export * from '...'

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
      })
    },

    // 関数定義の禁止（通常の関数定義と export function 両方）
    FunctionDeclaration(node) {
      // export default function() {} の場合、ExportDefaultDeclarationで既にエラーが出るのでスキップ
      if (insideExportDefault) {
        return
      }

      context.report({
        node,
        message: `バレルファイル内で関数定義は禁止されています。

バレルファイルは re-export のみを行うべきです。
禁止: import文、変数定義、関数定義、クラス定義
許可: export { ... } from '...'
      export * from '...'

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
      })
    },

    // クラス定義の禁止（通常のクラス定義と export class 両方）
    ClassDeclaration(node) {
      // export default class {} の場合、ExportDefaultDeclarationで既にエラーが出るのでスキップ
      if (insideExportDefault) {
        return
      }

      context.report({
        node,
        message: `バレルファイル内でクラス定義は禁止されています。

バレルファイルは re-export のみを行うべきです。
禁止: import文、変数定義、関数定義、クラス定義
許可: export { ... } from '...'
      export * from '...'

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
      })
    },

    // export default の禁止
    'ExportDefaultDeclaration'(node) {
      insideExportDefault = true
      context.report({
        node,
        message: `バレルファイル内で export default は禁止されています。

バレルファイルは re-export のみを行うべきです。
禁止: import文、変数定義、関数定義、クラス定義、export default
許可: export { ... } from '...'
      export * from '...'

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
      })
    },
    'ExportDefaultDeclaration:exit'() {
      insideExportDefault = false
    },

    // sourceなしのexport（export { foo }）の禁止
    // これは既存の定義をexportする形式なので、barrel内に定義が必要
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
        message: `バレルファイル内で、既存の定義をexportすることは禁止されています。

バレルファイルは re-export のみを行うべきです。
禁止: export { foo } （定義済みの変数をexport）
許可: export { foo } from './module'

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
      })
    },
  }
}

module.exports = {
  isBarrelFile,
  createBarrelPurityVisitor,
}
