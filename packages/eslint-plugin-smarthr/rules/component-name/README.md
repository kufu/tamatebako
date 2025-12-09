# smarthr/component-name

- styled-componentなどでコンポーネントを作成する際の命名規則を設定するルールです
- 特定のタグ、smarthr-uiが提供するコンポーネントなどを拡張する際、元の要素がなんであるか？がわかる名称になるようにチェックします
- a11y系ルールなどの前提になるチェックのため、基本的にoffにすることは推奨されません

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
