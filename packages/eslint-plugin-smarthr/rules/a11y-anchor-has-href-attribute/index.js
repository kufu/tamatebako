const JSON5 = require('json5')
const fs = require('fs')

const OPTION = (() => {
  const file = `${process.cwd()}/package.json`

  if (fs.existsSync(file)) {
    const json = JSON5.parse(fs.readFileSync(file))

    if (json.dependencies){
      const dependencies = Object.keys(json.dependencies)

      let nextjs = false
      let react_router = false
      const result = () => ({
        nextjs,
        react_router,
      })

      for (let i = 0; i < dependencies.length; i++) {
        switch (dependencies[i]) {
          case 'next':
            nextjs = true

            if (react_router) {
              return result()
            }

            break
          case 'react-router':
            react_router = true

            if (nextjs) {
              return result()
            }

            break
        }
      }
    }
  }

  return {}
})()

const JSX_EXPRESSION_CONTAINER = '[value.type="JSXExpressionContainer"]'
const ANCHOR_ELEMENT = 'JSXOpeningElement[name.name=/(Anchor|Link|^a)$/]'
const HREF_ATTRIBUTE = `JSXAttribute[name.name=${OPTION.react_router ? '/^(href|to)$/' : '"href"'}]`
const NULL_HREF_VALUES = ['#', ''].reduce((prev, v) =>
  `${prev},[value.type="Literal"][value.value="${v}"],${JSX_EXPRESSION_CONTAINER}[value.expression.value="${v}"]`
, '[value=null]')

const MESSAGE_SUFFIX = ` に href${OPTION.react_router ? '、もしくはto' : ''} 属性を正しく設定してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/a11y-anchor-has-href-attribute
 - onClickなどでページ遷移する場合でもhref属性に遷移先のURIを設定してください
   - Cmd + clickなどのキーボードショートカットに対応出来ます
 - onClickなどの動作がURLの変更を行わない場合、button要素でマークアップすることを検討してください
   - href属性に空文字(""など)や '#' が設定されている場合、実質画面遷移を行わないため、同様にbutton要素でマークアップすることを検討してください
 - リンクが存在せず無効化されていることを表したい場合、href属性に undefined を設定してください
   - button要素のdisabled属性が設定された場合に相当します`

const NEXT_LINK_REGEX = /Link$/
// HINT: next/link で `Link > a` という構造がありえるので直上のJSXElementを調べる
const nextCheck = (node) => NEXT_LINK_REGEX.test(node.parent.parent.openingElement.name.name || '')

const hasInvalidTemplateLiteral = (node) => {
  const quasis = node.value.expression.quasis
  if (quasis.length === 0) return false

  const firstQuasi = quasis[0].value.cooked

  // 全体が空文字列（quasisが1つだけで空文字列）
  if (quasis.length === 1 && firstQuasi === '') return true

  // #で始まる（quasisが1つで"#"、または複数で最初が"#"）
  if (firstQuasi === '#' || (firstQuasi && firstQuasi.startsWith('#'))) return true

  return false
}

const SCHEMA = [
  {
    type: 'object',
    properties: {
      checkType: { type: 'string', enum: ['always', 'allow-spread-attributes'], default: 'always' },
    },
    additionalProperties: false,
  }
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
    const spreadAttributeSelector = option.checkType === 'allow-spread-attributes' ? ':not(:has(JSXSpreadAttribute))' : ''

    const reporter = (node) => {
      context.report({
        node,
        message: `${node.name.name}${MESSAGE_SUFFIX}`,
      })
    }

    return {
      [`${ANCHOR_ELEMENT}:not(:has(${HREF_ATTRIBUTE}))${spreadAttributeSelector}`]: (node) => {
        if (!OPTION.nextjs || !nextCheck(node)) {
          reporter(node)
        }
      },
      [`${ANCHOR_ELEMENT}:has(${HREF_ATTRIBUTE}:matches(${NULL_HREF_VALUES}))`]: reporter,
      [`${ANCHOR_ELEMENT} ${HREF_ATTRIBUTE}${JSX_EXPRESSION_CONTAINER}[value.expression.type="TemplateLiteral"]`]: (node) => {
        if (hasInvalidTemplateLiteral(node)) {
          reporter(node.parent)
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
