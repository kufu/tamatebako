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
const ATTR_KEY = 'JSXAttribute[name.name="key"]'
const ATTR_TEXT_PROPS = 'JSXAttribute[name.name=/^(size|weight|color|leading|italic|whiteSpace|maxLines|styleType|icon|prefixIcon|suffixIcon|iconGap)$/]'
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
const HAS_KEY = `:has(${ATTR_KEY})`
const NOT_HAS_KEY = `:not(:has(${ATTR_KEY}))`
const NOT_HAS_CLASSNAME = `:not(:has(${ATTR_CLASSNAME}))`
const NOT_HAS_NON_KEY_ATTRS = `:not(:has(JSXAttribute[name.name!="key"]))`

// 完全なESLintセレクタ（事前計算）
// key属性なし
const SELECTOR_UNNECESSARY_TEXT_NO_ATTRS = `${TEXT_OPENING}:not(:has(JSXAttribute))`
const SELECTOR_UNNECESSARY_TEXT_ONLY_AS = `${TEXT_OPENING}[attributes.length=1] ${CHILD_AS_LITERAL}`
const SELECTOR_CONVERTIBLE_SHR_TO_PROPS = `${TEXT_OPENING}${NOT_HAS_AS}${NOT_HAS_TEXT_PROPS}${NOT_HAS_KEY} ${CHILD_CLASSNAME_LITERAL}${HAS_SHR_CLASS}`
const SELECTOR_UNNECESSARY_TEXT_CLASSNAME = `${TEXT_OPENING}${NOT_HAS_AS}${NOT_HAS_TEXT_PROPS}${NOT_HAS_KEY} ${CHILD_CLASSNAME_LITERAL}${NOT_HAS_SHR_CLASS}`
const SELECTOR_CONVERTIBLE_SHR_TO_PROPS_WITH_AS = `${TEXT_OPENING}:has(${ATTR_AS}${LITERAL_TYPE})${NOT_HAS_TEXT_PROPS}${NOT_HAS_KEY} ${CHILD_CLASSNAME_LITERAL}${HAS_SHR_CLASS}`
const SELECTOR_UNNECESSARY_TEXT_AS_CLASSNAME = `${TEXT_OPENING}:has(${ATTR_CLASSNAME}${LITERAL_TYPE}${NOT_HAS_SHR_CLASS})${NOT_HAS_TEXT_PROPS}${NOT_HAS_KEY} ${CHILD_AS_LITERAL}`
// key属性あり
const SELECTOR_UNNECESSARY_TEXT_ONLY_KEY = `${TEXT_OPENING}${HAS_KEY}${NOT_HAS_NON_KEY_ATTRS}`
const SELECTOR_UNNECESSARY_TEXT_KEY_AS = `${TEXT_OPENING}${HAS_KEY}:has(${ATTR_AS}${LITERAL_TYPE}):not(:has(${ATTR_CLASSNAME})):not(:has(JSXAttribute[name.name!=/^(key|as)$/]))`
const SELECTOR_UNNECESSARY_TEXT_KEY_CLASSNAME = `${TEXT_OPENING}${HAS_KEY}${NOT_HAS_AS}${NOT_HAS_TEXT_PROPS}:has(${ATTR_CLASSNAME}${LITERAL_TYPE}${NOT_HAS_SHR_CLASS}):not(:has(JSXAttribute[name.name!=/^(key|className)$/]))`
const SELECTOR_CONVERTIBLE_SHR_TO_PROPS_WITH_KEY = `${TEXT_OPENING}${HAS_KEY}${NOT_HAS_AS}${NOT_HAS_TEXT_PROPS} ${CHILD_CLASSNAME_LITERAL}${HAS_SHR_CLASS}`
const SELECTOR_CONVERTIBLE_SHR_TO_PROPS_WITH_KEY_AS = `${TEXT_OPENING}${HAS_KEY}:has(${ATTR_AS}${LITERAL_TYPE})${NOT_HAS_TEXT_PROPS} ${CHILD_CLASSNAME_LITERAL}${HAS_SHR_CLASS}`
const SELECTOR_UNNECESSARY_TEXT_KEY_AS_CLASSNAME = `${TEXT_OPENING}${HAS_KEY}:has(${ATTR_AS}${LITERAL_TYPE}):has(${ATTR_CLASSNAME}${LITERAL_TYPE}${NOT_HAS_SHR_CLASS})${NOT_HAS_TEXT_PROPS}:not(:has(JSXAttribute[name.name!=/^(key|as|className)$/]))`
const SELECTOR_UNNECESSARY_TEXT_KEY_OTHER_ATTRS = `${TEXT_OPENING}${HAS_KEY}${NOT_HAS_TEXT_PROPS}:not(:has(${ATTR_AS})):not(:has(${ATTR_CLASSNAME})):has(JSXAttribute[name.name!="key"])`
const SELECTOR_UNNECESSARY_TEXT_KEY_AS_OTHER_ATTRS = `${TEXT_OPENING}${HAS_KEY}:has(${ATTR_AS}${LITERAL_TYPE})${NOT_HAS_TEXT_PROPS}:not(:has(${ATTR_CLASSNAME})):has(JSXAttribute[name.name!=/^(key|as)$/])`
const SELECTOR_UNNECESSARY_TEXT_KEY_CLASSNAME_OTHER_ATTRS = `${TEXT_OPENING}${HAS_KEY}:has(${ATTR_CLASSNAME}${LITERAL_TYPE})${NOT_HAS_AS}${NOT_HAS_TEXT_PROPS}:has(JSXAttribute[name.name!=/^(key|className)$/])`
const SELECTOR_UNNECESSARY_TEXT_KEY_AS_CLASSNAME_OTHER_ATTRS = `${TEXT_OPENING}${HAS_KEY}:has(${ATTR_AS}${LITERAL_TYPE}):has(${ATTR_CLASSNAME}${LITERAL_TYPE})${NOT_HAS_TEXT_PROPS}:has(JSXAttribute[name.name!=/^(key|as|className)$/])`
// 矛盾検出
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
 * 指定した属性名の属性ノードを取得
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

      // パターン1-1b: key属性のみ
      [SELECTOR_UNNECESSARY_TEXT_ONLY_KEY]: (node) => {
        context.report({
          node,
          message: `Textコンポーネントの機能を使用していないため、ネイティブHTML要素（<span>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <span>
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります`,
          fix(fixer) {
            const jsxElement = node.parent

            return [
              fixer.replaceText(node.name, 'span'),
              fixer.replaceText(jsxElement.closingElement.name, 'span')
            ]
          },
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
            const sourceCode = context.sourceCode || context.getSourceCode()

            // 属性とその前のスペースを含めて削除
            const tokenBefore = sourceCode.getTokenBefore(asAttrNode)
            const rangeStart = tokenBefore.range[1]
            const rangeEnd = asAttrNode.range[1]

            return [
              fixer.removeRange([rangeStart, rangeEnd]),
              fixer.replaceText(openingElement.name, tagName),
              fixer.replaceText(jsxElement.closingElement.name, tagName)
            ]
          },
        })
      },

      // パターン1-2b: key + as属性のみ（文字列リテラル）
      [SELECTOR_UNNECESSARY_TEXT_KEY_AS]: (node) => {
        const asValue = getAttributeLiteralValue(node, 'as')

        context.report({
          node,
          message: `as属性のみを持つTextコンポーネントは、ネイティブHTML要素（<${asValue}>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - Textコンポーネントにas以外の属性がない場合、直接HTML要素を使用することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください`,
          fix(fixer) {
            const jsxElement = node.parent
            const sourceCode = context.sourceCode || context.getSourceCode()
            const asAttrNode = getAttributeNode(node, 'as')

            // 属性とその前のスペースを含めて削除
            const tokenBefore = sourceCode.getTokenBefore(asAttrNode)
            const rangeStart = tokenBefore.range[1]
            const rangeEnd = asAttrNode.range[1]

            return [
              fixer.removeRange([rangeStart, rangeEnd]),
              fixer.replaceText(node.name, asValue),
              fixer.replaceText(jsxElement.closingElement.name, asValue)
            ]
          },
        })
      },

      // パターン2-1: classNameのみ（asなし）、Text属性なし、shr-クラスあり
      [SELECTOR_CONVERTIBLE_SHR_TO_PROPS]: (classNameAttrNode) => {
        const { nonConvertible, propSuggestions, convertible } = categorizeClassNames(classNameAttrNode)
        const openingElement = classNameAttrNode.parent
        const jsxElement = openingElement.parent

        // 変換可能なクラスが0個の場合、spanに変換（パターン1-3と同じ動作）
        if (!propSuggestions) {
          const classNameText = `className="${classNameAttrNode.value.value}"`
          context.report({
            node: openingElement,
            message: `Textコンポーネントの機能を使用していないため、ネイティブHTML要素（<span>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <span ${classNameText}>
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります`,
            fix(fixer) {
              return [
                fixer.replaceText(openingElement.name, 'span'),
                fixer.replaceText(jsxElement.closingElement.name, 'span')
              ]
            },
          })
          return
        }

        // 変換可能なクラスがある場合、属性に変換
        context.report({
          node: openingElement,
          message: `classNameで指定されたshr-プレフィックスのクラスは、Textコンポーネントの属性に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <Text ${propSuggestions}${nonConvertible ? ` className="${nonConvertible}"` : ''}>
 - 変換可能なクラス: ${convertible}
 - shr-プレフィックスのクラスをTextの属性に置き換えることで、型安全性が向上し、意図がより明確になります`,
          fix(fixer) {
            const sourceCode = context.sourceCode || context.getSourceCode()
            const fixes = []

            if (nonConvertible) {
              // classNameの値を更新（属性自体は残す）
              fixes.push(fixer.replaceText(classNameAttrNode.value, `"${nonConvertible}"`))
            } else {
              // className属性全体を削除（shr-クラスのみの場合）
              const tokenBefore = sourceCode.getTokenBefore(classNameAttrNode)
              const rangeStart = tokenBefore.range[1]
              const rangeEnd = classNameAttrNode.range[1]
              fixes.push(fixer.removeRange([rangeStart, rangeEnd]))
            }

            // 新しいpropsを追加
            fixes.push(fixer.insertTextAfter(openingElement.name, ` ${propSuggestions}`))

            return fixes
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

            return [
              fixer.replaceText(openingElement.name, 'span'),
              fixer.replaceText(jsxElement.closingElement.name, 'span')
            ]
          },
        })
      },

      // パターン1-3b: key + classNameのみ（asなし）、Text属性なし、shr-クラスなし
      [SELECTOR_UNNECESSARY_TEXT_KEY_CLASSNAME]: (node) => {
        const classNameValue = getAttributeLiteralValue(node, 'className')
        const classNameText = `className="${classNameValue}"`

        context.report({
          node,
          message: `Textコンポーネントの機能を使用していないため、ネイティブHTML要素（<span>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <span ${classNameText}>
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります`,
          fix(fixer) {
            const jsxElement = node.parent

            return [
              fixer.replaceText(node.name, 'span'),
              fixer.replaceText(jsxElement.closingElement.name, 'span')
            ]
          },
        })
      },

      // パターン1-4: key + その他属性（as/className/Text専用属性以外）
      [SELECTOR_UNNECESSARY_TEXT_KEY_OTHER_ATTRS]: (node) => {
        context.report({
          node,
          message: `Textコンポーネントの機能を使用していないため、ネイティブHTML要素（<span>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <span>
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります`,
          fix(fixer) {
            const jsxElement = node.parent

            return [
              fixer.replaceText(node.name, 'span'),
              fixer.replaceText(jsxElement.closingElement.name, 'span')
            ]
          },
        })
      },

      // パターン2-1: classNameのみ（asなし）、Text属性なし、shr-クラスあり
      [SELECTOR_CONVERTIBLE_SHR_TO_PROPS_WITH_AS]: (classNameAttrNode) => {
        const { nonConvertible, propSuggestions, convertible } = categorizeClassNames(classNameAttrNode)
        const openingElement = classNameAttrNode.parent
        const jsxElement = openingElement.parent
        const asValue = getAttributeLiteralValue(openingElement, 'as')

        // 変換可能なクラスが0個の場合、as属性で指定されたタグに変換（パターン1-4と同じ動作）
        if (!propSuggestions) {
          const classNameValue = getAttributeLiteralValue(openingElement, 'className')
          const classNameText = `className="${classNameValue}"`
          context.report({
            node: openingElement,
            message: `Textコンポーネントの機能を使用していないため、ネイティブHTML要素に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - <${asValue}>要素にclassNameを移動してください
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります`,
            fix(fixer) {
              const sourceCode = context.sourceCode || context.getSourceCode()
              const asAttrNode = getAttributeNode(openingElement, 'as')

              // 属性とその前のスペースを含めて削除
              const tokenBefore = sourceCode.getTokenBefore(asAttrNode)
              const rangeStart = tokenBefore.range[1]
              const rangeEnd = asAttrNode.range[1]

              return [
                fixer.removeRange([rangeStart, rangeEnd]),
                fixer.replaceText(openingElement.name, asValue),
                fixer.replaceText(jsxElement.closingElement.name, asValue)
              ]
            },
          })
          return
        }

        // 変換可能なクラスがある場合、属性に変換
        context.report({
          node: openingElement,
          message: `classNameで指定されたshr-プレフィックスのクラスは、Textコンポーネントの属性に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <Text${asValue ? ` as="${asValue}"` : ''} ${propSuggestions}${nonConvertible ? ` className="${nonConvertible}"` : ''}>
 - 変換可能なクラス: ${convertible}
 - shr-プレフィックスのクラスをTextの属性に置き換えることで、型安全性が向上し、意図がより明確になります`,
          fix(fixer) {
            const sourceCode = context.sourceCode || context.getSourceCode()
            const fixes = []

            if (nonConvertible) {
              // classNameの値を更新（属性自体は残す）
              fixes.push(fixer.replaceText(classNameAttrNode.value, `"${nonConvertible}"`))
            } else {
              // className属性全体を削除（shr-クラスのみの場合）
              const tokenBefore = sourceCode.getTokenBefore(classNameAttrNode)
              const rangeStart = tokenBefore.range[1]
              const rangeEnd = classNameAttrNode.range[1]
              fixes.push(fixer.removeRange([rangeStart, rangeEnd]))
            }

            // 新しいpropsを追加（as属性がある場合はその後ろに挿入）
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
            const sourceCode = context.sourceCode || context.getSourceCode()

            // 属性とその前のスペースを含めて削除
            const tokenBefore = sourceCode.getTokenBefore(asAttrNode)
            const rangeStart = tokenBefore.range[1]
            const rangeEnd = asAttrNode.range[1]

            return [
              fixer.removeRange([rangeStart, rangeEnd]),
              fixer.replaceText(openingElement.name, tagName),
              fixer.replaceText(jsxElement.closingElement.name, tagName)
            ]
          },
        })
      },

      // パターン2-1-key: key + classNameのみ（asなし）、Text属性なし、shr-クラスあり
      [SELECTOR_CONVERTIBLE_SHR_TO_PROPS_WITH_KEY]: (classNameAttrNode) => {
        const { nonConvertible, propSuggestions, convertible } = categorizeClassNames(classNameAttrNode)
        const openingElement = classNameAttrNode.parent

        context.report({
          node: openingElement,
          message: `classNameで指定されたshr-プレフィックスのクラスは、Textコンポーネントの属性に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <Text ${propSuggestions}${nonConvertible ? ` className="${nonConvertible}"` : ''}>
 - 変換可能なクラス: ${convertible}
 - shr-プレフィックスのクラスをTextの属性に置き換えることで、型安全性が向上し、意図がより明確になります`,
          fix(fixer) {
            const sourceCode = context.sourceCode || context.getSourceCode()
            const fixes = []

            if (nonConvertible) {
              fixes.push(fixer.replaceText(classNameAttrNode.value, `"${nonConvertible}"`))
            } else {
              const tokenBefore = sourceCode.getTokenBefore(classNameAttrNode)
              const rangeStart = tokenBefore.range[1]
              const rangeEnd = classNameAttrNode.range[1]
              fixes.push(fixer.removeRange([rangeStart, rangeEnd]))
            }

            fixes.push(fixer.insertTextAfter(openingElement.name, ` ${propSuggestions}`))

            return fixes
          },
        })
      },

      // パターン2-2-key, 2-3-key: key + className + as（文字列リテラル）、Text属性なし、shr-クラスあり
      [SELECTOR_CONVERTIBLE_SHR_TO_PROPS_WITH_KEY_AS]: (classNameAttrNode) => {
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
            const sourceCode = context.sourceCode || context.getSourceCode()
            const fixes = []

            if (nonConvertible) {
              fixes.push(fixer.replaceText(classNameAttrNode.value, `"${nonConvertible}"`))
            } else {
              const tokenBefore = sourceCode.getTokenBefore(classNameAttrNode)
              const rangeStart = tokenBefore.range[1]
              const rangeEnd = classNameAttrNode.range[1]
              fixes.push(fixer.removeRange([rangeStart, rangeEnd]))
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

      // パターン1-4-key: key + className + as（変換不可能なクラスのみ）
      [SELECTOR_UNNECESSARY_TEXT_KEY_AS_CLASSNAME]: (node) => {
        const asValue = getAttributeLiteralValue(node, 'as')

        context.report({
          node,
          message: `Textコンポーネントの機能を使用していないため、ネイティブHTML要素に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - <${asValue}>要素にclassNameを移動してください
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります`,
          fix(fixer) {
            const jsxElement = node.parent
            const sourceCode = context.sourceCode || context.getSourceCode()
            const asAttrNode = getAttributeNode(node, 'as')

            const tokenBefore = sourceCode.getTokenBefore(asAttrNode)
            const rangeStart = tokenBefore.range[1]
            const rangeEnd = asAttrNode.range[1]

            return [
              fixer.removeRange([rangeStart, rangeEnd]),
              fixer.replaceText(node.name, asValue),
              fixer.replaceText(jsxElement.closingElement.name, asValue)
            ]
          },
        })
      },

      // key + as + その他属性
      [SELECTOR_UNNECESSARY_TEXT_KEY_AS_OTHER_ATTRS]: (node) => {
        const asValue = getAttributeLiteralValue(node, 'as')

        context.report({
          node,
          message: `Textコンポーネントの機能を使用していないため、ネイティブHTML要素（<${asValue}>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <${asValue}>
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります`,
          fix(fixer) {
            const jsxElement = node.parent
            const sourceCode = context.sourceCode || context.getSourceCode()
            const asAttrNode = getAttributeNode(node, 'as')

            const tokenBefore = sourceCode.getTokenBefore(asAttrNode)
            const rangeStart = tokenBefore.range[1]
            const rangeEnd = asAttrNode.range[1]

            return [
              fixer.removeRange([rangeStart, rangeEnd]),
              fixer.replaceText(node.name, asValue),
              fixer.replaceText(jsxElement.closingElement.name, asValue)
            ]
          },
        })
      },

      // key + className + その他属性
      [SELECTOR_UNNECESSARY_TEXT_KEY_CLASSNAME_OTHER_ATTRS]: (node) => {
        context.report({
          node,
          message: `Textコンポーネントの機能を使用していないため、ネイティブHTML要素（<span>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <span>
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります`,
          fix(fixer) {
            const jsxElement = node.parent

            return [
              fixer.replaceText(node.name, 'span'),
              fixer.replaceText(jsxElement.closingElement.name, 'span')
            ]
          },
        })
      },

      // key + as + className + その他属性
      [SELECTOR_UNNECESSARY_TEXT_KEY_AS_CLASSNAME_OTHER_ATTRS]: (node) => {
        const asValue = getAttributeLiteralValue(node, 'as')

        context.report({
          node,
          message: `Textコンポーネントの機能を使用していないため、ネイティブHTML要素（<${asValue}>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <${asValue}>
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります`,
          fix(fixer) {
            const jsxElement = node.parent
            const sourceCode = context.sourceCode || context.getSourceCode()
            const asAttrNode = getAttributeNode(node, 'as')

            const tokenBefore = sourceCode.getTokenBefore(asAttrNode)
            const rangeStart = tokenBefore.range[1]
            const rangeEnd = asAttrNode.range[1]

            return [
              fixer.removeRange([rangeStart, rangeEnd]),
              fixer.replaceText(node.name, asValue),
              fixer.replaceText(jsxElement.closingElement.name, asValue)
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
