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

const messageUseButtonTertiary = `BulkActionRow内の「すべてのオブジェクトの選択」機能にはButton[variant="tertiary"]を使用してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-bulk-action-row-button
 - BulkActionRowで使用する「すべてのオブジェクトの選択」ボタンは、Button[variant="tertiary"]を使用することで、BulkActionRowの背景色に対してコントラスト比4.5:1を確保できます。
 - 現在の要素: Button
 - 参考: https://github.com/kufu/smarthr-design-system/pull/2024`

const messageUseButtonTertiaryTextLink = `BulkActionRow内の「すべてのオブジェクトの選択」機能にはButton[variant="tertiary"]を使用してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-bulk-action-row-button
 - BulkActionRowで使用する「すべてのオブジェクトの選択」ボタンは、Button[variant="tertiary"]を使用することで、BulkActionRowの背景色に対してコントラスト比4.5:1を確保できます。
 - 現在の要素: TextLink
 - 参考: https://github.com/kufu/smarthr-design-system/pull/2024`

const messageUseButtonTertiaryStyledButton = `BulkActionRow内の「すべてのオブジェクトの選択」機能にはButton[variant="tertiary"]を使用してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-bulk-action-row-button
 - BulkActionRowで使用する「すべてのオブジェクトの選択」ボタンは、Button[variant="tertiary"]を使用することで、BulkActionRowの背景色に対してコントラスト比4.5:1を確保できます。
 - 現在の要素: StyledButton
 - 参考: https://github.com/kufu/smarthr-design-system/pull/2024`

const messageWrongVariantPrimary = `BulkActionRow内の「すべてのオブジェクトの選択」ボタンにはvariant="tertiary"を指定してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-bulk-action-row-button
 - Button[variant="tertiary"]を使用することで、BulkActionRowの背景色に対してコントラスト比4.5:1を確保できます。
 - 現在: Button[variant="primary"]
 - 参考: https://github.com/kufu/smarthr-design-system/pull/2024`

const messageWrongVariantSecondary = `BulkActionRow内の「すべてのオブジェクトの選択」ボタンにはvariant="tertiary"を指定してください。
 - 詳細: https://github.com/kufu/tamatebako/tree/master/packages/eslint-plugin-smarthr/rules/design-system-guideline-bulk-action-row-button
 - Button[variant="tertiary"]を使用することで、BulkActionRowの背景色に対してコントラスト比4.5:1を確保できます。
 - 現在: Button[variant="secondary"]
 - 参考: https://github.com/kufu/smarthr-design-system/pull/2024`

ruleTester.run('design-system-guideline-bulk-action-row-button', rule, {
  valid: [
    // BulkActionRow内のすべてのオブジェクトの選択ボタンにvariant="tertiary"を指定
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
    // すべてのオブジェクトの選択ボタン以外の一括操作ボタンはvariant制約を受けない
    {
      code: `
        <BulkActionRow>
          <Button variant="primary">一括削除</Button>
          <Button>その他の一括操作</Button>
        </BulkActionRow>
      `,
    },
    // すべてのオブジェクトの選択ボタンとその他のボタンが混在
    {
      code: `
        <BulkActionRow>
          <Cluster align="center">
            <Text>このページの50件すべて選択されています。</Text>
            <Button variant="tertiary" size="S">
              一覧の1000件すべてを選択
            </Button>
            <Button size="S">
              一括削除
            </Button>
          </Cluster>
        </BulkActionRow>
      `,
    },
    // BulkActionRow外のボタンは制約を受けない
    {
      code: `
        <Table>
          <thead>
            <tr>
              <th>
                <Button variant="primary">別の操作</Button>
              </th>
            </tr>
            <BulkActionRow>
              <Button variant="tertiary">一覧の100件すべてを選択</Button>
            </BulkActionRow>
          </thead>
        </Table>
      `,
    },
    // BulkActionRow内にボタンがない
    {
      code: `
        <BulkActionRow>
          <Text>テキストのみ</Text>
        </BulkActionRow>
      `,
    },
    // ネストされたすべてのオブジェクトの選択ボタンにvariant="tertiary"を指定
    {
      code: `
        <BulkActionRow>
          <Cluster>
            <Stack>
              <Button variant="tertiary">一覧の50件すべてを選択</Button>
            </Stack>
          </Cluster>
        </BulkActionRow>
      `,
    },
    // styled-componentで「すべて選択」以外のテキストの場合はチェックされない
    {
      code: `
        <BulkActionRow>
          <StyledButton>一括削除</StyledButton>
        </BulkActionRow>
      `,
    },
  ],
  invalid: [
    // styled-componentをすべてのオブジェクトの選択ボタンに使用
    {
      code: `
        <BulkActionRow>
          <StyledButton>一覧のすべてを選択</StyledButton>
        </BulkActionRow>
      `,
      errors: [{ message: messageUseButtonTertiaryStyledButton }],
    },
    // TextLinkをすべてのオブジェクトの選択ボタンに使用
    {
      code: `
        <BulkActionRow>
          <TextLink href={undefined} onClick={toggleAll}>
            一覧の100件すべてを選択
          </TextLink>
        </BulkActionRow>
      `,
      errors: [{ message: messageUseButtonTertiaryTextLink }],
    },
    // すべてのオブジェクトの選択ボタンにvariantが指定されていない
    {
      code: `
        <BulkActionRow>
          <Button size="S">一覧の100件すべてを選択</Button>
        </BulkActionRow>
      `,
      errors: [{ message: messageUseButtonTertiary }],
    },
    // すべてのオブジェクトの選択ボタンにvariant="primary"を指定
    {
      code: `
        <BulkActionRow>
          <Button variant="primary">一覧の1000件すべてを選択</Button>
        </BulkActionRow>
      `,
      errors: [{ message: messageWrongVariantPrimary }],
    },
    // すべてのオブジェクトの選択ボタンにvariant="secondary"を指定
    {
      code: `
        <BulkActionRow>
          <Button variant="secondary">一覧の50件すべてを選択</Button>
        </BulkActionRow>
      `,
      errors: [{ message: messageWrongVariantSecondary }],
    },
    // ネストされたすべてのオブジェクトの選択ボタンにvariantが指定されていない
    {
      code: `
        <BulkActionRow>
          <Cluster align="center">
            <Text>テキスト</Text>
            <Button>一覧の1000件すべてを選択</Button>
          </Cluster>
        </BulkActionRow>
      `,
      errors: [{ message: messageUseButtonTertiary }],
    },
    // 完全な実装例で間違ったvariantを指定
    {
      code: `
        <Table>
          <thead>
            <BulkActionRow>
              <Cluster align="center">
                <Text>このページの「オブジェクト名」50件すべて選択されています。</Text>
                <Button variant="primary" size="S">
                  一覧の「オブジェクト名」1000件すべてを選択
                </Button>
              </Cluster>
            </BulkActionRow>
          </thead>
        </Table>
      `,
      errors: [{ message: messageWrongVariantPrimary }],
    },
  ],
})
