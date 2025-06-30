/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react'

import { useIntl } from './useIntl'

describe('useIntl', () => {
  describe('formatMessage', () => {
    it('未実装なのでエラーになること', () => {
      const r = renderHook(useIntl)
      expect(() => r.result.current.formatMessage()).toThrow(/Not implemented/)
    })
  })
})
