const targetRegex = /((F|^f)ieldset|(F|^f)orm(Group|Control))(s)?$/
const wrapperRegex = /((F|^f)ieldset(s)?|(F|^f)orm((Group|Control)(s)?)?|(RemoteTrigger(.*))?FormDialog|FilterDropdown)$/
const ignoreCheckParentTypeRegex = /^(Program|ExportNamedDeclaration)$/
const declaratorTargetRegex = /(Fieldset|Form(Group|Control))(s)?$/
const asRegex = /^(as|forwardedAs)$/
const bareTagRegex = /^(form|fieldset)$/

const includeAsAttrFormOrFieldset = (a) => asRegex.test(a.name?.name) && bareTagRegex.test(a.value.value)

const searchBubbleUp = (node) => {
  switch (node.type) {
    case 'Program':
      // rootまで検索した場合は確定でエラーにする
      return null
    case 'JSXElement':
      // formかFieldsetでラップされていればOK
      if (node.openingElement.name.name && (wrapperRegex.test(node.openingElement.name.name) || node.openingElement.attributes.some(includeAsAttrFormOrFieldset))) {
        return node
      }
      break
    case 'VariableDeclarator':
      // FormControl系コンポーネントの拡張の場合は対象外
      if (ignoreCheckParentTypeRegex.test(node.parent.parent?.type) && declaratorTargetRegex.test(node.id.name)) {
        return node
      }

      break
    case 'FunctionDeclaration':
    case 'ClassDeclaration':
      // FormControl系コンポーネントの拡張の場合は対象外
      if (ignoreCheckParentTypeRegex.test(node.parent.type) && declaratorTargetRegex.test(node.id.name)) {
        return node
      }

      break
  }

  return searchBubbleUp(node.parent)
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
    return {
      JSXOpeningElement: (node) => {
        const elementName = node.name.name

        if (elementName && targetRegex.test(elementName)) {
          const result = searchBubbleUp(node.parent.parent)

          if (!result) {
            context.report({
              node,
              message: `${elementName}をform要素で囲むようにマークアップしてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-form-control-in-form
 - form要素で囲むことでスクリーンリーダーに入力フォームであることが正しく伝わる、入力要素にfocusした状態でEnterを押せばsubmitできる、inputのpattern属性を利用できるなどのメリットがあります
 - 以下のいずれかの方法で修正をおこなってください
   - 方法1: form要素で ${elementName} を囲んでください。smarthr-ui/ActionDialog、もしくはsmarthr-ui/RemoteTriggerActionDialogを利用している場合、smarthr-ui/FormDialog、smarthr-ui/RemoteTriggerFormDialogに置き換えてください
   - 方法2: ${elementName} がコンポーネント内の一要素であり、かつその親コンポーネントがFormControl、もしくはFieldsetを表現するものである場合、親コンポーネント名を "${declaratorTargetRegex}" とマッチするものに変更してください`,
            })
          }
        }
      },
    }
  },
}
module.exports.schema = []
