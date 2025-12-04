const SCHEMA = []

const PROHIBIT_ATTR_REGEX = /^(data-(spec|testid))$/

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
      'JSXAttribute[name.name=/^(data-(spec|testid))$/]': (node) => {
        context.report({
          node,
          message: `テストしたい要素を指定するためにテスト用の属性は利用せず、他の方法を検討してください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/best-practice-for-data-test-attribute
 - 方法1: click_link, click_button等を利用することで、テスト環境に準じた方法で要素を指定することを検討してください
   - 参考(Testing Library): https://testing-library.com/docs/queries/about
   - 参考(Capybara): https://rubydoc.info/github/jnicklas/capybara/Capybara/Node/Finders
 - 方法2: テスト環境のメソッド等で要素が指定できない場合はrole、name、aria系などユーザーが認識できる属性を利用した方法で要素を指定することを検討してください
   - 画像の場合、alt属性が利用できます
   - id, class属性は基本的にユーザーが認識出来ないため利用しないでください`,
        });
      },
    }
  },
}
module.exports.schema = SCHEMA
