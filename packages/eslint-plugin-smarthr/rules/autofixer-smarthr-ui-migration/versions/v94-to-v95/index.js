/**
 * smarthr-ui v94 → v95 移行ルール
 *
 * v95での破壊的変更に対応する自動修正を提供します。
 *
 * 対応する破壊的変更:
 * 1. LanguageSwitcher, AppLauncher の decorators 属性削除
 * 2. InputFile の decorators 属性削除
 * 3. FormDialog のボタン属性をObject形式に統合
 * 4. ActionDialog のボタン属性をObject形式に統合
 * 5. MessageDialog のdecorators削除とcloseButton属性への統一
 *
 * 参考: https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v95.0.0
 */

const { setupSmarthrUiAliasOptions } = require('../../helpers')

// ============================================================
// 定数定義
// ============================================================

// v95を示す定数（メッセージで使用）
const TARGET_VERSION = 'v95'

// decoratorsを削除するコンポーネント（単純削除のみ）
const COMPONENTS_REMOVE_DECORATORS = ['LanguageSwitcher', 'InputFile']

// ボタン属性を統合するコンポーネント（FormDialog, ActionDialog）
const DIALOG_COMPONENTS_WITH_BUTTONS = ['FormDialog', 'ActionDialog']

// ============================================================
// モジュールエクスポート
// ============================================================

module.exports = {
  messages: {
    removeDecorators: 'smarthr-ui {{to}} では {{component}} の decorators 属性は削除されました。翻訳はsmarthr-ui内で自動的に行われます',
    migrateAppLauncherDecorators: 'smarthr-ui {{to}} では AppLauncher の decorators.triggerLabel は triggerLabel 属性に移行されました。動的な値を渡す場合のみ triggerLabel 属性を使用してください',
    migrateActionText: 'smarthr-ui {{to}} では {{component}} の actionText 属性は actionButton に統合されました',
    migrateActionTheme: 'smarthr-ui {{to}} では {{component}} の actionTheme 属性は actionButton に統合されました',
    migrateActionDisabled: 'smarthr-ui {{to}} では {{component}} の actionDisabled 属性は actionButton に統合されました',
    migrateCloseDisabled: 'smarthr-ui {{to}} では {{component}} の closeDisabled 属性は closeButton に統合されました',
    migrateDecoratorsCloseButtonLabel: 'smarthr-ui {{to}} では {{component}} の decorators.closeButtonLabel 属性は closeButton に統合されました',
    migrateMessageDialogDecorators: 'smarthr-ui {{to}} では MessageDialog の decorators.closeButtonLabel 属性は closeButton に統合されました',
  },

  createCheckers(context, sourceCode, options = {}) {
    const { validSources, isAliasFile, filename } = setupSmarthrUiAliasOptions(context, options)

    const checkers = {
      // ============================================================
      // 1, 2. LanguageSwitcher, AppLauncher, InputFile の decorators 属性削除
      // ============================================================

      'JSXAttribute[name.name="decorators"]'(node) {
        const componentName = node.parent.name.name

        // 対象コンポーネントのみ
        if (!COMPONENTS_REMOVE_DECORATORS.includes(componentName)) return

        context.report({
          node,
          messageId: 'removeDecorators',
          data: { component: componentName, to: TARGET_VERSION },
          fix(fixer) {
            // decorators属性を削除
            const tokenBefore = sourceCode.getTokenBefore(node)
            if (tokenBefore && tokenBefore.range[1] < node.range[0]) {
              return fixer.removeRange([tokenBefore.range[1], node.range[1]])
            }
            return fixer.remove(node)
          },
        })
      },

      // ============================================================
      // 3, 4. FormDialog/ActionDialog のボタン属性統合
      // ============================================================

      // FormDialog/ActionDialog要素を検出
      'JSXOpeningElement'(node) {
        const componentName = node.name.name

        // 対象コンポーネントのみ
        if (!DIALOG_COMPONENTS_WITH_BUTTONS.includes(componentName)) return

        // 各属性を収集
        let actionTextAttr = null
        let actionThemeAttr = null
        let actionDisabledAttr = null
        let closeDisabledAttr = null
        let decoratorsAttr = null
        let actionButtonAttr = null
        let closeButtonAttr = null

        node.attributes.forEach((attr) => {
          if (attr.type !== 'JSXAttribute') return
          const attrName = attr.name.name

          if (attrName === 'actionText') actionTextAttr = attr
          if (attrName === 'actionTheme') actionThemeAttr = attr
          if (attrName === 'actionDisabled') actionDisabledAttr = attr
          if (attrName === 'closeDisabled') closeDisabledAttr = attr
          if (attrName === 'decorators') decoratorsAttr = attr
          if (attrName === 'actionButton') actionButtonAttr = attr
          if (attrName === 'closeButton') closeButtonAttr = attr
        })

        // actionButton属性が既にある場合、古い属性は削除のみ
        // closeButton属性が既にある場合、古い属性は削除のみ
        const hasActionButton = !!actionButtonAttr
        const hasCloseButton = !!closeButtonAttr

        // actionText を actionButton に移行
        if (actionTextAttr) {
          context.report({
            node: actionTextAttr,
            messageId: 'migrateActionText',
            data: { component: componentName, to: TARGET_VERSION },
            fix(fixer) {
              if (hasActionButton) {
                // actionButton属性が既にある場合は削除のみ
                const tokenBefore = sourceCode.getTokenBefore(actionTextAttr)
                if (tokenBefore && tokenBefore.range[1] < actionTextAttr.range[0]) {
                  return fixer.removeRange([tokenBefore.range[1], actionTextAttr.range[1]])
                }
                return fixer.remove(actionTextAttr)
              }

              // actionButton属性がない場合、actionTextをactionButtonにリネーム
              // 他の属性（actionTheme, actionDisabled）がある場合はObject形式に変換する必要があるが、
              // 段階的に処理するため、まずは単純なリネームのみ
              if (!actionThemeAttr && !actionDisabledAttr) {
                return fixer.replaceText(actionTextAttr.name, 'actionButton')
              }

              // actionTheme または actionDisabled がある場合、Object形式に変換
              // これは複雑なため、エラーのみ表示（手動対応）
              return null
            },
          })
        }

        // actionTheme を actionButton に移行
        if (actionThemeAttr) {
          context.report({
            node: actionThemeAttr,
            messageId: 'migrateActionTheme',
            data: { component: componentName, to: TARGET_VERSION },
            fix(fixer) {
              // actionButton属性が既にある場合は削除のみ
              if (hasActionButton) {
                const tokenBefore = sourceCode.getTokenBefore(actionThemeAttr)
                if (tokenBefore && tokenBefore.range[1] < actionThemeAttr.range[0]) {
                  return fixer.removeRange([tokenBefore.range[1], actionThemeAttr.range[1]])
                }
                return fixer.remove(actionThemeAttr)
              }

              // 複雑なため、エラーのみ表示（手動対応）
              return null
            },
          })
        }

        // actionDisabled を actionButton に移行
        if (actionDisabledAttr) {
          context.report({
            node: actionDisabledAttr,
            messageId: 'migrateActionDisabled',
            data: { component: componentName, to: TARGET_VERSION },
            fix(fixer) {
              // actionButton属性が既にある場合は削除のみ
              if (hasActionButton) {
                const tokenBefore = sourceCode.getTokenBefore(actionDisabledAttr)
                if (tokenBefore && tokenBefore.range[1] < actionDisabledAttr.range[0]) {
                  return fixer.removeRange([tokenBefore.range[1], actionDisabledAttr.range[1]])
                }
                return fixer.remove(actionDisabledAttr)
              }

              // 複雑なため、エラーのみ表示（手動対応）
              return null
            },
          })
        }

        // closeDisabled を closeButton に移行
        if (closeDisabledAttr) {
          context.report({
            node: closeDisabledAttr,
            messageId: 'migrateCloseDisabled',
            data: { component: componentName, to: TARGET_VERSION },
            fix(fixer) {
              // closeButton属性が既にある場合は削除のみ
              if (hasCloseButton) {
                const tokenBefore = sourceCode.getTokenBefore(closeDisabledAttr)
                if (tokenBefore && tokenBefore.range[1] < closeDisabledAttr.range[0]) {
                  return fixer.removeRange([tokenBefore.range[1], closeDisabledAttr.range[1]])
                }
                return fixer.remove(closeDisabledAttr)
              }

              // 複雑なため、エラーのみ表示（手動対応）
              return null
            },
          })
        }

        // decorators.closeButtonLabel を closeButton に移行
        if (decoratorsAttr) {
          // decorators属性の値を解析してcloseButtonLabelがあるかチェック
          const decoratorsValue = sourceCode.getText(decoratorsAttr.value)
          if (decoratorsValue.includes('closeButtonLabel')) {
            context.report({
              node: decoratorsAttr,
              messageId: 'migrateDecoratorsCloseButtonLabel',
              data: { component: componentName, to: TARGET_VERSION },
              fix(fixer) {
                // closeButton属性が既にある場合は削除のみ
                if (hasCloseButton) {
                  const tokenBefore = sourceCode.getTokenBefore(decoratorsAttr)
                  if (tokenBefore && tokenBefore.range[1] < decoratorsAttr.range[0]) {
                    return fixer.removeRange([tokenBefore.range[1], decoratorsAttr.range[1]])
                  }
                  return fixer.remove(decoratorsAttr)
                }

                // 複雑なため、エラーのみ表示（手動対応）
                return null
              },
            })
          }
        }
      },

      // ============================================================
      // AppLauncher の decorators.triggerLabel を triggerLabel に移行
      // ============================================================

      'JSXOpeningElement[name.name="AppLauncher"] > JSXAttribute[name.name="decorators"]'(node) {
        // decorators属性の値を解析してtriggerLabelがあるかチェック
        const decoratorsValue = sourceCode.getText(node.value)
        if (decoratorsValue.includes('triggerLabel')) {
          // triggerLabel属性が既にあるかチェック
          const triggerLabelAttr = node.parent.attributes.find(
            (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'triggerLabel'
          )

          context.report({
            node,
            messageId: 'migrateAppLauncherDecorators',
            data: { to: TARGET_VERSION },
            fix(fixer) {
              // triggerLabel属性が既にある場合は削除のみ
              if (triggerLabelAttr) {
                const tokenBefore = sourceCode.getTokenBefore(node)
                if (tokenBefore && tokenBefore.range[1] < node.range[0]) {
                  return fixer.removeRange([tokenBefore.range[1], node.range[1]])
                }
                return fixer.remove(node)
              }

              // 値の抽出は複雑なため、エラーのみ表示（手動対応）
              return null
            },
          })
        }
      },

      // ============================================================
      // 5. MessageDialog の decorators 削除と closeButton への統一
      // ============================================================

      'JSXOpeningElement[name.name="MessageDialog"] > JSXAttribute[name.name="decorators"]'(node) {
        // decorators属性の値を解析してcloseButtonLabelがあるかチェック
        const decoratorsValue = sourceCode.getText(node.value)
        if (decoratorsValue.includes('closeButtonLabel')) {
          // closeButton属性が既にあるかチェック
          const closeButtonAttr = node.parent.attributes.find(
            (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'closeButton'
          )

          context.report({
            node,
            messageId: 'migrateMessageDialogDecorators',
            data: { to: TARGET_VERSION },
            fix(fixer) {
              // closeButton属性が既にある場合は削除のみ
              if (closeButtonAttr) {
                const tokenBefore = sourceCode.getTokenBefore(node)
                if (tokenBefore && tokenBefore.range[1] < node.range[0]) {
                  return fixer.removeRange([tokenBefore.range[1], node.range[1]])
                }
                return fixer.remove(node)
              }

              // 複雑なため、エラーのみ表示（手動対応）
              return null
            },
          })
        }
      },
    }

    return checkers
  },
}
