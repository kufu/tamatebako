const { rootPath } = require('../../libs/common')

const asRegex = /^(as|forwardedAs)$/
const asFormRegex = /^(form|fieldset)$/
const asSectioningContentRegex = /^(article|aside|nav|section)$/

const includeAsAttrFormOrFieldset = (a) => a.name?.name.match(asRegex) && asFormRegex.test(a.value.value)
const includeAsAttrSectioningContent = (a) => a.name?.name.match(asRegex) && asSectioningContentRegex.test(a.value.value)
const includeWrapper =  (fn) => wrapperRegex.test(fn)

const sectioningContentRegex = /((A|^a)(rticle|side)|(N|^n)av|(S|^s)ection)$/

const formControlRegexStr = '(FormControl|(F|^f)ieldset)(s)?'
const formControlRegex = new RegExp(`${formControlRegexStr}$`)
const wrapperRegex = new RegExp(`(${formControlRegexStr}|(F|^f)orm(Dialog)?)$`)
const extRegex = /\.[a-z0-9]+?$/
const ignoreNavRegex = /(Side|Index)Nav$/
const formPartCheckParentTypeRegex = /^(Program|ExportNamedDeclaration)$/

const rootPathSlashed = `${rootPath}/`

const searchBubbleUpForSectioningContent = (node) => {
  switch (node.type) {
    case 'Program':
      // rootまで検索した場合はOK
      return null
    case 'JSXElement':
      const openingElement = node.openingElement
      const elementName = openingElement.name.name

      if (elementName) {
        // formかFieldsetでラップされていればNG
        if (wrapperRegex.test(elementName) || openingElement.attributes.some(includeAsAttrFormOrFieldset)) {
          return node
        } else if ((sectioningContentRegex.test(elementName) && !ignoreNavRegex.test(elementName)) || openingElement.attributes.some(includeAsAttrSectioningContent)) {
          // 他のSectioningContentに到達した場合、同じチェックを繰り返すことになるため終了する
          return null
        }
      }

      break
    // Form系コンポーネントの拡張なのでNG
    case 'VariableDeclarator':
      if (node.parent.parent?.type.match(formPartCheckParentTypeRegex) && wrapperRegex.test(node.id.name)) {
        return node
      }

      break
    // Form系コンポーネントの拡張なのでNG
    case 'FunctionDeclaration':
      if (formPartCheckParentTypeRegex.test(node.parent.type) && wrapperRegex.test(node.id.name)) {
        return node
      }

      break
  }

  return searchBubbleUpForSectioningContent(node.parent)
}

const searchBubbleUpForFormControl = (node) => {
  switch (node.type) {
    case 'Program':
      // rootまで検索した場合はOK
      return null
    case 'JSXElement':
      const openingElement = node.openingElement
      const elementName = openingElement.name.name

      if (elementName) {
        // SectioningContentでラップされていればNG
        if (sectioningContentRegex.test(elementName) && !ignoreNavRegex.test(elementName)) {
          return  { node: openingElement, elementName }
        } else  {
          const attr = openingElement.attributes.find(includeAsAttrSectioningContent)

          if (attr) {
            return  { node: openingElement, elementName: `${attr.name.name}="${attr.value.value}"` }
          } else if (wrapperRegex.test(elementName) || openingElement.attributes.some(includeAsAttrFormOrFieldset)) {
            // 他のFormControl か Fieldsetに到達した場合、同じチェックを繰り返すことになるため終了する
            return null
          }
        }
      }

      break
    case 'VariableDeclarator':
      if (node.parent.parent?.type.match(formPartCheckParentTypeRegex) && wrapperRegex.test(node.id.name)) {
        return null
      }

      break
    case 'FunctionDeclaration':
      if (formPartCheckParentTypeRegex.test(node.parent.type) && wrapperRegex.test(node.id.name)) {
        return null
      }

      break
  }

  return searchBubbleUpForFormControl(node.parent)
}

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: [],
  },
  create(context) {
    const filenames = context.filename.replace(rootPathSlashed, '').replace(extRegex, '').split('/')
    const isInnerForm = filenames.some(includeWrapper)
    const notified = []

    return {
      JSXOpeningElement: (node) => {
        const elementName = node.name.name

        if (elementName) {
          // HINT: smarthr-ui/SideNav,IndexNav は対象外とする
          if (ignoreNavRegex.test(elementName)) {
            return
          }

          const isSection = sectioningContentRegex.test(elementName)
          const asAttr = isSection ? false : node.attributes.find(includeAsAttrSectioningContent)

          if ((isSection || asAttr)) {
            if (isInnerForm || searchBubbleUpForSectioningContent(node.parent.parent)) {
              if (!notified.includes(node)) {
                notified.push(node)
                context.report({
                  node,
                  message: `${isSection ? elementName : `${asAttr.name.name}="${asAttr.value.value}"`}とその内部に存在するHeadingをsmarthr-ui/Fieldsetに置き換えてください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-sectioning-content-in-form
 - もしくはform要素を利用していない場合、フォームを構成する入力要素郡すべてを一つのform要素で囲んでください
   - required属性、pattern属性など一部属性はform要素で囲まないと動作しません
   - 送信用ボタンのonClickをform要素のonSubmitに移動し、送信用ボタンのtype属性に "submit" を指定することでより適切にマークアップ出来ます
     - その際、onSubmitの動作中で "e.preventDefault()" と "e.stopPropagation()" を指定する必要がある場合があります。
 - form内の見出しとなる要素をlegend, labelのみに統一することでスクリーンリーダーのジャンプ機能などの利便性が向上します
 - smarthr-ui/Fieldset が利用できない場合、fieldset要素とlegend要素を使ったマークアップに修正してください
   - その際、fieldset要素の直下にlegend要素が存在するようにしてください。他要素がfieldsetとlegendの間に存在すると、正しく紐づけが行われない場合があります`,
                })
              }
            }
          } else if (formControlRegex.test(elementName)) {
            const sectioningContent = searchBubbleUpForFormControl(node.parent.parent)

            if (sectioningContent) {
              if (!notified.includes(sectioningContent.node)) {
                notified.push(sectioningContent.node)
                context.report({
                  node: sectioningContent.node,
                  message: `${sectioningContent.elementName}とその内部に存在するHeadingをsmarthr-ui/Fieldsetに置き換えてください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-sectioning-content-in-form
 - もしくはform要素を利用していない場合、フォームを構成する入力要素郡すべてを一つのform要素で囲んでください
   - required属性、pattern属性など一部属性はform要素で囲まないと動作しません
   - 送信用ボタンのonClickをform要素のonSubmitに移動し、送信用ボタンのtype属性に "submit" を指定することでより適切にマークアップ出来ます
     - その際、onSubmitの動作中で "e.preventDefault()" と "e.stopPropagation()" を指定する必要がある場合があります。
 - form内の見出しとなる要素をlegend, labelのみに統一することでスクリーンリーダーのジャンプ機能などの利便性が向上します
 - smarthr-ui/Fieldset が利用できない場合、fieldset要素とlegend要素を使ったマークアップに修正してください
   - その際、fieldset要素の直下にlegend要素が存在するようにしてください。他要素がfieldsetとlegendの間に存在すると、正しく紐づけが行われない場合があります`,
                })
              }
            }
          }
        }
      },
    }
  },
}
module.exports.schema = []
