/**
 * @jest-environment jsdom
 */

import { type Locale, getLocale } from './getLocale'

describe('getLocale (ブラウザ環境)', () => {
  describe('必ずデフォルトの言語コードを返したい場合の引数を指定した場合', () => {
    it('日本語の言語コードを返すこと', () => {
      expect(
        getLocale({
          locale: 'en-US',
          locales: ['en-US', 'ja-JP'],
          shouldReturnDefaultLanguage: true,
        }),
      ).toBe('ja-JP')
    })
  })
  describe('指定された言語コードがnullの場合', () => {
    it('日本語の言語コードを返すこと', () => {
      expect(
        getLocale({
          locale: null,
          locales: ['en-US', 'ja-JP'],
        }),
      ).toBe('ja-JP')
    })
  })
  describe('指定された言語コードにアプリが対応している場合', () => {
    it('指定された言語コードを返すこと', () => {
      const locales: Locale[] = ['en-US', 'ja-JP']
      expect(
        getLocale({
          locale: 'en-US',
          locales,
        }),
      ).toBe('en-US')
    })
  })
  describe('cookieに言語コードが存在する場合', () => {
    it('cookieに保存されている言語コードを返すこと', () => {
      const locales: Locale[] = ['en-US', 'ja-JP', 'ko-KR']
      // cookieをモック
      document.cookie = 'selectedLocale=ko-KR; path=/; max-age=31536000' // 1年間有効
      expect(
        getLocale({
          locale: 'vi-VN',
          locales,
        }),
      ).toBe('ko-KR')
    })
  })
  describe('cookieに言語コードが存在し、keyを引数で指定した場合', () => {
    it('指定されたcookie名の言語コードを返すこと', () => {
      const locales: Locale[] = ['en-US', 'ja-JP', 'ko-KR']
      // cookieをモック
      document.cookie = 'customLocale=ko-KR; path=/; max-age=31536000' // 1年間有効
      expect(
        getLocale({
          locale: 'vi-VN',
          locales,
          cookieKey: 'customLocale',
        }),
      ).toBe('ko-KR')
    })
  })
  describe('指定された言語コードにアプリが対応していない場合', () => {
    it('ブラウザの言語設定を確認し、対応する言語コードを返すこと', () => {
      const locales: Locale[] = ['en-US', 'ja-JP']
      // ブラウザの言語設定をモック
      Object.defineProperty(navigator, 'languages', {
        value: ['zh-CN', 'en-US'],
        writable: false,
      })
      expect(
        getLocale({
          locale: 'zh-Hans-CN',
          locales,
        }),
      ).toBe('en-US')
    })
  })
  describe('ブラウザの言語設定に対応する言語コードがない場合', () => {
    it('デフォルトの言語コードを返すこと', () => {
      const locales: Locale[] = ['en-US', 'ja-JP', 'ko-KR']
      // ブラウザの言語設定をモック
      Object.defineProperty(navigator, 'languages', {
        value: ['fr-FR', 'es-ES'],
        writable: false,
      })
      expect(
        getLocale({
          locale: 'vi-VN',
          locales,
        }),
      ).toBe('ja-JP')
    })
  })
})
