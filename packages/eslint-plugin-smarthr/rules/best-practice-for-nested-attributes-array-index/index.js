const SCHEMA = []

const NOINDEX_ARRAY_REGEX = /\[\]\[/

/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'problem',
    schema: SCHEMA,
  },
  create(context) {
    const checker = (node, value) => {
      if (NOINDEX_ARRAY_REGEX.test(value)) {
        context.report({
          node,
          message: `入力要素のname属性に対して、配列に当たる部分の連番を指定しない場合（例: a[xxx][][yyy] ）、配列内アイテムの属性が意図せず入れ替わってしまう場合がありえるため、常にindexを設定してください。
 - 例のyyyに当たる値が配列内の別アイテムに紐づいてしまう場合があります。
 - 詳しくは https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-nested-attributes-array-index を参照してください`,
        })
      }
    }

    return {
      Literal: (node) => {
        checker(node, node.value)
      },
      TemplateElement: (node) => {
        checker(node, node.value.cooked)
      },
    }
  },
}
module.exports.schema = SCHEMA
