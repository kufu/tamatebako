# smarthr/a11y-prohibit-useless-sectioning-fragment

Headingレベルの自動計算用のコンポーネントであるSectioningFragmentが不必要に利用されている場合を検知し、修正を促します


## SectioningFragmentの扶養な場合の判定基準について

自動でレベル計算が行われる状態のコンポーネントを子として持っている場合、エラーになります。

```jsx
// smarthr-ui/Sectionは自動レベル計算を行うため SectioninigFragment は不要
<SectioninigFragment>
  <Section>
    any
  </Section>
</SectioninigFragment>
```

```jsx
// smarthr-uiのLayout系コンポーネントでもasにSectioninContentを指定した場合は自動レベル計算が行われるためエラー
<SectioninigFragment>
  <Stack as="aside">{hoge}</Stack>
</SectioninigFragment>
```

## rules

```js
{
  rules: {
    'smarthr/a11y-prohibit-useless-sectioning-fragment': 'error', // 'warn', 'off',
  },
}
```

## ❌ Incorrect

```jsx
<SectioninigFragment>
  <Section>
    any
  </Section>
</SectioninigFragment>
```

```jsx
<SectioninigFragment>
  <Stack as="aside">
    any
  </Stack>
</SectioninigFragment>
```

```jsx
<SectioninigFragment>
  <HogeCenter forwardedas="nav">
    any
  </HogeCenter>
</SectioninigFragment>
```

## ✅ Correct

```jsx
<Section>
  any
</Section>
```

```jsx
<Stack as="aside">
  any
</Stack>
```

```jsx
<HogeCenter forwardedas="nav">
  any
</HogeCenter>
```

```jsx
<SectioningFragment>
  <Any />
</SectioningFragment>
```

```jsx
<Aside>
  <SectioningFragment>{any}</SectioningFragment>>
</Aside>
```
