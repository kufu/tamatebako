# smarthr/design-system-guideline-bulk-action-row-button

BulkActionRow内では「すべてのオブジェクトを選択」ボタンの実装には Button[variant="tertiary"] を使用することを推奨するルールです

## なぜこのルールが必要なのか

BulkActionRowで使用する「すべてのオブジェクトの選択」ボタンは、Button[variant="tertiary"]を使用することで、BulkActionRowの背景色に対してコントラスト比4.5:1を確保できるように内部的に実装されているため、視覚的に見やすくなります。

**参考**:

- [テーブルの一括操作 - SmartHR Design System](https://smarthr.design/products/design-patterns/table-bulk-action/#h4-2)
- [Table - SmartHR Design System](https://smarthr.design/products/components/table/#h3-2)

### このルールがチェックする内容

1. **aタグやLinkコンポーネントの使用を検出**: BulkActionRow内でaタグやTextLink、末尾がLinkで終わるコンポーネントを使用している場合にエラーを出します
2. **独自実装のButtonコンポーネントの使用を検出**: BulkActionRow内でStyledButtonなど、独自実装されたButtonコンポーネントを使用している場合にエラーを出します

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
// TextLinkコンポーネントで実装すると、コントラスト比が確保できず、セマンティックなマークアップではありません
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
        <SelectAllButton>一覧の「オブジェクト名」1000件すべてを選択</SelectAllButton>
      </Cluster>
    </BulkActionRow>
  </thead>
</Table>
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
