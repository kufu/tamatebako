const DEFAULT_LANGUAGE = 'ja'

export type Locale = 'ja' | 'en-us' | 'id-id' | 'pt' | 'vi' | 'ko' | 'zh-cn' | 'zh-tw'

/**
 * 対応する言語コードを判定して返します。
 *
 * 判定優先順位:
 * 1. shouldReturnDefaultLanguage が true の場合はデフォルト言語
 * 2. locale が locales に含まれていればそれを返す
 * 3. cookieKey で指定したcookieの値が locales に含まれていればそれを返す
 * 4. ブラウザの言語設定(navigator.languages)に対応するものがあればそれを返す
 * 5. どれにも該当しなければデフォルト言語
 *
 * @param params.locale - 明示的に指定された言語コード（nullの場合はスキップ）
 * @param params.locales - アプリが対応する言語コード配列
 * @param params.shouldReturnDefaultLanguage - 常にデフォルト言語を返す場合にtrue
 * @param params.cookieKey - 取得するcookieのキー（省略時は'selectedLocale'）
 * @returns 判定された言語コード
 */
export function getLocale(params: {
  locale: Locale | null
  locales: Locale[]
  shouldReturnDefaultLanguage?: boolean
  cookieKey?: string
}): Locale {
  const { locale, locales, shouldReturnDefaultLanguage = false, cookieKey = 'selectedLocale' } = params

  // サーバーサイドのエラー回避
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE

  // デフォルト言語を返すべき場合
  if (shouldReturnDefaultLanguage) return DEFAULT_LANGUAGE

  if (locale === null) return DEFAULT_LANGUAGE

  if (locales.includes(locale)) return locale

  // cookieから言語コードを取得
  const cookieLocale = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${cookieKey}=`))
    ?.split('=')[1] as Locale | undefined
  // cookieに言語コードが存在する場合、対応する言語コードを返す
  if (cookieLocale !== undefined && locales.includes(cookieLocale)) return cookieLocale

  // ブラウザの言語設定を取得し、最も優先度が高い有効な言語を返却する
  const browserLanguages = (navigator.languages && navigator.languages.length > 0)
    ? navigator.languages.map((lang) => lang.toLowerCase())
    : [navigator.language?.toLowerCase()].filter(Boolean)
  for (const lang of browserLanguages) {
    const convertedLang = convertLang(lang)
    if (locales.includes(convertedLang)) {
      return convertedLang
    }
  }

  return DEFAULT_LANGUAGE
}

const convertLang = (lang: string): Locale => {
  // jaから始まる場合はjaに変換
  if (lang.startsWith('ja')) return 'ja'

  // idから始まる場合はidに変換
  if (lang.startsWith('id')) return 'id-id'

  // enから始まる場合はen-usに変換
  if (lang.startsWith('en')) return 'en-us'

  // ptから始まる場合はptに変換
  if (lang.startsWith('pt')) return 'pt'

  // viから始まる場合はviに変換
  if (lang.startsWith('vi')) return 'vi'

  // koから始まる場合はkoに変換
  if (lang.startsWith('ko')) return 'ko'

  // zh-cn, zh-hansから始まる場合はzh-cnに変換
  if (lang.startsWith('zh-cn') || lang.startsWith('zh-hans')) return 'zh-cn'

  // zh-tw, zh-hant, zh-hkから始まる場合はzh-twに変換
  if (lang.startsWith('zh-tw') || lang.startsWith('zh-hant') || lang.startsWith('zh-hk')) return 'zh-tw'

  // 上記のチェックに当てはまらなかったzhから始まるものはzh-cnに変換
  if (lang.startsWith('zh')) return 'zh-cn'

  return DEFAULT_LANGUAGE
}
