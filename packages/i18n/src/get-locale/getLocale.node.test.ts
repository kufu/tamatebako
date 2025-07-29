/**
 * @jest-environment node
 */
import { type Locale, getLocale } from './getLocale'

describe('getLocale (node環境)', () => {
  // 共通のlocales配列を使用することを提案
  const supportedLocales: Locale[] = ['en-US', 'ja-JP', 'ko-KR']

  describe('shouldReturnDefaultLanguage が true の場合', () => {
    it('デフォルトの言語コード（ja-JP）を返すこと', () => {
      expect(
        getLocale({
          currentLocale: 'en-US',
          supportedLocales,
          shouldReturnDefaultLanguage: true,
        }),
      ).toBe('ja-JP')
    })
  })
  describe('locale が null の場合', () => {
    it('デフォルトの言語コード（ja-JP）を返すこと', () => {
      expect(
        getLocale({
          currentLocale: null,
          supportedLocales,
        }),
      ).toBe('ja-JP')
    })
  })
  describe('locale で指定された言語コードにアプリが対応している場合', () => {
    it('指定された言語コードを返すこと', () => {
      expect(
        getLocale({
          currentLocale: 'en-US',
          supportedLocales,
        }),
      ).toBe('en-US')
    })
  })
  describe('ブラウザ環境ではなく locale で指定された言語コードにアプリが対応していない場合', () => {
    it('デフォルトの言語コード（ja-JP）を返すこと', () => {
      const result = getLocale({
        currentLocale: 'vi-VN',
        supportedLocales,
        shouldReturnDefaultLanguage: false,
      })
      expect(result).toBe('ja-JP')
    })
  })
})
