/**
 * smarthr-ui v91 → v92 移行ルール
 *
 * v92での破壊的変更に対応する自動修正を提供します。
 *
 * 対応する破壊的変更:
 * 1. RemoteTriggerダイアログのプレフィックス削除
 *    - RemoteTriggerActionDialog → ActionDialog
 *    - RemoteTriggerFormDialog → FormDialog
 *    - RemoteTriggerMessageDialog → MessageDialog
 *    - RemoteTriggerStepFormDialog → StepFormDialog
 * 2. コンポーネントサイズ指定を大文字に統一
 *    - size="default" → size="M"
 *    - size="s" → size="S"
 *    - size="m" → size="M"
 * 3. decorators属性削除（Combobox, SearchInput, Textarea, InformationPanel）
 *
 * 参考: https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v92.0.0
 */

const { setupSmarthrUiAliasOptions } = require('../../helpers')

// ============================================================
// 定数定義
// ============================================================

// 1. RemoteTriggerダイアログのリネームマッピング
const REMOTE_TRIGGER_DIALOG_COMPONENTS = {
  RemoteTriggerActionDialog: 'ActionDialog',
  RemoteTriggerFormDialog: 'FormDialog',
  RemoteTriggerMessageDialog: 'MessageDialog',
  RemoteTriggerStepFormDialog: 'StepFormDialog',
}

// 2. サイズ値の変換マッピング
const SIZE_VALUE_MAP = {
  default: 'M',
  s: 'S',
  m: 'M',
}

// サイズ指定を持つコンポーネント
const SIZE_COMPONENTS = [
  'Button',
  'AnchorButton',
  'Select',
  'SegmentedControl',
  'SideNav',
  'SideNavItemButton',
  'SideNavItemAnchor',
  'InputFile',
  'Loader',
  'LoaderSpinner',
]

// 3. decorators属性を持つコンポーネント
const DECORATORS_COMPONENTS = [
  'MultiCombobox',
  'SingleCombobox',
  'SearchInput',
  'Textarea',
  'InformationPanel',
]

// v92を示す定数（メッセージで使用）
const TARGET_VERSION = 'v92'

// ============================================================
// モジュールエクスポート
// ============================================================

module.exports = {
  messages: {
    renameRemoteTriggerDialog: 'smarthr-ui {{to}} では {{old}} が {{new}} にリネームされました（RemoteTrigger版が推奨版になりました）',
    convertSizeValue: 'smarthr-ui {{to}} ではサイズ指定が大文字に統一されました: size="{{old}}" → size="{{new}}"',
    removeDecorators: 'smarthr-ui {{to}} では {{component}} の decorators 属性は削除されました（smarthr-ui内部で自動的に翻訳されるようになりました）',
    renameAliasFile: 'smarthr-ui {{to}} では {{old}} が {{new}} にリネームされました。以下の手順で対応してください: 1. ファイル名を変更（例: git mv {{oldFile}} {{newFile}}）2. このファイルをimportしている箇所を更新（例: from \'@/path/{{old}}\' → from \'@/path/{{new}}\'）',
  },

  createCheckers(context, sourceCode, options = {}) {
    const { validSources, isAliasFile, filename } = setupSmarthrUiAliasOptions(context, options)

    const checkers = {
      // ============================================================
      // 0. aliasファイル名の変更チェック
      // ============================================================

      Program(node) {
        if (!isAliasFile) return

        // ファイル名からコンポーネント名を抽出（拡張子を除く）
        const fileBasename = filename.split('/').pop() || ''
        const componentName = fileBasename.replace(/\.(tsx?|jsx?)$/, '')

        // RemoteTriggerDialog系コンポーネント名と一致するかチェック
        const newName = REMOTE_TRIGGER_DIALOG_COMPONENTS[componentName]
        if (newName) {
          const oldFile = fileBasename
          const newFile = fileBasename.replace(componentName, newName)

          context.report({
            node,
            messageId: 'renameAliasFile',
            data: {
              old: componentName,
              new: newName,
              to: TARGET_VERSION,
              oldFile,
              newFile,
            },
          })
        }
      },

      // ============================================================
      // 1. RemoteTriggerダイアログのリネーム
      // ============================================================

      // import文での検出と修正
      ImportDeclaration(node) {
        if (!validSources.includes(node.source.value)) return

        node.specifiers.forEach((specifier) => {
          if (specifier.type !== 'ImportSpecifier') return

          const importedName = specifier.imported.name
          const newName = REMOTE_TRIGGER_DIALOG_COMPONENTS[importedName]

          if (newName) {
            context.report({
              node: specifier,
              messageId: 'renameRemoteTriggerDialog',
              data: { old: importedName, new: newName, to: TARGET_VERSION },
              fix(fixer) {
                return fixer.replaceText(specifier.imported, newName)
              },
            })
          }
        })
      },

      // export文での検出と修正（re-export）
      ExportNamedDeclaration(node) {
        if (!node.source) return
        if (!validSources.includes(node.source.value)) return

        node.specifiers.forEach((specifier) => {
          if (specifier.type !== 'ExportSpecifier') return

          const exportedName = specifier.exported.name
          const localName = specifier.local.name
          const newName = REMOTE_TRIGGER_DIALOG_COMPONENTS[localName]

          if (newName) {
            context.report({
              node: specifier,
              messageId: 'renameRemoteTriggerDialog',
              data: { old: localName, new: newName, to: TARGET_VERSION },
              fix(fixer) {
                if (localName === exportedName) {
                  return fixer.replaceText(specifier, newName)
                }
                return fixer.replaceText(specifier.local, newName)
              },
            })
          }
        })
      },

      // JSX要素での検出と修正
      'JSXOpeningElement[name.name=/^RemoteTrigger(ActionDialog|FormDialog|MessageDialog|StepFormDialog)$/]'(node) {
        const componentName = node.name.name
        const newName = REMOTE_TRIGGER_DIALOG_COMPONENTS[componentName]

        if (newName) {
          context.report({
            node,
            messageId: 'renameRemoteTriggerDialog',
            data: { old: componentName, new: newName, to: TARGET_VERSION },
            fix(fixer) {
              const fixes = [fixer.replaceText(node.name, newName)]

              // 終了タグも修正
              const jsxElement = node.parent
              if (jsxElement.closingElement) {
                fixes.push(fixer.replaceText(jsxElement.closingElement.name, newName))
              }

              return fixes
            },
          })
        }
      },

      // ============================================================
      // 2. サイズ指定の大文字統一
      // ============================================================

      // size属性の値をチェック
      'JSXAttribute[name.name="size"][value.type="Literal"]'(node) {
        const componentName = node.parent.name.name

        // 対象コンポーネントかチェック
        if (!SIZE_COMPONENTS.includes(componentName)) return

        const sizeValue = node.value.value
        const newValue = SIZE_VALUE_MAP[sizeValue]

        if (newValue) {
          context.report({
            node,
            messageId: 'convertSizeValue',
            data: { old: sizeValue, new: newValue, to: TARGET_VERSION },
            fix(fixer) {
              return fixer.replaceText(node.value, `"${newValue}"`)
            },
          })
        }
      },

      // ============================================================
      // 3. decorators属性削除（自動修正あり）
      // ============================================================

      'JSXAttribute[name.name="decorators"]'(node) {
        const componentName = node.parent.name.name

        if (DECORATORS_COMPONENTS.includes(componentName)) {
          context.report({
            node,
            messageId: 'removeDecorators',
            data: { component: componentName, to: TARGET_VERSION },
            fix(fixer) {
              // 属性とその前のスペース/改行を削除
              const tokenBefore = sourceCode.getTokenBefore(node)
              if (tokenBefore && tokenBefore.range[1] < node.range[0]) {
                return fixer.removeRange([tokenBefore.range[1], node.range[1]])
              }
              return fixer.remove(node)
            },
          })
        }
      },

      // ============================================================
      // aliasファイル内のexport変数名置換
      // ============================================================

      VariableDeclarator(node) {
        if (!isAliasFile) return
        if (node.id.type !== 'Identifier') return

        const variableName = node.id.name
        const newName = REMOTE_TRIGGER_DIALOG_COMPONENTS[variableName]

        if (newName) {
          context.report({
            node: node.id,
            messageId: 'renameRemoteTriggerDialog',
            data: { old: variableName, new: newName, to: TARGET_VERSION },
            fix(fixer) {
              return fixer.replaceText(node.id, newName)
            },
          })
        }
      },
    }

    return checkers
  },
}
