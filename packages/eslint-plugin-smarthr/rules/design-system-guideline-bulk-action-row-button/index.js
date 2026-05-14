const SCHEMA = []

const MESSAGE_USE_BUTTON_TERTIARY = `BulkActionRow内の「すべてのオブジェクトの選択」機能にはButton[variant="tertiary"]を使用してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-bulk-action-row-button
 - BulkActionRowで使用する「すべてのオブジェクトの選択」ボタンは、Button[variant="tertiary"]を使用することで、BulkActionRowの背景色に対してコントラスト比4.5:1を確保できます。
 - 現在の要素: {currentElement}
 - 参考: 
  - https://smarthr.design/products/design-patterns/table-bulk-action/#h4-2
  - https://smarthr.design/products/components/table/#h3-2`

const MESSAGE_WRONG_VARIANT = `BulkActionRow内の「すべてのオブジェクトの選択」ボタンにはvariant="tertiary"を指定してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-bulk-action-row-button
 - Button[variant="tertiary"]を使用することで、BulkActionRowの背景色に対してコントラスト比4.5:1を確保できます。
 - 現在: Button[variant="{currentVariant}"]
 - 参考: 
  - https://smarthr.design/products/design-patterns/table-bulk-action/#h4-2
  - https://smarthr.design/products/components/table/#h3-2`

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
  },
  create(context) {
    return {
      JSXElement(node) {
        const elementName = node.openingElement.name.name

        // インタラクティブ要素（ボタン、リンクなど）のみをチェック
        if (!isInteractiveElement(elementName)) {
          return
        }

        // この要素がBulkActionRow内にあるかチェック
        if (!isInsideBulkActionRow(node.openingElement)) {
          return
        }

        // これが「すべてのオブジェクトの選択」要素かチェック
        if (!isSelectAllButton(node)) {
          return
        }

        // Buttonコンポーネントの場合、variantをチェック
        if (elementName === 'Button') {
          // variant属性をチェック
          const variantAttr = node.openingElement.attributes.find(
            (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'variant',
          )

          if (!variantAttr) {
            // variant属性が見つからない - Button[variant="tertiary"]を使用すべき
            context.report({
              node: node.openingElement,
              message: MESSAGE_USE_BUTTON_TERTIARY.replace('{currentElement}', 'Button'),
            })
          } else {
            // variantが"tertiary"かチェック
            const variantValue = getAttributeValue(variantAttr)

            if (variantValue !== 'tertiary') {
              context.report({
                node: node.openingElement,
                message: MESSAGE_WRONG_VARIANT.replace('{currentVariant}', variantValue),
              })
            }
          }
        } else {
          // その他の要素（TextLink、styled-componentなど）の場合、Button[variant="tertiary"]の使用を推奨
          context.report({
            node: node.openingElement,
            message: MESSAGE_USE_BUTTON_TERTIARY.replace('{currentElement}', elementName),
          })
        }
      },
    }
  },
}

module.exports.schema = SCHEMA

/**
 * 要素がインタラクティブ要素（ボタン、リンクなど）かチェック
 * これらの要素のみが「すべてのオブジェクトの選択」パターンのチェック対象となる
 */
function isInteractiveElement(elementName) {
  // 一般的なインタラクティブパターンをチェック
  // Buttonコンポーネント
  if (elementName === 'Button') return true

  // Linkコンポーネント
  if (elementName === 'TextLink' || elementName === 'Link' || elementName.endsWith('Link')) return true

  // Button風コンポーネント（styled-components、カスタムボタンなど）
  if (elementName.includes('Button')) return true

  // HTMLのインタラクティブ要素
  if (elementName === 'button' || elementName === 'a') return true

  return false
}

/**
 * ノードがBulkActionRow要素の内側にあるかチェック
 */
function isInsideBulkActionRow(node) {
  let parent = node.parent

  while (parent) {
    if (
      parent.type === 'JSXElement' &&
      parent.openingElement &&
      parent.openingElement.name &&
      parent.openingElement.name.name === 'BulkActionRow'
    ) {
      return true
    }
    parent = parent.parent
  }

  return false
}

/**
 * このボタンが「すべてのオブジェクトの選択」ボタンかチェック
 * テキストに「〜件すべてを選択」パターンが含まれているかで判定
 */
function isSelectAllButton(node) {
  const text = getButtonText(node)
  // テキストに「すべて」と「選択」のキーワードが含まれているかチェック
  // 「すべてのオブジェクトを選択」のデザインパタンでは、「一覧の{オブジェクト名}{件数}件すべてを選択」または「一覧の{オブジェクト名}すべてを選択」と決められているので、両方のキーワードが含まれているかで判定する
  // 参考: https://smarthr.design/products/design-patterns/table-bulk-action/#h3-3
  return /すべて/.test(text) && /選択/.test(text)
}

/**
 * Button要素からすべてのテキストコンテンツを取得
 */
function getButtonText(buttonNode) {
  let text = ''

  function traverse(node) {
    if (!node) return

    // JSXTextノード
    if (node.type === 'JSXText') {
      text += node.value
      return
    }

    // JSXExpressionContainer内のLiteral
    if (node.type === 'JSXExpressionContainer' && node.expression) {
      if (node.expression.type === 'Literal') {
        text += String(node.expression.value)
        return
      }
      // テンプレートリテラル
      if (node.expression.type === 'TemplateLiteral') {
        node.expression.quasis.forEach((quasi) => {
          text += quasi.value.cooked || quasi.value.raw
        })
        return
      }
    }

    // 再帰的に子要素を走査
    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  if (buttonNode.children) {
    buttonNode.children.forEach(traverse)
  }

  return text
}

/**
 * JSXAttributeの値を取得
 */
function getAttributeValue(attr) {
  if (!attr.value) return null

  if (attr.value.type === 'Literal') {
    return attr.value.value
  }

  if (attr.value.type === 'JSXExpressionContainer') {
    if (attr.value.expression.type === 'Literal') {
      return attr.value.expression.value
    }
  }

  return null
}
