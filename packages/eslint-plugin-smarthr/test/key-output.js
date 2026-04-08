const rule = require('/Users/atsushi.mizoue/works/tamatebako/packages/eslint-plugin-smarthr/rules/best-practice-for-text-component')
const { Linter } = require('eslint')

const linter = new Linter({ configType: 'flat' })

const config = {
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
  plugins: {
    test: { rules: { 'test-rule': rule } }
  },
  rules: {
    'test/test-rule': 'error'
  }
}

function test(code) {
  const messages = linter.verify(code, config)
  if (messages.length === 0) {
    console.log('エラーなし')
    return null
  }

  const output = linter.verifyAndFix(code, config).output
  console.log('エラー数:', messages.length)
  console.log('Input :', code)
  console.log('Output:', output)
  console.log()
  return output
}

console.log('=== key + id ===')
test('<Text key="k" id="i">c</Text>')

console.log('=== key + onClick ===')
test('<Text key="k" onClick={h}>c</Text>')

console.log('=== key={var} ===')
test('<Text key={id}>c</Text>')

console.log('=== key + as + id ===')
test('<Text key="k" as="p" id="i">c</Text>')

console.log('=== key + as + onClick ===')
test('<Text key="k" as="p" onClick={h}>c</Text>')

console.log('=== key + className + id ===')
test('<Text key="k" className="c" id="i">c</Text>')
