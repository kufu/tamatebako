# smarthr/design-system-guideline-prohibit-unnecessary-object-prop

smarthr-uiの`ReactNode | ObjectXxxType`形式のpropsに対して、詳細な設定が不要な場合にobject形式を使うことを禁止するルールです（自動修正対応）。

## なぜ禁止するのか

これらのpropsのobject形式は、スタイルやサイズなど詳細な設定を同時に行いたい場合のための形式です。詳細な設定が不要な場合にまでobject形式を使うと、以下のデメリットがあります：

- **冗長**: `{ children: '値' }`よりも`"値"`の方が簡潔で読みやすい
- **意図の不明瞭化**: object形式を見た際に「何か詳細な設定がされているはず」という期待を持たせてしまう

## 対象

現時点では以下の組み合わせが対象です（今後拡張予定）：

| コンポーネント | prop | 必須キー |
| --- | --- | --- |
| `DropdownMenuButton` | `trigger` | `children` |

対象propの値がobject形式で、かつ必須キー**のみ**を持つ場合に検出します。spread構文（`{ ...xxx }`）を含む場合や、必須キー以外の追加プロパティ（`size`、`onlyIcon`等）を持つ場合は対象外です。

## rules

```js
{
  rules: {
    'smarthr/design-system-guideline-prohibit-unnecessary-object-prop': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
<DropdownMenuButton trigger={{ children: 'メニュー' }}>...</DropdownMenuButton>
```

## ✅ Correct

```jsx
<DropdownMenuButton trigger="メニュー">...</DropdownMenuButton>

{/* 詳細な設定(size, onlyIcon等)を伴う場合はobject形式のまま許容 */}
<DropdownMenuButton trigger={{ children: 'メニュー', size: 's' }}>...</DropdownMenuButton>

{/* spread構文を含む場合は静的に判断できないため対象外 */}
<DropdownMenuButton trigger={{ ...triggerProps }}>...</DropdownMenuButton>
```
