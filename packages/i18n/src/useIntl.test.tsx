/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react'
import { IntlProvider } from 'use-intl'

import { useIntl } from './useIntl'

const jaMessages = {
  Home: {
    bar: 'テスト',
  },
} as const

describe('useIntl', () => {
  it('use-intlのIntlProviderで動作すること', () => {
    const r = renderHook(useIntl, {
      wrapper({ children }) {
        return (
          <IntlProvider locale="ja" messages={jaMessages}>
            {children}
          </IntlProvider>
        )
      },
    })

    expect(r.result.current.formatMessage('Home.bar')).toBe('テスト')
  })
})
