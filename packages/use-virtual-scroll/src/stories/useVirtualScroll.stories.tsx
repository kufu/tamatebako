import type { Meta, StoryObj } from '@storybook/react'

import { useVirtualScroll } from '../useVirtualScroll'
import React from 'react'
import { useState } from 'react'

const meta = {
  title: 'useVirtualScroll',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ScrollOnWindow: Story = {
  render: () => {
    const originalItems = [...Array(1000)].map((_, i) => i)
    const itemHeight = 20

    const { items, listRef, createListStyle, createItemStyle } = useVirtualScroll<
      (typeof originalItems)[number],
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
  },
}

export const ScrollOnContainer: Story = {
  render: () => {
    const originalItems = [...Array(1000)].map((_, i) => i)
    const itemHeight = 20
    const [containerHeight, setContainerHeight] = useState(300)

    const { items, listRef, scrollableContainerRef, createListStyle, createItemStyle } = useVirtualScroll<
      (typeof originalItems)[number],
      HTMLUListElement,
      HTMLDivElement
    >(originalItems, itemHeight)

    return (
      <>
        <div>
          <label htmlFor="scroll-container-height">Scroll Container Height</label>
        </div>
        <input
          name="height"
          id="scroll-container-height"
          type="number"
          value={containerHeight}
          onChange={(e) => setContainerHeight(Number(e.target.value))}
        />
        <div
          ref={scrollableContainerRef}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            height: containerHeight,
            border: 'solid 1px #999',
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
      </>
    )
  },
}
