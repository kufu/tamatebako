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
 * ノードタイプごとのエラーメッセージ定義
 */
const PURITY_ERROR_MESSAGES = {
  ImportDeclaration: {
    subject: 'import 文',
    baseMessage: `バレルファイル内で import 文は禁止されています。

バレルファイルは re-export のみを行うべきです。
禁止: import文、変数定義、関数定義、クラス定義
許可: export { ... } from '...'

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
  },
  VariableDeclaration: {
    subject: '変数定義',
    baseMessage: `バレルファイル内で変数定義は禁止されています。

バレルファイルは re-export のみを行うべきです。
禁止: import文、変数定義、関数定義、クラス定義
許可: export { ... } from '...'

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
  },
  FunctionDeclaration: {
    subject: '関数定義',
    baseMessage: `バレルファイル内で関数定義は禁止されています。

バレルファイルは re-export のみを行うべきです。
禁止: import文、変数定義、関数定義、クラス定義
許可: export { ... } from '...'

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
  },
  ClassDeclaration: {
    subject: 'クラス定義',
    baseMessage: `バレルファイル内でクラス定義は禁止されています。

バレルファイルは re-export のみを行うべきです。
禁止: import文、変数定義、関数定義、クラス定義
許可: export { ... } from '...'

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
  },
  ExportDefaultDeclaration: {
    subject: 'export default',
    baseMessage: `バレルファイル内で export default は禁止されています。

バレルファイルは re-export のみを行うべきです。
禁止: import文、変数定義、関数定義、クラス定義、export default
許可: export { ... } from '...'

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
  },
  ExportNamedDeclaration: {
    subject: '既存の定義をexport',
    baseMessage: `バレルファイル内で、既存の定義をexportすることは禁止されています。

バレルファイルは re-export のみを行うべきです。
禁止: export { foo } （定義済みの変数をexport）
許可: export { foo } from './module'

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
  },
  TSTypeAliasDeclaration: {
    subject: '型定義',
    baseMessage: `バレルファイル内で型定義は禁止されています。

バレルファイルは re-export のみを行うべきです。
型定義は専用ファイルに記述し、そこから re-export してください。

禁止: export type Size = 'small' | 'medium' | 'large'
許可: export type { Size } from './types'

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
  },
  TSInterfaceDeclaration: {
    subject: 'インターフェース定義',
    baseMessage: `バレルファイル内でインターフェース定義は禁止されています。

バレルファイルは re-export のみを行うべきです。
型定義は専用ファイルに記述し、そこから re-export してください。

禁止: export interface ComponentAPI { ... }
許可: export type { ComponentAPI } from './types'

詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import`,
  },
}

/**
 * エラーメッセージを取得
 * @param {string} nodeType - ノードタイプ
 * @returns {string} エラーメッセージ
 */
const createPurityErrorMessage = (nodeType) => {
  return PURITY_ERROR_MESSAGES[nodeType].baseMessage
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
    // 単純禁止パターン（条件なしで禁止）
    'ImportDeclaration, VariableDeclaration, TSTypeAliasDeclaration, TSInterfaceDeclaration'(node) {
      context.report({
        node,
        message: createPurityErrorMessage(node.type),
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
        message: createPurityErrorMessage(node.type),
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
        message: createPurityErrorMessage(node.type),
      })
    },

    // export default の禁止
    'ExportDefaultDeclaration'(node) {
      insideExportDefault = true
      context.report({
        node,
        message: createPurityErrorMessage(node.type),
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
        message: createPurityErrorMessage(node.type),
      })
    },
  }
}

module.exports = {
  isBarrelFile,
  createBarrelPurityVisitor,
}
