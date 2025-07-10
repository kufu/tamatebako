/**
 * @jest-environment jsdom
 */

import { type Locale, getLocale } from './getLocale'

describe('getLocale (ブラウザ環境)', () => {
  // 共通のlocales配列を使用することを提案
  const supportedLocales: Locale[] = ['en-US', 'ja-JP', 'ko-KR']
  // 元のnavigator.languagesを保存
  const originalLanguages = navigator.languages

  afterEach(() => {
    // 各テスト後にnavigator.languagesを元に戻す
    Object.defineProperty(navigator, 'languages', {
      value: originalLanguages,
      writable: true,
      configurable: true,
    })

    // 全てのcookieをクリア
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim()
      if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    })
  })

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
  describe('cookieに言語コードが存在する場合', () => {
    it('cookieに保存されている言語コードを返すこと', () => {
      // cookieをモック
      document.cookie = 'selectedLocale=ko-KR; path=/; max-age=31536000' // 1年間有効
      expect(
        getLocale({
          currentLocale: 'vi-VN',
          supportedLocales,
        }),
      ).toBe('ko-KR')
    })
  })
  describe('cookieに言語コードが存在し、cookieKey を引数で指定した場合', () => {
    it('指定されたcookie名の言語コードを返すこと', () => {
      // cookieをモック
      document.cookie = 'customLocale=ko-KR; path=/; max-age=31536000' // 1年間有効
      expect(
        getLocale({
          currentLocale: 'vi-VN',
          supportedLocales,
          cookieKey: 'customLocale',
        }),
      ).toBe('ko-KR')
    })
  })
  describe('locale で指定された言語コードにアプリが対応していない場合', () => {
    it('ブラウザの言語設定を確認し、対応する言語コードを返すこと', () => {
      // ブラウザの言語設定をモック
      Object.defineProperty(navigator, 'languages', {
        value: ['zh-CN', 'en-US'],
        writable: true,
        configurable: true,
      })
      expect(
        getLocale({
          currentLocale: 'zh-Hans-CN',
          supportedLocales,
        }),
      ).toBe('en-US')
    })
  })
  describe('ブラウザの言語設定に対応する言語コードが locales に含まれない場合', () => {
    it('デフォルトの言語コード（ja-JP）を返すこと', () => {
      // ブラウザの言語設定をモック
      Object.defineProperty(navigator, 'languages', {
        value: ['fr-FR', 'es-ES'],
        writable: true,
        configurable: true,
      })
      expect(
        getLocale({
          currentLocale: 'vi-VN',
          supportedLocales,
        }),
      ).toBe('ja-JP')
    })
  })
})
