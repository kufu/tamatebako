/**
 * @jest-environment node
 */
import { getLocale } from './getLocale'

describe('getLocale (node環境)', () => {
  it('ブラウザ環境ではない場合、デフォルトの言語コードを返す', () => {
    const result = getLocale({
      locale: 'en-US',
      locales: ['en-US', 'ja-JP'],
      shouldReturnDefaultLanguage: true,
    })
    expect(result).toBe('ja-JP')
  })
})
