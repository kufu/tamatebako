# `@smarthr/use-virtual-scroll`

仮想スクロールをするための React のカスタムフックです。

## Usage

### window に対してスクロールするリストに仮想スクロールを適用させる場合

```tsx
import React from 'react'
import { useVirtualScroll } from '@smarthr/use-virtual-scroll'

const ScrollOnWindow = () => {
  const originalItems = [...Array(1000)].map((_, i) => i)
  const itemHeight = 20

  const { items, listRef, createListStyle, createItemStyle } = useVirtualScroll<
    typeof originalItems[number],
    HTMLUListElement
  >(originalItems, itemHeight)

  return (
    <ul ref={listRef} style={createListStyle()}>
      {items.map((item, index) => (
        <li key={index} style={{ height: itemHeight, ...createItemStyle(index) }}>
          {item}
        </li>
      ))}
    </ul>
  )
}
```

### 特定の要素内でスクロールするリストに仮想スクロールを適用させる場合

```tsx
import React from 'react'
import { useVirtualScroll } from '@smarthr/use-virtual-scroll'

const ScrollOnContainer = () => {
  const originalItems = [...Array(1000)].map((_, i) => i)
  const itemHeight = 20

  const {
    items,
    listRef,
    scrollableContainerRef,
    createListStyle,
    createItemStyle,
  } = useVirtualScroll<typeof originalItems[number], HTMLUListElement, HTMLDivElement>(
    originalItems,
    itemHeight,
  )

  return (
    <div
      ref={scrollableContainerRef}
      style={{
        width: 300,
        height: 300,
        overflow: 'auto',
      }}
    >
      <ul ref={listRef} style={createListStyle()}>
        {items.map((item, index) => (
          <li key={index} style={{ height: itemHeight, ...createItemStyle(index) }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## Options

第3引数にオブジェクト形式で options を指定できます。

| name                  | required   | type   | description                                                                          |
|-----------------------|-----------|--------|--------------------------------------------------------------------------------------|
| marginItemCount | -        | number | スクロールコンテナ外にリストアイテムをいくつ表示しておくかの設定です。スクロール時のリストアイテムのちらつきが気になる場合は値を設定してください。デフォルト値は0です。  |

## License

This project is licensed under the terms of the [MIT license](https://github.com/kufu/tamatebako/blob/master/packages/use-virtual-scroll/LICENSE).
