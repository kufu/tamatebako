# smarthr/design-system-guideline-bulk-action-row-button

BulkActionRow内では「すべてのオブジェクトを選択」ボタンの実装には Button[variant="tertiary"] を使用することを推奨するルールです

## なぜこのルールが必要なのか

### 1. 視覚的なアクセシビリティのため（Design Systemガイドライン）

BulkActionRowで使用する「すべてのオブジェクトの選択」ボタンは、Button[variant="tertiary"]を使用することで、BulkActionRowの背景色に対してコントラスト比4.5:1を確保できるように内部的に実装されているため、視覚的に見やすくなります。

**参考**:

- [テーブルの一括操作 - SmartHR Design System](https://smarthr.design/products/design-patterns/table-bulk-action/#h4-2)
- [Table - SmartHR Design System](https://smarthr.design/products/components/table/#h3-2)

### 2. セマンティックなマークアップのため

BulkActionRowは一括操作用の領域であり、内部に設置するクリッカブルな要素は基本的に**画面遷移以外の動作**（削除、編集、選択など）を担います。

- **a要素、AnchorButton、Link**: 画面遷移（リンク）を示すセマンティックなマークアップ
- **button要素、Button**: ボタンやその他のインタラクション（フォーム送信、操作実行など）を示すセマンティックなマークアップ

BulkActionRow内のクリッカブルな要素は画面遷移を伴わないため、a要素やAnchorButton、Linkでマークアップするのは不適切です。Buttonコンポーネントを使用してください。

### このルールがチェックする内容

1. **aタグやLinkコンポーネントの使用を検出**: BulkActionRow（またはXxxxBulkActionRowパターンのラッパーコンポーネント）内でaタグやTextLink、末尾がLinkで終わるコンポーネントを使用している場合にエラーを出します
2. **prefixが付いたButtonコンポーネントの使用を検出**: BulkActionRow（またはXxxxBulkActionRowパターンのラッパーコンポーネント）内でAnchorButton、StyledButtonなど、XxxxButtonパターンのコンポーネント（Buttonコンポーネント以外）を使用している場合にエラーを出します

**Note**: このルールは`BulkActionRow`だけでなく、`StyledBulkActionRow`や`CustomBulkActionRow`のように末尾が`BulkActionRow`で終わるラッパーコンポーネントにも適用されます。

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
// TextLinkは画面遷移を示すセマンティックなマークアップです
// BulkActionRowは一括操作用の領域であり、画面遷移以外の動作を担うため、Linkは不適切です
// また、コントラスト比も確保できません
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
// AnchorButtonはa要素ベースのコンポーネントであり、画面遷移を示すセマンティックなマークアップです
// BulkActionRowは一括操作用の領域であり、画面遷移以外の動作を担うため、AnchorButtonは不適切です
<Table>
  <thead>
    <BulkActionRow>
      <Cluster align="center">
        <Text>このページの「オブジェクト名」50件すべて選択されています。</Text>
        <AnchorButton href={undefined} onClick={toggleAllChecked}>
          一覧の「オブジェクト名」1000件すべてを選択
        </AnchorButton>
      </Cluster>
    </BulkActionRow>
  </thead>
</Table>
```

```jsx
// prefixが付いたButtonコンポーネントを使用している
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
