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

// Test 9: key={itemId}（変数）→ エラーが出るか確認
console.log('Test 9: key={itemId}（変数）')
try {
  ruleTester.run('test-key-variable', rule, {
    valid: [
      { code: '<Text key={itemId}>content</Text>' }
    ],
    invalid: []
  })
  console.log('✅ Pass: key属性が変数の場合は正しくvalidとして扱われる\n')
} catch (e) {
  console.log('❌ Fail: エラーが検出されてしまった')
  console.log('詳細:', e.message.split('\n')[0])
  console.log()
}

// Test 12: key + as + id → エラーが出るか確認
console.log('Test 12: key + as + id')
try {
  ruleTester.run('test-key-as-id', rule, {
    valid: [],
    invalid: [
      {
        code: '<Text key="item-1" as="p" id="foo">content</Text>',
        output: '<span key="item-1" id="foo">content</span>',
        errors: [{ message: /.*/ }]
      }
    ]
  })
  console.log('✅ Pass: key + as + idは正しくエラーとして検出される\n')
} catch (e) {
  console.log('❌ Fail: エラーが検出されない')
  console.log('詳細:', e.message.split('\n').slice(0, 3).join('\n'))
  console.log()
}

// Test 12-2: key + as（リテラル） + onClick → エラーが出るか確認
console.log('Test 12-2: key + as + onClick')
try {
  ruleTester.run('test-key-as-onclick', rule, {
    valid: [],
    invalid: [
      {
        code: '<Text key="item-1" as="p" onClick={handler}>content</Text>',
        output: '<span key="item-1" onClick={handler}>content</span>',
        errors: [{ message: /.*/ }]
      }
    ]
  })
  console.log('✅ Pass: key + as + onClickは正しくエラーとして検出される\n')
} catch (e) {
  console.log('❌ Fail: エラーが検出されない')
  console.log('詳細:', e.message.split('\n').slice(0, 3).join('\n'))
  console.log()
}

// Test verification: どのセレクタが反応しているか確認
console.log('\n=== 現在のセレクタの動作確認 ===\n')

// key + id のみ
console.log('key + id:')
try {
  ruleTester.run('verify-key-id', rule, {
    valid: [],
    invalid: [{ code: '<Text key="k" id="i">c</Text>', errors: [{}] }]
  })
  console.log('  検出される ✓')
} catch (e) {
  console.log('  検出されない ✗')
}

// key + onClick のみ
console.log('key + onClick:')
try {
  ruleTester.run('verify-key-onclick', rule, {
    valid: [],
    invalid: [{ code: '<Text key="k" onClick={h}>c</Text>', errors: [{}] }]
  })
  console.log('  検出される ✓')
} catch (e) {
  console.log('  検出されない ✗')
}

// key + as（変数）のみ
console.log('key + as（変数）:')
try {
  ruleTester.run('verify-key-as-var', rule, {
    valid: [{ code: '<Text key="k" as={comp}>c</Text>' }],
    invalid: []
  })
  console.log('  validとして扱われる ✓')
} catch (e) {
  console.log('  エラーが出る ✗')
}

// key（変数）のみ
console.log('key（変数）のみ:')
try {
  ruleTester.run('verify-key-var', rule, {
    valid: [{ code: '<Text key={id}>c</Text>' }],
    invalid: []
  })
  console.log('  validとして扱われる ✓')
} catch (e) {
  console.log('  エラーが出る ✗')
}

// key + as + id
console.log('key + as + id:')
try {
  ruleTester.run('verify-key-as-id', rule, {
    valid: [],
    invalid: [{ code: '<Text key="k" as="p" id="i">c</Text>', errors: [{}] }]
  })
  console.log('  検出される ✓')
} catch (e) {
  console.log('  検出されない ✗')
}

// key + as + onClick
console.log('key + as + onClick:')
try {
  ruleTester.run('verify-key-as-onclick', rule, {
    valid: [],
    invalid: [{ code: '<Text key="k" as="p" onClick={h}>c</Text>', errors: [{}] }]
  })
  console.log('  検出される ✓')
} catch (e) {
  console.log('  検出されない ✗')
}

// key + className + id
console.log('key + className + id:')
try {
  ruleTester.run('verify-key-classname-id', rule, {
    valid: [],
    invalid: [{ code: '<Text key="k" className="c" id="i">text</Text>', errors: [{}] }]
  })
  console.log('  検出される ✓')
} catch (e) {
  console.log('  検出されない ✗')
}
