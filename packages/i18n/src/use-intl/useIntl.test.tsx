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

/**
 * declareでMessagesの型定義を行っても型制約を適用できることを確認する
 * @see https://next-intl.dev/docs/workflows/typescript
 */
declare module 'use-intl' {
  interface AppConfig {
    Messages: typeof jaMessages
  }
}

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
