# smarthr/a11y-prohibit-checkbox-or-radio-in-table-cell

- テーブルセル（Th, Td）内に Checkbox, RadioButton を配置することを禁止するルールです
  - SmartHR UI には、デフォルトでアクセシブルネームを設定する TdCheckbox, ThCheckbox, TdRadioButton といったより適切なコンポーネントが用意されています

## rules

```js
{
  rules: {
    'smarthr/a11y-prohibit-checkbox-or-radio-in-table-cell': [
      'error', // 'warn', 'off'
    ]
  },
}
```

## ❌ Incorrect

```jsx
<Td>
  <Checkbox name="foo" />
</Td>

<Th>
  <Checkbox name="bar" />
</Th>

<Td>
  <RadioButton name="baz" />
</Td>
```

## ✅ Correct

```jsx
<TdCheckbox name="foo" />
<ThCheckbox name="bar" />
<TdRadioButton name="baz" />
```
