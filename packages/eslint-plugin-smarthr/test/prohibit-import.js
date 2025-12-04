const rule = require('../rules/prohibit-import')
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})

ruleTester.run('prohibit-import', rule, {
  valid: [
    {
      code: `import _ from 'lodash-es'`,
      filename: '/a/hoge.js',
      options: [
        {
          '^.+$': {
            'lodash': {
              imported: true,
            },
          },
        }
      ]
    },
    {
      code: `import { isEqual } from 'lodash-es'`,
      filename: '/a/hoge.js',
      options: [
        {
          '^.+$': {
            'lodash': {
              imported: ['isEqual']
            },
          },
        }
      ]
    },
    {
      code: `import { isEqaul } from 'lodash'`,
      filename: '/a/hoge.js',
      options: [
        {
          '^.+$': {
            'lodash': {
              imported: ['isEqual']
            },
          },
        }
      ]
    },
    {
      code: `import _ from 'lodash'`,
      filename: '/a/hoge.js',
      options: [
        {
          '^.+$': {
            'lodash': {
              imported: ['isEqual']
            },
          },
        }
      ]
    },
    {
      code: `import _ from 'lodash'`,
      filename: '/a/hoge.js',
      options: [
        {
          '^fuga.js$': {
            'lodash': {
              imported: true
            },
          },
        }
      ],
    },
    {
      code: `import { isEqual } from './module/validator'`,
      filename: '/page/hoge.js',
      options: [
        {
          '^.+$': {
            './module/validator': {
              imported: ['isEqual'],
            },
          },
        }
      ],
    },
  ],
  invalid: [
    {
      code: `import _ from 'lodash'`,
      filename: '/a/hoge.js',
      options: [
        {
          '^.+$': {
            'lodash': {
              imported: true
            },
          },
        }
      ],
      errors: [{ message: `lodash は利用しないでください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/prohibit-import` }]
    },
    {
      code: `import { isEqual } from 'lodash'`,
      filename: '/a/hoge.js',
      options: [
        {
          '^.+$': {
            'lodash': {
              imported: true
            },
          },
        }
      ],
      errors: [{ message: `lodash は利用しないでください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/prohibit-import` }]
    },
    {
      code: `import { isEqual } from 'lodash'`,
      filename: '/a/hoge.js',
      options: [
        {
          '^.+$': {
            'lodash': {
              imported: ['isEqual']
            },
          },
        }
      ],
      errors: [{message: `lodash/isEqual は利用しないでください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/prohibit-import` }]
    },
    {
      code: `import { isEqual } from 'lodash'`,
      filename: '/a/hoge.js',
      options: [
        {
          '^.+$': {
            'lodash': {
              imported: ['isEqual'],
              "reportMessage": "must not use {{module}}/{{export}}"
            },
          },
        }
      ],
      errors: [{message: `must not use lodash/isEqual
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/prohibit-import` }]
    },
    {
      code: `import { isEqual } from 'lodash'`,
      filename: '/a/hoge.js',
      options: [
        {
          '^.+$': {
            'example': {
              imported: true,
            },
            'lodash': {
              imported: ['isEqual'],
              reportMessage: "must not use {{module}}/{{export}}",
            },
          },
        }
      ],
      errors: [{message: `must not use lodash/isEqual
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/prohibit-import` }]
    },
    {
      code: `import { isEqual } from 'lodash'`,
      filename: '/a/hoge.js',
      options: [
        {
          '/hoge.js$': {
            'example': {
              imported: true,
            },
            'lodash': {
              imported: ['isEqual'],
              reportMessage: "must not use {{module}}/{{export}}",
            },
          },
        }
      ],
      errors: [{message: `must not use lodash/isEqual
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/prohibit-import` }]
    },
    {
      code: `import { isEqual } from './module/validator'`,
      filename: 'page/hoge.js',
      options: [
        {
          '^.+$': {
            './page/module/validator': {
              imported: ['isEqual'],
            },
          },
        }
      ],
      errors: [{ message: `./module/validator/isEqual は利用しないでください
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/prohibit-import` }]
    },
  ]
})
