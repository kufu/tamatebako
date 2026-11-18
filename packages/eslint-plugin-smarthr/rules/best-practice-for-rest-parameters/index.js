const SCHEMA = [
  {
    type: 'object',
    properties: {
      fix: {
        type: 'boolean',
        default: false,
      },
    },
    additionalProperties: false,
  },
]

const REST_REGEX = /(^r|R)est$/
const MEMBER_EXPRESSION_REST_REGEX = /^(r|[a-zA-Z0-9_]+R)est\./
const FUNCTION_TYPES = ['ArrowFunctionExpression', 'FunctionExpression', 'FunctionDeclaration']

const UNFORMAT_NAME__REST_ELEMENT_SELECTOR = `RestElement:not([argument.name=${REST_REGEX}])`
const CONFUSING_NAME_VARIABLE_SELECTOR_1 = `:not(:matches(RestElement,JSXSpreadAttribute,JSXSpreadAttribute > TSAsExpression,SpreadElement,SpreadElement > TSAsExpression,MemberExpression,BinaryExpression,VariableDeclarator,ArrayExpression,CallExpression,ObjectPattern > Property,ObjectExpression > Property,ReturnStatement,ArrowFunctionExpression)) > Identifier[name=${REST_REGEX}]`
const CONFUSING_NAME_VARIABLE_SELECTOR_2 = `:matches(VariableDeclarator[id.name=${REST_REGEX}],ObjectPattern > Property[value.name=${REST_REGEX}],ObjectExpression > Property[key.name=${REST_REGEX}])`
const ARROW_FUNCTION_PARAMS_SELECTOR = `ArrowFunctionExpression > Identifier[name=${REST_REGEX}]`
const USE_REST_VIORATION_SELECTOR_MEMBER_EXPRESSION = `MemberExpression[object.name=${REST_REGEX}]`
const USE_REST_VIORATION_SELECTOR_IN_OPERATOR = `BinaryExpression[operator="in"][right.name=${REST_REGEX}]`
const USE_REST_VIORATION_OBJECT_PATTERN = `VariableDeclarator[id.type='ObjectPattern'][init.name=${REST_REGEX}]`
// 残余引数と同時に分割代入されたプロパティのうち、リネーム・デフォルト値なしのもの
const DESTRUCTURED_PROP_WITH_REST_SELECTOR = 'ObjectPattern:has(RestElement) > Property[computed=false][shorthand=true]'

const DETAIL_LINK = `
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-rest-parameters`

/**
 * 配列(ObjectPattern.properties, ObjectExpression.properties等)内の要素を
 * カンマごと削除するための範囲を取得する
 */
function getListItemRemovalRange(list, item) {
  const index = list.indexOf(item)

  if (index === -1) return null

  // 最後の要素: 直前の要素の後(カンマを含む)から削除
  if (index === list.length - 1) {
    return [list[index - 1].range[1], item.range[1]]
  }

  // 最後以外の要素: 自身の開始位置から、次の要素の開始位置まで削除(自身の後ろのカンマを含む)
  // HINT: 複数の要素を同時に削除する場合でも、隣接する要素同士が同じカンマを取り合って
  // 削除範囲が重複しないよう、常に「自身の後ろのカンマ」のみを消費する
  return [item.range[0], list[index + 1].range[0]]
}

/**
 * 識別子ノードが、指定したVariableの参照(束縛の同一性に基づく)かどうかを判定する
 */
function isReferenceOf(variable, identifierNode) {
  return variable.references.some((reference) => reference.identifier === identifierNode)
}

/**
 * propAの唯一の参照が、`{...rest}`と同じJSX要素・オブジェクトに
 * そのまま渡されているだけの冗長な受け渡しかどうかを判定する。
 * 該当する場合、削除対象のノード(JSXAttribute または Property)を返す
 */
function findRedundantPassthrough(usageNode, propName, restVariable) {
  const parent = usageNode.parent

  // JSX: <Foo {...rest} propA={propA} />
  if (
    parent.type === 'JSXExpressionContainer' &&
    parent.expression === usageNode &&
    parent.parent.type === 'JSXAttribute' &&
    parent.parent.name.type === 'JSXIdentifier' &&
    parent.parent.name.name === propName
  ) {
    const jsxAttr = parent.parent
    const openingElement = jsxAttr.parent
    const hasRestSpread = openingElement.attributes.some(
      (a) => a.type === 'JSXSpreadAttribute' && a.argument.type === 'Identifier' && isReferenceOf(restVariable, a.argument)
    )

    return hasRestSpread ? { node: jsxAttr, remove: (fixer) => fixer.remove(jsxAttr) } : null
  }

  // オブジェクト: { ...rest, propA } または { ...rest, propA: propA }
  if (
    parent.type === 'Property' &&
    parent.value === usageNode &&
    !parent.computed &&
    !parent.method &&
    parent.kind === 'init' &&
    parent.key.type === 'Identifier' &&
    parent.key.name === propName
  ) {
    const property = parent
    const objectExpression = property.parent

    if (objectExpression.type !== 'ObjectExpression') return null

    const hasRestSpread = objectExpression.properties.some(
      (p) => p.type === 'SpreadElement' && p.argument.type === 'Identifier' && isReferenceOf(restVariable, p.argument)
    )

    return hasRestSpread
      ? {
          node: property,
          remove: (fixer) => {
            const range = getListItemRemovalRange(objectExpression.properties, property)
            return range ? fixer.removeRange(range) : null
          },
        }
      : null
  }

  return null
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
    const sourceCode = context.sourceCode || context.getSourceCode()
    const options = context.options[0] || {}
    const fix = options.fix

    const actionNotRest = (node) => {
      context.report({
        node,
        message: `残余引数以外に ${REST_REGEX} とマッチする名称を利用しないでください${DETAIL_LINK}
 - 残余引数(rest parameters)と混同する可能性があるため別の名称に修正してください`,
      })
    }
    const actionUseRestVioration = (node) => {
      context.report({
        node,
        message: `残余引数内の属性を参照しないでください${DETAIL_LINK}`,
      })
    }
    const actionMemberExpressionName = (node) => {
      if (node.parent.type === 'MemberExpression') {
        return actionMemberExpressionName(node.parent)
      }

      if (MEMBER_EXPRESSION_REST_REGEX.test(context.sourceCode.getText(node))){
        actionUseRestVioration(node)
      }
    }

    return {
      'ObjectPattern[properties.length=1]>RestElement': (node) => {
        context.report({
          node,
          message: `意味のない残余引数のため、単一の引数に変更してください${DETAIL_LINK}`,
        })
      },
      [UNFORMAT_NAME__REST_ELEMENT_SELECTOR]: (node) => {
        context.report({
          node,
          message: `残余引数には ${REST_REGEX} とマッチする名称を指定してください${DETAIL_LINK}`,
        })
      },
      [CONFUSING_NAME_VARIABLE_SELECTOR_1]: actionNotRest,
      [CONFUSING_NAME_VARIABLE_SELECTOR_2]: actionNotRest,
      [ARROW_FUNCTION_PARAMS_SELECTOR]: (node) => {
        if (node !== node.parent.body) {
          actionNotRest(node)
        }
      },
      [USE_REST_VIORATION_SELECTOR_MEMBER_EXPRESSION]: actionMemberExpressionName,
      [USE_REST_VIORATION_SELECTOR_IN_OPERATOR]: (node) => {
        actionUseRestVioration(node.right)
      },
      [USE_REST_VIORATION_OBJECT_PATTERN]: actionUseRestVioration,
      [DESTRUCTURED_PROP_WITH_REST_SELECTOR]: (node) => {
        const objectPattern = node.parent
        const functionNode = objectPattern.parent

        // objectPatternが関数の引数そのものである場合のみ対象（ネストした分割代入は対象外）
        if (!functionNode || !FUNCTION_TYPES.includes(functionNode.type) || !functionNode.params.includes(objectPattern)) {
          return
        }

        const restElement = objectPattern.properties.find((p) => p.type === 'RestElement')

        if (!restElement || restElement.argument.type !== 'Identifier') return

        const propName = node.key.name
        const declaredVariables = sourceCode.getDeclaredVariables(functionNode)
        const propVariable = declaredVariables.find((v) => v.defs.some((d) => d.name === node.value))
        const restVariable = declaredVariables.find((v) => v.defs.some((d) => d.name === restElement.argument))

        if (!propVariable || !restVariable) return

        // 宣言位置そのものを除いた参照を取得
        const references = propVariable.references.filter((r) => r.identifier !== node.value)

        // 参照がちょうど1つでない場合（他の場所でも使われている場合）は対象外
        if (references.length !== 1) return

        const passthrough = findRedundantPassthrough(references[0].identifier, propName, restVariable)

        if (!passthrough) return

        context.report({
          node,
          message: `"${propName}"は変更されずに残余引数(${restElement.argument.name})と同じ箇所にそのまま渡されているだけのため、分割代入せず${restElement.argument.name}からまとめて渡すことができます${DETAIL_LINK}`,
          fix: fix
            ? (fixer) => {
                const propertyRange = getListItemRemovalRange(objectPattern.properties, node)

                if (!propertyRange) return []

                return [fixer.removeRange(propertyRange), passthrough.remove(fixer)].filter(Boolean)
              }
            : null,
        })
      },
    }
  },
}
module.exports.schema = SCHEMA
