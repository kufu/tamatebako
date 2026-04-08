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

// Test 1: key + Text専用属性（size等）→ エラーなし（valid）
console.log('Test 1: key + size属性 → エラーなし（Text専用属性があるため）')
try {
  ruleTester.run('test-key-size', rule, {
    valid: [
      { code: '<Text key="item-1" size="M">content</Text>' }
    ],
    invalid: []
  })
  console.log('✅ Pass: key + size属性は正しくvalidとして扱われる\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n')[0], '\n')
}

// Test 2: key + weight属性 → エラーなし（valid）
console.log('Test 2: key + weight属性 → エラーなし（Text専用属性があるため）')
try {
  ruleTester.run('test-key-weight', rule, {
    valid: [
      { code: '<Text key="item-1" weight="bold">content</Text>' }
    ],
    invalid: []
  })
  console.log('✅ Pass: key + weight属性は正しくvalidとして扱われる\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n')[0], '\n')
}

// Test 3: key + id属性 → エラーあり（id属性だけではText機能を使っていない）
console.log('Test 3: key + id属性のみ → エラーあり（id属性はText専用ではない）')
try {
  ruleTester.run('test-key-id', rule, {
    valid: [],
    invalid: [
      { code: '<Text key="item-1" id="foo">content</Text>', errors: [{ message: /.*/ }] }
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
      { code: '<Text key="item-1" onClick={handler}>content</Text>', errors: [{ message: /.*/ }] }
    ]
  })
  console.log('✅ Pass: key + onClick属性のみは正しくエラーとして検出される\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n')[0], '\n')
}

// Test 5: key + className（変換可能なshr-クラス）→ shr-クラスを属性に変換
console.log('Test 5: key + className（shr-text-sm）→ size属性に変換')
try {
  ruleTester.run('test-key-shr-class', rule, {
    valid: [],
    invalid: [
      {
        code: '<Text key="item-1" className="shr-text-sm">content</Text>',
        output: '<Text size="S" key="item-1">content</Text>',
        errors: [{ message: /classNameで指定されたshr-プレフィックス/ }]
      }
    ]
  })
  console.log('✅ Pass: key + shr-クラスは正しく変換される\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n')[0], '\n')
}

// Test 6: key + className（変換可能＋不可能の混在）→ 変換可能なものだけ変換
console.log('Test 6: key + className（shr-text-sm + custom）→ 部分変換')
try {
  ruleTester.run('test-key-mixed-class', rule, {
    valid: [],
    invalid: [
      {
        code: '<Text key="item-1" className="shr-text-sm custom">content</Text>',
        output: '<Text size="S" key="item-1" className="custom">content</Text>',
        errors: [{ message: /classNameで指定されたshr-プレフィックス/ }]
      }
    ]
  })
  console.log('✅ Pass: key + 混在クラスは正しく部分変換される\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n')[0], '\n')
}

// Test 7: key + as + className（変換可能なshr-クラス）→ shr-クラスを属性に変換
console.log('Test 7: key + as + className（shr-text-sm）→ size属性に変換')
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
  console.log('✅ Pass: key + as + shr-クラスは正しく変換される\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n')[0], '\n')
}

// Test 8: key + size + className（shr-クラス）→ 矛盾エラー
console.log('Test 8: key + size + className（shr-text-sm）→ 矛盾エラー')
try {
  ruleTester.run('test-key-conflict', rule, {
    valid: [],
    invalid: [
      {
        code: '<Text key="item-1" size="M" className="shr-text-sm">content</Text>',
        errors: [{ message: /Textコンポーネントの属性とclassNameで矛盾/ }]
      }
    ]
  })
  console.log('✅ Pass: key + size + shr-クラスは矛盾として検出される\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n')[0], '\n')
}

// Test 9: key属性の値が変数の場合 → エラーなし（静的解析不可）
console.log('Test 9: key属性が変数 → エラーなし（静的解析できないためスキップ）')
try {
  ruleTester.run('test-key-variable', rule, {
    valid: [
      { code: '<Text key={itemId}>content</Text>' }
    ],
    invalid: []
  })
  console.log('✅ Pass: key属性が変数の場合は正しくスキップされる\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n')[0], '\n')
}

// Test 10: key + as（変数）→ エラーなし
console.log('Test 10: key + as（変数）→ エラーなし（静的解析不可）')
try {
  ruleTester.run('test-key-as-variable', rule, {
    valid: [
      { code: '<Text key="item-1" as={component}>content</Text>' }
    ],
    invalid: []
  })
  console.log('✅ Pass: key + as（変数）は正しくスキップされる\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n')[0], '\n')
}

// Test 11: key + className（変数）→ エラーなし
console.log('Test 11: key + className（変数）→ エラーなし（静的解析不可）')
try {
  ruleTester.run('test-key-classname-variable', rule, {
    valid: [
      { code: '<Text key="item-1" className={customClass}>content</Text>' }
    ],
    invalid: []
  })
  console.log('✅ Pass: key + className（変数）は正しくスキップされる\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n')[0], '\n')
}

// Test 12: key + as + id（複数の非Text専用属性）→ エラーあり
console.log('Test 12: key + as + id → エラーあり（as + idはText機能を使っていない）')
try {
  ruleTester.run('test-key-as-id', rule, {
    valid: [],
    invalid: [
      {
        code: '<Text key="item-1" as="p" id="foo">content</Text>',
        errors: [{ message: /.*/ }]
      }
    ]
  })
  console.log('✅ Pass: key + as + idは正しくエラーとして検出される\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n')[0], '\n')
}

// Test 13: key属性なしの既存パターンが影響を受けていないか確認
console.log('Test 13: 既存パターン（属性なし）→ エラーあり')
try {
  ruleTester.run('test-existing-no-attrs', rule, {
    valid: [],
    invalid: [
      { code: '<Text>content</Text>', errors: [{ message: /属性を持たないTextコンポーネント/ }] }
    ]
  })
  console.log('✅ Pass: 既存パターンは影響を受けていない\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n')[0], '\n')
}

// Test 14: key属性なしの既存パターン（as属性のみ）→ エラーあり
console.log('Test 14: 既存パターン（as属性のみ）→ エラーあり')
try {
  ruleTester.run('test-existing-only-as', rule, {
    valid: [],
    invalid: [
      {
        code: '<Text as="p">content</Text>',
        output: '<p>content</p>',
        errors: [{ message: /as属性のみを持つTextコンポーネント/ }]
      }
    ]
  })
  console.log('✅ Pass: 既存パターンは影響を受けていない\n')
} catch (e) {
  console.log('❌ Fail:', e.message.split('\n')[0], '\n')
}

console.log('\n=== テスト完了 ===')
