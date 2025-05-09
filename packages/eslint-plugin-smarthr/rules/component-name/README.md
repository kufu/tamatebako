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

// selectと勘違いしてしまうような名称はNG
const HogeSelect = styled.div
const HogeSelect = styled(Hoge)

// selectとわからないような名称はNG
const Hoge = styled.select
const Hoge = styled(FugaSelect)
```

## ✅ Correct

```jsx
// import 時のasをチェック
import { HogeSelect as FugaSelect } from 'any'
// typeを設定すれば命名チェックから除外される
import { type HogeSelect as Fuga } from 'any'
import type { HogeSelect as Fuga } from 'any'

// 継承元がselectであることがわかるためOK
const HogeSelect = styled.select
const HogeSelect = styled(FugaSelect)
```
