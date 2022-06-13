import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react'

type Options = {
  marginItemCount?: number
}

export const useVirtualScroll = <
  Item,
  List extends HTMLElement,
  ScrollContainer extends HTMLElement | Window = Window,
>(
  items: Item[],
  itemHeight: number,
  options?: Options,
) => {
  // @ts-ignore
  const scrollableContainerRef = useRef<ScrollContainer>(window)
  const listRef = useRef<List>(null)
  const [virtualScrollAmount, setVirtualScrollAmount] = useState(0)
  const [scrollableContainerHeight, setScrollableContainerHeight] = useState(0)
  const marginItemCount = options?.marginItemCount ?? 0

  const itemCount = items.length
  let startCount = Math.floor(virtualScrollAmount / itemHeight)
  let endCount = Math.ceil((virtualScrollAmount + scrollableContainerHeight) / itemHeight)
  // marginItemCount に合わせて startCount と endCount を修正
  startCount = startCount <= marginItemCount ? 0 : startCount - marginItemCount
  endCount = itemCount - marginItemCount <= endCount ? itemCount : endCount + marginItemCount

  /**
   * ラッパー要素の style を作る関数
   */
  const createListStyle = useCallback(
    (): CSSProperties => ({
      position: 'relative',
      height: `${itemCount * itemHeight}px`,
    }),
    [itemCount, itemHeight],
  )

  /**
   * 各アイテムの style を作る関数
   */
  const createItemStyle = useCallback(
    (index: number): CSSProperties => {
      const positionOffset = startCount * itemHeight
      const positionTop = itemHeight * index
      return {
        position: 'absolute',
        top: `${positionOffset + positionTop}px`,
      }
    },
    [startCount, itemHeight],
  )

  /**
   * スクロールイベントを監視
   */
  useEffect(() => {
    const scrollableContainer = scrollableContainerRef.current
    const list = listRef.current!
    if (isWindow(scrollableContainer)) {
      const onScroll = () => {
        const listTop = Math.ceil(list.getBoundingClientRect().top)
        const newVirtualScrollAmount = Math.max(-listTop, 0)
        setVirtualScrollAmount(newVirtualScrollAmount)
      }
      onScroll()
      scrollableContainer.addEventListener('scroll', onScroll, { passive: true })
      return () => {
        scrollableContainer.removeEventListener('scroll', onScroll)
      }
    } else {
      const onScroll = () => {
        const scrollableContainerTop = Math.ceil(scrollableContainer.getBoundingClientRect().top)
        const listTop = Math.ceil(list.getBoundingClientRect().top)
        const newVirtualScrollAmount = Math.max(scrollableContainerTop - listTop, 0)
        setVirtualScrollAmount(newVirtualScrollAmount)
      }
      onScroll()
      scrollableContainer.addEventListener('scroll', onScroll, { passive: true })
      return () => {
        scrollableContainer.removeEventListener('scroll', onScroll)
      }
    }
  }, [])

  /**
   * リサイズイベントを監視
   */
  useEffect(() => {
    const scrollableContainer = scrollableContainerRef.current
    if (isWindow(scrollableContainer)) {
      const onResize = () => setScrollableContainerHeight(scrollableContainer.innerHeight)
      onResize()
      scrollableContainer.addEventListener('resize', onResize, { passive: true })
      return () => {
        scrollableContainer.removeEventListener('resize', onResize)
      }
    } else {
      const onResizeHTMLElement = () =>
        setScrollableContainerHeight(scrollableContainer.clientHeight)
      const observer = new ResizeObserver(onResizeHTMLElement)
      observer.observe(scrollableContainer)
      return () => {
        observer.disconnect()
      }
    }
  }, [])

  return {
    items: items.slice(startCount, endCount),
    listRef,
    scrollableContainerRef,
    createListStyle,
    createItemStyle,
  }
}

const isWindow = (target: HTMLElement | Window): target is Window => {
  return target === window
}
