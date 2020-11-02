/**
 * useBulkCheck
 *
 * リストに対しての個別チェック・ページ内一括チェック・ページを跨いだ一括全件チェックの状態を管理するための React のカスタムフックです。
 * バックエンドではチェックした要素の ID 一覧(sting[])かページを跨いだ一括全件チェックのフラグ(boolean)を受け取ることを想定します。
 */

import { useState } from 'react'

export type ListItem<T> = { id: string } & T
export type CheckedListItem<T> = { item: ListItem<T>; checked: boolean }
export type Argument<T> = {
  pageItems: Array<ListItem<T>>
  defaultCheckedIds?: string[]
  defaultIsAllChecked?: boolean
}

export const useBulkCheck = <T>({
  pageItems: originalItems,
  defaultCheckedIds = [],
  defaultIsAllChecked = false,
}: Argument<T>) => {
  const [checkedSet, updateCheckedSet] = useState(new Set(defaultCheckedIds))
  const [isAllChecked, setIsAllChecked] = useState(defaultIsAllChecked)

  const pageItems = getPageItemsWithChecked(originalItems, checkedSet, isAllChecked)
  const hasCheckedItemInPage = getHasCheckedItemInPage(pageItems)
  const isPageChecked = getIsPageChecked(pageItems)

  const toggleChecked = (id: string) => {
    const currentChecked = checkedSet.has(id)
    const newSet = new Set(checkedSet)

    if (currentChecked) {
      setIsAllChecked(false)
      newSet.delete(id)
    } else {
      newSet.add(id)
    }

    updateCheckedSet(newSet)
  }
  const togglePageChecked = () => {
    const newSet = new Set(checkedSet)

    if (isAllChecked) {
      setIsAllChecked(false)
      newSet.clear()
    } else {
      const checkedItemsInCurrentPage = getCheckedItems(pageItems)

      if (isPageChecked || checkedItemsInCurrentPage.length) {
        checkedItemsInCurrentPage.forEach(({ item }) => {
          newSet.delete(item.id)
        })
      } else {
        pageItems.forEach(({ item }) => {
          newSet.add(item.id)
        })
      }
    }

    updateCheckedSet(newSet)
  }
  const toggleAllChecked = () => {
    setIsAllChecked(!isAllChecked)
  }
  const resetChecked = () => {
    setIsAllChecked(false)
    updateCheckedSet(new Set())
  }

  return {
    pageItems,
    hasCheckedItemInPage,
    isPageChecked,
    isAllChecked,
    toggleChecked,
    togglePageChecked,
    toggleAllChecked,
    resetChecked,
    checkedIds: Array.from(checkedSet),
  }
}

const getPageItemsWithChecked = <T>(
  pageItems: Array<ListItem<T>>,
  checkedSet: Set<string>,
  isAllChecked: boolean,
) =>
  pageItems.map((item) => ({
    item,
    checked: checkedSet.has(item.id) || isAllChecked,
  }))
const getHasCheckedItemInPage = <T>(pageItems: Array<CheckedListItem<T>>) =>
  pageItems.some(({ checked }) => checked)
const getIsPageChecked = <T>(pageItems: Array<CheckedListItem<T>>) =>
  pageItems.every(({ checked }) => checked)
const getCheckedItems = <T>(pageItems: Array<CheckedListItem<T>>) =>
  pageItems.filter(({ checked }) => checked)
