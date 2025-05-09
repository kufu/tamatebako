const fs = require('fs')

const JSON5 = require('json5')

const { generateTagFormatter } = require('../../libs/format_styled_components')

const OPTION = (() => {
  const file = `${process.cwd()}/package.json`

  if (!fs.existsSync(file)) {
    return {}
  }

  const json = JSON5.parse(fs.readFileSync(file))
  const dependencies = [...Object.keys(json.dependencies || {}), ...Object.keys(json.devDependencies || {})]

  return {
    react_hook_form: dependencies.includes('react-hook-form'),
  }
})()

const EXPECTED_NAMES = {
  '(i|I)nput$': 'Input$',
  '(t|T)extarea$': 'Textarea$',
  '(s|S)elect$': 'Select$',
  'InputFile$': 'InputFile$',
  'RadioButton$': 'RadioButton$',
  'RadioButtonPanel$': 'RadioButtonPanel$',
  'Check(b|B)ox$': 'Checkbox$',
  'Combo(b|B)ox$': 'Combobox$',
  '(Date|Wareki)Picker$': '(Date|Wareki)Picker$',
  TimePicker$: 'TimePicker$',
  DropZone$: 'DropZone$',
}
const TARGET_TAG_NAME_REGEX = new RegExp(`(${Object.keys(EXPECTED_NAMES).join('|')})`)
const INPUT_NAME_REGEX = /^[a-zA-Z0-9_\[\]]+$/
const INPUT_TAG_REGEX = /(i|I)nput$/
const RADIO_BUTTON_REGEX = /RadioButton(Panel)?$/

const MESSAGE_PART_FORMAT = `"${INPUT_NAME_REGEX.toString()}"にmatchするフォーマットで命名してください`
const MESSAGE_UNDEFINED_NAME_PART = `
 - ブラウザの自動補完が有効化されるなどのメリットがあります
 - より多くのブラウザが自動補完を行える可能性を上げるため、${MESSAGE_PART_FORMAT}`
const MESSAGE_UNDEFINED_FOR_RADIO = `にグループとなる他のinput[radio]と同じname属性を指定してください
 - 適切に指定することで同じname属性を指定したinput[radio]とグループが確立され、適切なキーボード操作を行えるようになります${MESSAGE_UNDEFINED_NAME_PART}`
const MESSAGE_UNDEFINED_FOR_NOT_RADIO = `にname属性を指定してください${MESSAGE_UNDEFINED_NAME_PART}`
const MESSAGE_NAME_FORMAT_SUFFIX = `はブラウザの自動補完が適切に行えない可能性があるため${MESSAGE_PART_FORMAT}`

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

    return {
      ...generateTagFormatter({ context, EXPECTED_NAMES }),
      JSXOpeningElement: (node) => {
        const { name, attributes } = node
        const nodeName = name.name || ''

        if (TARGET_TAG_NAME_REGEX.test(nodeName)) {
          let nameAttr = null
          let hasSpreadAttr = false
          let hasReactHookFormRegisterSpreadAttr = false
          let hasRadioInput = false

          attributes.forEach((a) => {
            if (a.type === 'JSXSpreadAttribute') {
              hasSpreadAttr = true

              if (hasReactHookFormRegisterSpreadAttr === false && a.argument?.callee?.name === 'register') {
                hasReactHookFormRegisterSpreadAttr = true
              }
            } else {
              switch (a.name?.name) {
                case 'name': {
                  nameAttr = a
                  break
                }
                case 'type': {
                  if (a.value.value === 'radio') {
                    hasRadioInput = true
                  }
                  break
                }
              }
            }
          })

          if (nameAttr) {
            const nameValue = nameAttr.value?.value

            if (nameValue && !INPUT_NAME_REGEX.test(nameValue)) {
              context.report({
                node,
                message: `${nodeName} のname属性の値(${nameValue})${MESSAGE_NAME_FORMAT_SUFFIX}`,
              })
            }
          } else if (
            !(OPTION.react_hook_form && hasReactHookFormRegisterSpreadAttr) &&
            (attributes.length === 0 || checkType !== 'allow-spread-attributes' || !hasSpreadAttr)
          ) {
            const isRadio = RADIO_BUTTON_REGEX.test(nodeName) || INPUT_TAG_REGEX.test(nodeName) && hasRadioInput

            context.report({
              node,
              message: `${nodeName} ${isRadio ? MESSAGE_UNDEFINED_FOR_RADIO : MESSAGE_UNDEFINED_FOR_NOT_RADIO}`,
            })
          }
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
