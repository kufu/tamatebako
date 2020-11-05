import { act, renderHook } from '@testing-library/react-hooks'

import { useBulkCheck } from '../'

describe('useBulkCheck', () => {
  const list = [{ id: 'item-1' }, { id: 'item-2' }, { id: 'item-3' }]

  describe('初期状態', () => {
    describe('初期状態がない場合', () => {
      it('デフォルトの初期状態になる', () => {
        const { result } = renderHook(() => useBulkCheck({ pageItems: list }))

        expect(result.current.pageItems).toEqual([
          { item: { id: 'item-1' }, checked: false },
          { item: { id: 'item-2' }, checked: false },
          { item: { id: 'item-3' }, checked: false },
        ])
        expect(result.current.hasCheckedItemInPage).toBeFalsy()
        expect(result.current.isPageChecked).toBeFalsy()
        expect(result.current.isAllChecked).toBeFalsy()
        expect(result.current.checkedIds).toEqual([])
      })
    })

    describe('defaultCheckedIds がある場合', () => {
      it('チェックした item の ID が反映される', () => {
        const { result } = renderHook(() =>
          useBulkCheck({ pageItems: list, defaultCheckedIds: ['item-1', 'item-3'] }),
        )

        expect(result.current.pageItems).toEqual([
          { item: { id: 'item-1' }, checked: true },
          { item: { id: 'item-2' }, checked: false },
          { item: { id: 'item-3' }, checked: true },
        ])
        expect(result.current.hasCheckedItemInPage).toBeTruthy()
        expect(result.current.isPageChecked).toBeFalsy()
        expect(result.current.isAllChecked).toBeFalsy()
        expect(result.current.checkedIds).toEqual(['item-1', 'item-3'])
      })
    })

    describe('defaultIsAllChecked がある場合', () => {
      it('全件チェックが反映される', () => {
        const { result } = renderHook(() =>
          useBulkCheck({ pageItems: list, defaultIsAllChecked: true }),
        )

        expect(result.current.pageItems).toEqual([
          { item: { id: 'item-1' }, checked: true },
          { item: { id: 'item-2' }, checked: true },
          { item: { id: 'item-3' }, checked: true },
        ])
        expect(result.current.hasCheckedItemInPage).toBeTruthy()
        expect(result.current.isPageChecked).toBeTruthy()
        expect(result.current.isAllChecked).toBeTruthy()
        expect(result.current.checkedIds).toEqual([])
      })
    })
  })

  describe('toggleChecked', () => {
    describe('チェック状態の item の ID を渡した場合', () => {
      it('該当 item のチェック状態と全件チェックフラグを解除する', () => {
        const { result } = renderHook(() =>
          useBulkCheck({
            pageItems: list,
            defaultCheckedIds: ['item-1', 'item-2'],
            defaultIsAllChecked: true,
          }),
        )

        act(() => {
          result.current.toggleChecked('item-2')
        })

        expect(result.current.pageItems).toEqual([
          { item: { id: 'item-1' }, checked: true },
          { item: { id: 'item-2' }, checked: false },
          { item: { id: 'item-3' }, checked: false },
        ])
        expect(result.current.hasCheckedItemInPage).toBeTruthy()
        expect(result.current.isPageChecked).toBeFalsy()
        expect(result.current.isAllChecked).toBeFalsy()
        expect(result.current.checkedIds).toEqual(['item-1'])
      })
    })

    describe('未チェック状態の item の ID を渡した場合', () => {
      it('該当 item をチェック状態にする', () => {
        const { result } = renderHook(() => useBulkCheck({ pageItems: list }))

        act(() => {
          result.current.toggleChecked('item-1')
        })

        expect(result.current.pageItems).toEqual([
          { item: { id: 'item-1' }, checked: true },
          { item: { id: 'item-2' }, checked: false },
          { item: { id: 'item-3' }, checked: false },
        ])
        expect(result.current.hasCheckedItemInPage).toBeTruthy()
        expect(result.current.isPageChecked).toBeFalsy()
        expect(result.current.isAllChecked).toBeFalsy()
        expect(result.current.checkedIds).toEqual(['item-1'])
      })
    })
  })

  describe('togglePageChecked', () => {
    describe('isAllChecked が true の場合', () => {
      it('isAllChecked が false になって checkedSet が初期化される', () => {
        const { result } = renderHook(() =>
          useBulkCheck({
            pageItems: list,
            defaultCheckedIds: ['item-1', 'item-2', 'item-5'],
            defaultIsAllChecked: true,
          }),
        )

        act(() => {
          result.current.togglePageChecked()
        })

        expect(result.current.pageItems).toEqual([
          { item: { id: 'item-1' }, checked: false },
          { item: { id: 'item-2' }, checked: false },
          { item: { id: 'item-3' }, checked: false },
        ])
        expect(result.current.hasCheckedItemInPage).toBeFalsy()
        expect(result.current.isPageChecked).toBeFalsy()
        expect(result.current.isAllChecked).toBeFalsy()
        expect(result.current.checkedIds).toEqual([])
      })
    })

    describe('isAllChecked が false の場合', () => {
      describe('isPageChecked が true の場合', () => {
        it('checkedSet 内にある ID のうち pageItems 内にあるものが削除される', () => {
          const { result } = renderHook(() =>
            useBulkCheck({
              pageItems: list,
              defaultCheckedIds: ['item-1', 'item-2', 'item-3', 'item-5'],
            }),
          )

          act(() => {
            result.current.togglePageChecked()
          })

          expect(result.current.pageItems).toEqual([
            { item: { id: 'item-1' }, checked: false },
            { item: { id: 'item-2' }, checked: false },
            { item: { id: 'item-3' }, checked: false },
          ])
          expect(result.current.hasCheckedItemInPage).toBeFalsy()
          expect(result.current.isPageChecked).toBeFalsy()
          expect(result.current.isAllChecked).toBeFalsy()
          expect(result.current.checkedIds).toEqual(['item-5'])
        })
      })

      describe('checkedItemsInCurrentPage の length が1以上の場合', () => {
        it('checkedSet 内にある ID のうち pageItems 内にあるものが削除される', () => {
          const { result } = renderHook(() =>
            useBulkCheck({ pageItems: list, defaultCheckedIds: ['item-1', 'item-5'] }),
          )

          act(() => {
            result.current.togglePageChecked()
          })

          expect(result.current.pageItems).toEqual([
            { item: { id: 'item-1' }, checked: false },
            { item: { id: 'item-2' }, checked: false },
            { item: { id: 'item-3' }, checked: false },
          ])
          expect(result.current.hasCheckedItemInPage).toBeFalsy()
          expect(result.current.isPageChecked).toBeFalsy()
          expect(result.current.isAllChecked).toBeFalsy()
          expect(result.current.checkedIds).toEqual(['item-5'])
        })
      })

      describe('isPageChecked が false かつ checkedItemsInCurrentPage の length が0の場合', () => {
        it('checkedSet に pageItems 内にある ID が全て追加される', () => {
          const { result } = renderHook(() =>
            useBulkCheck({ pageItems: list, defaultCheckedIds: ['item-5'] }),
          )

          act(() => {
            result.current.togglePageChecked()
          })

          expect(result.current.pageItems).toEqual([
            { item: { id: 'item-1' }, checked: true },
            { item: { id: 'item-2' }, checked: true },
            { item: { id: 'item-3' }, checked: true },
          ])
          expect(result.current.hasCheckedItemInPage).toBeTruthy()
          expect(result.current.isPageChecked).toBeTruthy()
          expect(result.current.isAllChecked).toBeFalsy()
          expect(result.current.checkedIds).toEqual(['item-5', 'item-1', 'item-2', 'item-3'])
        })
      })
    })
  })

  describe('toggleAllChecked', () => {
    describe('isAllChecked が true の場合', () => {
      it('isAllChecked が false になる', () => {
        const { result } = renderHook(() =>
          useBulkCheck({ pageItems: list, defaultIsAllChecked: true }),
        )

        act(() => {
          result.current.toggleAllChecked()
        })

        expect(result.current.isAllChecked).toBeFalsy()
      })
    })

    describe('isAllChecked が false の場合', () => {
      it('isAllChecked が true になる', () => {
        const { result } = renderHook(() => useBulkCheck({ pageItems: list }))

        act(() => {
          result.current.toggleAllChecked()
        })

        expect(result.current.isAllChecked).toBeTruthy()
      })
    })

    describe('選択状態の item がすでにある場合', () => {
      it('checkedIds には影響しない', () => {
        const { result } = renderHook(() =>
          useBulkCheck({ pageItems: list, defaultCheckedIds: ['item-1', 'item-3'] }),
        )

        act(() => {
          result.current.toggleAllChecked()
        })

        expect(result.current.pageItems).toEqual([
          { item: { id: 'item-1' }, checked: true },
          { item: { id: 'item-2' }, checked: true },
          { item: { id: 'item-3' }, checked: true },
        ])
        expect(result.current.hasCheckedItemInPage).toBeTruthy()
        expect(result.current.isPageChecked).toBeTruthy()
        expect(result.current.isAllChecked).toBeTruthy()
        expect(result.current.checkedIds).toEqual(['item-1', 'item-3'])

        act(() => {
          result.current.toggleAllChecked()
        })

        expect(result.current.pageItems).toEqual([
          { item: { id: 'item-1' }, checked: true },
          { item: { id: 'item-2' }, checked: false },
          { item: { id: 'item-3' }, checked: true },
        ])
        expect(result.current.hasCheckedItemInPage).toBeTruthy()
        expect(result.current.isPageChecked).toBeFalsy()
        expect(result.current.isAllChecked).toBeFalsy()
        expect(result.current.checkedIds).toEqual(['item-1', 'item-3'])
      })
    })
  })

  describe('resetChecked', () => {
    it('isAllChecked が false になって checkedSet が初期化される', () => {
      const { result } = renderHook(() =>
        useBulkCheck({
          pageItems: list,
          defaultCheckedIds: ['item-1', 'item-2'],
          defaultIsAllChecked: true,
        }),
      )

      act(() => {
        result.current.resetChecked()
      })

      expect(result.current.pageItems).toEqual([
        { item: { id: 'item-1' }, checked: false },
        { item: { id: 'item-2' }, checked: false },
        { item: { id: 'item-3' }, checked: false },
      ])
      expect(result.current.hasCheckedItemInPage).toBeFalsy()
      expect(result.current.isPageChecked).toBeFalsy()
      expect(result.current.isAllChecked).toBeFalsy()
      expect(result.current.checkedIds).toEqual([])
    })
  })
})
