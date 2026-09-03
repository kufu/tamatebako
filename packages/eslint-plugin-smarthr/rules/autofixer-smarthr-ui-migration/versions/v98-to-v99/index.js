/**
 * smarthr-ui v98 → v99 移行ルール
 *
 * v99での破壊的変更に対応します。
 *
 * 対応する破壊的変更:
 * 1. useIntl() から日付フォーマット関数が分離: useDateFormat() を使用してください
 *    （formatDate, formatTime, formatTimestamp, getWeekStartDay）
 * 2. useIntl() から availableLocales が分離: useAvailableLocales() を使用してください
 *
 * 参考: https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v99.0.0
 *      https://github.com/kufu/smarthr-ui/pull/6484
 */

const { setupSmarthrUiAliasOptions } = require('../../helpers')

// ============================================================
// 定数定義
// ============================================================

// v99を示す定数（メッセージで使用）
const TARGET_VERSION = 'v99'

// README.mdへのGitHubリンク（エラーメッセージで使用）
const README_URL =
  'https://github.com/kufu/tamatebako/blob/master/packages/eslint-plugin-smarthr/rules/autofixer-smarthr-ui-migration/versions/v98-to-v99/README.md'

// useIntl() から useDateFormat() に移動した日付フォーマット関数
const DATE_FORMAT_PROPS = ['formatDate', 'formatTime', 'formatTimestamp', 'getWeekStartDay']

// useIntl() から useAvailableLocales() に移動したプロパティ
const AVAILABLE_LOCALES_PROP = 'availableLocales'

// 移行先のフック名
const DATE_FORMAT_HOOK = 'useDateFormat'
const AVAILABLE_LOCALES_HOOK = 'useAvailableLocales'

// ============================================================
// ヘルパー関数
// ============================================================

/**
 * Programノードから smarthr-ui（またはalias）のimport文を取得する
 *
 * @param {Object} programNode - Programノード
 * @param {string[]} validSources - 対象とするimport元のリスト
 * @returns {Object|undefined} ImportDeclarationノード
 */
function findSmarthrUiImport(programNode, validSources) {
  return programNode.body.find((node) => node.type === 'ImportDeclaration' && validSources.includes(node.source.value))
}

/**
 * import文から指定した名前のImportSpecifierを取得する
 *
 * @param {Object} importNode - ImportDeclarationノード
 * @param {string} name - 探す名前
 * @returns {Object|undefined} ImportSpecifierノード
 */
function findImportSpecifier(importNode, name) {
  return importNode.specifiers.find((specifier) => specifier.type === 'ImportSpecifier' && specifier.imported.name === name)
}

/**
 * useIntl がこの箇所でしか参照されていないか判定する
 *
 * true の場合、useIntl() を別フックに置き換えると import が不要になるため、
 * import文の useIntl をそのまま移行先のフック名に置き換えられる。
 *
 * @param {Object} sourceCode - ESLintのsourceCode
 * @param {Object} node - 判定の起点となるノード
 * @returns {boolean} useIntl の参照が1箇所だけの場合true
 */
function isUseIntlReferencedOnce(sourceCode, node) {
  let scope = sourceCode.getScope(node)

  while (scope) {
    const variable = scope.variables.find((v) => v.name === 'useIntl')

    if (variable) {
      return variable.references.length === 1
    }

    scope = scope.upper
  }

  return false
}

/**
 * import文を移行先のフックに対応させるfixを生成する
 *
 * - useIntl が不要になる場合: useIntl を移行先のフック名に置き換える
 * - useIntl が引き続き必要な場合: 移行先のフックを追加する
 * - 移行先のフックが既にimport済みの場合: 何もしない
 *
 * @param {Object} fixer - ESLintのfixer
 * @param {Object} importNode - ImportDeclarationノード
 * @param {Object} useIntlSpecifier - useIntlのImportSpecifierノード
 * @param {string} newHookName - 移行先のフック名
 * @param {boolean} canReplaceUseIntl - useIntlを置き換えて良い場合true
 * @returns {Object|null} fix（不要な場合はnull）
 */
function createImportFix(fixer, importNode, useIntlSpecifier, newHookName, canReplaceUseIntl) {
  if (findImportSpecifier(importNode, newHookName)) {
    return null
  }

  if (canReplaceUseIntl) {
    return fixer.replaceText(useIntlSpecifier, newHookName)
  }

  return fixer.insertTextAfter(useIntlSpecifier, `, ${newHookName}`)
}

/**
 * ObjectPatternの各プロパティを移行先ごとに分類する
 *
 * @param {Object} objectPattern - ObjectPatternノード
 * @returns {{ dateFormat: Object[], availableLocales: Object[], others: Object[], hasRest: boolean }}
 */
function categorizeProperties(objectPattern) {
  const result = { dateFormat: [], availableLocales: [], others: [], hasRest: false }

  objectPattern.properties.forEach((property) => {
    // `const { ...rest } = useIntl()` は何が使われるか判断できない
    if (property.type === 'RestElement') {
      result.hasRest = true
      return
    }

    // `const { [key]: value } = useIntl()` は静的に判断できない
    if (property.computed || property.key.type !== 'Identifier') {
      result.others.push(property)
      return
    }

    const name = property.key.name

    if (DATE_FORMAT_PROPS.includes(name)) {
      result.dateFormat.push(property)
    } else if (name === AVAILABLE_LOCALES_PROP) {
      result.availableLocales.push(property)
    } else {
      result.others.push(property)
    }
  })

  return result
}

// ============================================================
// モジュールエクスポート
// ============================================================

module.exports = {
  messages: {
    migrateUseIntlDateFormat:
      'smarthr-ui {{to}} では useIntl() から日付フォーマット関数（{{props}}）が分離されました。useDateFormat() を使用してください。詳細: {{readmeUrl}}',
    migrateUseIntlAvailableLocales:
      'smarthr-ui {{to}} では useIntl() から availableLocales が分離されました。useAvailableLocales() を使用してください。詳細: {{readmeUrl}}',
    migrateUseIntlMixed:
      'smarthr-ui {{to}} では useIntl() から {{props}} が分離されました。useIntl() と併用しているため自動修正できません。useDateFormat() / useAvailableLocales() の呼び出しに分けてください。注意: このエラーは手動修正後も消えません。対応完了後は { from: "98", to: "99" } 設定を削除してください。詳細: {{readmeUrl}}',
    migrateUseIntlIndirect:
      'smarthr-ui {{to}} では useIntl() から日付フォーマット関数と availableLocales が分離されました。分割代入ではないため自動修正できません。useDateFormat() / useAvailableLocales() を使用してください。注意: このエラーは手動修正後も消えません。対応完了後は { from: "98", to: "99" } 設定を削除してください。詳細: {{readmeUrl}}',
  },

  createCheckers(context, sourceCode, options = {}) {
    const { validSources, isAliasFile } = setupSmarthrUiAliasOptions(context, options)

    // smarthr-ui から useIntl をimportしているファイルのみを対象にするための情報
    // Programが最初に訪問されるため、以降のチェッカーから参照できる
    const smarthrUi = { importNode: null, useIntlSpecifier: null }

    /**
     * このファイルが移行対象か判定する
     *
     * smarthr-ui から useIntl をimportしていない場合、
     * 同名の別フック（react-intl等）の可能性があるため対象外とする
     */
    const isMigrationTarget = () => !!smarthrUi.useIntlSpecifier

    const checkers = {
      Program(node) {
        const importNode = findSmarthrUiImport(node, validSources)

        if (!importNode && !isAliasFile) {
          return
        }

        smarthrUi.importNode = importNode
        smarthrUi.useIntlSpecifier = importNode ? findImportSpecifier(importNode, 'useIntl') : null
      },

      // ============================================================
      // 1. const { ... } = useIntl() の分割代入
      // ============================================================

      "VariableDeclarator[init.type='CallExpression'][init.callee.name='useIntl'][id.type='ObjectPattern']"(node) {
        if (!isMigrationTarget()) {
          return
        }

        const { dateFormat, availableLocales, others, hasRest } = categorizeProperties(node.id)

        // 移行対象のプロパティを使っていない場合は何もしない
        if (dateFormat.length === 0 && availableLocales.length === 0) {
          return
        }

        const movedProps = [...dateFormat, ...availableLocales].map((p) => p.key.name).join(', ')

        // useIntl() に残るプロパティがある場合は宣言の分割が必要なため自動修正しない
        // rest要素がある場合も、何が使われるか判断できないため自動修正しない
        const isMixed = others.length > 0 || hasRest || (dateFormat.length > 0 && availableLocales.length > 0)

        if (isMixed) {
          context.report({
            node,
            messageId: 'migrateUseIntlMixed',
            data: { to: TARGET_VERSION, props: movedProps, readmeUrl: README_URL },
          })
          return
        }

        const isDateFormatOnly = dateFormat.length > 0
        const newHookName = isDateFormatOnly ? DATE_FORMAT_HOOK : AVAILABLE_LOCALES_HOOK

        context.report({
          node,
          messageId: isDateFormatOnly ? 'migrateUseIntlDateFormat' : 'migrateUseIntlAvailableLocales',
          data: { to: TARGET_VERSION, props: movedProps, readmeUrl: README_URL },
          fix(fixer) {
            const fixes = [fixer.replaceText(node.init.callee, newHookName)]

            // useAvailableLocales() は戻り値が配列そのものなので分割代入をやめる
            // 例: const { availableLocales: locales } = useIntl() → const locales = useAvailableLocales()
            if (!isDateFormatOnly) {
              fixes.push(fixer.replaceText(node.id, sourceCode.getText(availableLocales[0].value)))
            }

            const importFix = createImportFix(
              fixer,
              smarthrUi.importNode,
              smarthrUi.useIntlSpecifier,
              newHookName,
              isUseIntlReferencedOnce(sourceCode, node),
            )

            if (importFix) {
              fixes.push(importFix)
            }

            return fixes
          },
        })
      },

      // ============================================================
      // 2. useIntl().formatDate のような直接のメンバーアクセス
      // ============================================================

      "MemberExpression[object.type='CallExpression'][object.callee.name='useIntl']"(node) {
        if (!isMigrationTarget()) {
          return
        }

        if (node.computed || node.property.type !== 'Identifier') {
          return
        }

        const name = node.property.name

        if (!DATE_FORMAT_PROPS.includes(name) && name !== AVAILABLE_LOCALES_PROP) {
          return
        }

        context.report({
          node,
          messageId: 'migrateUseIntlIndirect',
          data: { to: TARGET_VERSION, readmeUrl: README_URL },
        })
      },

      // ============================================================
      // 3. const intl = useIntl() のように変数で受けている場合
      // ============================================================

      "VariableDeclarator[init.type='CallExpression'][init.callee.name='useIntl'][id.type='Identifier']"(node) {
        if (!isMigrationTarget()) {
          return
        }

        const variable = sourceCode.getScope(node).variables.find((v) => v.name === node.id.name)

        if (!variable) {
          return
        }

        // 変数経由で移行対象のプロパティにアクセスしている箇所があるかを確認する
        // 例: const intl = useIntl(); intl.formatDate(...)
        const usesMovedProp = variable.references.some((reference) => {
          const parent = reference.identifier.parent

          return (
            parent &&
            parent.type === 'MemberExpression' &&
            !parent.computed &&
            parent.property.type === 'Identifier' &&
            (DATE_FORMAT_PROPS.includes(parent.property.name) || parent.property.name === AVAILABLE_LOCALES_PROP)
          )
        })

        if (!usesMovedProp) {
          return
        }

        context.report({
          node,
          messageId: 'migrateUseIntlIndirect',
          data: { to: TARGET_VERSION, readmeUrl: README_URL },
        })
      },
    }

    return checkers
  },
}
