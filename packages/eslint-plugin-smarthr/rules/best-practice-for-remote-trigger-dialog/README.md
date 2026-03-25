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

### ベストプラクティス：Dialogは1つ、Triggerは複数

複数アイテム毎（例: 従業員一覧）にDialogをレンダリングするのではなく、Dialogは一つでTriggerが複数になるようにロジックを組むことがベストプラクティスです。

```jsx
// NG: 各従業員ごとにDialogを作成（パフォーマンス上問題）
{employees.map(employee => (
  <>
    <RemoteDialogTrigger targetId={`employee-${employee.id}`}>
      詳細
    </RemoteDialogTrigger>
    <RemoteTriggerActionDialog id={`employee-${employee.id}`}>
      {employee.name}の詳細
    </RemoteTriggerActionDialog>
  </>
))}

// OK: Dialogは1つ、Triggerが複数（Dialogのレンダリングは高コストのため、一つにまとめる）
{employees.map(employee => (
  <RemoteDialogTrigger
    targetId="employee_detail"
    onClick={() => setSelectedEmployee(employee)}
  >
    詳細
  </RemoteDialogTrigger>
))}
<RemoteTriggerActionDialog id="employee_detail">
  {selectedEmployee?.name}の詳細
</RemoteTriggerActionDialog>
```

このパターンでは、Dialogのレンダリングは高コストのため、一つにまとめることでパフォーマンスが向上します。そのため、「何のためのダイアログか」を表すid属性（`employee_detail`）はプロダクト内で常に一意になります。アイテムのidなどの変数を使わずとも一意の文字列を指定でき、リテラル文字列で統一的に管理することが適切です。

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
