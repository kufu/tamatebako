const { INTERACTIVE_COMPONENT_NAMES, AS_FORM_PART_ATTRIBUTE } = require('../best-practice-for-interactive-element')

const SCHEMA = []

const REGEX_OVERFLOW_CLASSNAME = /(^| |\-)overflow\-((x|y)\-)?(auto|scroll)($| )/

const TABINDEX = 'JSXAttribute[name.name="tabIndex"]'
const CLASS_NAME = 'JSXAttribute[name.name="className"]'
const NOT_TABSTOP = `JSXOpeningElement:not(:has(${TABINDEX}:matches([value.value="0"],[value.expression.value=0])))`
const OVERFLOW_CLASSNAME_LITERAL = `${CLASS_NAME}[value.value=${REGEX_OVERFLOW_CLASSNAME}]`
const OVERFLOW_CLASSNAME_TEMPLATE = `${CLASS_NAME}[value.expression.type="TemplateLiteral"][value.expression.expressions.length>0]`

const INTERACTIVE_COMPONENT_PATTERN = `/(${INTERACTIVE_COMPONENT_NAMES})/`
const TABINDEX_ELEMENT = `JSXOpeningElement:not([name.name=${INTERACTIVE_COMPONENT_PATTERN}]):not(:has(${AS_FORM_PART_ATTRIBUTE})):has(${TABINDEX}:matches([value.value=/^(0|-1)$/],[value.expression.value=0],[value.expression.operator="-"][value.expression.argument.value=1]))`

const SELECTOR_INVALID_TABINDEX = `${TABINDEX} Literal:not(:matches([value=/^(0|-1)$/],[value=0],[value=1][parent.operator="-"]))`
const SELECTOR_OVERFLOW_CLASS_LITERAL = `${NOT_TABSTOP}:has(${OVERFLOW_CLASSNAME_LITERAL})`
const SELECTOR_OVERFLOW_CLASS_TEMPLATE = `${NOT_TABSTOP} ${OVERFLOW_CLASSNAME_TEMPLATE}`
const SELECTOR_TABINDEX_ERROR = `${TABINDEX_ELEMENT}:not(:has(${OVERFLOW_CLASSNAME_LITERAL})):not(:has(${OVERFLOW_CLASSNAME_TEMPLATE}))`
const SELECTOR_TABINDEX_TEMPLATE = `${TABINDEX_ELEMENT} > ${OVERFLOW_CLASSNAME_TEMPLATE}`

const hasScrollerClass = (quasi) => REGEX_OVERFLOW_CLASSNAME.test(quasi.value.cooked)

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
  },
  create(context) {
    const reportScrollerError = (node) =>
      context.report({
        node,
        message: `scroll可能な要素にはtabIndex={0}を設定してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-scroller-has-tabindex
 - tabIndex={0}を設定することでキーボード操作でアクセスしやすくなります
 - 推奨: smarthr-ui/Scrollerコンポーネントを利用すると、tabIndexが自動的に設定されます`,
      })

    const reportTabIndexError = (node) =>
      context.report({
        node,
        message: `${node.name.name}にtabIndex属性は設定しないでください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-scroller-has-tabindex
 - tabIndex属性はインタラクティブな要素、もしくはscroll可能な要素にのみ設定してください
 - 対応方法1: 対象の要素がインタラクティブなコンポーネントの場合、名称を調整してください
   - "${INTERACTIVE_COMPONENT_PATTERN}" の正規表現にmatchするコンポーネントに変更、もしくは名称を調整してください
 - 対応方法2: 対象の要素がscroll可能な要素の場合、smarthr-ui/Scrollerコンポーネントの利用を検討してください
 - 対応方法3: 対象の要素がインタラクティブな要素でない場合、tabIndex属性を削除してください`,
      })

    return {
      // tabIndex値のチェック
      [SELECTOR_INVALID_TABINDEX]: (node) =>
        context.report({
          node,
          message: `tabIndex属性には0, -1以外の値を設定しないでください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-scroller-has-tabindex
 - focus可能な要素の順序が意図しづらい状態になってしまうため0、もしくは-1に変更してください`,
        }),
      // overflowクラス（文字列リテラル）+ tabIndex={0}なし
      [SELECTOR_OVERFLOW_CLASS_LITERAL]: reportScrollerError,
      // overflowクラス（TemplateLiteral）+ tabIndex={0}なし
      [SELECTOR_OVERFLOW_CLASS_TEMPLATE]: (node) => {
        if (node.value.expression.quasis.some(hasScrollerClass)) {
          reportScrollerError(node.parent)
        }
      },
      // tabIndex on non-interactive elements (Literal)
      [SELECTOR_TABINDEX_ERROR]: reportTabIndexError,
      // tabIndex on non-interactive elements (TemplateLiteral)
      [SELECTOR_TABINDEX_TEMPLATE]: (node) => {
        if (!node.value.expression.quasis.some(hasScrollerClass)) {
          reportTabIndexError(node.parent)
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
