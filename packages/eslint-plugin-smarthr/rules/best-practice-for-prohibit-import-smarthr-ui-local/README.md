# smarthr/best-practice-for-prohibit-import-smarthr-ui-local

smarthr-uiの内部実装へのimportを禁止するルールです。

## なぜ内部実装へのimportを禁止するのか

smarthr-uiから`smarthr-ui/lib/...`のようなパスでimportすると、以下の問題が発生します:

### 内部実装への依存

```jsx
// NG: 内部のディレクトリ構造に依存している
import { AnchorButton } from 'smarthr-ui/lib/components/Button/AnchorButton'
```

このimportは以下の問題を抱えています:

- **破壊的変更のリスク**
  - smarthr-uiの内部ディレクトリ構造が変わると、importが壊れる
  - `lib/`配下のファイルは公開APIではなく、予告なく変更される可能性がある

- **メンテナンスコストの増加**
  - smarthr-uiのバージョンアップ時に修正が必要になる可能性が高い

### 型のimport問題

```jsx
// NG: 内部の型定義を直接import
import type { Variant } from 'smarthr-ui/lib/components/Button/types'
import { HeadingTagTypes } from 'smarthr-ui/lib/components/Heading/Heading'
```

これらの型は内部実装やStorybook用にexportされているもので、以下の問題があります:

- **型定義が公開APIではない**
  - 内部的に使用される型のため、変更・削除される可能性がある

- **本来の使用方法ではない**
  - 型が必要な場合は、コンポーネントから生成することが推奨される

## 正しい実装方法

### コンポーネントのimport

`smarthr-ui`から直接importしてください:

```jsx
// OK
import { AnchorButton, FaArrowRightIcon } from 'smarthr-ui'
```

### 型の取得

型情報が必要な場合は、`ComponentProps`を使ってコンポーネントから生成してください:

```jsx
// OK: Headingのtag属性の型を取得
import { ComponentProps } from 'react'
import { Heading } from 'smarthr-ui'

type HeadingTagTypes = Required<ComponentProps<typeof Heading>>['tag']
```

```jsx
// OK: Buttonのvariant属性の型を取得
import { ComponentProps } from 'react'
import { Button } from 'smarthr-ui'

type Variant = Required<ComponentProps<typeof Button>>['variant']
```

```jsx
// OK: AppHeaderのnavigations配列の要素の型を取得
import { ComponentProps } from 'react'
import { AppHeader } from 'smarthr-ui'

type Navigation = Exclude<ComponentProps<typeof AppHeader>['navigations'], undefined | null>[number]
```

## rules

```js
{
  rules: {
    'smarthr/best-practice-for-prohibit-import-smarthr-ui-local': 'error', // 'warn', 'off'
  },
}
```

## ❌ Incorrect

```jsx
// smarthr-uiの内部構造に依存したpathからimportしているためNG
import { AnchorButton } from 'smarthr-ui/lib/components/Button/AnchorButton'
import { FaArrowRightIcon } from 'smarthr-ui/lib/components/Icon'

// 型情報は内部実装、storybookのためにexportしているもののため利用するとNG
import { HeadingTagTypes } from 'smarthr-ui/lib/components/Heading/Heading'
import type { Variant } from 'smarthr-ui/lib/components/Button/types'
import { type Navigation } from 'smarthr-ui/lib/components/AppHeader/types'
```

## ✅ Correct

```jsx
// 'smarthr-ui' からimportしているのでOK
import { AnchorButton, FaArrowRightIcon } from 'smarthr-ui'

// 型情報をコンポーネントから生成しているのでOK
import { ComponentProps } from 'react'

import { Heading } from 'smarthr-ui'
type HeadingTagTypes = Required<ComponentProps<typeof Heading>>['tag']

import { Button } from 'smarthr-ui'
type Variant = Required<ComponentProps<typeof Button>>['variant']

import { AppHeader } from 'smarthr-ui'
type Navigation = Exclude<ComponentProps<typeof AppHeader>['navigations'], undefined | null>[number]
```
