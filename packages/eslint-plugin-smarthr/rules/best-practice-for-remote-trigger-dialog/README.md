# smarthr/best-practice-for-remote-trigger-dialog

RemoteDialogTrigger、RemoteTriggerXxxxDialogのベストプラクティスをチェックするルールです。

## なぜリテラル文字列が必要なのか

RemoteDialogTriggerとRemoteTriggerXxxDialogは、`id`と`targetId`を使って対応関係を定義します。リテラル文字列を使うことで、DialogとTriggerが指すIDは常に一意の文字列になり、コード検索などで簡単に紐づく対象を見つけることができます。

変数を使うと、異なる変数名や生成方法が使われることで、紐づくTriggerとDialogを調べることが困難になる場合があります。

```jsx
// NG: 変数を使った例 - 異なるファイルで異なる変数名
// fileA.tsx
const dialogId = 'help_dialog'
<RemoteDialogTrigger targetId={dialogId}>open</RemoteDialogTrigger>

// fileB.tsx
const id = 'help_dialog'
<RemoteTriggerActionDialog id={id}>content</RemoteTriggerActionDialog>

// この場合、"help_dialog"で検索しても変数名しかヒットせず、
// 対応するTriggerとDialogを見つけることが困難
```

```jsx
// OK: リテラル文字列を使った例
// fileA.tsx
<RemoteDialogTrigger targetId="help_dialog">open</RemoteDialogTrigger>

// fileB.tsx
<RemoteTriggerActionDialog id="help_dialog">content</RemoteTriggerActionDialog>

// "help_dialog"で検索すれば、対応するTriggerとDialogが両方見つかる
```

DialogとTriggerの関係は1:1または1:n（複数のTriggerが1つのDialogを開く）のみで、Dialogの名称はプロダクト内で常に一意です。そのため、リテラル文字列で統一的に管理することが適切です。

## rules

```js
{
  rules: {
    'smarthr/best-practice-for-remote-trigger-dialog': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```js
<RemoteDialogTrigger targetId={id}>open.</RemoteDialogTrigger>
<RemoteTriggerActionDialog {...args} id={'hoge'}>content.</RemoteTriggerActionDialog>
```

## ✅ Correct


```js
<RemoteDialogTrigger targetId="help_dialog">open.</RemoteDialogTrigger>
<RemoteTriggerActionDialog {...args} id="help_dialog">content.</RemoteTriggerActionDialog>
```
