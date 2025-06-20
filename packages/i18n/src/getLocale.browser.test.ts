/**
 * @jest-environment jsdom
 */

import { type Locale, getLocale } from './getLocale'

describe('getLocale (ブラウザ環境)', () => {
  describe('必ずデフォルトの言語コードを返したい場合の引数を指定した場合', () => {
    it('日本語の言語コードを返すこと', () => {
      expect(
        getLocale({
          locale: 'en-us',
          locales: ['en-us', 'ja'],
          shouldReturnDefaultLanguage: true,
        }),
      ).toBe('ja')
    })
  })
  describe('指定された言語コードがnullの場合', () => {
    it('日本語の言語コードを返すこと', () => {
      expect(
        getLocale({
          locale: null,
          locales: ['en-us', 'ja'],
        }),
      ).toBe('ja')
    })
  })
  describe('指定された言語コードにアプリが対応している場合', () => {
    it('指定された言語コードを返すこと', () => {
      const locales: Locale[] = ['en-us', 'ja']
      expect(
        getLocale({
          locale: 'en-us',
          locales,
        }),
      ).toBe('en-us')
    })
  })
  describe('cookieに言語コードが存在する場合', () => {
    it('cookieに保存されている言語コードを返すこと', () => {
      const locales: Locale[] = ['en-us', 'ja', 'ko']
      // cookieをモック
      document.cookie = 'selectedLocale=ko; path=/; max-age=31536000' // 1年間有効
      expect(
        getLocale({
          locale: 'vi',
          locales,
        }),
      ).toBe('ko')
    })
  })
  describe('cookieに言語コードが存在し、keyを引数で指定した場合', () => {
    it('指定されたcookie名の言語コードを返すこと', () => {
      const locales: Locale[] = ['en-us', 'ja', 'ko']
      // cookieをモック
      document.cookie = 'customLocale=ko; path=/; max-age=31536000' // 1年間有効
      expect(
        getLocale({
          locale: 'vi',
          locales,
          cookieKey: 'customLocale',
        }),
      ).toBe('ko')
    })
  })
  describe('指定された言語コードにアプリが対応していない場合', () => {
    it('ブラウザの言語設定を確認し、対応する言語コードを返すこと', () => {
      const locales: Locale[] = ['en-us', 'ja']
      // ブラウザの言語設定をモック
      Object.defineProperty(navigator, 'languages', {
        value: ['zh-CN', 'en-US'],
        writable: false,
      })
      expect(
        getLocale({
          locale: 'zh-cn',
          locales,
        }),
      ).toBe('en-us')
    })
  })
  describe('ブラウザの言語設定に対応する言語コードがない場合', () => {
    it('デフォルトの言語コードを返すこと', () => {
      const locales: Locale[] = ['en-us', 'ja', 'ko']
      // ブラウザの言語設定をモック
      Object.defineProperty(navigator, 'languages', {
        value: ['fr-FR', 'es-ES'],
        writable: false,
      })
      expect(
        getLocale({
          locale: 'vi',
          locales,
        }),
      ).toBe('ja')
    })
  })
})
