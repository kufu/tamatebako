const SCHEMA = []

const ERROR_MESSAGE = `ResponseMessageは見出しやラベルでは使用できません。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-response-message
 - ResponseMessageはAPIの実行結果を表示する目的のコンポーネントです
 - 見出しやラベルにアイコンを表示したい場合は、Headingのicon属性、FormControlのlabel.icon属性、Fieldsetのlegend.icon属性、またはsmarthr-ui/Textを使用してください`

// status/type値とアイコンのマッピング（smarthr-uiの仕様に基づく）
const STATUS_ICON_MAP = {
  info: 'FaCircleInfoIcon',
  success: 'FaCircleCheckIcon',
  warning: 'WarningIcon',
  error: 'FaCircleExclamationIcon',
  sync: 'FaRotateIcon',
}

// 正規表現パターン（速度最適化のため事前に定義）
const H_TAG_PATTERN = 'h[1-6]'
const HEADING_TAG_REGEX = new RegExp(`^${H_TAG_PATTERN}$`)
const HEADING_PATTERN = `((^${H_TAG_PATTERN})|(Page)?Heading)$`

// セレクタパターン
const RESPONSE_MESSAGE = 'JSXOpeningElement[name.name=/ResponseMessage$/]'
const LABEL_LEGEND = '/^(label|legend)$/'

const SELECTOR = `:matches(JSXElement[openingElement.name.name=/${HEADING_PATTERN}/] ${RESPONSE_MESSAGE}, JSXOpeningElement[name.name=/^(FormControl|Fieldset)$/] > JSXAttribute[name.name=${LABEL_LEGEND}] JSXExpressionContainer ${RESPONSE_MESSAGE}, JSXElement[openingElement.name.name=${LABEL_LEGEND}] ${RESPONSE_MESSAGE})`

// ============================================================
// ヘルパー関数（速度最適化のためcreate外で定義）
// ============================================================

/**
 * label/legend属性のオブジェクト形式からicon属性を取得
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
    return iconProp || null
  }
  return null
}

/**
 * 属性値を取得
 */
function getAttributeValue(attr, sourceCode) {
  if (!attr || !attr.value) return null

  if (attr.value.type === 'Literal') {
    return attr.value.value
  }

  if (attr.value.type === 'JSXExpressionContainer') {
    const expr = attr.value.expression
    if (expr.type === 'Literal') {
      return expr.value
    }
    return sourceCode.getText(expr)
  }

  return null
}

/**
 * JSX要素の子要素をテキストとして取得
 */
function getJSXElementChildren(element, sourceCode) {
  if (!element.children || element.children.length === 0) return ''

  return element.children
    .map((child) => sourceCode.getText(child))
    .join('')
    .trim()
}

/**
 * Heading要素の子要素を取得し、ResponseMessageをその子要素で置き換え
 */
function getHeadingChildrenWithResponseMessageReplaced(headingElement, responseMessageElement, sourceCode) {
  if (!headingElement.children || headingElement.children.length === 0) return ''

  return headingElement.children
    .map((child) => {
      // ResponseMessage要素の場合は、その子要素のテキストに置き換え
      if (child === responseMessageElement) {
        return getJSXElementChildren(responseMessageElement, sourceCode)
      }
      return sourceCode.getText(child)
    })
    .join('')
    .trim()
}

/**
 * ResponseMessageの親要素を遡ってHeading/FormControl/Fieldset/label/legendを探す
 */
function findParentComponent(node) {
  let current = node.parent

  while (current) {
    if (current.type === 'Program') break

    if (current.type === 'JSXElement' && current.openingElement.name.type === 'JSXIdentifier') {
      const name = current.openingElement.name.name

      // Heading/PageHeadingコンポーネント
      if (name === 'Heading' || name === 'PageHeading') {
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

      // FormControlコンポーネントのlabel属性内
      if (name === 'FormControl') {
        const labelAttr = current.openingElement.attributes.find(
          (a) => a.type === 'JSXAttribute' && a.name.name === 'label'
        )
        if (labelAttr) {
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

      // Fieldsetコンポーネントのlegend属性内
      if (name === 'Fieldset') {
        const legendAttr = current.openingElement.attributes.find(
          (a) => a.type === 'JSXAttribute' && a.name.name === 'legend'
        )
        if (legendAttr) {
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

      // h1-h6要素
      if (HEADING_TAG_REGEX.test(name)) {
        return {
          type: 'heading',
          element: current,
          node: current.openingElement,
          tagName: name,
        }
      }

      // label要素
      if (name === 'label') {
        return {
          type: 'label',
          element: current,
          node: current.openingElement,
        }
      }

      // legend要素
      if (name === 'legend') {
        return {
          type: 'legend',
          element: current,
          node: current.openingElement,
        }
      }
    }

    current = current.parent
  }

  return null
}

/**
 * ResponseMessageを適切な形式に修正
 */
function fixResponseMessage(fixer, parent, responseMessageElement, children, iconName, iconGapValue) {
  const gap = iconGapValue !== undefined ? iconGapValue : 0.5

  if (parent.type === 'Heading') {
    // Heading/PageHeading の場合
    if (parent.hasIcon) {
      // 既にicon属性がある場合は自動修正しない
      return null
    }
    // Heading要素の開始タグの終わりから終了タグの開始までを置き換え
    const openingElement = parent.node
    const closingElement = parent.element.closingElement
    const rangeStart = openingElement.range[1]
    const rangeEnd = closingElement.range[0]

    return [
      fixer.replaceTextRange([rangeStart, rangeEnd], children),
      fixer.insertTextAfter(openingElement.name, ` icon={{ prefix: <${iconName} />, gap: ${gap} }}`),
    ]
  } else if (parent.type === 'FormControl' || parent.type === 'Fieldset') {
    // FormControl/Fieldset の場合
    if (parent.hasIcon) {
      // 既にicon属性がある場合は自動修正しない
      return null
    }
    const attr = parent.labelAttr || parent.legendAttr
    const newValue = `{{ text: ${children}, icon: { prefix: <${iconName} />, gap: ${gap} } }}`
    return fixer.replaceText(attr.value, newValue)
  } else if (parent.type === 'heading' || parent.type === 'label' || parent.type === 'legend') {
    // h1-h6, label, legend要素の場合はTextコンポーネントに置き換え
    return fixer.replaceText(
      responseMessageElement,
      `<Text icon={{ prefix: <${iconName} />, gap: ${gap} }}>${children}</Text>`
    )
  }

  return null
}

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    fixable: 'code',
    schema: SCHEMA,
  },
  create(context) {
    const sourceCode = context.getSourceCode()

    return {
      [SELECTOR]: (node) => {
        // ResponseMessageの親要素を特定
        const parent = findParentComponent(node)

        if (!parent) {
          // 親が特定できない場合はエラーのみ
          context.report({
            node,
            message: ERROR_MESSAGE,
          })
          return
        }

        // ResponseMessage要素の情報を取得
        const responseMessageElement = node.parent

        // Heading要素の場合は、Heading全体の子要素を取得してResponseMessageを置き換え
        // それ以外の場合は、ResponseMessageの子要素のみを取得
        const children = parent.type === 'Heading'
          ? getHeadingChildrenWithResponseMessageReplaced(parent.element, responseMessageElement, sourceCode)
          : getJSXElementChildren(responseMessageElement, sourceCode)

        // status/type属性とiconGap属性を一度に取得（速度最適化）
        let statusAttr = null
        let iconGapAttr = null
        for (const attr of node.attributes) {
          if (attr.type !== 'JSXAttribute') continue
          const attrName = attr.name.name
          if (attrName === 'status' || attrName === 'type') {
            statusAttr = attr
          } else if (attrName === 'iconGap') {
            iconGapAttr = attr
          }
          // 両方見つかったら早期終了
          if (statusAttr && iconGapAttr) break
        }

        const statusValue = getAttributeValue(statusAttr, sourceCode) || 'info'
        const iconGapValue = iconGapAttr ? getAttributeValue(iconGapAttr, sourceCode) : undefined

        // アイコン名を決定
        const iconName = STATUS_ICON_MAP[statusValue] || 'FaCircleInfoIcon'

        context.report({
          node,
          message: ERROR_MESSAGE,
          fix(fixer) {
            return fixResponseMessage(
              fixer,
              parent,
              responseMessageElement,
              children,
              iconName,
              iconGapValue
            )
          },
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
