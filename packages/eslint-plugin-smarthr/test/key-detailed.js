const rule = require('/Users/atsushi.mizoue/works/tamatebako/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component')
const { RuleTester } = require('eslint')

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})

// Test 3: key + id属性のみ → どんな出力が生成されるか確認
console.log('Test 3: key + id属性のみ')
try {
  ruleTester.run('test-key-id', rule, {
    valid: [],
    invalid: [
      {
        code: '<Text key="item-1" id="foo">content</Text>',
        output: '<span key="item-1" id="foo">content</span>',
        errors: [{ message: /.*/ }]
      }
    ]
  })
  console.log('✅ Pass\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n').slice(0, 5).join('\n'), '\n')
}

// Test 7: key + as + className（shr-text-sm）→ 出力確認
console.log('Test 7: key + as + className（shr-text-sm）')
try {
  ruleTester.run('test-key-as-shr-class', rule, {
    valid: [],
    invalid: [
      {
        code: '<Text key="item-1" as="p" className="shr-text-sm">content</Text>',
        output: '<Text as="p" size="S" key="item-1">content</Text>',
        errors: [{ message: /classNameで指定されたshr-プレフィックス/ }]
      }
    ]
  })
  console.log('✅ Pass\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n').slice(0, 10).join('\n'), '\n')
}

// Test 9: key={itemId}（変数）→ どんなエラーが出ているか確認
console.log('Test 9: key={itemId}（変数）')
const { Linter } = require('eslint')
const linter = new Linter()
linter.defineRule('test-rule', rule)
const messages = linter.verify('<Text key={itemId}>content</Text>', {
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
  rules: {
    'test-rule': 'error'
  }
})
console.log('エラー数:', messages.length)
if (messages.length > 0) {
  console.log('エラー内容:', messages[0].message.split('\n')[0])
}
console.log()

// Test 12: key + as + id → セレクタが検出しない理由を確認
console.log('Test 12: key + as + id')
const messages12 = linter.verify('<Text key="item-1" as="p" id="foo">content</Text>', {
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
  rules: {
    'test-rule': 'error'
  }
})
console.log('エラー数:', messages12.length)
if (messages12.length > 0) {
  console.log('エラー内容:', messages12[0].message.split('\n')[0])
} else {
  console.log('エラーが検出されませんでした')
}
