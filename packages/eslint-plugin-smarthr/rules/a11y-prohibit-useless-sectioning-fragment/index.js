const BARE_SECTIONING_TAG_REGEX = /^(article|aside|nav|section)$/
const SECTIONING_REGEX = /((A(rticle|side))|Nav|Section)$/
const SECTIONING_FRAGMENT = 'SectioningFragment'
const LAYOUT_REGEX = /((C(ent|lust)er)|Reel|Sidebar|Stack|Base(Column)?)$/
const AS_REGEX = /^(as|forwardedAs)$/

const includeSectioningAsAttr = (a) => AS_REGEX.test(a.name?.name) && BARE_SECTIONING_TAG_REGEX.test(a.value.value)

const searchSectioningFragment = (node) => {
  switch (node.type) {
    case 'JSXElement':
      return SECTIONING_FRAGMENT === node.openingElement.name?.name ? node.openingElement : null
    case 'Program':
      return null
  }

  return searchSectioningFragment(node.parent)
}

const SCHEMA = []

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
      JSXOpeningElement: (node) => {
        const name = node.name?.name || ''
        let hit = null
        let asAttr = null

        if (SECTIONING_REGEX.test(name)) {
          hit = true
        } else {
          asAttr = LAYOUT_REGEX.test(name) && node.attributes.find(includeSectioningAsAttr)

          if (asAttr) {
            hit = true
          }
        }

        if (hit) {
          result = searchSectioningFragment(node.parent.parent)

          if (result) {
            context.report({
              node: result,
              message: `無意味なSectioningFragmentが記述されています。子要素である<${name}${asAttr ? ` ${asAttr.name.name}="${asAttr.value.value}"` : ''}>で問題なくセクションは設定されているため、このSectioningFragmentは削除してください`
            })
          }
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
