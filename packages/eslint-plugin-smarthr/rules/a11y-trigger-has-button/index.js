const TRIGGER_REGEX = /(Dropdown|Dialog)Trigger$/
const BUTTON_REGEX = /(B|^b)utton$/
const ANCHOR_BUTTON_REGEX = /AnchorButton$/
const FALSY_TEXT_REGEX = /^\s*\n+\s*$/

const filterFalsyJSXText = (cs) => cs.filter((c) => (
  !(c.type === 'JSXText' && FALSY_TEXT_REGEX.test(c.value))
))

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
      [`JSXElement[openingElement.name.name=${TRIGGER_REGEX}]:not([openingElement.name.name=/HelpDialogTrigger$/])`]: (parentNode) => {
        const children = filterFalsyJSXText(parentNode.children)

        if (children.length > 1) {
          const node = parentNode.openingElement
          const match = node.name.name.match(TRIGGER_REGEX)

          context.report({
            node,
            message: `${match[1]}Trigger の直下には複数のコンポーネントを設置することは出来ません。button要素が一つだけ設置されている状態にしてください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-trigger-has-button`,
          })
        } else {
          const c = children[0]

          if (
            // `<DialogTrigger>{button}</DialogTrigger>` のような場合は許可する
            c &&
            c.type !== 'JSXExpressionContainer' && (
              c.type !== 'JSXElement' ||
              !BUTTON_REGEX.test(c.openingElement.name.name) ||
              ANCHOR_BUTTON_REGEX.test(c.openingElement.name.name)
            )
          ) {
            const match = parentNode.openingElement.name.name.match(TRIGGER_REGEX)

            context.report({
              node: c,
              message: `${match[1]}Trigger の直下にはbutton要素のみ設置してください(AnchorButtonはa要素のため設置できません)
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-trigger-has-button`,
            })
          }
        }
      },
    }
  },
}
module.exports.schema = []
