# smarthr/best-practice-for-object-props

smarthr-uiの`ReactNode | ObjectXxxType`形式のpropsに対して、詳細な設定が不要な場合にobject形式を使うことを禁止するルールです（自動修正対応）。

## なぜ禁止するのか

これらのpropsのobject形式は、スタイルやサイズなど詳細な設定を同時に行いたい場合のための形式です。詳細な設定が不要な場合にまでobject形式を使うと、以下のデメリットがあります：

- **冗長**: `{ children: '値' }`よりも`"値"`の方が簡潔で読みやすい
- **意図の不明瞭化**: object形式を見た際に「何か詳細な設定がされているはず」という期待を持たせてしまう

## 対象

現時点では以下の組み合わせが対象です（今後拡張予定）：

| コンポーネント | prop | 必須キー |
| --- | --- | --- |
| `ActionDialog` | `actionButton` / `closeButton` / `heading` | `text` |
| `AnchorButton` | `inactiveReason` | `text`（※smarthr-ui側で`message`から`text`へリネーム予定。リネーム前は検知されない） |
| `Button` | `disabledReason` | `text`（※smarthr-ui側で`message`から`text`へリネーム予定。リネーム前は検知されない） |
| `DefinitionListItem` | `term` | `text` |
| `DropdownMenuButton` | `trigger` | `text`（※smarthr-ui側で`children`から`text`へリネーム予定。リネーム前は検知されない） |
| `Fieldset` | `legend` | `text` |
| `FilterDropdown` | `trigger` | `text` |
| `FormControl` | `label` | `text` |
| `FormDialog` | `actionButton` / `closeButton` / `heading` | `text` |
| `InformationPanel` | `heading` | `text` |
| `MessageDialog` | `heading` | `text` |
| `StepFormDialog` | `backButton` / `closeButton` / `heading` / `submitButton` | `text` |
| `Text` | `icon` | `prefix` |
| `Text` | `maxLines` | `max` |

コンポーネント名は末尾一致（例: `ActionDialog`は`ControlledActionDialog`や`RemoteTriggerActionDialog`等も対象）で判定します。

対象propの値がobject形式で、かつ必須キー**のみ**を持つ場合に検出します。spread構文（`{ ...xxx }`）を含む場合や、必須キー以外の追加プロパティ（`size`、`styleType`、`tooltip`等）を持つ場合は対象外です。

## rules

```js
{
  rules: {
    'smarthr/best-practice-for-object-props': 'error', // 'warn', 'off'
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
```jsx
{/* ❌ */}
<Text maxLines={{ max: 3 }}>長いテキスト</Text>
<Text icon={{ prefix: <Icon /> }}>テキスト</Text>

{/* ✅ 自動修正後 */}
<Text maxLines={3}>長いテキスト</Text>
<Text icon={<Icon />}>テキスト</Text>

{/* ✅ 追加プロパティを伴う場合はobject形式のまま許容 */}
<Text maxLines={{ max: 3, tooltip: true }}>長いテキスト</Text>
```
```jsx
{/* ❌ */}
<ActionDialog heading={{ text: '確認' }} actionButton={{ text: '送信' }}>...</ActionDialog>

{/* ✅ 自動修正後 */}
<ActionDialog heading={'確認'} actionButton={'送信'}>...</ActionDialog>

{/* ✅ theme等の追加プロパティを伴う場合はobject形式のまま許容 */}
<ActionDialog heading="確認" actionButton={{ text: '送信', theme: 'danger' }}>...</ActionDialog>
```
```jsx
{/* ❌ */}
<Button disabledReason={{ message: '権限がありません' }}>保存</Button>

{/* ✅ 自動修正後 */}
<Button disabledReason={'権限がありません'}>保存</Button>

{/* ✅ icon等の追加プロパティを伴う場合はobject形式のまま許容 */}
<AnchorButton inactiveReason={{ message: '権限がありません', icon: FaLockIcon }}>保存</AnchorButton>
```
