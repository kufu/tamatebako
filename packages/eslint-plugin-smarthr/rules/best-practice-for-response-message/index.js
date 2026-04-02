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
const HEADING_PATTERN = `((^${H_TAG_PATTERN})|Heading)$`
const HEADING_TAG_REGEX = /^h[1-6]$/
const HEADING_COMPONENT_REGEX = /Heading$/

// セレクタパターン
const RESPONSE_MESSAGE = 'JSXOpeningElement[name.name=/ResponseMessage$/]'
const LABEL_LEGEND = '/^(label|legend)$/'

const SELECTOR = `:matches(JSXElement[openingElement.name.name=/${HEADING_PATTERN}/] ${RESPONSE_MESSAGE}, JSXOpeningElement[name.name=/^(FormControl|Fieldset)$/] > JSXAttribute[name.name=${LABEL_LEGEND}] JSXExpressionContainer ${RESPONSE_MESSAGE}, JSXElement[openingElement.name.name=${LABEL_LEGEND}] ${RESPONSE_MESSAGE})`

// ============================================================
// ヘルパー関数（速度最適化のためcreate外で定義）
// ============================================================

/**
 * label/legend属性のオブジェクト形式からicon属性を取得
 *
 * SELECTORがJSXExpressionContainerを保証するため、value/expressionは必ず存在
 */
function getLabelIconAttribute(labelAttr) {
  return labelAttr.value.expression.properties?.find((p) => p.key?.name === 'icon') || null
}

/**
 * 属性値を取得
 */
function getAttributeValue(attr, sourceCode) {
  if (attr?.value) {
    switch (attr.value.type) {
      case 'Literal':
        return attr.value.value
      case 'JSXExpressionContainer':
        return attr.value.expression.type === 'Literal'
          ? attr.value.expression.value
          : sourceCode.getText(attr.value.expression)
    }
  }
  return null
}

/**
 * JSX要素の子要素をテキストとして取得
 */
function getJSXElementChildren(element, sourceCode) {
  if (!element.children?.length) return ''
  return element.children.reduce((acc, child) => acc + sourceCode.getText(child), '').trim()
}

/**
 * Heading要素の子要素を取得し、ResponseMessageをその子要素で置き換え
 */
function getHeadingChildrenWithResponseMessageReplaced(headingElement, responseMessageElement, sourceCode) {
  if (!headingElement.children?.length) return ''
  return headingElement.children.reduce((acc, child) => {
    // ResponseMessage要素の場合は、その子要素のテキストに置き換え
    return child === responseMessageElement
      ? acc + getJSXElementChildren(responseMessageElement, sourceCode)
      : acc + sourceCode.getText(child)
  }, '').trim()
}

/**
 * ResponseMessageの親要素を遡ってHeading/FormControl/Fieldset/label/legendを探す
 */
function findParentComponent(current) {
  if (current.type !== 'JSXElement' || current.openingElement.name.type !== 'JSXIdentifier') {
    return findParentComponent(current.parent)
  }

  const name = current.openingElement.name.name
  const base = {
    element: current,
    node: current.openingElement,
  }

  // h1-h6要素（Textコンポーネントに置き換える）
  if (HEADING_TAG_REGEX.test(name)) {
    return base
  }

  // Heading/PageHeadingコンポーネント
  if (HEADING_COMPONENT_REGEX.test(name)) {
    return {
      ...base,
      iconAttr: current.openingElement.attributes.find(
        (a) => a.type === 'JSXAttribute' && a.name.name === 'icon'
      ),
    }
  }

  // 完全一致はswitchで最適化
  switch (name) {
    case 'FormControl':
    case 'Fieldset':
      const attrName = name === 'FormControl' ? 'label' : 'legend'
      const attr = current.openingElement.attributes.find(
        (a) => a.type === 'JSXAttribute' && a.name.name === attrName
      )
      if (attr) {
        return {
          ...base,
          attr,
          iconAttr: getLabelIconAttribute(attr),
        }
      }
      return findParentComponent(current.parent)
    case 'label':
    case 'legend':
      return base
  }

  return findParentComponent(current.parent)
}

/**
 * ResponseMessageを適切な形式に修正
 */
function fixResponseMessage(fixer, parent, responseMessageElement, children, iconName, iconGapValue) {
  // 既にicon属性がある場合は自動修正しない（早期リターン）
  if (parent.iconAttr) {
    return null
  }

  const gap = iconGapValue !== undefined ? iconGapValue : 0.5
  const iconTemplate = `{ prefix: <${iconName} />, gap: ${gap} }`

  if (parent.attr) {
    // FormControl/Fieldset の場合
    return fixer.replaceText(parent.attr.value, `{{ text: ${children}, icon: ${iconTemplate} }}`)
  } else if ('iconAttr' in parent) {
    // Heading/PageHeading の場合
    const openingElement = parent.node
    const closingElement = parent.element.closingElement
    return [
      fixer.replaceTextRange([openingElement.range[1], closingElement.range[0]], children),
      fixer.insertTextAfter(openingElement.name, ` icon={${iconTemplate}}`),
    ]
  } else {
    // h1-h6, label, legend要素の場合はTextコンポーネントに置き換え
    return fixer.replaceText(responseMessageElement, `<Text icon={${iconTemplate}}>${children}</Text>`)
  }
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
        const parent = findParentComponent(node.parent)

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
        const children = 'iconAttr' in parent && !parent.attr
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
