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

// Textコンポーネントのスタイリングプロパティ
const TEXT_STYLE_PROPS = ['size', 'weight', 'color', 'leading', 'italic', 'whiteSpace', 'maxLines', 'styleType', 'icon']

/**
 * className属性からクラス名の配列を取得
 */
function getClassNames(classNameAttr) {
  if (!classNameAttr || !classNameAttr.value) {
    return []
  }

  // Literal（文字列リテラル）の場合のみ処理
  if (classNameAttr.value.type !== 'Literal' || typeof classNameAttr.value.value !== 'string') {
    return null // 静的解析不可能
  }

  return classNameAttr.value.value.split(/\s+/).filter(Boolean)
}

/**
 * クラス名を変換可能/不可能に分類
 */
function categorizeClasses(classNames) {
  const convertible = []
  const nonConvertible = []

  for (const className of classNames) {
    if (CLASS_TO_PROP_MAP[className]) {
      convertible.push(className)
    } else {
      nonConvertible.push(className)
    }
  }

  return { convertible, nonConvertible }
}

/**
 * 変換可能なクラス名からTextプロパティへの推奨を生成
 */
function generatePropSuggestions(convertibleClasses) {
  const propMap = {}

  for (const className of convertibleClasses) {
    const mapping = CLASS_TO_PROP_MAP[className]
    propMap[mapping.prop] = mapping.value
  }

  return Object.entries(propMap)
    .map(([prop, value]) => `${prop}="${value}"`)
    .join(' ')
}

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    schema: SCHEMA,
  },
  create(context) {
    return {
      'JSXOpeningElement[name.name="Text"]': (node) => {
        const attributes = node.attributes

        // 属性を分類
        const asAttr = attributes.find(attr => attr.type === 'JSXAttribute' && attr.name.name === 'as')
        const classNameAttr = attributes.find(attr => attr.type === 'JSXAttribute' && attr.name.name === 'className')
        const hasTextStyleProps = attributes.some(attr =>
          attr.type === 'JSXAttribute' && TEXT_STYLE_PROPS.includes(attr.name.name)
        )

        // classNameの解析
        const classNames = classNameAttr ? getClassNames(classNameAttr) : []

        // 早期リターン: classNameが静的解析不可能な場合はスキップ
        if (classNames === null) {
          return
        }

        const { convertible, nonConvertible } = categorizeClasses(classNames)

        // Textのスタイリングプロパティがある場合、shr-クラスとの矛盾をチェック
        if (hasTextStyleProps) {
          if (convertible.length > 0) {
            context.report({
              node,
              message: `Textコンポーネントの属性とclassNameで矛盾する指定があります。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 変換可能なクラス: ${convertible.join(', ')}
 - Textコンポーネントの属性（size、weight、color等）とclassNameのshr-プレフィックスのクラスを同時に使用すると、意図しない挙動になる可能性があります
 - どちらか一方のみを使用してください`,
            })
          }
          return
        }

        const hasShrClasses = convertible.length > 0

        // パターン1: className なし
        if (!classNameAttr) {
          // 1-1: 属性なし
          if (attributes.length === 0) {
            context.report({
              node,
              message: `属性を持たないTextコンポーネントは、<span>に置き換えるか、要素を削除してテキストのみにすることを検討してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - Textコンポーネントに属性がない場合、直接HTML要素を使用するか、不要な要素を削除することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください`,
            })
            return
          }

          // 1-2: as属性のみ
          if (attributes.length === 1 && asAttr && asAttr.value && asAttr.value.type === 'Literal') {
            context.report({
              node,
              message: `as属性のみを持つTextコンポーネントは、ネイティブHTML要素（<${asAttr.value.value}>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - Textコンポーネントにas以外の属性がない場合、直接HTML要素を使用することでシンプルになります
 - weight、size、color等の属性がある場合は、Textコンポーネントのまま利用してください`,
            })
          }
          return
        }

        // パターン2: shr-クラスがある場合
        if (hasShrClasses) {
          const propSuggestions = generatePropSuggestions(convertible)
          const asValue = asAttr && asAttr.value && asAttr.value.type === 'Literal' ? asAttr.value.value : null
          const asString = asValue ? ` as="${asValue}"` : ''
          const remainingClassName = nonConvertible.length > 0 ? ` className="${nonConvertible.join(' ')}"` : ''

          // 2-1, 2-2: すべて変換可能
          if (nonConvertible.length === 0) {
            context.report({
              node,
              message: `classNameで指定されたshr-プレフィックスのクラスは、Textコンポーネントの属性に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <Text${asString} ${propSuggestions}>
 - shr-プレフィックスのクラスをTextの属性に置き換えることで、型安全性が向上し、意図がより明確になります`,
            })
          } else {
            // 2-3: 一部のみ変換可能
            context.report({
              node,
              message: `classNameで指定されたshr-プレフィックスのクラスは、Textコンポーネントの属性に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <Text${asString} ${propSuggestions}${remainingClassName}>
 - 変換可能なクラス: ${convertible.join(', ')}
 - shr-プレフィックスのクラスをTextの属性に置き換えることで、型安全性が向上し、意図がより明確になります`,
            })
          }
          return
        }

        // パターン3: shr-クラスがなく、変換不可能なクラスのみ
        if (nonConvertible.length > 0) {
          const asValue = asAttr && asAttr.value && asAttr.value.type === 'Literal' ? asAttr.value.value : null

          // 1-3: classNameのみ（as なし）
          if (!asAttr) {
            context.report({
              node,
              message: `Textコンポーネントの機能を使用していないため、ネイティブHTML要素（<span>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <span className="${nonConvertible.join(' ')}">
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります`,
            })
            return
          }

          // 1-4: className + as
          if (asValue) {
            context.report({
              node,
              message: `Textコンポーネントの機能を使用していないため、ネイティブHTML要素（<${asValue}>）に置き換えてください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component
 - 推奨: <${asValue} className="${nonConvertible.join(' ')}">
 - Textコンポーネントの機能（weight、size、color等）を使用しない場合は、直接HTML要素を使用することでシンプルになります`,
            })
          }
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
