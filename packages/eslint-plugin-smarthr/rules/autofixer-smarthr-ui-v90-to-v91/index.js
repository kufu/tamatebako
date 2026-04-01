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

          // 4. iconGap 削除と移行
          if (attrName === 'iconGap') {
            handleIconGapMigration(node, attr)
          }
        })
      },

      // 5. AppHeader の arbitraryDisplayName 削除
      'JSXOpeningElement[name.name="AppHeader"] > JSXAttribute[name.name="arbitraryDisplayName"]'(node) {
        context.report({
          node,
          messageId: 'removeArbitraryDisplayName',
          fix(fixer) {
            return fixer.remove(node)
          },
        })
      },
    }

    function handleIconGapMigration(responseMessageNode, iconGapAttr) {
      // ResponseMessage の属性を取得
      const statusAttr = responseMessageNode.attributes.find(
        (a) => a.type === 'JSXAttribute' && a.name.name === 'status'
      )
      const typeAttr = responseMessageNode.attributes.find(
        (a) => a.type === 'JSXAttribute' && a.name.name === 'type'
      )

      const statusValue = getAttributeValue(statusAttr || typeAttr) || 'info'
      const iconGapValue = getAttributeValue(iconGapAttr)

      // 親を遡って Heading/FormControl/Fieldset を探す
      const parent = findParentComponent(responseMessageNode)

      if (!parent) {
        // パターンC: 適切な親が見つからない → iconGap のみ削除
        context.report({
          node: iconGapAttr,
          messageId: 'removeIconGap',
          fix(fixer) {
            return fixer.remove(iconGapAttr)
          },
        })
        return
      }

      // ResponseMessage の children を取得
      const responseMessageElement = responseMessageNode.parent
      const children = getJSXElementChildren(responseMessageElement)

      if (parent.hasIcon) {
        // パターンA: 親に icon がある
        context.report({
          node: iconGapAttr,
          messageId: 'removeIconGap',
          fix(fixer) {
            return fixIconGapWithParentIcon(
              fixer,
              parent,
              responseMessageElement,
              children,
              iconGapValue
            )
          },
        })
      } else {
        // パターンB: 親に icon がない
        const iconName = STATUS_ICON_MAP[statusValue]
        context.report({
          node: iconGapAttr,
          messageId: 'removeIconGap',
          fix(fixer) {
            return fixIconGapWithoutParentIcon(
              fixer,
              parent,
              responseMessageElement,
              children,
              iconName,
              iconGapValue
            )
          },
        })
      }
    }

    function findParentComponent(node) {
      let current = node.parent

      while (current) {
        if (current.type === 'Program') break

        if (current.type === 'JSXElement' && current.openingElement.name.type === 'JSXIdentifier') {
          const name = current.openingElement.name.name

          if (name === 'Heading') {
            const iconAttr = current.openingElement.attributes.find(
              (a) => a.type === 'JSXAttribute' && a.name.name === 'icon'
            )
            return {
              type: 'Heading',
              node: current.openingElement,
              iconAttr,
              hasIcon: !!iconAttr,
            }
          }

          if (name === 'FormControl') {
            const labelAttr = current.openingElement.attributes.find(
              (a) => a.type === 'JSXAttribute' && a.name.name === 'label'
            )
            if (labelAttr && isResponseMessageInAttribute(labelAttr, node)) {
              const iconAttr = getLabelIconAttribute(labelAttr)
              return {
                type: 'FormControl',
                node: current.openingElement,
                labelAttr,
                iconAttr,
                hasIcon: !!iconAttr,
              }
            }
          }

          if (name === 'Fieldset') {
            const legendAttr = current.openingElement.attributes.find(
              (a) => a.type === 'JSXAttribute' && a.name.name === 'legend'
            )
            if (legendAttr && isResponseMessageInAttribute(legendAttr, node)) {
              const iconAttr = getLabelIconAttribute(legendAttr)
              return {
                type: 'Fieldset',
                node: current.openingElement,
                legendAttr,
                iconAttr,
                hasIcon: !!iconAttr,
              }
            }
          }
        }

        current = current.parent
      }

      return null
    }

    function isResponseMessageInAttribute(attr, responseMessageNode) {
      // attr.value の中に responseMessageNode が含まれているかチェック
      let current = responseMessageNode
      while (current) {
        if (current === attr) return true
        current = current.parent
      }
      return false
    }

    function getLabelIconAttribute(labelAttr) {
      // label={{ text: ..., icon: ... }} の形式から icon を取得
      if (
        labelAttr.value &&
        labelAttr.value.type === 'JSXExpressionContainer' &&
        labelAttr.value.expression.type === 'ObjectExpression'
      ) {
        const iconProp = labelAttr.value.expression.properties.find(
          (p) => p.type === 'Property' && p.key.name === 'icon'
        )
        return iconProp
      }
      return null
    }

    function getAttributeValue(attr) {
      if (!attr || !attr.value) return null

      if (attr.value.type === 'Literal') {
        return attr.value.value
      }

      if (attr.value.type === 'JSXExpressionContainer') {
        const expr = attr.value.expression
        if (expr.type === 'Literal') {
          return expr.value
        }
        // 変数や式の場合は文字列として取得
        return sourceCode.getText(expr)
      }

      return null
    }

    function getJSXElementChildren(element) {
      if (!element.children || element.children.length === 0) return null

      // JSXText や JSXExpressionContainer の内容を取得
      return element.children
        .map((child) => sourceCode.getText(child))
        .join('')
        .trim()
    }

    function fixIconGapWithParentIcon(fixer, parent, responseMessageElement, children, iconGapValue) {
      const fixes = []

      // ResponseMessage を children に置き換え
      fixes.push(fixer.replaceText(responseMessageElement, children))

      // 親の icon 属性を object 形式に変換
      const iconValue = sourceCode.getText(parent.iconAttr.value)
      const newIconValue = `{{ prefix: ${iconValue.replace(/^{|}$/g, '')}, gap: ${iconGapValue} }}`
      fixes.push(fixer.replaceText(parent.iconAttr.value, newIconValue))

      return fixes
    }

    function fixIconGapWithoutParentIcon(fixer, parent, responseMessageElement, children, iconName, iconGapValue) {
      const fixes = []

      // ResponseMessage を children に置き換え
      fixes.push(fixer.replaceText(responseMessageElement, children))

      // 親に icon 属性を追加
      const iconAttrText = ` icon={{ prefix: <${iconName} />, gap: ${iconGapValue} }}`

      if (parent.type === 'Heading') {
        // Heading の場合
        fixes.push(fixer.insertTextAfter(parent.node.name, iconAttrText))
      } else {
        // FormControl/Fieldset の場合は label/legend を object 形式に変換
        const attrName = parent.type === 'FormControl' ? 'label' : 'legend'
        const attr = parent.labelAttr || parent.legendAttr
        const currentValue = sourceCode.getText(attr.value)
        const newValue = `{{ text: ${currentValue}, icon: { prefix: <${iconName} />, gap: ${iconGapValue} } }}`
        fixes.push(fixer.replaceText(attr.value, newValue))
      }

      return fixes
    }
  },
}
