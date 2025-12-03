const NUMBERED_TEXT_REGEX = /^[\s\n]*(([0-9])([^0-9]{2})[^\s\n]*)/
const ORDERED_LIST_REGEX = /(Ordered(.*)List|^ol)$/
const SELECT_REGEX = /(S|s)elect$/
const IGNORE_ATTRIBUTE_VALUE_REGEX = /^[0-9]+(px|em|ex|ch|rem|lh|rlh|vw|vh|vmin|vmax|vb|vi|svw|svh|lvw|lvh|dvw|dvh|%)?$/
const AS_ATTRIBUTE_REGEX = /^(as|forwardedAs)$/

const findAsOlAttr = (a) => a.type === 'JSXAttribute' && AS_ATTRIBUTE_REGEX.test(a.name?.name) && a.value?.value === 'ol'

const searchOrderedList = (node) => {
  if (node.type === 'JSXElement' && node.openingElement.name?.name) {
    const name = node.openingElement.name.name

    if (SELECT_REGEX.test(name)) {
      // HINT: select要素の場合、optionのラベルに連番がついている場合がありえるのでignoreする
      // 通常と処理を分けるためnullではなく0を返す
      return 0
    } else if (
      ORDERED_LIST_REGEX.test(name) ||
      node.openingElement.attributes.find(findAsOlAttr)
    ) {
      return node.openingElement
    }
  }

  if (node.type === 'Program') {
    return null
  }

  return searchOrderedList(node.parent)
}

const checkNumberedTextInOl = (result, node, context) => {
  if (result) {
    context.report({
      node,
      message: `${result.name.name} 内で連番がテキストとして記述されています。連番はol要素で表現できるため、削除してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-numbered-text-within-ol
 - ol要素のデフォルトで表示される連番のフォーマット、スタイルから変更したい場合、counter-reset と counter-increment を利用してください
   - 参考: [MDN CSS カウンターの使用](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_counter_styles/Using_CSS_counters)`,
    })
  }
}

const renderTag = (node) => `\`${node.name.name}="${node.value.value}"\``
const renderNode = (node, matcher) => node.type === 'JSXText' ? `\`${matcher[1]}\`` : renderTag(node)

const SCHEMA = []

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
  },
  create(context) {
    let firstNumber = 0
    let firstNumberedNode = null
    let firstNumberedMatcher = null

    function checker(node, matcher) {
      if (matcher) {
        const result = searchOrderedList(node)

        if (result !== 0) {
          checkNumberedTextInOl(result, node, context)

          const nowNumber = matcher[2] * 1

          if (firstNumberedNode && nowNumber !== firstNumber) {
            if (nowNumber === firstNumber + 1) {
              const resultFirst = searchOrderedList(firstNumberedNode)

              if (!resultFirst) {
                if (!result) {
                  context.report({
                    node: firstNumberedNode,
                    message: `連番を含むテキストがol要素でマークアップされていません。ol要素でマークアップすることで関連する順番に意味のある要素を適切にマークアップできるため以下の方法で修正してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-numbered-text-within-ol
 - ${renderNode(firstNumberedNode, firstNumberedMatcher)} と ${renderNode(node, matcher)} が同じol要素内に存在するように修正してください
 - 上記以外にも関連する連番をふくむ要素が存在する場合、それらも同じol内に存在する必要があります`,
                  })
                } else {
                  context.report({
                    node: firstNumberedNode,
                    message: `連番を含むテキストがol要素でマークアップされていません。ol要素でマークアップすることで関連する順番に意味のある要素を適切にマークアップできるため以下の方法で修正してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-numbered-text-within-ol
 - ${renderNode(firstNumberedNode, firstNumberedMatcher)} が ${renderNode(node, matcher)} を囲んでいるol要素内(<${result.name.name}>)に存在するように修正してください
 - 上記以外にも関連する連番をふくむ要素が存在する場合、それらも同じol要素内(<${result.name.name}>)に存在する必要があります`,
                  })
                }
              } else {
                if (!result) {
                  context.report({
                    node,
                    message: `連番を含むテキストがol要素でマークアップされていません。ol要素でマークアップすることで関連する順番に意味のある要素を適切にマークアップできるため以下の方法で修正してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-numbered-text-within-ol
 - ${renderNode(node, matcher)} が ${renderNode(firstNumberedNode, firstNumberedMatcher)} を囲んでいるol要素内(<${resultFirst.name.name}>)に存在するように修正してください
 - 上記以外にも関連する連番をふくむ要素が存在する場合、それらも同じol要素内(<${resultFirst.name.name}>)に存在する必要があります`,
                  })

                  firstNumberedNode = null
                } else if (resultFirst !== result) {
                  context.report({
                    node,
                    message: `連番を含むテキストが同一のol要素でマークアップされていません。同一のol要素でマークアップすることでリスト内の要素関連性を正しく表せるためマークアップの修正を行ってください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-numbered-text-within-ol
 - ${renderNode(firstNumberedNode, firstNumberedMatcher)} と ${renderNode(node, matcher)} が同じol要素内に存在するように修正してください
 - 上記以外にも関連する連番をふくむ要素が存在する場合、それらも同じol内に存在する必要があります`,
                  })
                }
              }
            }

            firstNumber = nowNumber
            firstNumberedNode = node
            firstNumberedMatcher = matcher
          } else if (!firstNumberedNode || nowNumber === firstNumber) {
            firstNumber = nowNumber
            firstNumberedNode = node
            firstNumberedMatcher = matcher
          }
        }
      }
    }

    return {
      JSXAttribute: (node) => {
        if (node.value?.value && !IGNORE_ATTRIBUTE_VALUE_REGEX.test(node.value.value)) {
          checker(node, node.value.value.match(NUMBERED_TEXT_REGEX))
        }
      },
      JSXText: (node) => {
        checker(node, node.value.match(NUMBERED_TEXT_REGEX))
      },
    }
  },
}
module.exports.schema = SCHEMA
