/**
 * smarthr-ui のバージョン間移行を支援する自動修正ルール
 *
 * このルールは一時的に使用するもので、移行完了後は無効化してください。
 *
 * 使用例:
 * {
 *   "rules": {
 *     "smarthr/autofixer-smarthr-ui-migration": ["error", { "from": "90", "to": "91" }]
 *   }
 * }
 *
 * 複数バージョンをまたぐ移行も可能です（例: 90→93）。
 * この場合、存在する移行ルール（v90→v91など）を自動的に適用し、
 * 実装されていないバージョンについては警告を表示します。
 */

const v90ToV91 = require('./versions/v90-to-v91/index')
const v91ToV92 = require('./versions/v91-to-v92/index')

// サポートしているバージョン間の移行モジュール
const VERSION_MODULES = {
  'v90-v91': v90ToV91,
  'v91-v92': v91ToV92,
}

module.exports = {
  meta: {
    type: 'problem',
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          from: {
            type: 'string',
            pattern: '^[0-9]+$',
          },
          to: {
            type: 'string',
            pattern: '^[0-9]+$',
          },
          smarthrUiAlias: {
            type: 'string',
          },
        },
        required: ['from', 'to'],
        additionalProperties: false,
      },
    ],
    messages: {
      missingOptions: 'オプションで from と to を指定してください。例: { "from": "90", "to": "91" }',
      unsupportedVersion: 'サポートされていないバージョンです: {{from}} to {{to}}',
      skippedVersion: 'v{{version}} の自動修正ルールが実装されていません。変更内容は https://github.com/kufu/smarthr-ui/releases から対応するversionの情報を確認してください',
      ...v90ToV91.messages,
      ...v91ToV92.messages,
    },
  },
  create(context) {
    const options = context.options[0]

    // オプション必須チェック
    if (!options || !options.from || !options.to) {
      return {
        Program(node) {
          context.report({
            node,
            messageId: 'missingOptions',
          })
        },
      }
    }

    const { from, to } = options
    const sourceCode = context.getSourceCode()

    // バージョン間の移行パスを生成
    const migrationResult = getMigrationPath(from, to)

    if (!migrationResult) {
      // サポートされていないバージョン
      return {
        Program(node) {
          context.report({
            node,
            messageId: 'unsupportedVersion',
            data: { from, to },
          })
        },
      }
    }

    const { path, skipped } = migrationResult

    // 各ステップのチェッカーを収集してマージ
    // 例: v90→v92 なら [v90→v91のチェッカー] を収集
    const checkersList = path.map((stepKey) => {
      const module = VERSION_MODULES[stepKey]
      return module.createCheckers(context, sourceCode, options)
    })

    const mergedCheckers = mergeCheckers(checkersList)

    // スキップされたバージョンがある場合は警告を追加
    // 例: v90→v93 で v92 の移行ルールがない場合、v92 について警告
    if (skipped.length > 0) {
      addSkippedVersionWarnings(mergedCheckers, context, skipped)
    }

    return mergedCheckers
  },
}

/**
 * バージョン間の移行パスを生成する
 *
 * @param {string} from - 移行元バージョン（例: "90"）
 * @param {string} to - 移行先バージョン（例: "91"）
 * @returns {{ path: string[], skipped: number[] } | null} 移行パス情報、または無効な場合はnull
 *
 * @example
 * getMigrationPath('90', '91')
 * // => { path: ['90-91'], skipped: [] }
 *
 * @example
 * getMigrationPath('90', '93')
 * // 92のモジュールがない場合
 * // => { path: ['90-91'], skipped: [92, 93] }
 */
function getMigrationPath(from, to) {
  const fromNum = parseInt(from)
  const toNum = parseInt(to)

  if (fromNum >= toNum || isNaN(fromNum) || isNaN(toNum)) {
    return null
  }

  const path = []
  const skipped = []

  // fromからtoまでの各ステップについて、移行モジュールが存在するかチェック
  // 内部的にはvプレフィックス付きのキーで管理（ファイル名と統一）
  for (let i = fromNum; i < toNum; i++) {
    const stepKey = `v${i}-v${i + 1}`
    if (VERSION_MODULES[stepKey]) {
      path.push(stepKey)
    } else {
      // モジュールが存在しない = 自動修正ルールが未実装
      // major versionなので必ず破壊的変更があるはずだが、ルールは未実装
      skipped.push(i + 1)
    }
  }

  // 適用可能なステップが1つもない場合は、完全にサポート外
  if (path.length === 0) {
    return null
  }

  return { path, skipped }
}

/**
 * 複数のチェッカーオブジェクトを1つにマージする
 *
 * 同じセレクターに対する複数のハンドラーがある場合、両方を実行するようにラップする。
 *
 * @param {Array<Object>} checkersList - チェッカーオブジェクトの配列
 * @returns {Object} マージされたチェッカーオブジェクト
 */
function mergeCheckers(checkersList) {
  const merged = {}

  checkersList.forEach((checkers) => {
    Object.keys(checkers).forEach((selector) => {
      if (!merged[selector]) {
        // 初めて見るセレクターはそのまま追加
        merged[selector] = checkers[selector]
      } else {
        // 既に存在するセレクターの場合、両方のハンドラーを順次実行するようラップ
        // 例: v90→v91とv91→v92で同じImportDeclarationを処理する場合
        const existing = merged[selector]
        const additional = checkers[selector]
        merged[selector] = function (node) {
          existing.call(this, node)
          additional.call(this, node)
        }
      }
    })
  })

  return merged
}

/**
 * スキップされたバージョンについての警告を追加する
 *
 * Programノードのハンドラーをラップして、スキップされた各バージョンについて
 * 警告メッセージを表示する。
 *
 * @param {Object} checkers - チェッカーオブジェクト（この関数内で直接変更される）
 * @param {Object} context - ESLintのcontext
 * @param {number[]} skippedVersions - スキップされたバージョン番号の配列（例: [92, 93]）
 */
function addSkippedVersionWarnings(checkers, context, skippedVersions) {
  const existingProgramHandler = checkers.Program

  checkers.Program = function (node) {
    // 既存のProgramハンドラーがあれば先に実行
    if (existingProgramHandler) {
      existingProgramHandler.call(this, node)
    }

    // スキップされた各バージョンについて警告を表示
    skippedVersions.forEach((versionNumber) => {
      context.report({
        node,
        messageId: 'skippedVersion',
        data: { version: `v${versionNumber}` },
      })
    })
  }
}
