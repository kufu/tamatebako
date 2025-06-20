const JSON5 = require('json5')
const fs = require('fs')

const OPTION = (() => {
  const file = `${process.cwd()}/package.json`

  if (!fs.existsSync(file)) {
    return {}
  }

  const json = JSON5.parse(fs.readFileSync(file))
  const dependencies = [
    ...(json.dependencies ? Object.keys(json.dependencies) : []),
    ...(json.devDependencies ? Object.keys(json.devDependencies) : []),
  ]

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

  return result()
})()

const REGEX_TARGET = /(Anchor|Link|^a)$/
const check = (node, checkType) => {
  const result = baseCheck(node, checkType)

  return result && ((OPTION.nextjs && !nextCheck(node, checkType)) || (OPTION.react_router && !reactRouterCheck(node))) ? null : result
}
const baseCheck = (node, checkType) => {
  const nodeName = node.name.name || ''

  if (
    REGEX_TARGET.test(nodeName) &&
    checkExistAttribute(node, findHrefAttribute) &&
    (checkType !== 'allow-spread-attributes' || !node.attributes.some(findSpreadAttr))
  ) {
    return nodeName
  }

  return false
}
const nextCheck = (node, checkType) => {
  // HINT: next/link で `Link>a` という構造がありえるので直上のJSXElementを調べる
  const target = node.parent.parent.openingElement

  return target ? baseCheck(target, checkType) : false
}
const reactRouterCheck = (node) => checkExistAttribute(node, findToAttribute)

const checkExistAttribute = (node, find) => {
  const attr = node.attributes.find(find)?.value

  return (
    !attr ||
    isNullTextHref(attr) ||
    (attr.type === 'JSXExpressionContainer' && isNullTextHref(attr.expression))
  )
}
const isNullTextHref = (attr) => attr.type === 'Literal' && (attr.value === '' || attr.value === '#')
const findSpreadAttr = (a) => a.type === 'JSXSpreadAttribute'

const findHrefAttribute = (a) => a.name?.name == 'href'
const findToAttribute = (a) => a.name?.name == 'to'

const MESSAGE_SUFFIX = ` に href 属性を正しく設定してください
 - onClickなどでページ遷移する場合でもhref属性に遷移先のURIを設定してください
   - Cmd + clickなどのキーボードショートカットに対応出来ます
 - onClickなどの動作がURLの変更を行わない場合、button要素でマークアップすることを検討してください
   - href属性に空文字(""など)や '#' が設定されている場合、実質画面遷移を行わないため、同様にbutton要素でマークアップすることを検討してください
 - リンクが存在せず無効化されていることを表したい場合、href属性に undefined を設定してください
   - button要素のdisabled属性が設定された場合に相当します`

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
    const checkType = option.checkType || 'always'

    return {
      JSXOpeningElement: (node) => {
        const nodeName = check(node, checkType)

        if (nodeName) {
          context.report({
            node,
            message: `${nodeName}${MESSAGE_SUFFIX}`,
          })
        }
      },
    }
  },
}
module.exports.schema = SCHEMA
