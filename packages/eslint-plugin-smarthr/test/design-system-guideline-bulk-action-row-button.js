const rule = require('../rules/design-system-guideline-bulk-action-row-button')
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

const messageDoNotUseLink = `BulkActionRow内では「Button」コンポーネントを使用してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-bulk-action-row-button
 - aタグやLinkコンポーネントは使用しないでください。
 - もし「すべてのオブジェクトを選択」ボタンの実装であれば、Button[variant="tertiary"]を使用してください。
 - 参考:
  - https://smarthr.design/products/design-patterns/table-bulk-action/#h4-2
  - https://smarthr.design/products/components/table/#h3-2`

const messageDoNotUsePrefixedButton = `BulkActionRow内では「Button」コンポーネントのみを使用してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-bulk-action-row-button
 - XxxxButtonのようにprefixが付いたButtonコンポーネント（AnchorButton、StyledButtonなど）は使用しないでください。
 - もし「すべてのオブジェクトを選択」ボタンの実装であれば、Button[variant="tertiary"]を使用してください。
 - 参考:
  - https://smarthr.design/products/design-patterns/table-bulk-action/#h4-2
  - https://smarthr.design/products/components/table/#h3-2`

ruleTester.run('design-system-guideline-bulk-action-row-button', rule, {
  valid: [
    // BulkActionRow内でButtonを使用
    {
      code: `
        <BulkActionRow>
          <Button variant="primary">一括削除</Button>
        </BulkActionRow>
      `,
    },
    {
      code: `
        <BulkActionRow>
          <button>一括削除</button>
        </BulkActionRow>
      `,
    },
    //「すべてのオブジェクトの選択」ボタンにvariant="tertiary"を指定
    {
      code: `
        <Table>
          <thead>
            <BulkActionRow>
              <Cluster align="center">
                <Text>このページの「オブジェクト名」50件すべて選択されています。</Text>
                <Button variant="tertiary" size="S">
                  一覧の「オブジェクト名」1000件すべてを選択
                </Button>
              </Cluster>
            </BulkActionRow>
          </thead>
        </Table>
      `,
    },
    // ButtonClusterなど、Buttonで終わらないコンポーネントは誤検知しない
    {
      code: `
        <BulkActionRow>
          <ButtonCluster>
            <Button>削除</Button>
            <Button>編集</Button>
          </ButtonCluster>
        </BulkActionRow>
      `,
    },
  ],
  invalid: [
    // BulkActionRow内でaタグを使用
    {
      code: `
        <BulkActionRow>
          <a href="#" onClick={toggleAll}>一覧の100件すべてを選択</a>
        </BulkActionRow>
      `,
      errors: [{ message: messageDoNotUseLink }],
    },
    // BulkActionRow内でTextLinkを使用
    {
      code: `
        <BulkActionRow>
          <TextLink href={undefined} onClick={toggleAll}>
            一覧の100件すべてを選択
          </TextLink>
        </BulkActionRow>
      `,
      errors: [{ message: messageDoNotUseLink }],
    },
    // BulkActionRow内でprefixが付いたButtonコンポーネントを使用
    {
      code: `
        <BulkActionRow>
          <StyledSelectAllButton>一覧のすべてを選択</StyledSelectAllButton>
        </BulkActionRow>
      `,
      errors: [{ message: messageDoNotUsePrefixedButton }],
    },
    // AnchorButtonを使用
    {
      code: `
        <BulkActionRow>
          <AnchorButton href={undefined} onClick={toggleAllChecked}>
            一覧のすべてを選択
          </AnchorButton>
        </BulkActionRow>
      `,
      errors: [{ message: messageDoNotUsePrefixedButton }],
    },
    // ネストされた構造でもチェック
    {
      code: `
        <BulkActionRow>
          <Cluster>
            <Stack>
              <CustomButton>操作</CustomButton>
            </Stack>
          </Cluster>
        </BulkActionRow>
      `,
      errors: [{ message: messageDoNotUsePrefixedButton }],
    },
    // StyledBulkActionRowのようなラッパーコンポーネント内でもチェック
    {
      code: `
        <StyledBulkActionRow>
          <TextLink href={undefined} onClick={toggleAll}>
            一覧の100件すべてを選択
          </TextLink>
        </StyledBulkActionRow>
      `,
      errors: [{ message: messageDoNotUseLink }],
    },
    {
      code: `
        <CustomBulkActionRow>
          <AnchorButton href={undefined} onClick={toggleAllChecked}>
            一覧のすべてを選択
          </AnchorButton>
        </CustomBulkActionRow>
      `,
      errors: [{ message: messageDoNotUsePrefixedButton }],
    },
  ],
})
