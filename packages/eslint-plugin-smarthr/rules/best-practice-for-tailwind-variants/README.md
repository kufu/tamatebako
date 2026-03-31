# smarthr/best-practice-for-tailwind-variants

tailwind-variantsの記法をチェックするルールです。tailwind-variantsの使い方に一定のルールを課すことで、実装のブレを無くし、レビューコストなどを下げることが目的です。

## なぜtailwind-variantsの記法を統一する必要があるのか

### tv関数のimport名の統一

tv関数をimportする際の名称を `tv` に固定することで、コードの一貫性を保ちます。`as` を使った名称変更を禁止することで、プロジェクト全体で同じ命名規則を維持し、可読性を向上させます。

### 変数名の統一による可読性の向上

tv関数の実行結果を格納する変数名を `classNameGenerator` または `xxxClassNameGenerator` に統一することで、コード内でのclass名生成ロジックの位置を明確にします。これにより、レビュアーや他の開発者が瞬時にその変数の役割を理解できるようになります。

### useMemoによるメモ化の強制

tv関数で生成した関数の実行を `useMemo` hook でメモ化することを強制します。これには以下の利点があります：

- パフォーマンスの最適化：不要な再計算を防ぎます
- 将来の移行作業の簡易化：useMemo内にtailwind系の実行をまとめることで、tailwind-variantsから別のライブラリへ乗り換える際の作業を楽にします
- コードの一貫性：すべてのtailwind-variants使用箇所で同じパターンを適用することで、プロジェクト全体の保守性が向上します

## チェック内容

このルールは以下の3つの観点からチェックを行います：

1. **import時の名称固定**: tailwind-variants(tv) のimport時の名称を `tv` に固定しているか（`as` などでの名称変更の禁止）
2. **変数名の統一**: tv の実行結果を格納する変数名が `classNameGenerator` または `xxxClassNameGenerator` になっているか
3. **useMemoの使用**: tvで生成した関数の実行を `useMemo` hook でメモ化しているか

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
