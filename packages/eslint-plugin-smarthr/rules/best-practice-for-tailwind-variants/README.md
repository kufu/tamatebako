# smarthr/best-practice-for-tailwind-variants

- tailwind-variantsの記法をチェックするルールです
- tailwind-variantsの使い方に一定のルールを課すことで、実装のブレを無くし、レビューコストなどを下げることが目的です
- tv関数の実行結果を格納する変数の名称を一定のルールにすることで可読性を向上させます
- また、上記関数を実行する際、一律useMemoを利用することを促します
   - useMemo内にtailwind系の実行をまとめることで将来的にtailwind-variantsから乗り換える際の作業を楽にする、などmemo化以外の効果もあります
- まとめると現状以下のチェックを行います
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
```
```jsx
import { tv } from 'tailwind-variants'

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
