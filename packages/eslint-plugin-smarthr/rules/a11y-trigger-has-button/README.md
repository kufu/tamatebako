# smarthr/a11y-trigger-has-button

DropdownTriggerやDialogTrigger, DisclosureTrigger内にbutton要素を設置することを強制するルールです。

## なぜbutton要素の設置を強制するのか

DropdownTrigger, DialogTrigger, DisclosureTriggerはすべてUI上の変化を起こすことを目的にしたコンポーネントです。
(例: DropdownTriggerで包まれた要素をクリックすることでDropdownが開く)

これらのコンポーネントは前提としてURLの変化は起こさないため、button要素を設定することが望ましく、コンポーネントの実装もその様になっています。

## エラーになる条件について

### Trigger以下に複数の子が存在する場合

Triggerの直下はbutton要素のみになるようにしてください。
TriggerではButtonの属性を拡張して設定する場合があり、複数要素を設定するとこれらの設定が狂う場合が考えられるためです。

```jsx
// Triggerの子は単一である必要があるのでNG
<DialogTrigger>
  <Button />
  <Any />
</DialogTrigger>
```

### 子がbutton要素ではない場合

Triggerの直下はbutton要素になるようにしてください。
前述の通りbuttonであることがコンポーネントとして期待しているため、それ以外の要素を設定すると意図しない動作をする可能性があります。

```jsx
// Triggerの子はbutton要素である必要があるのでNG
<DialogTrigger>
  <Any />
</DialogTrigger>
```

smarthr-ui/AnchorButtonも実体はa要素のため、エラーになります

```jsx
// Triggerの子はbutton要素である必要があるのでNG
<DialogTrigger>
  <XxxAnchorButton />
</DialogTrigger>
```

## rules

```js
{
  rules: {
    'smarthr/a11y-trigger-has-button': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
// Triggerの子はbutton要素である必要がある
<DropdownTrigger>
  <Xxx />
</DropdownTrigger>
```

```jsx
// Triggerの子はbutton要素のみである必要がある
<DialogTrigger>
  <Button />
  <Any />
</DialogTrigger>
```

```jsx
// AnchorButtonは実体はa要素のためNG
<DisclosureTrigger>
  <YyyAnchorButton />
</DisclosureTrigger>
```

## ✅ Correct

```jsx
<DropdownTrigger>
  <Button />
</DropdownTrigger>
```

```jsx
<DialogTrigger>
  <XxxButton />
</DialogTrigger>
```
