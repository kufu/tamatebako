# smarthr/design-system-guideline-prohibit-input-affix-interactive-element

Inputコンポーネントの`prefix`/`suffix`属性に操作可能な要素を配置すること、および`prefix`/`suffix`と`subActionArea`を同時に指定することを禁止するルールです。

## なぜ禁止するのか

`prefix`/`suffix`は装飾用の要素（アイコンやテキストなど）を配置するためのpropsで、`subActionArea`は操作用の要素（ボタンなど）を配置するためのpropsです。役割を分けることで、以下のメリットがあります：

- **アクセシビリティ**: 操作可能な要素が適切な位置・文脈に配置され、スクリーンリーダー等での操作性が向上します
- **意図の明確化**: `prefix`/`suffix`と`subActionArea`の役割が明確になり、コードの可読性が向上します
- **一貫性の維持**: プロジェクト全体でInputの操作要素配置パターンが統一されます

## 対象

- **コンポーネント**: 名前が`Input`で終わるすべてのコンポーネント
- **検出内容**:
  1. `suffix`と`subActionArea`を同時に指定している場合（`prefix`と`subActionArea`の同時指定は許容）
  2. `prefix`または`suffix`内にButtonやRemoteDialogTriggerなど操作可能なコンポーネントを含めている場合
  3. `prefix`または`suffix`内に`onXxxx`や`handleXxxx`といったハンドラ属性を持つ要素を含めている場合

## rules

```js
{
  rules: {
    'smarthr/design-system-guideline-prohibit-input-affix-interactive-element': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
// suffixとsubActionAreaを同時に指定
<Input suffix={<Icon name="search" />} subActionArea={<Button>クリア</Button>} />

// prefix/suffix内に操作可能なコンポーネント
<Input suffix={<Button>クリア</Button>} />
<Input prefix={<RemoteDialogTrigger targetId="dialog">開く</RemoteDialogTrigger>} />

// prefix/suffix内にハンドラ属性を持つ要素
<Input suffix={<div onClick={handleClick}>×</div>} />
<Input prefix={<span handleClear={clear}>×</span>} />
```

## ✅ Correct

```jsx
// prefix/suffixは装飾用の要素のみ
<Input suffix={<Icon name="search" />} />
<Input prefix="円" />

// 操作可能な要素はsubActionAreaに配置
<Input subActionArea={<Button>クリア</Button>} />
<Input subActionArea={<RemoteDialogTrigger targetId="dialog">開く</RemoteDialogTrigger>} />

// prefixとsubActionAreaの同時指定は許容
<Input prefix={<Icon name="search" />} subActionArea={<Button>クリア</Button>} />
```
