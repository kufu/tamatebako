const SCHEMA = [
  {
    type: 'object',
    required: [
      'componentName',
    ],
    properties: {
      componentPath: { type: 'string', default: '' },
      componentName: { type: 'string' },
      prohibitAttributies: { type: 'array', items: { type: 'string' }, default: [] },
    },
    additionalProperties: false,
  }
]

const NOOP = () => {}
const findDangerouslySetInnerHTMLAttr = (a) => a.name.name === 'dangerouslySetInnerHTML'

const WHITESPACE_REGEX = /(\s|\n)+/g
const ALLOW_ELM_REGEX = /^(br|RangeSeparator)$/

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    schema: SCHEMA,
  },
  create(context) {
    const { componentPath, componentName, prohibitAttributies } = context.options[0]
    let JSXAttribute = NOOP

    if (prohibitAttributies) {
      JSXAttribute = (node) => {
        const hit = prohibitAttributies.find((a) => a === node.name.name)

        if (hit) {
          context.report({
            node,
            message: `${hit} 属性は使用せず、 ${componentPath || componentName} コンポーネントを利用してください`,
          });
        }
      }
    }

    return {
      JSXAttribute,
      JSXOpeningElement: (node) => {
        // HINT: 翻訳コンポーネントはテキストとbrのみ許容する
        if (node.name.name === componentName) {
          let existValidChild = false

          for (let i = 0; i < node.parent.children.length; i++) {
            const c = node.parent.children[i]

            switch (c.type) {
              case 'JSXText':
                // HINT: 空白と改行のみの場合はテキストが存在する扱いにはしない
                if (existValidChild || !c.value.replace(WHITESPACE_REGEX, '')) {
                  break
                }

                existValidChild = true
              case 'JSXExpressionContainer':
                // TODO 変数がstringのみか判定できるなら対応したい
                existValidChild = true

                break
              case 'JSXElement':
                if (ALLOW_ELM_REGEX.test(c.openingElement.name.name)) {
                  break
                }

                return context.report({
                  node,
                  message: `${componentName} 内では <br />, <RangeSeparator /> 以外のタグは使えません`,
                });
            }
          }

          if (!existValidChild && !node.attributes.some(findDangerouslySetInnerHTMLAttr)) {
            context.report({
              node,
              message: `${componentName} 内には必ずテキストを設置してください`,
            });
          }
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
