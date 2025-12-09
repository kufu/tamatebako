const SCHEMA = [
  {
    type: 'object',
    properties: {
      componentsWithText: { type: 'array', items: { type: 'string' }, default: [] },
    },
    additionalProperties: false,
  }
]

const CLICKABLE_ELEMENT = 'JSXElement[openingElement.name.name=/((^b|B)utton|Anchor|Link|^a)/]:has(JSXClosingElement)'
const TEXT_LIKE_ATTRIBUTE = 'JSXAttribute[name.name=/^(text|alt|aria-label(ledby)?)$/]:not(:matches([value=null],[value.value=""])))'

const message = `a, buttonなどのクリッカブルな要素内にはテキストを設定してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-clickable-element-has-text
 - 要素内にアイコン、画像のみを設置する場合はaltなどの代替テキスト用属性を指定してください
  - SVG component の場合、altを属性として受け取れるようにした上で '<svg role="img" aria-label={alt}>' のように指定してください
 - クリッカブルな要素内に設置しているコンポーネントがテキストを含んでいる場合、"XxxxText" のように末尾に "Text" もしくは "Message" という名称を設定してください`

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
  },
  create(context) {
    const option = context.options[0] || {}
    const componentsWithText = option.componentsWithText || []
    // HINT: SmartHRLogo コンポーネントは内部でaltを持っているため対象外にする
    const elementWithText = `JSXOpeningElement[name.name=/(SmartHRLogo|Text|Message|^(${componentsWithText.join('|')}))$/]`

    return {
      [`${CLICKABLE_ELEMENT}:not(:has(:matches(${TEXT_LIKE_ATTRIBUTE},JSXText,JSXExpressionContainer,${elementWithText}))`]: (node) => {
        context.report({
          node,
          message,
        });
      },
    }
  },
}
module.exports.schema = SCHEMA
