# smarthr/best-practice-for-tailwind-variants

- tailwind-variantsの記法をチェックするルールです
- 現状は以下のチェックを行います
  - tailwind-variants(tv) のimport時の名称をtvに固定しているか (asなどでの名称変更の禁止)
  - tv の実行結果を格納する変数名を統一 (classNameGenerator、もしくはxxxClassNameGenerator)
  - tvで生成した関数の実行をuseMemo hook でメモ化しているか


## rules

```js
{
  rules: {
    'smarthr/best-practice-for-tailwind-variants': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
import { tv as hoge } from 'tailwind-variants'

const xxx = tv({
  ...
})

...

const yyyy = xxx()
```

## ✅ Correct

```jsx
import { tv } from 'tailwind-variants'

const classNameGenerator = tv({
  ...
})

...

const yyyy = useMemo(() => classNameGenerator(), [])
```
