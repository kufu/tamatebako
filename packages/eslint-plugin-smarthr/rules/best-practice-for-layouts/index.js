const MULTI_CHILDREN_REGEX = /(Cluster|Stack)$/
const REGEX_NLSP = /^\s*\n+\s*$/
const FLEX_END_REGEX = /^(flex-)?end$/

const LAYOUT_COMPONENT_REGEX_WITHOUT_STACK = /(Center|Cluster|Container|Reel|Sidebar)$/
const LAYOUT_COMPONENT_REGEX = /(Center|Cluster|Container|Reel|Stack|Sidebar)$/
const LAYOUT_COMPONENT_ELEMENT_WITHOUT_STACK = `JSXOpeningElement[name.name=${LAYOUT_COMPONENT_REGEX_WITHOUT_STACK}]`
const HEADING_ELEMENT = 'JSXElement[openingElement.name.name=/Heading$/]'
const NOT_HAS_AS_SPAN_ATTRIBUTE = ':not(:has(JSXAttribute[name.name=/^(as|forwardedAs)$/][value.value="span"]))'
const STACK_ELEMENT_NOT_SPAN = `JSXOpeningElement[name.name=/Stack$/]${NOT_HAS_AS_SPAN_ATTRIBUTE}`
const LAYOUT_ELEMENT_NOT_SPAN = `JSXOpeningElement[name.name=${LAYOUT_COMPONENT_REGEX}]${NOT_HAS_AS_SPAN_ATTRIBUTE}`
const FORM_CONTROL_LABEL_ATTRIBUTE = 'JSXOpeningElement[name.name=/FormControl$/] JSXAttribute[name.name="label"]'
const FIELDSET_LEGEND_ATTRIBUTE = 'JSXOpeningElement[name.name=/Fieldset$/] JSXAttribute[name.name="legend"]'
const ICON_ELEMENT_WITH_TEXT = `JSXOpeningElement[name.name=/Icon$/]:has(JSXAttribute[name.name="text"])`
const TEXT_ELEMENT_WITH_PREFIX = 'JSXOpeningElement[name.name=/Text$/]:has(JSXAttribute[name.name=/^(prefixIcon|icon)$/])'

const filterFalsyJSXText = (cs) => cs.filter(checkFalsyJSXText)
const checkFalsyJSXText = (c) => (
  !(
    c.type === 'JSXText' && REGEX_NLSP.test(c.value) ||
    c.type === 'JSXEmptyExpression'
  )
)

const searchChildren = (node) => {
  if (
    node.type === 'JSXFragment' ||
    node.type === 'JSXElement' && node.openingElement.name?.name === 'SectioningFragment'
  ) {
    const children = node.children.filter(checkFalsyJSXText)

    if (children.length > 1) {
      return false
    }
  }

  switch(node.type) {
    case 'MemberExpression':
      return searchChildren(node.object)
    // {hoge} や {hoge.fuga} の場合、許容する
    case 'Identifier':
      return false
    case 'JSXExpressionContainer':
    case 'ChainExpression':
      return searchChildren(node.expression)
    case 'CallExpression':
      return node.callee.property?.name !== 'map'
    case 'ConditionalExpression':
      return searchChildren(node.consequent) && searchChildren(node.alternate)
    case 'LogicalExpression':
      return searchChildren(node.right)
  }

  return true
}

const DETAIL_LINK_MESSAGE = `
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-layouts`

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
    return {
      [`JSXOpeningElement[selfClosing=false][name.name=${MULTI_CHILDREN_REGEX}]`]: (node) => {
        const nodeName = node.name.name;
        const matcher = nodeName.match(MULTI_CHILDREN_REGEX)
        const layoutType = matcher[1]
        let justifyAttr = null
        let alignAttr = null
        let gapAttr = null

        node.attributes.forEach((a) => {
          switch (a.name?.name) {
            case 'justify':
              justifyAttr = a
              break
            case 'align':
              alignAttr = a
              break
            case 'gap':
              gapAttr = a
              break
          }
        })

        if (layoutType === 'Stack') {
          if (alignAttr && FLEX_END_REGEX.test(alignAttr.value.value)) {
            return
          } else if (gapAttr?.value.type === 'JSXExpressionContainer' && gapAttr.value.expression.value === 0) {
            context.report({
              node,
              message: `${nodeName} に "gap={0}" が指定されており、smarthr-ui/${layoutType} の利用方法として誤っている可能性があります。以下の修正方法を検討してください。${DETAIL_LINK_MESSAGE}
 - 方法1: 子要素を一つにまとめられないか検討してください
   - 例: "<Stack gap={0}><p>hoge</p><p>fuga</p></Stack>" を "<p>hoge<br />fuga</p>" にするなど
 - 方法2: 子要素のstyleを確認しgap属性を0以外にできないか検討してください
   - 子要素が個別に持っているmarginなどのstyleを${nodeName}のgap属性で共通化できないか確認してください
 - 方法3: 別要素でマークアップし直すか、${nodeName}を削除してください
   - 親要素に smarthr-ui/Cluster, smarthr-ui/Stack などが存在している場合、div・spanなどで1要素にまとめる必要がある場合があります
   - as, forwardedAsなどでSectioningContent系要素に変更している場合、対応するsmarthr-ui/Section, Aside, Nav, Article のいずれかに差し替えてください`
            })
          }
        }

        const children = node.parent.children.filter(checkFalsyJSXText)

        if (children.length === 1) {
          if (justifyAttr && FLEX_END_REGEX.test(justifyAttr.value.value)) {
            return
          }

          if (searchChildren(children[0])) {
            context.report({
              node,
              message:
                (justifyAttr?.value.value === 'center' || alignAttr?.value.value === 'center')
                  ? `${nodeName} は smarthr-ui/${layoutType} ではなく smarthr-ui/Center でマークアップしてください${DETAIL_LINK_MESSAGE}`
                  : `${nodeName}には子要素が一つしか無いため、${layoutType}でマークアップする意味がありません。${DETAIL_LINK_MESSAGE}
 - styleを確認し、div・spanなど、別要素でマークアップし直すか、${nodeName}を削除してください
 - as, forwardedAsなどでSectioningContent系要素に変更している場合、対応するsmarthr-ui/Section, Aside, Nav, Article のいずれかに差し替えてください`
            })
          }
        }
      },
      [`${HEADING_ELEMENT} ${LAYOUT_COMPONENT_ELEMENT_WITHOUT_STACK}`]: (node) => {
        const component = node.name.name.match(LAYOUT_COMPONENT_REGEX_WITHOUT_STACK)[1]

        context.report({
          node,
          message: `Headingの子孫に${component}を置くことはできません。Headingの外で${component}を使用するようにマークアップを修正してください。${DETAIL_LINK_MESSAGE}`
        })
      },
      [`${HEADING_ELEMENT} ${STACK_ELEMENT_NOT_SPAN}`]: (node) => {
        context.report({
          node,
          message: `Headingの子孫にStackを置く場合、as属性、もしくはforwardedAs属性に \`span\` を指定してください${DETAIL_LINK_MESSAGE}`,
        })
      },
      [`${HEADING_ELEMENT} :matches(${ICON_ELEMENT_WITH_TEXT},${TEXT_ELEMENT_WITH_PREFIX})`]: (node) => {
        context.report({
          node,
          message: `HeadingにIconを設定する場合 <Heading icon={<XxxIcon />}></Heading> のようにicon属性を利用してください${DETAIL_LINK_MESSAGE}`,
        })
      },
      [`${FORM_CONTROL_LABEL_ATTRIBUTE} ${LAYOUT_COMPONENT_ELEMENT_WITHOUT_STACK}`]: (node) => {
        context.report({
          node,
          message: `FormControlのlabel属性に${node.name.name.match(LAYOUT_COMPONENT_REGEX_WITHOUT_STACK)[1]}を置くことはできません。ラベル用テキスト以外をstatusLabels、subActionArea、もしくはlabel属性のObjectとして '{ text: テキスト, icon: <XxxIcon /> }'に置き換えてください。${DETAIL_LINK_MESSAGE}`,
        })
      },
      [`${FORM_CONTROL_LABEL_ATTRIBUTE} ${STACK_ELEMENT_NOT_SPAN}`]: (node) => {
        context.report({
          node,
          message: `FormControlのlabel属性にStackを置く場合、as属性、もしくはforwardedAs属性に \`span\` を指定してください${DETAIL_LINK_MESSAGE}`,
        })
      },
      [`${FORM_CONTROL_LABEL_ATTRIBUTE} :matches(${ICON_ELEMENT_WITH_TEXT},${TEXT_ELEMENT_WITH_PREFIX})`]: (node) => {
        context.report({
          node,
          message: `FormControlのlabel属性にアイコンを設定する場合 <FormControl label={{ text: 'テキスト', icon: <XxxIcon /> }} /> のようにlabel.icon属性を利用してください${DETAIL_LINK_MESSAGE}`,
        })
      },
      [`${FIELDSET_LEGEND_ATTRIBUTE} ${LAYOUT_COMPONENT_ELEMENT_WITHOUT_STACK}`]: (node) => {
        context.report({
          node,
          message: `Fieldsetのlegend属性に${node.name.name.match(LAYOUT_COMPONENT_REGEX_WITHOUT_STACK)[1]}を置くことはできません。ラベル用テキスト以外をstatusLabels、subActionArea、もしくはlabel属性のObjectとして '{ text: テキスト, icon: <XxxIcon /> }'に置き換えてください。${DETAIL_LINK_MESSAGE}`,
        })
      },
      [`${FIELDSET_LEGEND_ATTRIBUTE} ${STACK_ELEMENT_NOT_SPAN}`]: (node) => {
        context.report({
          node,
          message: `Fieldsetのlegend属性にStackを置く場合、as属性、もしくはforwardedAs属性に \`span\` を指定してください${DETAIL_LINK_MESSAGE}`,
        })
      },
      [`${FIELDSET_LEGEND_ATTRIBUTE} :matches(${ICON_ELEMENT_WITH_TEXT},${TEXT_ELEMENT_WITH_PREFIX})`]: (node) => {
        context.report({
          node,
          message: `Fieldsetのlegend属性にアイコンを設定する場合 <Fieldset legend={{ text: 'テキスト', icon: <XxxIcon /> }} /> のようにlegend.icon属性を利用してください${DETAIL_LINK_MESSAGE}`,
        })
      },
      [`JSXElement:has( > JSXOpeningElement[name.name=/RadioButton(Panel)?$/]) ${LAYOUT_ELEMENT_NOT_SPAN}`]: (node) => {
        const component = node.name.name.match(LAYOUT_COMPONENT_REGEX)[1]

        context.report({
          node,
          message: `RadioButton, RadioButtonPanelの子孫に${component}を置く場合、as属性、もしくはforwardedAs属性に \`span\` を指定してください${DETAIL_LINK_MESSAGE}`,
        })
      },
      [`JSXElement:has( > JSXOpeningElement[name.name=/Checkbox?$/]) ${LAYOUT_ELEMENT_NOT_SPAN}`]: (node) => {
        const component = node.name.name.match(LAYOUT_COMPONENT_REGEX)[1]

        context.report({
          node,
          message: `Checkboxの子孫に${component}を置く場合、as属性、もしくはforwardedAs属性に \`span\` を指定してください${DETAIL_LINK_MESSAGE}`,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
