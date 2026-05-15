const rule = require('../rules/best-practice-for-consecutive-definition-list')
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

ruleTester.run('best-practice-for-consecutive-definition-list', rule, {
  valid: [
    // 単一の DefinitionList
    {
      code: `
        <DefinitionList>
          <DefinitionListItem term="項目1">内容1</DefinitionListItem>
        </DefinitionList>
      `,
    },
    // DefinitionList が連続していない
    {
      code: `
        <div>
          <DefinitionList>
            <DefinitionListItem term="項目1">内容1</DefinitionListItem>
          </DefinitionList>
          <p>テキスト</p>
          <DefinitionList>
            <DefinitionListItem term="項目2">内容2</DefinitionListItem>
          </DefinitionList>
        </div>
      `,
    },
    // maxColumns を使用して1つにまとめている
    {
      code: `
        <DefinitionList>
          <DefinitionListItem maxColumns={1} term="項目1">内容1</DefinitionListItem>
          <DefinitionListItem maxColumns={2} term="項目2">内容2</DefinitionListItem>
        </DefinitionList>
      `,
    },
    // Fragment 内で単一
    {
      code: `
        <>
          <DefinitionList>
            <DefinitionListItem term="項目1">内容1</DefinitionListItem>
          </DefinitionList>
        </>
      `,
    },
    // 異なる階層
    {
      code: `
        <>
          <div>
            <DefinitionList>
              <DefinitionListItem term="項目1">内容1</DefinitionListItem>
            </DefinitionList>
          </div>
          <div>
            <DefinitionList>
              <DefinitionListItem term="項目2">内容2</DefinitionListItem>
            </DefinitionList>
          </div>
        </>
      `,
    },
  ],

  invalid: [
    // DefinitionList が連続している
    {
      code: `
        <div>
          <DefinitionList>
            <DefinitionListItem term="項目1">内容1</DefinitionListItem>
          </DefinitionList>
          <DefinitionList>
            <DefinitionListItem term="項目2">内容2</DefinitionListItem>
          </DefinitionList>
        </div>
      `,
      errors: [
        {
          message: /DefinitionList が連続しています/,
        },
      ],
    },
    // 3つ連続
    {
      code: `
        <div>
          <DefinitionList>
            <DefinitionListItem term="項目1">内容1</DefinitionListItem>
          </DefinitionList>
          <DefinitionList>
            <DefinitionListItem term="項目2">内容2</DefinitionListItem>
          </DefinitionList>
          <DefinitionList>
            <DefinitionListItem term="項目3">内容3</DefinitionListItem>
          </DefinitionList>
        </div>
      `,
      errors: [
        {
          message: /DefinitionList が連続しています/,
        },
        {
          message: /DefinitionList が連続しています/,
        },
      ],
    },
    // Fragment 内で連続
    {
      code: `
        <>
          <DefinitionList>
            <DefinitionListItem term="項目1">内容1</DefinitionListItem>
          </DefinitionList>
          <DefinitionList>
            <DefinitionListItem term="項目2">内容2</DefinitionListItem>
          </DefinitionList>
        </>
      `,
      errors: [
        {
          message: /DefinitionList が連続しています/,
        },
      ],
    },
    // 空白が間にある場合
    {
      code: `
        <div>
          <DefinitionList>
            <DefinitionListItem term="項目1">内容1</DefinitionListItem>
          </DefinitionList>

          <DefinitionList>
            <DefinitionListItem term="項目2">内容2</DefinitionListItem>
          </DefinitionList>
        </div>
      `,
      errors: [
        {
          message: /DefinitionList が連続しています/,
        },
      ],
    },
  ],
})
