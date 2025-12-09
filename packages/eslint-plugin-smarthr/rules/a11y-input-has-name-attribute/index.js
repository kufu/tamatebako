const fs = require('fs')

const JSON5 = require('json5')

const OPTION = (() => {
  const file = `${process.cwd()}/package.json`

  if (fs.existsSync(file)) {
    return {
      react_hook_form: Object.keys(JSON5.parse(fs.readFileSync(file)).dependencies).includes('react-hook-form'),
    }
  }

  return {}
})()

const INPUT_ELEMENT = 'JSXOpeningElement[name.name=/((I|^i)nput|(T|^t)extarea|(S|^s)elect|InputFile|RadioButton(Panel)?|(Check|Combo)(B|b)ox|(Date|Wareki|Time)Picker|DropZone)$/]'
const INPUT_ELEMENT_WITHOUT_RADIO = 'JSXOpeningElement[name.name=/((I|^i)nput|(T|^t)extarea|(S|^s)elect|InputFile|(Check|Combo)(B|b)ox|(Date|Wareki|Time)Picker|DropZone)$/]'
const RADIO_ELEMENT = 'JSXOpeningElement:matches([name.name=/RadioButton(Panel)?$/],[name.name=/(I|^i)nput?$/]:has(JSXAttribute[name.name="type"][value.value="radio"]))'
const NAME_ATTRIBUTE = 'JSXAttribute[name.name="name"]'

const INPUT_NAME_REGEX = /^[a-zA-Z0-9_\[\]]+$/.toString()

const MESSAGE_PART_FORMAT = `"${INPUT_NAME_REGEX.toString()}"にmatchするフォーマットで命名してください`
const MESSAGE_UNDEFINED_NAME_PART = `
 - ブラウザの自動補完が有効化されるなどのメリットがあります
 - より多くのブラウザが自動補完を行える可能性を上げるため、${MESSAGE_PART_FORMAT}`

const SCHEMA = [
  {
    type: 'object',
    properties: {
      checkType: { type: 'string', enum: ['always', 'allow-spread-attributes'], default: 'always' },
    },
    additionalProperties: false,
  },
]

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
    const checkType = option.checkType || 'always'

    const notHasSpreadAttribute =
      option.checkType == 'allow-spread-attributes'
        ? ':not(:has(JSXSpreadAttribute))'
        : OPTION.react_hook_form ? ':not(:has(JSXSpreadAttribute CallExpression[callee.name="register"]))' : ''

    return {
      [`${INPUT_ELEMENT_WITHOUT_RADIO}:not(:has(:matches(${NAME_ATTRIBUTE},JSXAttribute[name.name="type"][value.value="radio"])))${notHasSpreadAttribute}`]: (node) => {
        context.report({
          node,
          message: `${node.name.name} にname属性を指定してください${MESSAGE_UNDEFINED_NAME_PART}
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-input-has-name-attribute`,
        })
      },
      [`${RADIO_ELEMENT}:not(:has(${NAME_ATTRIBUTE}))${notHasSpreadAttribute}`]: (node) => {
        context.report({
          node,
          message: `${node.name.name} にグループとなる他のinput[radio]と同じname属性を指定してください
 - 適切に指定することで同じname属性を指定したinput[radio]とグループが確立され、適切なキーボード操作を行えるようになります${MESSAGE_UNDEFINED_NAME_PART}
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-input-has-name-attribute`,
        })
      },
      [`${INPUT_ELEMENT}${notHasSpreadAttribute} ${NAME_ATTRIBUTE}[value.value]:not([value.value=${INPUT_NAME_REGEX}])`]: (node) => {
        context.report({
          node,
          message: `${node.parent.name.name} のname属性の値(${node.value.value})はブラウザの自動補完が適切に行えない可能性があるため${MESSAGE_PART_FORMAT}
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-input-has-name-attribute`,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
