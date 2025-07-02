/**
 * @jest-environment jsdom
 */
import { render, renderHook as renderHookOrigin } from '@testing-library/react'
import { IntlProvider, useTranslations } from 'use-intl'

import { useIntlImpl } from './useIntlImpl'

const jaMessages = {
  Home: {
    bar: 'テスト',
    foo: {
      baz: 'こんにちは {name}',
    },
  },
  Case: {
    important: 'これ<important>大事</important>',
    multiline: 'テスト1<br></br>テスト2<br></br>テスト3',
  },
} as const

type OwnMessages = typeof jaMessages
type UseIntlImpl = typeof useIntlImpl<OwnMessages>

describe('useIntlImpl', () => {
  /**
   * useIntlImplのテスト用にuse-intlベースのフックを定義
   */
  const useHook = () => useIntlImpl<OwnMessages>(useTranslations)

  describe('formatMessage', () => {
    const renderHook = (c: UseIntlImpl) =>
      renderHookOrigin(c, {
        wrapper({ children }) {
          return (
            <IntlProvider locale="ja" messages={jaMessages}>
              {children}
            </IntlProvider>
          )
        },
      })

    const write = (c: React.ReactNode) => {
      const r = render(c)
      return r.container.innerHTML
    }

    it('idに該当する言語リソースを取得できること', () => {
      const r = renderHook(useHook)
      expect(r.result.current.formatMessage('Home.bar')).toBe('テスト')
    })

    describe('optionsパラメータ', () => {
      describe('strict', () => {
        it('false指定でidの型制約を弱めて動的な値を指定できること', () => {
          const r = renderHook(useHook)
          // 確認用に意図的に型を曖昧にする
          const key: string = 'bar'
          expect(
            r.result.current.formatMessage(`Home.${key}`, {
              strict: false,
            }),
          ).toBe('テスト')
        })
      })

      describe('values', () => {
        it('フォーマットの指定を適用できること', () => {
          const r = renderHook(useHook)
          expect(
            write(
              r.result.current.formatMessage('Case.important', {
                values: {
                  important: (chunks) => <b>{chunks}</b>,
                },
              }),
            ),
          ).toBe('これ<b>大事</b>')
        })

        it('プレースホルダーを置き換えできること', () => {
          const r = renderHook(useHook)
          expect(
            r.result.current.formatMessage('Home.foo.baz', {
              values: {
                name: 'test',
              },
            }),
          ).toBe('こんにちは test')
        })
      })
    })

    /**
     * @see https://next-intl.dev/docs/usage/messages#rich-text-self-closing
     */
    describe('リソース中に<br></br>を含む場合', () => {
      it('<br>で改行されること', () => {
        const r = renderHook(useHook)
        expect(write(r.result.current.formatMessage('Case.multiline'))).toBe('テスト1<br>テスト2<br>テスト3')
      })
    })
  })
})
