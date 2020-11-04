# `@smarthr/useBulkCheck`
[![npm version](https://badge.fury.io/js/%40smarthr%2FuseBulkCheck.svg)](https://badge.fury.io/js/%40smarthr%2FuseBulkCheck)

リストに対しての個別チェック・ページ内一括チェック・ページを跨いだ一括全件チェックの状態を管理するための React のカスタムフックです。  
バックエンドではチェックした要素の ID 一覧(sting[])かページを跨いだ一括全件チェックのフラグ(boolean)を受け取ることを想定します。

## Usage

```tsx
import React from 'react'
import { useBulkCheck } from '@smarthr/useBulkCheck'

export const Component = () => {
  const users = [
    {
      id: '1',
      name: 'user-1',
    },
    {
      id: '2',
      name: 'user-2',
    },
    {
      id: '3',
      name: 'user-3',
    },
  ]
  const {
    pageItems,
    hasCheckedItemInPage,
    isPageChecked,
    isAllChecked,
    toggleChecked,
    togglePageChecked,
    toggleAllChecked,
    resetChecked,
    checkedIds,
  } = useBulkCheck({ pageItems: users, defaultCheckedIds: ['1', '3'], defaultIsAllChecked: false })

  return (
    <div>
      <ul>
        {pageItems.map(({ item, checked }) => (
          <li key={item.id}>
            <input type="checkbox" checked={checked || isPageChecked || isAllChecked} onChange={() => toggleChecked(item.id)} />
            {item.name}
          </li>
        ))}
      </ul>

      <div>
        <p>
          <input type="checkbox" checked={isPageChecked} onChange={togglePageChecked} />
          ページ内全件チェック
        </p>
        <p>
          <input type="checkbox" checked={isAllChecked} onChange={toggleAllChecked} />
          ページを跨いで全件チェック
        </p>
        <button onClick={resetChecked}>全てのチェック状態を解除</button>
      </div>

      <div>
        <p>
          {hasCheckedItemInPage
            ? '表示しているページ内にチェックされたユーザーが一人以上います'
            : '表示しているページ内のユーザーにはチェックが一つもついていません'}
        </p>
        <p>
          {isPageChecked
            ? '表示しているページ内の全てのユーザーにチェックがついています'
            : '表示しているページ内にチェックがついていないユーザーが一人以上います'}
        </p>
        <p>{isAllChecked && 'ページを跨いで全てのユーザーにチェックがついています'}</p>
      </div>

      <div>
        <p>ページ関係なくチェックされている ID の一覧です。</p>
        <ul>
          {checkedIds.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```
