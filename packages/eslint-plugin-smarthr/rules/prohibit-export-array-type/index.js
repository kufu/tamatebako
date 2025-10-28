/**
 * @type {import('@typescript-eslint/utils').TSESLint.RuleModule<''>}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    schema: [],
  },
  create(context) {
    return {
      ':matches(TSTypeReference,ExportNamedDeclaration):matches([declaration.typeAnnotation.type="TSArrayType"],[declaration.typeAnnotation.typeName.name="Array"])': (node) => {
        context.report({
          node,
          message: `型をexportする際、配列ではなくアイテムの型をexportしてください。
 - 型を配列でexportすると、その型が配列かどうかを判定するための情報は名称のみになります
 - 名称から配列かどうかを判定しにくい場合があるため、利用するファイル内で配列として型を設定してください`,
        })
      },
    }
  },
}
module.exports.schema = []
