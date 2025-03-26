const { generateTagFormatter } = require('../../libs/format_styled_components')

const EXPECTED_NAMES = {
  '(i|I)nput$': 'Input$',
  'SearchInput$': 'SearchInput$',
  '(t|T)extarea$': 'Textarea$',
  'FieldSet$': 'FieldSet$',
  'Combo(b|B)ox$': 'Combobox$',
  '(Date|Wareki)Picker$': '(Date|Wareki)Picker$',
  'TimePicker$': 'TimePicker$',
}
const INPUT_TAG_REGEX = /((i|I)nput|(t|T)extarea|FieldSet|Combo(b|B)ox|(Date|Wareki|Time)Picker)$/
const SEARCH_INPUT_REGEX = /SearchInput$/
const COMBOBOX_REGEX = /Combo(b|B)ox$/

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
      ...generateTagFormatter({ context, EXPECTED_NAMES }),
      JSXOpeningElement: (node) => {
        const name = node.name.name

        if (name && INPUT_TAG_REGEX.test(name)) {
          const placeholder = node.attributes.find((a) => a.name?.name === 'placeholder')

          if (placeholder) {
            if (SEARCH_INPUT_REGEX.test(name)) {
              const tooltipMessage = node.attributes.find((a) => a.name?.name === 'tooltipMessage')

              if (!tooltipMessage) {
                context.report({
                  node: placeholder,
                  message: `${name} にはplaceholder属性を単独で利用せず、tooltipMessageオプションのみ、もしくはplaceholderとtooltipMessageの併用を検討してください。 (例: '<${name} tooltipMessage="ヒント" />', '<${name} tooltipMessage={hint} placeholder={hint} />')`,
                })
              }
            } else if (COMBOBOX_REGEX.test(name)) {
              let defaultItem
              let dropdownHelpMessage

              node.attributes.forEach((a) => {
                switch(a.name?.name) {
                  case 'defaultItem':
                    defaultItem = a
                    break
                  case 'dropdownHelpMessage':
                    dropdownHelpMessage = a
                    break
                }
              })

              if (defaultItem) {
                context.report({
                  node: placeholder,
                  message: `${name} にはdefaultItemが設定されているため、placeholder属性を閲覧出来ません。削除してください。`,
                })
              } else if (!dropdownHelpMessage) {
                context.report({
                  node: placeholder,
                  message: `${name} にはplaceholder属性は設定せず、以下のいずれか、もしくは組み合わせての対応を検討してください。
 - 選択肢をどんな値で絞り込めるかの説明をしたい場合は dropdownHelpMessage 属性に変更してください。
 - 空の値の説明のためにplaceholderを利用している場合は defaultItem 属性に変更してください。
 - 上記以外の説明を行いたい場合、ヒント用要素を設置してください。(例: '<div><${name} /><Hint>ヒント</Hint></div>')`,
                })
              }
            } else {
              context.report({
                node: placeholder,
                message: `${name} にはplaceholder属性は設定せず、別途ヒント用要素の利用を検討してください。(例: '<div><${name} /><Hint>ヒント</Hint></div>')`,
              })
            }
          }
        }
      },
    }
  },
}
module.exports.schema = []
