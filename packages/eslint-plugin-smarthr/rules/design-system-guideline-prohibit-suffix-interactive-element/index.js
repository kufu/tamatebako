const { INTERACTIVE_COMPONENT_NAMES } = require('../best-practice-for-interactive-element')

const HANDLER_ATTRIBUTE_REGEX = /^(on[A-Z]|handle[A-Z])/

const SCHEMA = []

const EXCLUSIVE_MESSAGE = `InputコンポーネントにsuffixとsubActionAreaを同時に指定することはできません。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-prohibit-suffix-interactive-element
 - suffixは装飾用、subActionAreaは操作用の要素を配置するためのpropsです
 - いずれか一方のみを指定してください`

const INTERACTIVE_ELEMENT_MESSAGE = `Inputコンポーネントのsuffixに操作可能な要素を配置することはできません。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-prohibit-suffix-interactive-element
 - suffixは装飾用のpropsです。ButtonやRemoteDialogTriggerなどの操作可能なコンポーネント、onXxxxやhandleXxxxといったハンドラ属性を持つ要素はsubActionAreaに配置してください`

module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
  },
  create(context) {
    return {
      'JSXOpeningElement[name.name=/Input$/]:has(> JSXAttribute[name.name="suffix"]):has(> JSXAttribute[name.name="subActionArea"])': (node) => {
        context.report({
          node,
          message: EXCLUSIVE_MESSAGE,
        })
      },
      [`JSXOpeningElement[name.name=/Input$/] > JSXAttribute[name.name="suffix"] > JSXExpressionContainer JSXOpeningElement[name.name=/${INTERACTIVE_COMPONENT_NAMES}/]`]: (node) => {
        context.report({
          node,
          message: INTERACTIVE_ELEMENT_MESSAGE,
        })
      },
      [`JSXOpeningElement[name.name=/Input$/] > JSXAttribute[name.name="suffix"] > JSXExpressionContainer JSXOpeningElement:has(JSXAttribute[name.name=${HANDLER_ATTRIBUTE_REGEX}])`]: (node) => {
        context.report({
          node,
          message: INTERACTIVE_ELEMENT_MESSAGE,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
