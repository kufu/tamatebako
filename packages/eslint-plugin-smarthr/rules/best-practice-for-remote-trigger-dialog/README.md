# smarthr/best-practice-for-remote-trigger-dialog

RemoteDialogTrigger、RemoteTriggerXxxxDialogのベストプラクティスをチェックするルールです。

## なぜリテラル文字列が必要なのか

RemoteDialogTriggerとRemoteTriggerXxxxDialogは、`id`と`targetId`を使って対応関係を定義します:

```jsx
// RemoteDialogTriggerのtargetIdと、RemoteTriggerActionDialogのidを一致させる
<RemoteDialogTrigger targetId="help_dialog">open</RemoteDialogTrigger>
<RemoteTriggerActionDialog id="help_dialog">content</RemoteTriggerActionDialog>
```

この`id`と`targetId`に変数やテンプレート文字列を使うと、以下の問題が発生します:

### 対応関係が不明確になる

```jsx
// NG: 変数を使うと、どのDialogと対応するか不明
<RemoteDialogTrigger targetId={id}>open</RemoteDialogTrigger>
```

この場合、`id`変数の値を追跡しなければ、どのDialogと対応するかわかりません。

### 検索が困難になる

リテラル文字列であれば、コード全体を文字列検索することで対応するTriggerとDialogをすぐに見つけられます:

```
// "help_dialog"で検索すれば、対応するTriggerとDialogが両方見つかる
```

変数を使うと、この検索が機能しなくなります。

### リファクタリングのリスクが増加

リテラル文字列であれば、IDEのリネーム機能や一括置換で安全に変更できます。

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
