/**
 * @jest-environment node
 */
import { getLocale } from './getLocale'

describe('getLocale (node環境)', () => {
  it('ブラウザ環境ではない場合、デフォルトの言語コードを返す', () => {
    const result = getLocale({
      currentLocale: 'en-US',
      supportedLocales: ['en-US', 'ja-JP'],
      shouldReturnDefaultLanguage: false,
    })
    expect(result).toBe('ja-JP')
  })
})
