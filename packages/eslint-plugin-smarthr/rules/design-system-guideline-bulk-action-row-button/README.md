# smarthr/design-system-guideline-bulk-action-row-button

BulkActionRow内のすべてのオブジェクトの選択（すべてのオブジェクトを選択）ボタンで、Button[variant="tertiary"] の使用を必須にするルールです

## なぜこのルールが必要なのか

BulkActionRowで使用するすべてのオブジェクトの選択（すべてのオブジェクトを選択）ボタンは、Button[variant="tertiary"]を使用することで、BulkActionRowの背景色に対してコントラスト比4.5:1を確保できるように内部的に実装されているため、視覚的に見やすくなります。

**注意**:

- このルールは「すべて」と「選択」というテキストを含む要素のみを対象とします
- 一括削除などの他の一括操作ボタンは対象外です
- TextLinkやstyled-componentで実装されたボタンも検出し、Button[variant="tertiary"]の使用を推奨します

[参考: smarthr-design-system PR#2024](https://github.com/kufu/smarthr-design-system/pull/2024)  
[参考: smarthr-ui PR#6285](https://github.com/kufu/smarthr-ui/pull/6285)

### デザインガイドラインとの整合性

BulkActionRowは一括操作のためのUIパターンです。その中でも、全選択を行う「すべてのオブジェクトの選択」ボタンは特別な役割を持ち、`variant="tertiary"` を使用することで:

- ユーザーに一貫したUI体験を提供
- デザインシステムのガイドラインに準拠
- 視覚的なヒエラルキーを適切に表現
- 他の一括操作ボタンとの視覚的な区別を明確化

## rules

```js
{
  rules: {
    'smarthr/design-system-guideline-bulk-action-row-button': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
// 「すべてのオブジェクトの選択」ボタンをTexLinkコンポーネントで実装されている、コントラスト比が確保できないのと、マークアップがセマンティックじゃない
<Table>
  <thead>
    <BulkActionRow>
      <Cluster align="center">
        <Text>このページの「オブジェクト名」50件すべて選択されています。</Text>
        <TextLink href={undefined} onClick={toggleAllChecked}>
          一覧の「オブジェクト名」1000件すべてを選択
        </TextLink>
      </Cluster>
    </BulkActionRow>
  </thead>
</Table>
```

```jsx
// 「すべてのオブジェクトの選択」ボタンを独自実装されている
<Table>
  <thead>
    <BulkActionRow>
      <Cluster align="center">
        <Text>このページの「オブジェクト名」50件すべて選択されています。</Text>
        <button>一覧の「オブジェクト名」1000件すべてを選択</button>
      </Cluster>
    </BulkActionRow>
  </thead>
</Table>
```

```jsx
// variant="tertiary"が使われていない
<Table>
  <thead>
    <BulkActionRow>
      <Cluster align="center">
        <Text>このページの「オブジェクト名」50件すべて選択されています。</Text>
        <Button variant="secondary" size="S">
          一覧の「オブジェクト名」1000件すべてを選択
        </Button>
      </Cluster>
    </BulkActionRow>
  </thead>
</Table>
```

```jsx
// styled-componentで独自実装するのもNG
<BulkActionRow>
  <StyledButton onClick={handleSelectAll}>すべて選択</StyledButton>
</BulkActionRow>
```

## ✅ Correct

```jsx
// 「すべてのオブジェクトの選択」ボタンにvariant="tertiary"を指定
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
```

```jsx
// 一括削除などの他の一括操作ボタンはvariant制約を受けない
<Table>
  <thead>
    <BulkActionRow>
      <Cluster align="center">
        <Text>このページの「オブジェクト名」50件すべて選択されています。</Text>
        <Button variant="tertiary" size="S">
          一覧の「オブジェクト名」1000件すべてを選択
        </Button>
        <Button size="S" onClick={() => {}}>
          一括削除
        </Button>
      </Cluster>
    </BulkActionRow>
  </thead>
</Table>
```
