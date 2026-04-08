const SCHEMA = []

// ============================================================
// smarthr-ui/Textコンポーネントのクラス名とプロパティのマッピング
// ============================================================
const CLASS_TO_PROP_MAP = {
  // size
  'shr-text-2xs': { prop: 'size', value: 'XXS' },
  'shr-text-xs': { prop: 'size', value: 'XS' },
  'shr-text-sm': { prop: 'size', value: 'S' },
  'shr-text-base': { prop: 'size', value: 'M' },
  'shr-text-lg': { prop: 'size', value: 'L' },
  'shr-text-xl': { prop: 'size', value: 'XL' },
  'shr-text-2xl': { prop: 'size', value: 'XXL' },

  // weight
  'shr-font-normal': { prop: 'weight', value: 'normal' },
  'shr-font-bold': { prop: 'weight', value: 'bold' },

  // leading
  'shr-leading-none': { prop: 'leading', value: 'NONE' },
  'shr-leading-tight': { prop: 'leading', value: 'TIGHT' },
  'shr-leading-normal': { prop: 'leading', value: 'NORMAL' },
  'shr-leading-loose': { prop: 'leading', value: 'LOOSE' },

  // color
  'shr-text-black': { prop: 'color', value: 'TEXT_BLACK' },
  'shr-text-white': { prop: 'color', value: 'TEXT_WHITE' },
  'shr-text-grey': { prop: 'color', value: 'TEXT_GREY' },
  'shr-text-disabled': { prop: 'color', value: 'TEXT_DISABLED' },
  'shr-text-link': { prop: 'color', value: 'TEXT_LINK' },
  'shr-text-color-inherit': { prop: 'color', value: 'inherit' },
}

const REGEX_CLASSNAME_SPLIT = /\s+/

// ============================================================
// ESLintセレクタ構築用の定数
// ============================================================
const CONVERTIBLE_SHR_CLASSES = Object.keys(CLASS_TO_PROP_MAP).join('|')
const CONVERTIBLE_SHR_PATTERN = `(^|\\s)(${CONVERTIBLE_SHR_CLASSES})(\\s|$)`

const ATTR_AS = 'JSXAttribute[name.name="as"]'
const ATTR_CLASSNAME = 'JSXAttribute[name.name="className"]'
const ATTR_TEXT_PROPS = 'JSXAttribute[name.name=/^(size|weight|color|leading|italic|whiteSpace|maxLines|styleType|icon|prefixIcon|suffixIcon|iconGap)$/]'
const LITERAL_TYPE = '[value.type="Literal"]'

const TEXT_OPENING = 'JSXOpeningElement[name.name="Text"]'
const HAS_TEXT_PROPS = `:has(${ATTR_TEXT_PROPS})`
const NOT_HAS_TEXT_PROPS = `:not(${HAS_TEXT_PROPS})`
const CHILD_CLASSNAME_LITERAL = `> ${ATTR_CLASSNAME}${LITERAL_TYPE}`
const HAS_CONVERTIBLE_SHR_CLASS = `[value.value=/${CONVERTIBLE_SHR_PATTERN}/]`
const NOT_HAS_CONVERTIBLE_SHR_CLASS = `:not(${HAS_CONVERTIBLE_SHR_CLASS})`
const NOT_HAS_CLASSNAME = `:not(:has(${ATTR_CLASSNAME}))`
const NOT_HAS_SPREAD = ':not(:has(JSXSpreadAttribute))'

// セレクタ構築用の共通パターン
const TEXT_WITHOUT_TEXT_PROPS = `${TEXT_OPENING}${NOT_HAS_TEXT_PROPS}`
const CLASSNAME_WITH_CONVERTIBLE_SHR = `${CHILD_CLASSNAME_LITERAL}${HAS_CONVERTIBLE_SHR_CLASS}`

// ============================================================
// ESLintセレクタ
// ============================================================
// Stage 1: shr-クラス → Text属性変換
const SELECTOR_CONVERTIBLE_SHR_TO_PROPS = `${TEXT_WITHOUT_TEXT_PROPS}${NOT_HAS_SPREAD} ${CLASSNAME_WITH_CONVERTIBLE_SHR}`
const SELECTOR_CONVERTIBLE_SHR_TO_PROPS_WITH_SPREAD = `${TEXT_WITHOUT_TEXT_PROPS}:has(JSXSpreadAttribute) ${CLASSNAME_WITH_CONVERTIBLE_SHR}`

// Stage 2: Text専用属性なし → HTML要素変換
const SELECTOR_UNNECESSARY_TEXT_NO_ATTRS = `${TEXT_OPENING}:not(:has(JSXAttribute))${NOT_HAS_SPREAD}`
const SELECTOR_UNNECESSARY_TEXT_NO_CLASSNAME = `${TEXT_WITHOUT_TEXT_PROPS}${NOT_HAS_CLASSNAME}:has(JSXAttribute)${NOT_HAS_SPREAD}:not(:has(${ATTR_AS}:not(${LITERAL_TYPE})))`
const SELECTOR_UNNECESSARY_TEXT_WITH_CLASSNAME = `${TEXT_WITHOUT_TEXT_PROPS}:has(${ATTR_CLASSNAME}${LITERAL_TYPE}${NOT_HAS_CONVERTIBLE_SHR_CLASS})${NOT_HAS_SPREAD}:not(:has(${ATTR_AS}:not(${LITERAL_TYPE})))`

// 矛盾検出
const SELECTOR_CONFLICTING_PROPS_SHR = `${TEXT_OPENING}${HAS_TEXT_PROPS}${NOT_HAS_SPREAD} ${CHILD_CLASSNAME_LITERAL}`

// ============================================================
// ヘルパー関数
// ============================================================

/**
 * className属性から変換可能なクラス名のみを抽出（矛盾検出用）
 */
function getConvertible(classNameAttrNode) {
  const classNames = classNameAttrNode.value.value.split(REGEX_CLASSNAME_SPLIT)
  const convertibleClassNames = []

  for (const className of classNames) {
    if (CLASS_TO_PROP_MAP[className]) {
      convertibleClassNames.push(className)
    }
  }

  return convertibleClassNames.join(', ')
}

/**
 * className属性を変換可能/不可能に分類し、Text属性ペアを生成
 */
function categorizeClassNames(classNameAttrNode) {
  const classNames = classNameAttrNode.value.value.split(REGEX_CLASSNAME_SPLIT)
  const convertibleClassNames = []
  const nonConvertibleClassNames = []
  const propPairs = []

  for (const className of classNames) {
    const mapping = CLASS_TO_PROP_MAP[className]
    if (mapping) {
      convertibleClassNames.push(className)
      propPairs.push(`${mapping.prop}="${mapping.value}"`)
    } else {
      nonConvertibleClassNames.push(className)
    }
  }

  return {
    nonConvertible: nonConvertibleClassNames.join(' '),
    propSuggestions: propPairs.join(' '),
    convertible: convertibleClassNames.join(', '),
  }
}

/**
 * 属性の文字列リテラル値を取得
 */
function getAttributeLiteralValue(openingElement, attrName) {
  const attr = openingElement.attributes.find(
    attr => attr.type === 'JSXAttribute' && attr.name.name === attrName
  )
  return attr?.value?.value ?? null
}

/**
 * 属性ノードを取得
 */
function getAttributeNode(openingElement, attrName) {
  return openingElement.attributes.find(
    attr => attr.type === 'JSXAttribute' && attr.name.name === attrName
  )
}

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    schema: SCHEMA,
  },
  create(context) {
    return {
      // Stage 1: shr-クラス → Text属性変換（spread attributesなし）
      [SELECTOR_CONVERTIBLE_SHR_TO_PROPS]: (classNameAttrNode) => {
        const { nonConvertible, propSuggestions, convertible } = categorizeClassNames(classNameAttrNode)
        const openingElement = classNameAttrNode.parent
        const sourceCode = context.sourceCode || context.getSourceCode()

        context.report({
          node: openingElement,
          message: `classNameで指定されたshr-プレフィックスのクラスは、Textコンポーネントの属性に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <Text ${propSuggestions}${nonConvertible ? ` className="${nonConvertible}"` : ''}>
 - 変換可能なクラス: ${convertible}
 - shr-プレフィックスのクラスをTextの属性に置き換えることで、型安全性が向上し、意図がより明確になります`,
          fix(fixer) {
            const fixes = []
            if (nonConvertible) {
              fixes.push(fixer.replaceText(classNameAttrNode.value, `"${nonConvertible}"`))
            } else {
              const tokenBefore = sourceCode.getTokenBefore(classNameAttrNode)
              fixes.push(fixer.removeRange([tokenBefore.range[1], classNameAttrNode.range[1]]))
            }
            const asAttrNode = getAttributeNode(openingElement, 'as')
            if (asAttrNode) {
              fixes.push(fixer.insertTextAfter(asAttrNode, ` ${propSuggestions}`))
            } else {
              fixes.push(fixer.insertTextAfter(openingElement.name, ` ${propSuggestions}`))
            }
            return fixes
          },
        })
      },

      // Stage 1: shr-クラス → Text属性変換（spread attributesあり、fixなし）
      [SELECTOR_CONVERTIBLE_SHR_TO_PROPS_WITH_SPREAD]: (classNameAttrNode) => {
        const { convertible } = categorizeClassNames(classNameAttrNode)
        const openingElement = classNameAttrNode.parent

        context.report({
          node: openingElement,
          message: `classNameで指定されたshr-プレフィックスのクラスは、Textコンポーネントの属性に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 変換可能なクラス: ${convertible}
 - spread attributes ({...props}) があるため自動修正できません。手動で修正してください
 - shr-プレフィックスのクラスをTextの属性に置き換えることで、型安全性が向上し、意図がより明確になります`,
        })
      },

      // Stage 2: 属性なし
      [SELECTOR_UNNECESSARY_TEXT_NO_ATTRS]: (node) => {
        context.report({
          node,
          message: `属性を持たないTextコンポーネントは、<span>に置き換えるか、要素を削除してテキストのみにすることを検討してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - Textコンポーネントに属性がない場合、直接HTML要素を使用するか、不要な要素を削除することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください`,
        })
      },

      // Stage 2: classNameなし
      [SELECTOR_UNNECESSARY_TEXT_NO_CLASSNAME]: (node) => {
        const asValue = getAttributeLiteralValue(node, 'as')
        const tagName = asValue || 'span'
        const sourceCode = context.sourceCode || context.getSourceCode()

        context.report({
          node,
          message: asValue
            ? `as属性のみを持つTextコンポーネントは、ネイティブHTML要素（<${tagName}>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - Textコンポーネントにas以外の属性がない場合、直接HTML要素を使用することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください`
            : `Textコンポーネントの機能を使用していないため、ネイティブHTML要素（<span>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <span>
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります`,
          fix(fixer) {
            const jsxElement = node.parent
            const fixes = []
            // as属性があれば削除
            if (asValue) {
              const asAttrNode = getAttributeNode(node, 'as')
              const tokenBefore = sourceCode.getTokenBefore(asAttrNode)
              fixes.push(fixer.removeRange([tokenBefore.range[1], asAttrNode.range[1]]))
            }
            fixes.push(fixer.replaceText(node.name, tagName))
            fixes.push(fixer.replaceText(jsxElement.closingElement.name, tagName))
            return fixes
          },
        })
      },

      // Stage 2: classNameあり
      [SELECTOR_UNNECESSARY_TEXT_WITH_CLASSNAME]: (node) => {
        const asValue = getAttributeLiteralValue(node, 'as')
        const classNameValue = getAttributeLiteralValue(node, 'className')
        const tagName = asValue || 'span'
        const sourceCode = context.sourceCode || context.getSourceCode()

        // classNameは常に表示（fixerが自動で保持するため）
        const classNameText = classNameValue ? ` className="${classNameValue}"` : ''

        context.report({
          node,
          message: asValue
            ? `Textコンポーネントの機能を使用していないため、ネイティブHTML要素に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - <${tagName}>要素にclassNameを移動してください
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります`
            : `Textコンポーネントの機能を使用していないため、ネイティブHTML要素（<span>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <span${classNameText}>
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります`,
          fix(fixer) {
            const jsxElement = node.parent
            const fixes = []
            // as属性があれば削除
            if (asValue) {
              const asAttrNode = getAttributeNode(node, 'as')
              const tokenBefore = sourceCode.getTokenBefore(asAttrNode)
              fixes.push(fixer.removeRange([tokenBefore.range[1], asAttrNode.range[1]]))
            }
            fixes.push(fixer.replaceText(node.name, tagName))
            fixes.push(fixer.replaceText(jsxElement.closingElement.name, tagName))
            return fixes
          },
        })
      },

      // 矛盾検出
      [SELECTOR_CONFLICTING_PROPS_SHR]: (classNameAttrNode) => {
        const convertible = getConvertible(classNameAttrNode)
        if (convertible) {
          context.report({
            node: classNameAttrNode.parent,
            message: `Textコンポーネントの属性とclassNameで矛盾する指定があります。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 変換可能なクラス: ${convertible}
 - Textコンポーネントの属性（size、weight、color等）とclassNameのshr-プレフィックスのクラスを同時に使用すると、意図しない挙動になる可能性があります
 - どちらか一方のみを使用してください`,
          })
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
