/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { useNextIntl } from './useNextIntl'

const jaMessages = {
  Home: {
    bar: 'テスト',
  },
} as const

/**
 * declareでMessagesの型定義を行っても型制約を適用できることを確認する
 * @see https://next-intl.dev/docs/workflows/typescript
 */
declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof jaMessages
  }
}

describe('useNextIntl', () => {
  it('next-intlのNextIntlClientProviderで動作すること', () => {
    const r = renderHook(useNextIntl, {
      wrapper({ children }) {
        return (
          <NextIntlClientProvider locale="ja" messages={jaMessages}>
            {children}
          </NextIntlClientProvider>
        )
      },
    })

    expect(r.result.current.formatMessage('Home.bar')).toBe('テスト')
  })
})
