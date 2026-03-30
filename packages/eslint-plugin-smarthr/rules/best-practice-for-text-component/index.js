const SCHEMA = []

// smarthr-ui/Textコンポーネントのクラス名とプロパティのマッピング
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

// ESLintセレクタの基本要素
const ATTR_AS = 'JSXAttribute[name.name="as"]'
const ATTR_CLASSNAME = 'JSXAttribute[name.name="className"]'
const ATTR_TEXT_PROPS = 'JSXAttribute[name.name=/^(size|weight|color|leading|italic|whiteSpace|maxLines|styleType|icon)$/]'
const LITERAL_TYPE = '[value.type="Literal"]'
const HAS_SHR_CLASS = '[value.value=/shr-/]'

// ESLintセレクタの共通部分
const TEXT_OPENING = 'JSXOpeningElement[name.name="Text"]'
const NOT_HAS_AS = `:not(:has(${ATTR_AS}))`
const HAS_TEXT_PROPS = `:has(${ATTR_TEXT_PROPS})`
const NOT_HAS_TEXT_PROPS = `:not(${HAS_TEXT_PROPS})`
const CHILD_CLASSNAME_LITERAL = `> ${ATTR_CLASSNAME}${LITERAL_TYPE}`
const NOT_HAS_SHR_CLASS = `:not(${HAS_SHR_CLASS})`
const CHILD_AS_LITERAL = `> ${ATTR_AS}${LITERAL_TYPE}`

// 完全なESLintセレクタ（事前計算）
const SELECTOR_UNNECESSARY_TEXT_NO_ATTRS = `${TEXT_OPENING}:not(:has(JSXAttribute))`
const SELECTOR_UNNECESSARY_TEXT_ONLY_AS = `${TEXT_OPENING}[attributes.length=1] ${CHILD_AS_LITERAL}`
const SELECTOR_CONVERTIBLE_SHR_TO_PROPS = `${TEXT_OPENING}${NOT_HAS_AS}${NOT_HAS_TEXT_PROPS} ${CHILD_CLASSNAME_LITERAL}${HAS_SHR_CLASS}`
const SELECTOR_UNNECESSARY_TEXT_CLASSNAME = `${TEXT_OPENING}${NOT_HAS_AS}${NOT_HAS_TEXT_PROPS} ${CHILD_CLASSNAME_LITERAL}${NOT_HAS_SHR_CLASS}`
const SELECTOR_CONVERTIBLE_SHR_TO_PROPS_WITH_AS = `${TEXT_OPENING}:has(${ATTR_AS}${LITERAL_TYPE})${NOT_HAS_TEXT_PROPS} ${CHILD_CLASSNAME_LITERAL}${HAS_SHR_CLASS}`
const SELECTOR_UNNECESSARY_TEXT_AS_CLASSNAME = `${TEXT_OPENING}:has(${ATTR_CLASSNAME}${LITERAL_TYPE}${NOT_HAS_SHR_CLASS})${NOT_HAS_TEXT_PROPS} ${CHILD_AS_LITERAL}`
const SELECTOR_CONFLICTING_PROPS_SHR = `${TEXT_OPENING}${HAS_TEXT_PROPS} ${CHILD_CLASSNAME_LITERAL}`

/**
 * className属性の変換可能なクラス名のみを取得（パターン3専用: 矛盾チェック）
 * セレクタで [value.type="Literal"] を保証しているため、必ず文字列リテラル
 * trim-props ルールで先頭・末尾の空白は禁止されているため、trim() は不要
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
 * className属性のクラス名を解析し、1回のループで全ての情報を生成（パターン2-1, 2-2, 2-3専用）
 * セレクタで [value.type="Literal"] を保証しているため、必ず文字列リテラル
 * trim-props ルールで先頭・末尾の空白は禁止されているため、trim() は不要
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
 * 指定した属性の値を取得（文字列リテラルのみ）
 * セレクタで [value.type="Literal"] を保証しているため、型チェックは不要
 */
function getAttributeLiteralValue(openingElement, attrName) {
  const attr = openingElement.attributes.find(
    attr => attr.type === 'JSXAttribute' && attr.name.name === attrName
  )
  return attr?.value?.value ?? null
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
      // パターン1-1: 属性なし
      [SELECTOR_UNNECESSARY_TEXT_NO_ATTRS]: (node) => {
        context.report({
          node,
          message: `属性を持たないTextコンポーネントは、<span>に置き換えるか、要素を削除してテキストのみにすることを検討してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - Textコンポーネントに属性がない場合、直接HTML要素を使用するか、不要な要素を削除することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください`,
        })
      },

      // パターン1-2: as属性のみ（文字列リテラル）
      [SELECTOR_UNNECESSARY_TEXT_ONLY_AS]: (asAttrNode) => {
        const tagName = asAttrNode.value.value

        context.report({
          node: asAttrNode.parent,
          message: `as属性のみを持つTextコンポーネントは、ネイティブHTML要素（<${tagName}>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - Textコンポーネントにas以外の属性がない場合、直接HTML要素を使用することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください`,
          fix(fixer) {
            const openingElement = asAttrNode.parent
            const jsxElement = openingElement.parent
            const sourceCode = context.getSourceCode()
            const content = sourceCode.getText(jsxElement).slice(
              jsxElement.openingElement.range[1] - jsxElement.range[0],
              jsxElement.closingElement ? jsxElement.closingElement.range[0] - jsxElement.range[0] : undefined
            )

            return openingElement.selfClosing
              ? fixer.replaceText(openingElement, `<${tagName} />`)
              : [
                  fixer.replaceText(openingElement, `<${tagName}>`),
                  fixer.replaceText(jsxElement.closingElement, `</${tagName}>`)
                ]
          },
        })
      },

      // パターン2-1: classNameのみ（asなし）、Text属性なし、shr-クラスあり
      [SELECTOR_CONVERTIBLE_SHR_TO_PROPS]: (classNameAttrNode) => {
        const { nonConvertible, propSuggestions, convertible } = categorizeClassNames(classNameAttrNode)

        context.report({
          node: classNameAttrNode.parent,
          message: `classNameで指定されたshr-プレフィックスのクラスは、Textコンポーネントの属性に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <Text ${propSuggestions}${nonConvertible ? ` className="${nonConvertible}"` : ''}>
 - 変換可能なクラス: ${convertible}
 - shr-プレフィックスのクラスをTextの属性に置き換えることで、型安全性が向上し、意図がより明確になります`,
          fix(fixer) {
            const openingElement = classNameAttrNode.parent
            const attributesText = nonConvertible ? `${propSuggestions} className="${nonConvertible}"` : propSuggestions
            const closingBracket = openingElement.selfClosing ? ' />' : '>'

            return fixer.replaceText(openingElement, `<Text ${attributesText}${closingBracket}`)
          },
        })
      },

      // パターン1-3: classNameのみ（asなし）、Text属性なし、shr-クラスなし
      [SELECTOR_UNNECESSARY_TEXT_CLASSNAME]: (classNameAttrNode) => {
        const classNameText = `className="${classNameAttrNode.value.value}"`

        context.report({
          node: classNameAttrNode.parent,
          message: `Textコンポーネントの機能を使用していないため、ネイティブHTML要素（<span>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <span ${classNameText}>
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります`,
          fix(fixer) {
            const openingElement = classNameAttrNode.parent
            const jsxElement = openingElement.parent

            return openingElement.selfClosing
              ? fixer.replaceText(openingElement, `<span ${classNameText} />`)
              : [
                  fixer.replaceText(openingElement, `<span ${classNameText}>`),
                  fixer.replaceText(jsxElement.closingElement, '</span>')
                ]
          },
        })
      },

      // パターン2-2, 2-3: className + as（文字列リテラル）、Text属性なし、shr-クラスあり
      [SELECTOR_CONVERTIBLE_SHR_TO_PROPS_WITH_AS]: (classNameAttrNode) => {
        const { nonConvertible, propSuggestions, convertible } = categorizeClassNames(classNameAttrNode)
        const openingElement = classNameAttrNode.parent
        const asValue = getAttributeLiteralValue(openingElement, 'as')

        context.report({
          node: openingElement,
          message: `classNameで指定されたshr-プレフィックスのクラスは、Textコンポーネントの属性に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <Text${asValue ? ` as="${asValue}"` : ''} ${propSuggestions}${nonConvertible ? ` className="${nonConvertible}"` : ''}>
 - 変換可能なクラス: ${convertible}
 - shr-プレフィックスのクラスをTextの属性に置き換えることで、型安全性が向上し、意図がより明確になります`,
          fix(fixer) {
            const asText = asValue ? `as="${asValue}" ` : ''
            const classNameText = nonConvertible ? ` className="${nonConvertible}"` : ''
            const attributesText = `${asText}${propSuggestions}${classNameText}`
            const closingBracket = openingElement.selfClosing ? ' />' : '>'

            return fixer.replaceText(openingElement, `<Text ${attributesText}${closingBracket}`)
          },
        })
      },

      // パターン1-4: className + as（文字列リテラル）、Text属性なし、shr-クラスなし
      [SELECTOR_UNNECESSARY_TEXT_AS_CLASSNAME]: (asAttrNode) => {
        const tagName = asAttrNode.value.value
        const openingElement = asAttrNode.parent
        const classNameValue = getAttributeLiteralValue(openingElement, 'className')
        const classNameText = `className="${classNameValue}"`

        context.report({
          node: openingElement,
          message: `Textコンポーネントの機能を使用していないため、ネイティブHTML要素に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - <${tagName}>要素にclassNameを移動してください
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります`,
          fix(fixer) {
            const jsxElement = openingElement.parent

            return openingElement.selfClosing
              ? fixer.replaceText(openingElement, `<${tagName} ${classNameText} />`)
              : [
                  fixer.replaceText(openingElement, `<${tagName} ${classNameText}>`),
                  fixer.replaceText(jsxElement.closingElement, `</${tagName}>`)
                ]
          },
        })
      },

      // パターン3: Text属性あり、classNameにshr-クラスあり（矛盾）
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
