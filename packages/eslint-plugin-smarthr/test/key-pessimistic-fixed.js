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

console.log('悲観的テスト: key属性のエッジケース\n')

// Test 3: key + id属性のみ → エラーあり（id属性はText専用ではない）
console.log('Test 3: key + id属性のみ → エラーあり（id属性はText専用ではない）')
try {
  ruleTester.run('test-key-id', rule, {
    valid: [],
    invalid: [
      { code: '<Text key="item-1" id="foo">content</Text>', output: '<span key="item-1" id="foo">content</span>', errors: [{ message: /.*/ }] }
    ]
  })
  console.log('✅ Pass: key + id属性のみは正しくエラーとして検出される\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n')[0], '\n')
}

// Test 4: key + onClick属性 → エラーあり
console.log('Test 4: key + onClick属性のみ → エラーあり（onClick属性はText専用ではない）')
try {
  ruleTester.run('test-key-onclick', rule, {
    valid: [],
    invalid: [
      { code: '<Text key="item-1" onClick={handler}>content</Text>', output: '<span key="item-1" onClick={handler}>content</span>', errors: [{ message: /.*/ }] }
    ]
  })
  console.log('✅ Pass: key + onClick属性のみは正しくエラーとして検出される\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n')[0], '\n')
}

// Test 7: key + as + className（shr-text-sm）→ size属性に変換
console.log('Test 7: key + as + className（shr-text-sm）→ size属性に変換')
try {
  ruleTester.run('test-key-as-shr-class', rule, {
    valid: [],
    invalid: [
      {
        code: '<Text key="item-1" as="p" className="shr-text-sm">content</Text>',
        output: '<Text key="item-1" as="p" size="S">content</Text>',
        errors: [{ message: /classNameで指定されたshr-プレフィックス/ }]
      }
    ]
  })
  console.log('✅ Pass: key + as + shr-クラスは正しく変換される\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n').slice(0, 5).join('\n'), '\n')
}

// Test 9: key={itemId}（変数）→ エラーあり（key属性の値は使わないので変数でも検出）
console.log('Test 9: key={itemId}（変数）→ エラーあり（key属性の値は使わないので変数でも検出）')
try {
  ruleTester.run('test-key-variable', rule, {
    valid: [],
    invalid: [
      { code: '<Text key={itemId}>content</Text>', output: '<span key={itemId}>content</span>', errors: [{ message: /.*/ }] }
    ]
  })
  console.log('✅ Pass: key属性が変数の場合も正しく検出される\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n')[0], '\n')
}

// Test 12: key + as + id → エラーあり（as + idはText機能を使っていない）
console.log('Test 12: key + as + id → エラーあり（as + idはText機能を使っていない）')
try {
  ruleTester.run('test-key-as-id', rule, {
    valid: [],
    invalid: [
      {
        code: '<Text key="item-1" as="p" id="foo">content</Text>',
        output: '<p key="item-1" id="foo">content</p>',
        errors: [{ message: /.*/ }]
      }
    ]
  })
  console.log('✅ Pass: key + as + idは正しくエラーとして検出される\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n')[0], '\n')
}

console.log('\n=== テスト完了 ===')
