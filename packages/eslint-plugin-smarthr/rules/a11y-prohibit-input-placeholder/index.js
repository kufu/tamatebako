const PLACEHOLDER_ATTRIBUTE = 'JSXAttribute[name.name="placeholder"]'
const COMBOBOX_ELEMENT = 'JSXOpeningElement[name.name=/Combo(B|b)ox$/]'
const DEFAULT_ITEM_ATTRIBUTE = 'JSXAttribute[name.name="defaultItem"]'
const SEARCH_INPUT_NAME = '[name.name=/SearchInput$/]'

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
      [`${COMBOBOX_ELEMENT}:has(${DEFAULT_ITEM_ATTRIBUTE}) ${PLACEHOLDER_ATTRIBUTE}`]: (node) => {
        context.report({
          node,
          message: `${node.parent.name.name} にはdefaultItemが設定されているため、placeholder属性を閲覧出来ません。削除してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-input-placeholder`,
        })
      },
      [`${COMBOBOX_ELEMENT}:not(:has(${DEFAULT_ITEM_ATTRIBUTE}, JSXAttribute[name.name="dropdownHelpMessage"])) ${PLACEHOLDER_ATTRIBUTE}`]: (node) => {
        const name = node.parent.name.name

        context.report({
          node,
          message: `${name} にはplaceholder属性は設定せず、以下のいずれか、もしくは組み合わせての対応を検討してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-input-placeholder
 - 選択肢をどんな値で絞り込めるかの説明をしたい場合は dropdownHelpMessage 属性に変更してください。
 - 空の値の説明のためにplaceholderを利用している場合は defaultItem 属性に変更してください。
 - 上記以外の説明を行いたい場合、ヒント用要素を設置してください。(例: '<div><${name} /><Hint>ヒント</Hint></div>')`,
        })
      },
      [`JSXOpeningElement${SEARCH_INPUT_NAME}:not(:has(JSXAttribute[name.name="tooltipMessage"])) ${PLACEHOLDER_ATTRIBUTE}`]: (node) => {
        const inputName = node.parent.name.name
        context.report({
          node,
          message: `${inputName} にはplaceholder属性を単独で利用せず、tooltipMessageオプションのみ、もしくはplaceholderとtooltipMessageの併用を検討してください。 (例: '<${inputName} tooltipMessage="ヒント" />', '<${inputName} tooltipMessage={hint} placeholder={hint} />')
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-input-placeholder`,
        })
      },
      [`JSXOpeningElement[name.name=/((I|^i)nput|(T|^t)extarea|FieldSet|(Date|Wareki|Time)Picker)$/]:not(${SEARCH_INPUT_NAME}) ${PLACEHOLDER_ATTRIBUTE}`]: (node) => {
        const name = node.parent.name.name

        context.report({
          node,
          message: `${name} にはplaceholder属性は設定せず、別途ヒント用要素の利用を検討してください。(例: '<div><${name} /><Hint>ヒント</Hint></div>')
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-input-placeholder`,
        })
      },
    }
  },
}
module.exports.schema = []
