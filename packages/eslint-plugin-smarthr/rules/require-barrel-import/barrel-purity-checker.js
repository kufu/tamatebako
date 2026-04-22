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
 * 基本エラーメッセージ（全ノードタイプ共通）
 */
const BASE_MESSAGE = `バレルファイルは設置されたディレクトリ外へのexportが責務です。
実装などexport以外の記述は別ファイルに書き出してください。`

/**
 * ノードタイプごとの追加情報
 */
const ADDITIONAL_DETAILS = {
  ExportDefaultDeclaration: {
    prohibited: 'import文、変数定義、関数定義、クラス定義、export default',
  },
  ExportNamedDeclaration: {
    prohibited: 'export { foo } （定義済みの変数をexport）',
    allowed: 'export { foo } from \'./module\'',
  },
  TSTypeAliasDeclaration: {
    note: '型定義は専用ファイルに記述し、そこから re-export してください。',
    prohibited: 'export type Size = \'small\' | \'medium\' | \'large\'',
    allowed: 'export type { Size } from \'./types\'',
  },
  TSInterfaceDeclaration: {
    note: '型定義は専用ファイルに記述し、そこから re-export してください。',
    prohibited: 'export interface ComponentAPI { ... }',
    allowed: 'export type { ComponentAPI } from \'./types\'',
  },
}

/**
 * エラーメッセージを生成
 * @param {string} nodeType - ノードタイプ
 * @returns {string} エラーメッセージ
 */
const createPurityErrorMessage = (nodeType) => {
  const details = ADDITIONAL_DETAILS[nodeType]

  let message = BASE_MESSAGE

  if (details) {
    message += '\n'
    if (details.note) {
      message += `\n${details.note}`
    }
    if (details.prohibited || details.allowed) {
      message += '\n'
      if (details.prohibited) {
        message += `\n禁止: ${details.prohibited}`
      }
      if (details.allowed) {
        message += `\n許可: ${details.allowed}`
      }
    }
  } else {
    // 標準的な禁止・許可リスト
    message += `\n
禁止: import文、変数定義、関数定義、クラス定義
許可: export { ... } from '...'`
  }

  message += '\n\n詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/require-barrel-import'

  return message
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
