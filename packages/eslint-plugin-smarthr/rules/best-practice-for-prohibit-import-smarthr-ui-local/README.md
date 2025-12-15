# smarthr/best-practice-for-prohibit-import-smarthr-ui-local

- smarthr-uiの内部的に利用している型などのimportを禁止します
  - 型は必要とするコンポーネントなどから生成することをおすすめします

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
