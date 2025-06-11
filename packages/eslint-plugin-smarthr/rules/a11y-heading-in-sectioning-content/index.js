const headingRegex = /((^h(1|2|3|4|5|6))|Heading)$/
const pageHeadingRegex = /PageHeading$/
const declaratorHeadingRegex = /Heading$/
const sectioningRegex = /((A(rticle|side))|Nav|Section|^SectioningFragment)$/
const bareTagRegex = /^(article|aside|nav|section)$/
const modelessDialogRegex = /ModelessDialog$/
const layoutComponentRegex = /((C(ent|lust)er)|Reel|Sidebar|Stack|Base(Column)?)$/
const asRegex = /^(as|forwardedAs)$/
const ignoreCheckParentTypeRegex = /^(Program|ExportNamedDeclaration)$/
const noHeadingTagNamesRegex = /^(span|legend)$/
const ignoreHeadingCheckParentTypeRegex = /^(Program|ExportNamedDeclaration)$/
const headingAttributeRegex = /^(heading|title)$/
const ariaLabelRegex = /^aria-label(ledby)?$/

const includeSectioningAsAttr = (a) => asRegex.test(a.name?.name) && bareTagRegex.test(a.value.value)

const headingMessage = `smarthr-ui/Headingと紐づく内容の範囲（アウトライン）が曖昧になっています。
 - smarthr-uiのArticle, Aside, Nav, SectionのいずれかでHeadingコンポーネントと内容をラップしてHeadingに対応する範囲を明確に指定してください。`
const rootHeadingMessage = `${headingMessage}
 - Headingをh1にしたい場合(機能名、ページ名などこのページ内でもっとも重要な見出しの場合)、smarthr-ui/PageHeadingを利用してください。その場合はSectionなどでアウトラインを示す必要はありません。`
const pageHeadingMessage = 'smarthr-ui/PageHeading が同一ファイル内に複数存在しています。PageHeadingはh1タグを出力するため最も重要な見出しにのみ利用してください。'
const pageHeadingInSectionMessage = 'smarthr-ui/PageHeadingはsmarthr-uiのArticle, Aside, Nav, Sectionで囲まないでください。囲んでしまうとページ全体の見出しではなくなってしまいます。'
const noTagAttrMessage = `tag属性を指定せず、smarthr-uiのArticle, Aside, Nav, Sectionのいずれかの自動レベル計算に任せるよう、tag属性を削除してください。
 - tag属性を指定することで意図しないレベルに固定されてしまう可能性があります。`

const VariableDeclaratorBareToSHR = (context, node) => {
  if (!node.init) {
    return
  }

  const tag = node.init.tag || node.init

  if (tag.object?.name === 'styled') {
    const message = reportMessageBareToSHR(tag.property.name, true)

    if (message) {
      context.report({
        node,
        message,
      });
    }
  }
}
const reportMessageBareToSHR = (tagName, visibleExample) => {
  const matcher = tagName.match(bareTagRegex)

  if (matcher) {
    const base = matcher[1]
    const shrComponent = `${base[0].toUpperCase()}${base.slice(1)}`

    return `"${base}"を利用せず、smarthr-ui/${shrComponent}を拡張してください。Headingのレベルが自動計算されるようになります。${visibleExample ? `(例: "styled.${base}" -> "styled(${shrComponent})")` : ''}`
  }
}

const searchBubbleUp = (node) => {
  if (
    node.type === 'Program' ||
    node.type === 'JSXElement' && node.openingElement.name.name && (
      sectioningRegex.test(node.openingElement.name.name) ||
      layoutComponentRegex.test(node.openingElement.name.name) && node.openingElement.attributes.some(includeSectioningAsAttr)
    )
  ) {
    return node
  }

  if (
    // Headingコンポーネントの拡張なので対象外
    node.type === 'VariableDeclarator' && ignoreHeadingCheckParentTypeRegex.test(node.parent.parent?.type) && declaratorHeadingRegex.test(node.id.name) ||
    node.type === 'FunctionDeclaration' && ignoreHeadingCheckParentTypeRegex.test(node.parent.type) && declaratorHeadingRegex.test(node.id.name) ||
    // ModelessDialogのheaderにHeadingを設定している場合も対象外
    node.type === 'JSXAttribute' && node.name.name === 'header' && modelessDialogRegex.test(node.parent.name.name)
  ) {
    return null
  }

  return searchBubbleUp(node.parent)
}
const searchBubbleUpSections = (node) => {
  switch (node.type) {
    case 'Program':
      // rootまで検索した場合は確定でエラーにする
      return null
    case 'VariableDeclarator':
      // SectioningContent系コンポーネントの拡張の場合は対象外
      if (ignoreCheckParentTypeRegex.test(node.parent.parent?.type) && sectioningRegex.test(node.id.name)) {
        return node
      }

      break
    case 'FunctionDeclaration':
    case 'ClassDeclaration':
      // SectioningContent系コンポーネントの拡張の場合は対象外
      if (ignoreCheckParentTypeRegex.test(node.parent.type) && sectioningRegex.test(node.id.name)) {
        return node
      }

      break
  }

  return searchBubbleUpSections(node.parent)
}
const searchChildren = (n) => {
  switch (n.type) {
    case 'BinaryExpression':
    case 'Identifier':
    case 'JSXEmptyExpression':
    case 'JSXText':
    case 'Literal':
    case 'VariableDeclaration':
      // これ以上childrenが存在しないため終了
      return false
    case 'JSXAttribute':
      return n.value ? searchChildren(n.value) : false
    case 'LogicalExpression':
      return searchChildren(n.right)
    case 'ArrowFunctionExpression':
      return searchChildren(n.body)
    case 'MemberExpression':
      return searchChildren(n.property)
    case 'ReturnStatement':
    case 'UnaryExpression':
      return searchChildren(n.argument)
    case 'ChainExpression':
    case 'JSXExpressionContainer':
      return searchChildren(n.expression)
    case 'BlockStatement': {
      return forInSearchChildren(n.body)
    }
    case 'ConditionalExpression': {
      return searchChildren(n.consequent) || searchChildren(n.alternate)
    }
    case 'CallExpression': {
      return forInSearchChildren(n.arguments)
    }
    case 'JSXFragment':
      break
    case 'JSXElement': {
      const name = n.openingElement.name.name || ''

      if (
        sectioningRegex.test(name) ||
        layoutComponentRegex.test(name) && n.openingElement.attributes.some(includeSectioningAsAttr)
      ) {
        return false
      } else if (
        (
          headingRegex.test(name) &&
          !noHeadingTagNamesRegex.test(n.openingElement.attributes.find(findTagAttr)?.value.value)
        ) ||
        forInSearchChildren(n.openingElement.attributes)
      ) {
        return true
      }

      break
    }
  }

  return n.children ? forInSearchChildren(n.children) : false
}

const forInSearchChildren = (ary) => {
  let r = false

  for (const i in ary) {
    r = searchChildren(ary[i])

    if (r) {
      break
    }
  }

  return r
}

const findTagAttr = (a) => a.name?.name == 'tag'

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: [],
  },
  create(context) {
    let h1s = []
    let sections = []

    return {
      VariableDeclarator: (node) => {
        VariableDeclaratorBareToSHR(context, node)
      },
      JSXOpeningElement: (node) => {
        const elementName = node.name.name || ''
        const message = reportMessageBareToSHR(elementName, false)

        if (message) {
          context.report({
            node,
            message,
          })
        // Headingに明示的にtag属性が設定されており、それらが span or legend の場合はHeading扱いしない
        } else if (headingRegex.test(elementName)) {
          const tagAttr = node.attributes.find(findTagAttr)

          if (!noHeadingTagNamesRegex.test(tagAttr?.value.value)) {
            const result = searchBubbleUp(node.parent)
            let hit = false

            if (result) {
              if (pageHeadingRegex.test(elementName)) {
                h1s.push(node)

                if (h1s.length > 1) {
                  hit = true
                  context.report({
                    node,
                    message: pageHeadingMessage,
                  })
                } else if (result.type !== 'Program') {
                  hit = true
                  context.report({
                    node,
                    message: pageHeadingInSectionMessage,
                  })
                }
              } else if (result.type === 'Program') {
                hit = true
                context.report({
                  node,
                  message: rootHeadingMessage,
                })
              } else if (sections.includes(result)) {
                hit = true
                context.report({
                  node,
                  message: headingMessage,
                })
              } else {
                sections.push(result)
              }
            }

            if (!hit && tagAttr) {
              context.report({
                node: tagAttr,
                message: noTagAttrMessage,
              })
            }
          }
        } else if (!node.selfClosing) {
          const isSection = elementName.match(sectioningRegex)
          let isNav = false

          if (isSection) {
            isNav = isSection[1] === 'Nav'

            for (let i = 0; i < node.attributes.length; i++) {
              const attrName = node.attributes[i].name?.name || ''

              if (
                // HINT: SectioningContent系コンポーネントの拡張の場合、title, heading属性などにHeadingのテキストが仕込まれている場合がある
                // 対象属性を持っている場合はcorrectとして扱う
                headingAttributeRegex.test(attrName) ||
                // HINT: Navかつaria-labelを持っている場合も許容する
                isNav && ariaLabelRegex.test(attrName)
              ) {
                return
              }
            }
          }

          const layoutSectionAsAttr = !isSection && layoutComponentRegex.test(elementName) ? node.attributes.find(includeSectioningAsAttr) : null

          if (
            (isSection || layoutSectionAsAttr) &&
            !searchBubbleUpSections(node.parent.parent) &&
            !forInSearchChildren(node.parent.children)
          ) {
            context.report({
              node,
              message: `${isSection ? elementName : `<${elementName} ${layoutSectionAsAttr.name.name}="${layoutSectionAsAttr.value.value}">`} はHeading要素を含んでいません。
 - SectioningContentはHeadingを含むようにマークアップする必要があります
 - ${elementName}に設定しているいずれかの属性がHeading，もしくはHeadingのテキストに該当する場合、その属性の名称を ${headingAttributeRegex.toString()} にマッチする名称に変更してください
 - Headingにするべき適切な文字列が存在しない場合、 ${isSection ? `${elementName} は削除するか、SectioningContentではない要素に差し替えてください` : `${layoutSectionAsAttr.name.name}="${layoutSectionAsAttr.value.value}"を削除、もしくは別の要素に変更してください`}${isNav ? `
 - nav要素の場合、aria-label、もしくはaria-labelledby属性を設定し、どんなナビゲーションなのかがわかる名称を設定してください` : ''}`,
            })
          }
        }
      },
    }
  },
}
module.exports.schema = []
