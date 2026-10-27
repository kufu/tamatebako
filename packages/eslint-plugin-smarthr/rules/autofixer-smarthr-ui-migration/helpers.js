/**
 * autofixer-smarthr-ui-migration 専用のヘルパー関数
 *
 * このファイルは複数のバージョン間で共通して使用されるヘルパー関数を提供します。
 */

const { rootPath } = require('../../libs/common')

/**
 * smarthrUiAliasで指定されたパスと現在のファイルパスがマッチするか判定
 *
 * @param {string} filename - 現在処理中のファイルパス
 * @param {string} smarthrUiAlias - smarthrUiAliasオプションの値（例: '@/components/parts/smarthr-ui'）
 * @returns {boolean} マッチする場合true
 */
function isFileMatchingSmarthrUiAlias(filename, smarthrUiAlias) {
  // rootPathを使って絶対パスで比較を試みる
  const resolved = smarthrUiAlias.replace(/^@\//, `${rootPath}/`)
  if (filename.includes(resolved)) {
    return true
  }

  // rootPathでマッチしない場合:
  // パスの一部としてマッチング（テスト環境などで使用）
  // 例: '@/components/parts/smarthr-ui' -> 'components/parts/smarthr-ui'
  const pathPart = smarthrUiAlias.replace(/^@\//, '').replace(/^~\//, '')

  // 以下のパターンにマッチング:
  // 1. ディレクトリ形式: /components/parts/smarthr-ui/index.tsx
  // 2. 個別ファイル: /components/parts/smarthr-ui/ActionDialog.tsx
  // 3. 単一ファイル形式: /components/parts/smarthr-ui.tsx
  return (
    filename.includes(`/${pathPart}/`) ||
    filename.endsWith(`/${pathPart}`) ||
    filename.includes(`/${pathPart}.`)
  )
}

/**
 * smarthrUiAliasオプションのセットアップ
 *
 * validSourcesの拡張とaliasファイル判定を行います。
 *
 * @param {Object} context - ESLintのcontext
 * @param {Object} options - ルールオプション（{ smarthrUiAlias?: string }）
 * @returns {{ validSources: string[], isAliasFile: boolean, filename: string }}
 *
 * @example
 * const { validSources, isAliasFile, filename } = setupSmarthrUiAliasOptions(context, options)
 *
 * // ImportDeclarationで使用
 * if (!validSources.includes(node.source.value)) return
 *
 * // aliasファイル内のexport変数名置換で使用
 * if (isAliasFile) {
 *   // aliasファイル専用の処理
 * }
 */
function setupSmarthrUiAliasOptions(context, options) {
  const customSmarthrUiAlias = options.smarthrUiAlias
  const validSources = ['smarthr-ui']
  if (customSmarthrUiAlias) {
    validSources.push(customSmarthrUiAlias)
  }

  const filename = context.getFilename()
  const isAliasFile = customSmarthrUiAlias && isFileMatchingSmarthrUiAlias(
    filename,
    customSmarthrUiAlias
  )

  return { validSources, isAliasFile, filename }
}

module.exports = {
  isFileMatchingSmarthrUiAlias,
  setupSmarthrUiAliasOptions,
}
