# smarthr/best-practice-for-remote-trigger-dialog

RemoteDialogTrigger、RemoteTriggerXxxxDialogのベストプラクティスをチェックするルールです。

## なぜリテラル文字列が必要なのか

RemoteDialogTriggerとRemoteTriggerXxxxDialogは、`id`と`targetId`を使って対応関係を定義します:

```jsx
// RemoteDialogTriggerのtargetIdと、RemoteTriggerActionDialogのidを一致させる
<RemoteDialogTrigger targetId="help_dialog">open</RemoteDialogTrigger>
<RemoteTriggerActionDialog id="help_dialog">content</RemoteTriggerActionDialog>
```

この`id`と`targetId`に変数を使うと、以下の問題が発生します:

### コード的な距離が遠い

RemoteDialogTriggerとRemoteTriggerXxxDialogは、その特性上、別ファイルなどコード的な距離が遠い位置にそれぞれ記述される場合があります。このような場合、変数を使うとどのTriggerとDialogが対応しているのか追跡することが困難になります。

### 変数名や生成方法の不一致

変数でこれらを設定する場合、全く違う変数の生成方法が使われたり、同じ値になる場合でも別の名称になってしまっていることがあります。これにより、紐づくTriggerとDialogであることを調べることが困難になります。

```jsx
// 別ファイルで異なる変数名や生成方法が使われる例
// fileA.tsx
const dialogId = 'help_dialog'
<RemoteDialogTrigger targetId={dialogId}>open</RemoteDialogTrigger>

// fileB.tsx
const id = 'help_dialog'
<RemoteTriggerActionDialog id={id}>content</RemoteTriggerActionDialog>
```

### 1:nまたは1:1の関係性

Trigger - Dialogの関係は、その特性上、ひとつのDialogに対して複数のTriggerがある1:nか、DialogとTriggerが1:1の関係になる場合しか存在しません。この明確な関係性を維持するためには、リテラル文字列で統一的に管理することが適切です。

## チェックする内容

`id`属性と`targetId`属性には、リテラルな文字列のみを許可します:

```jsx
// OK: リテラル文字列
<RemoteDialogTrigger targetId="help_dialog">open</RemoteDialogTrigger>
<RemoteTriggerActionDialog id="help_dialog">content</RemoteTriggerActionDialog>

// NG: 変数
<RemoteDialogTrigger targetId={id}>open</RemoteDialogTrigger>

// NG: テンプレートリテラル（JSX式内の文字列）
<RemoteTriggerActionDialog id={'hoge'}>content</RemoteTriggerActionDialog>
```

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
