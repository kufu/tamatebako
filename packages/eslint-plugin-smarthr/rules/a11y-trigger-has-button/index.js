const TRIGGER_REGEX = /(Dropdown|Dialog)Trigger$/
const HELP_DIALOG_TRIGGER_REGEX = /HelpDialogTrigger$/
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
      JSXElement: (parentNode) => {
        // HINT: 閉じタグが存在しない === 子が存在しない
        // 子を持っていない場合はおそらく固定の要素を吐き出すコンポーネントと考えられるため
        // その中身をチェックすることで担保できるのでskipする
        if (!parentNode.closingElement) {
          return
        }

        const node = parentNode.openingElement

        if (!node.name.name) {
          return
        }

        const match = node.name.name.match(TRIGGER_REGEX)

        if (!match || HELP_DIALOG_TRIGGER_REGEX.test(node.name.name)) {
          return
        }

        const children = filterFalsyJSXText(parentNode.children)

        if (children.length > 1) {
          context.report({
            node,
            message: `${match[1]}Trigger の直下には複数のコンポーネントを設置することは出来ません。buttonコンポーネントが一つだけ設置されている状態にしてください`,
          })

          return
        }

        children.forEach((c) => {
          // `<DialogTrigger>{button}</DialogTrigger>` のような場合は許可する
          if (c.type === 'JSXExpressionContainer') {
            return false
          }

          if (
            c.type !== 'JSXElement' ||
            !BUTTON_REGEX.test(c.openingElement.name.name) ||
            ANCHOR_BUTTON_REGEX.test(c.openingElement.name.name)
          ) {
            context.report({
              node: c,
              message: `${match[1]}Trigger の直下にはbuttonコンポーネントのみ設置してください`,
            })
          }
        })
      },
    }
  },
}
module.exports.schema = []
