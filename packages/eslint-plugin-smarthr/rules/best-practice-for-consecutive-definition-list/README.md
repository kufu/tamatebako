# best-practice-for-consecutive-definition-list

同階層に `DefinitionList` が連続して配置されている場合に警告します。

## ルールの詳細

`DefinitionList` コンポーネントが同じ親要素の直下に連続して配置されている場合、多くのケースで誤った使い方をしている可能性があります。

以前は異なるカラム数（1カラム・2カラムなど）を表現するために複数の `DefinitionList` を使う必要がありましたが、現在は `DefinitionListItem` の `maxColumns` prop を使用することで、1つの `DefinitionList` 内で異なるカラム数を混在させることができます。

## 👎 間違った例

```tsx
// ❌ DefinitionListが連続している
<DefinitionList>
  <DefinitionListItem term="項目1">内容1</DefinitionListItem>
</DefinitionList>
<DefinitionList>
  <DefinitionListItem term="項目2">内容2</DefinitionListItem>
  <DefinitionListItem term="項目3">内容3</DefinitionListItem>
</DefinitionList>
```

## 👍 正しい例

```tsx
// ✅ 1つのDefinitionListにまとめる
<DefinitionList>
  <DefinitionListItem term="項目1">内容1</DefinitionListItem>
  <DefinitionListItem term="項目2">内容2</DefinitionListItem>
  <DefinitionListItem term="項目3">内容3</DefinitionListItem>
</DefinitionList>

// ✅ maxColumns を使用してカラム数を指定
<DefinitionList>
  <DefinitionListItem maxColumns={1} term="項目1">内容1</DefinitionListItem>
  <DefinitionListItem maxColumns={2} term="項目2">内容2</DefinitionListItem>
  <DefinitionListItem maxColumns={2} term="項目3">内容3</DefinitionListItem>
</DefinitionList>

// ✅ 意味的に異なるグループを表現する場合は、間に別の要素を挿入
<DefinitionList>
  <DefinitionListItem term="基本情報">...</DefinitionListItem>
</DefinitionList>

<h2>詳細情報</h2>

<DefinitionList>
  <DefinitionListItem term="詳細項目">...</DefinitionListItem>
</DefinitionList>
```

## 例外

以下のようなケースでは、複数の `DefinitionList` を使用しても問題ありません：

- 意味的に明確に異なるグループを表現する場合（間に見出しなどの要素を挟む）
- 異なるスタイリングやレイアウトが必要な場合
- セマンティック上、別の定義リストとして扱うべき場合

## autofix

このルールは自動修正に対応していません。手動で修正してください。

## 参考

- [DefinitionListItem - maxColumns](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/DefinitionList/DefinitionListItem.tsx)
- [Storybook - DefinitionListItem MaxColumns](https://github.com/kufu/smarthr-ui/blob/master/packages/smarthr-ui/src/components/DefinitionList/stories/DefinitionListItem.stories.tsx)
