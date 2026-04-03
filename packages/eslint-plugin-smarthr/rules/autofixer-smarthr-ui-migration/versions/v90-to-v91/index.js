/**
 * smarthr-ui v90 → v91 移行ルール
 *
 * v91での破壊的変更に対応する自動修正を提供します。
 *
 * 対応する破壊的変更:
 * 1. Dialogコンポーネントのリネーム (例: ActionDialog → ControlledActionDialog)
 * 2. ResponseMessage の type → status リネーム
 * 3. ResponseMessage の right 属性削除
 * 4. ResponseMessage の iconGap 属性削除と親コンポーネントへの移行
 * 5. AppHeader の arbitraryDisplayName 属性削除
 *
 * 参考: https://github.com/kufu/smarthr-ui/releases/tag/smarthr-ui-v91.0.0
 */

// ============================================================
// 定数定義
// ============================================================

// 1. Dialogコンポーネントのリネームマッピング
const DIALOG_COMPONENTS = {
  ActionDialog: 'ControlledActionDialog',
  FormDialog: 'ControlledFormDialog',
  MessageDialog: 'ControlledMessageDialog',
  StepFormDialog: 'ControlledStepFormDialog',
}

// 4. ResponseMessageのstatusに対応するアイコンのマッピング
const STATUS_ICON_MAP = {
  info: 'FaCircleInfoIcon',
  success: 'FaCircleCheckIcon',
  warning: 'WarningIcon',
  error: 'FaCircleExclamationIcon',
  sync: 'FaRotateIcon',
}

// v91を示す定数（メッセージで使用）
const TARGET_VERSION = 'v91'

// ============================================================
// モジュールエクスポート
// ============================================================

module.exports = {
  messages: {
    renameDialog: 'smarthr-ui {{to}} では {{old}} が {{new}} にリネームされました',
    renameType: 'ResponseMessage の type 属性は status にリネームされました',
    removeRight: 'ResponseMessage の right 属性は削除されました。このエラーが表示された場合は @group-smarthrui-core に連絡してください',
    removeIconGap: 'ResponseMessage の iconGap 属性は削除されました。親コンポーネント（Heading/FormControl/Fieldset）で icon.gap を使用してください',
    removeIconGapWithParentIcon: 'ResponseMessage の iconGap 属性は削除されました。親コンポーネントに既に icon が設定されているため、手動で調整してください',
    migrateResponseMessage: '見出し/ラベル内の ResponseMessage は親コンポーネントの icon 属性に移行してください',
    migrateResponseMessageWithUnknownAttrs: '見出し/ラベル内の ResponseMessage は親コンポーネントの icon 属性に移行してください。status/iconGap 以外の属性（id, onClick など）がある場合は手動で移行してください',
    removeArbitraryDisplayName: 'AppHeader の arbitraryDisplayName 属性は削除されました。email, empCode, firstName, lastName から自動生成されます',
  },

  createCheckers(context, sourceCode) {
    return {
      // ============================================================
      // 1. Dialogコンポーネントのリネーム
      // ============================================================

      // import文での検出と修正
      // 例: import { ActionDialog } from 'smarthr-ui'
      //  → import { ControlledActionDialog } from 'smarthr-ui'
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
              data: { old: importedName, new: newName, to: TARGET_VERSION },
              fix(fixer) {
                return fixer.replaceText(specifier.imported, newName)
              },
            })
          }
        })
      },

      // JSX要素での検出と修正
      // 例: <ActionDialog>...</ActionDialog>
      //  → <ControlledActionDialog>...</ControlledActionDialog>
      'JSXOpeningElement[name.name=/^(ActionDialog|FormDialog|MessageDialog|StepFormDialog)$/]'(node) {
        const componentName = node.name.name
        const newName = DIALOG_COMPONENTS[componentName]

        if (newName) {
          context.report({
            node,
            messageId: 'renameDialog',
            data: { old: componentName, new: newName, to: TARGET_VERSION },
            fix(fixer) {
              const fixes = [fixer.replaceText(node.name, newName)]

              // 終了タグも修正（<Component></Component> 形式の場合）
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
      // 2, 3, 4. ResponseMessageの属性変更
      // ============================================================

      // ResponseMessageの各属性をチェックして対応
      // - type → status リネーム
      // - right 属性削除
      // - 見出し/ラベル内のResponseMessageを親のicon属性に移行
      'JSXOpeningElement[name.name=/ResponseMessage$/]'(node) {
        let typeAttr = null
        let statusAttr = null
        let iconGapAttr = null
        let rightAttr = null

        // 全属性を収集
        node.attributes.forEach((attr) => {
          if (attr.type !== 'JSXAttribute') return
          const attrName = attr.name.name

          if (attrName === 'type') typeAttr = attr
          if (attrName === 'status') statusAttr = attr
          if (attrName === 'iconGap') iconGapAttr = attr
          if (attrName === 'right') rightAttr = attr
        })

        // 2. type → status リネーム
        if (typeAttr) {
          context.report({
            node: typeAttr,
            messageId: 'renameType',
            fix(fixer) {
              return fixer.replaceText(typeAttr.name, 'status')
            },
          })
        }

        // 3. right 削除（エラーのみ）
        if (rightAttr) {
          context.report({
            node: rightAttr,
            messageId: 'removeRight',
          })
        }

        // 4. 見出し/ラベル内のResponseMessageを移行
        handleResponseMessageMigration(node, statusAttr, typeAttr, iconGapAttr)
      },

      // ============================================================
      // 5. AppHeaderのarbitraryDisplayName属性削除
      // ============================================================

      // arbitraryDisplayName属性を検出して削除
      // 表示名はemail, empCode, firstName, lastNameから自動生成されるため不要
      'JSXOpeningElement[name.name="AppHeader"] > JSXAttribute[name.name="arbitraryDisplayName"]'(node) {
        context.report({
          node,
          messageId: 'removeArbitraryDisplayName',
          fix(fixer) {
            // 属性とその前のスペース/改行を削除
            const tokenBefore = sourceCode.getTokenBefore(node)
            if (tokenBefore && tokenBefore.range[1] < node.range[0]) {
              return fixer.removeRange([tokenBefore.range[1], node.range[1]])
            }
            return fixer.remove(node)
          },
        })
      },
    }

    // ============================================================
    // ヘルパー関数（ResponseMessage移行用）
    // ============================================================

    /**
     * ResponseMessageの移行処理
     *
     * 見出し/ラベル内のResponseMessageを親のicon属性に移行する
     *
     * 以下のパターンに対応:
     * - パターンA: 親にicon属性が既にある → エラーのみ（手動対応が必要）
     * - パターンB: 親にicon属性がない → ResponseMessageと同じUIになるようiconを追加
     * - パターンC: 適切な親がない → iconGap属性があればそれだけ削除
     */
    function handleResponseMessageMigration(responseMessageNode, statusAttr, typeAttr, iconGapAttr) {
      const statusValue = getAttributeValue(statusAttr || typeAttr) || 'info'
      const iconGapValue = iconGapAttr ? getAttributeValue(iconGapAttr) : undefined

      // 親を遡って Heading/FormControl/Fieldset を探す
      const parent = findParentComponent(responseMessageNode)

      if (!parent) {
        // パターンC: 適切な親が見つからない
        if (iconGapAttr) {
          // iconGap属性がある場合はそれだけ削除
          context.report({
            node: iconGapAttr,
            messageId: 'removeIconGap',
            fix(fixer) {
              const tokenBefore = sourceCode.getTokenBefore(iconGapAttr)
              if (tokenBefore && tokenBefore.range[1] < iconGapAttr.range[0]) {
                return fixer.removeRange([tokenBefore.range[1], iconGapAttr.range[1]])
              }
              return fixer.remove(iconGapAttr)
            },
          })
        }
        return
      }

      // ResponseMessage の children を取得
      const responseMessageElement = responseMessageNode.parent
      const children = getJSXElementChildren(responseMessageElement)

      // 未知の属性をチェック（status/type/iconGap 以外の属性）
      const hasUnknownAttrs = hasUnknownAttributes(responseMessageNode, statusAttr, typeAttr, iconGapAttr)

      if (parent.hasIcon) {
        // パターンA: 親に icon がある → エラーのみ（自動修正なし）
        context.report({
          node: iconGapAttr || responseMessageNode,
          messageId: iconGapAttr ? 'removeIconGapWithParentIcon' : 'migrateResponseMessage',
        })
      } else if (hasUnknownAttrs) {
        // 未知の属性がある → エラーのみ（自動修正なし）
        context.report({
          node: iconGapAttr || responseMessageNode,
          messageId: 'migrateResponseMessageWithUnknownAttrs',
        })
      } else {
        // パターンB: 親に icon がない → ResponseMessage の UI を再現
        const iconName = STATUS_ICON_MAP[statusValue]
        context.report({
          node: iconGapAttr || responseMessageNode,
          messageId: iconGapAttr ? 'removeIconGap' : 'migrateResponseMessage',
          fix(fixer) {
            return fixResponseMessageMigration(
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

    /**
     * ResponseMessageに未知の属性があるかチェック
     *
     * @param {Object} responseMessageNode - ResponseMessageのASTノード
     * @param {Object} statusAttr - status属性のノード
     * @param {Object} typeAttr - type属性のノード
     * @param {Object} iconGapAttr - iconGap属性のノード
     * @returns {boolean} 未知の属性がある場合true
     */
    function hasUnknownAttributes(responseMessageNode, statusAttr, typeAttr, iconGapAttr) {
      const knownAttrs = new Set([statusAttr, typeAttr, iconGapAttr].filter(Boolean))

      for (const attr of responseMessageNode.attributes) {
        if (attr.type !== 'JSXAttribute') continue
        if (!knownAttrs.has(attr)) {
          return true
        }
      }

      return false
    }

    /**
     * ResponseMessageの親要素を遡ってHeading/FormControl/Fieldsetを探す
     *
     * @param {Object} node - ResponseMessage要素のASTノード
     * @returns {Object|null} 親コンポーネント情報、見つからない場合はnull
     */
    function findParentComponent(node) {
      let current = node.parent

      // Programノードに到達するまで親を遡る
      while (current) {
        if (current.type === 'Program') break

        if (current.type === 'JSXElement' && current.openingElement.name.type === 'JSXIdentifier') {
          const name = current.openingElement.name.name

          // Headingコンポーネントを検出
          if (name === 'Heading') {
            const iconAttr = current.openingElement.attributes.find(
              (a) => a.type === 'JSXAttribute' && a.name.name === 'icon'
            )
            return {
              type: 'Heading',
              element: current,
              node: current.openingElement,
              iconAttr,
              hasIcon: !!iconAttr,
            }
          }

          // FormControlコンポーネントのlabel属性内を検出
          if (name === 'FormControl') {
            const labelAttr = current.openingElement.attributes.find(
              (a) => a.type === 'JSXAttribute' && a.name.name === 'label'
            )
            if (labelAttr && isResponseMessageInAttribute(labelAttr, node)) {
              const iconAttr = getLabelIconAttribute(labelAttr)
              return {
                type: 'FormControl',
                element: current,
                node: current.openingElement,
                labelAttr,
                iconAttr,
                hasIcon: !!iconAttr,
              }
            }
          }

          // Fieldsetコンポーネントのlegend属性内を検出
          if (name === 'Fieldset') {
            const legendAttr = current.openingElement.attributes.find(
              (a) => a.type === 'JSXAttribute' && a.name.name === 'legend'
            )
            if (legendAttr && isResponseMessageInAttribute(legendAttr, node)) {
              const iconAttr = getLabelIconAttribute(legendAttr)
              return {
                type: 'Fieldset',
                element: current,
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

    /**
     * ResponseMessageが特定の属性の値として使われているかチェック
     *
     * @param {Object} attr - チェック対象の属性ノード
     * @param {Object} responseMessageNode - ResponseMessageのノード
     * @returns {boolean} 属性値内に含まれている場合true
     */
    function isResponseMessageInAttribute(attr, responseMessageNode) {
      let current = responseMessageNode
      while (current) {
        if (current === attr) return true
        current = current.parent
      }
      return false
    }

    /**
     * label/legend属性のオブジェクト形式からicon属性を取得
     *
     * 例: label={{ text: "ラベル", icon: <Icon /> }} の場合、iconプロパティを返す
     *
     * @param {Object} labelAttr - label/legend属性のASTノード
     * @returns {Object|null} iconプロパティ、存在しない場合はnull
     */
    function getLabelIconAttribute(labelAttr) {
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

    /**
     * JSX属性の値を取得
     *
     * @param {Object} attr - 属性のASTノード
     * @returns {string|number|null} 属性値、取得できない場合はnull
     */
    function getAttributeValue(attr) {
      if (!attr || !attr.value) return null

      // 文字列リテラル: status="success"
      if (attr.value.type === 'Literal') {
        return attr.value.value
      }

      // JSX式: status={"success"} または iconGap={0.5}
      if (attr.value.type === 'JSXExpressionContainer') {
        const expr = attr.value.expression
        if (expr.type === 'Literal') {
          return expr.value
        }
        // 変数や式の場合はソースコードをそのまま取得
        return sourceCode.getText(expr)
      }

      return null
    }

    /**
     * JSX要素の子要素をテキストとして取得
     *
     * @param {Object} element - JSX要素のASTノード
     * @returns {string} 子要素のテキスト、空の場合は空文字列
     */
    function getJSXElementChildren(element) {
      if (!element.children || element.children.length === 0) return ''

      return element.children
        .map((child) => sourceCode.getText(child))
        .join('')
        .trim()
    }

    /**
     * ResponseMessageの移行処理（親にicon属性がない場合）
     *
     * ResponseMessageと同じUIを再現するため、親にicon属性を追加する
     *
     * @param {Object} fixer - ESLintのfixer
     * @param {Object} parent - 親コンポーネント情報
     * @param {Object} responseMessageElement - ResponseMessage要素
     * @param {string} children - ResponseMessageの子要素テキスト
     * @param {string} iconName - 追加するアイコン名
     * @param {string|number|undefined} iconGapValue - gap値（undefinedの場合は省略）
     * @returns {Array|Object} fix操作
     */
    function fixResponseMessageMigration(fixer, parent, responseMessageElement, children, iconName, iconGapValue) {
      // gap値がundefinedまたは0.25（デフォルト値）の場合は省略
      const iconTemplate = !iconGapValue || iconGapValue === 0.25 || iconGapValue === '0.25'
        ? `{ prefix: <${iconName} /> }`
        : `{ prefix: <${iconName} />, gap: ${iconGapValue} }`

      if (parent.type === 'Heading') {
        // Heading の場合
        return [
          fixer.replaceText(responseMessageElement, children),
          fixer.insertTextAfter(parent.node.name, ` icon={${iconTemplate}}`),
        ]
      } else {
        // FormControl/Fieldset の場合: label/legend を object 形式に変換
        const attr = parent.labelAttr || parent.legendAttr
        const newValue = `{{ text: ${children}, icon: ${iconTemplate} }}`
        return fixer.replaceText(attr.value, newValue)
      }
    }
  },
}
