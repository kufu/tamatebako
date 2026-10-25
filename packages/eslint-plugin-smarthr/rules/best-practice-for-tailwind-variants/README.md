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

ただし、module scope（トップレベル）での呼び出しはimport時に一度しか評価されず、実質的にメモ化済みと同等であるため対象外とします。IIFE（即時実行関数）でラップされている場合も同様にmodule scope呼び出しとして扱います。

### 実行結果を格納する変数名の統一

`classNameGenerator`（またはプレフィックス付き）を実行した結果を格納する変数名を `className` / `classNames`（またはプレフィックス付き、定数の場合は `CLASS_NAME` / `CLASS_NAMES`）に統一することで、class名の実体がどの変数に入っているかを一目で判別できるようにします。

なお、`const { container, balloon } = classNameGenerator()` のようにサブジェネレータ関数を分割代入で取り出している場合は対象外とします（取り出した時点ではまだclass名の実体が生成されていないため）。

## チェック内容

このルールは以下の4つの観点からチェックを行います：

1. **import時の名称固定**: tailwind-variants(tv) のimport時の名称を `tv` に固定しているか（`as` などでの名称変更の禁止）
2. **変数名の統一**: tv の実行結果を格納する変数名が `classNameGenerator` または `xxxClassNameGenerator` になっているか
3. **useMemoの使用**: tvで生成した関数の実行を `useMemo` hook でメモ化しているか（module scopeでの呼び出しは対象外）
4. **実行結果の変数名統一**: `classNameGenerator`実行結果を格納する変数名が `className` / `classNames`（プレフィックス付き、または `CLASS_NAME` / `CLASS_NAMES` 形式の定数）になっているか（分割代入でサブジェネレータを取り出す場合は対象外）

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
```jsx
import { tv } from 'tailwind-variants'

const classNameGenerator = tv({
  ...
})

// 実行結果を格納する変数名がclassName/classNames(プレフィックス付き)やCLASS_NAME/CLASS_NAMESになっていない
const hoge = useMemo(() => classNameGenerator(), [])
```

## ✅ Correct

```jsx
import { tv } from 'tailwind-variants'

const classNameGenerator = tv({
  ...
})

...

const className = useMemo(() => classNameGenerator(), [])
```
```jsx
import { tv } from 'tailwind-variants'

const classNameGenerator = tv({
  ...
})

// module scope(トップレベル)での呼び出しはuseMemo不要
export const visuallyHiddenTextClassName = classNameGenerator()

// IIFEでラップされている場合も同様
const CLASS_NAMES = (() => {
  const { container, balloon } = classNameGenerator()

  return { container: container(), balloon: balloon() }
})()
```
