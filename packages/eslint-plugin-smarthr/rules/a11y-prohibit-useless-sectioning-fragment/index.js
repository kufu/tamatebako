const SCHEMA = []

const SECTIONING_FRAGMENT_ELEMENT = 'JSXElement[openingElement.name.name="SectioningFragment"]'
const SECTIONING_CONTENT_ELEMENT = 'JSXOpeningElement[name.name=/((A(rticle|side))|Nav|Section)$/]'
const SECTIONING_LAYOUT_ELEMENT = 'JSXOpeningElement[name.name=/((C(ent|lust)er)|Reel|Sidebar|Stack|Base(Column)?)$/]:has(JSXAttribute[name.name=/^(as|forwardedAs)$/][value.value=/^(article|aside|nav|section)$/])'

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
      [`${SECTIONING_FRAGMENT_ELEMENT}:has(:matches(${SECTIONING_CONTENT_ELEMENT}, ${SECTIONING_LAYOUT_ELEMENT}))`]: (node) => {
        context.report({
          node,
          message: `無意味なSectioningFragmentが記述されています。子要素で問題なくセクションは設定されているため、このSectioningFragmentは削除してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-prohibit-useless-sectioning-fragment`
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
