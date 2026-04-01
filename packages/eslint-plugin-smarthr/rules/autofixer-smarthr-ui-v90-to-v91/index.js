const DIALOG_COMPONENTS = {
  ActionDialog: 'ControlledActionDialog',
  FormDialog: 'ControlledFormDialog',
  MessageDialog: 'ControlledMessageDialog',
  StepFormDialog: 'ControlledStepFormDialog',
}

const STATUS_ICON_MAP = {
  info: 'FaCircleInfoIcon',
  success: 'FaCircleCheckIcon',
  warning: 'WarningIcon',
  error: 'FaCircleExclamationIcon',
  sync: 'FaRotateIcon',
}

module.exports = {
  meta: {
    type: 'problem',
    fixable: 'code',
    messages: {
      renameDialog: 'smarthr-ui v91 では {{old}} が {{new}} にリネームされました',
      renameType: 'ResponseMessage の type 属性は status にリネームされました',
      removeRight: 'ResponseMessage の right 属性は削除されました。このエラーが表示された場合は @group-smarthrui-core に連絡してください',
      removeIconGap: 'ResponseMessage の iconGap 属性は削除されました。親コンポーネント（Heading/FormControl/Fieldset）で icon.gap を使用してください',
      removeArbitraryDisplayName: 'AppHeader の arbitraryDisplayName 属性は削除されました。email, empCode, firstName, lastName から自動生成されます',
    },
  },
  create(context) {
    const sourceCode = context.getSourceCode()

    return {
      // 1. Dialog コンポーネントのリネーム (import)
      ImportDeclaration(node) {
        if (node.source.value !== 'smarthr-ui') return

        node.specifiers.forEach((specifier) => {
          if (specifier.type !== 'ImportSpecifier') return

          const importedName = specifier.imported.name
          const newName = DIALOG_COMPONENTS[importedName]

          if (newName) {
            context.report({
              node: specifier,
              messageId: 'renameDialog',
              data: { old: importedName, new: newName },
              fix(fixer) {
                return fixer.replaceText(specifier.imported, newName)
              },
            })
          }
        })
      },

      // 1. Dialog コンポーネントのリネーム (JSX)
      'JSXOpeningElement[name.name=/^(ActionDialog|FormDialog|MessageDialog|StepFormDialog)$/]'(node) {
        const componentName = node.name.name
        const newName = DIALOG_COMPONENTS[componentName]

        if (newName) {
          context.report({
            node,
            messageId: 'renameDialog',
            data: { old: componentName, new: newName },
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

      // 2, 3, 4. ResponseMessage の属性
      'JSXOpeningElement[name.name=/ResponseMessage$/]'(node) {
        node.attributes.forEach((attr) => {
          if (attr.type !== 'JSXAttribute') return

          const attrName = attr.name.name

          // 2. type → status
          if (attrName === 'type') {
            context.report({
              node: attr,
              messageId: 'renameType',
              fix(fixer) {
                return fixer.replaceText(attr.name, 'status')
              },
            })
          }

          // 3. right 削除（エラーのみ）
          if (attrName === 'right') {
            context.report({
              node: attr,
              messageId: 'removeRight',
            })
          }

          // 4. iconGap 削除
          if (attrName === 'iconGap') {
            context.report({
              node: attr,
              messageId: 'removeIconGap',
              fix(fixer) {
                // 属性とその前のスペースを削除
                const tokenBefore = sourceCode.getTokenBefore(attr)
                if (tokenBefore && tokenBefore.range[1] < attr.range[0]) {
                  return fixer.removeRange([tokenBefore.range[1], attr.range[1]])
                }
                return fixer.remove(attr)
              },
            })
          }
        })
      },

      // 5. AppHeader の arbitraryDisplayName 削除
      'JSXOpeningElement[name.name="AppHeader"] > JSXAttribute[name.name="arbitraryDisplayName"]'(node) {
        context.report({
          node,
          messageId: 'removeArbitraryDisplayName',
          fix(fixer) {
            // 属性とその前のスペースを削除
            const tokenBefore = sourceCode.getTokenBefore(node)
            if (tokenBefore && tokenBefore.range[1] < node.range[0]) {
              return fixer.removeRange([tokenBefore.range[1], node.range[1]])
            }
            return fixer.remove(node)
          },
        })
      },
    }

  },
}
