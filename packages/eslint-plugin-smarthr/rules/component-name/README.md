# smarthr/component-name

styled-componentなどでコンポーネントを作成する際の命名規則を設定するルールです。

## なぜコンポーネント名の規則が必要なのか

特定のタグ、smarthr-uiが提供するコンポーネントなどを拡張する際、元の要素が何であるかがわかる名称になっていないと、以下の問題が発生します:

### a11y系ルールが正しく機能しない

このルールはa11y系ルールなどの前提になるチェックのため、基本的にoffにすることは推奨されません。

例: `select`要素を拡張したコンポーネントに`Select`という名称が含まれていない場合、a11y系のチェックが正しく動作しません。

### コードの可読性が低下する

`const Hoge = styled.select` のような命名では、`Hoge`が何の要素を拡張しているのか不明瞭です。

`const HogeSelect = styled.select` のように命名することで、selectを拡張していることが明確になります。

### 誤った要素の利用を防ぐ

`const HogeSelect = styled.div` のような、select要素ではないのにselectを連想させる名称は混乱を招きます。

## チェックする内容

### 拡張元の要素が推測できる名称になっているか

コンポーネント名から拡張元の要素やコンポーネントが推測できない場合、エラーになります。

```jsx
// NG: selectを拡張しているのにHogeという名称では推測できない
const Hoge = styled.select
```

### 誤解を招く名称になっていないか

実際の要素とは異なる要素を連想させる名称の場合、エラーになります。

```jsx
// NG: div要素なのにSelectという名称は誤解を招く
const HogeSelect = styled.div
```

### import時のas指定も対象

importする際の名称変更(as)も同様にチェックされます。

```jsx
// NG: HogeSelectをFugaという名称に変更すると元の要素が不明
import { HogeSelect as Fuga } from 'any'
```

ただし、型のimportの場合は除外されます。

```jsx
// OK: 型のimportなので除外される
import { type HogeSelect as Fuga } from 'any'
import type { HogeSelect as Fuga } from 'any'
```

### Modal禁止、Dialogに統一

SmartHR Design Systemでは、Modalという用語は使わずDialogに統一する方針のため、Modalという名称はエラーになります。

```jsx
// NG: Modalではなく、Dialogを使う
const HogeModal = styled(Any)

// OK
const HogeDialog = styled(Any)
```

## rules

```js
{
  rules: {
    'smarthr/component-name': 'error', // 'warn', 'off',
  },
}
```

## ❌ Incorrect

```jsx
// import 時のasをチェック
import { HogeSelect as Fuga } from 'any'

// 特定の要素と勘違いしてしまうような名称はNG
// 例: select要素ではないにも関わらずselectを予想してしまう名称を設定している
const HogeSelect = styled.div
const HogeSelect = styled(Hoge)

// 拡張前の要素がわからないような名称はNG
// 例: select要素であることがHogeから想像できない
const Hoge = styled.select
const Hoge = styled(FugaSelect)

// Modalでは意味が通らないパターンがあるためDialogに統一する方針のためNG
const HogeModal = styled(Any)
```

## ✅ Correct

```jsx
// import 時のasをチェック
import { HogeSelect as FugaSelect } from 'any'
// typeを設定すれば命名チェックから除外される
import { type HogeSelect as Fuga } from 'any'
import type { HogeSelect as Fuga } from 'any'

// あたらしい名称が継承元の要素を予想できるためOK
const HogeSelect = styled.select
const HogeSelect = styled(FugaSelect)

// ModalではなくDialogが利用されているためOK
const HogeDialog = styled(Any)
```
