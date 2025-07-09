const DEFAULT_LANGUAGE = 'ja-JP'

/**
 * サポートされているロケール一覧：
 * 
 * ja-JP: 日本語
 * en-US: 英語
 * ko-KR: 韓国語
 * zh-Hant-TW: 繁体中文
 * zh-Hans-CN: 簡体中文
 * vi-VN: ベトナム語
 * pt-BR: ポルトガル語
 * ja-JP-x-easy: やさしい日本語
 * id-ID: インドネシア語
 */
export type Locale = 'ja-JP' | 'en-US' | 'ko-KR' | 'zh-Hant-TW' | 'zh-Hans-CN' | 'vi-VN' | 'pt-BR' | 'ja-JP-x-easy' | 'id-ID'

/**
 * 対応する言語コードを判定して返します。
 *
 * 判定優先順位:
 * 1. shouldReturnDefaultLanguage が true の場合はデフォルト言語
 * 2. currentLocale が supportedLocales に含まれていればそれを返す
 * 3. cookieKey で指定したcookieの値が supportedLocales に含まれていればそれを返す
 * 4. ブラウザの言語設定(navigator.languages)に対応するものがあればそれを返す
 * 5. どれにも該当しなければデフォルト言語
 *
 * @param params.currentLocale - 現在の言語コード（DBの値や固定値など、nullの場合はスキップ）
 * @param params.supportedLocales - アプリが対応する言語コード配列
 * @param params.shouldReturnDefaultLanguage - 常にデフォルト言語を返す場合にtrue
 * @param params.cookieKey - 取得するcookieのキー（省略時は'selectedLocale'）
 * @returns 判定された言語コード
 */
export function getLocale(params: {
  currentLocale: Locale | null
  supportedLocales: Locale[]
  shouldReturnDefaultLanguage?: boolean
  cookieKey?: string
}): Locale {
  const { currentLocale, supportedLocales, shouldReturnDefaultLanguage = false, cookieKey = 'selectedLocale' } = params

  // サーバーサイドのエラー回避
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE

  // デフォルト言語を返すべき場合
  if (shouldReturnDefaultLanguage) return DEFAULT_LANGUAGE

  if (currentLocale === null) return DEFAULT_LANGUAGE

  if (supportedLocales.includes(currentLocale)) return currentLocale

  // cookieから言語コードを取得
  const cookieLocale = getCookieLocale(cookieKey)
  // cookieに言語コードが存在する場合、対応する言語コードを返す
  if (cookieLocale && supportedLocales.includes(cookieLocale)) return cookieLocale

  // ブラウザの言語設定を取得
  // navigator.languages: ユーザーがブラウザに設定している優先言語リスト。最初の要素が最も優先度が高い
  // 例: ['ja-JP', 'en-US', 'en'] -> 日本語を優先し、次に英語（米国）、最後に英語全般
  // navigator.languages が存在しないブラウザの場合は navigator.language（単一の設定）を使用
  const getBrowserLanguages = () => {
    if (navigator.languages && navigator.languages.length > 0) {
      return navigator.languages
    }
    return navigator.language ? [navigator.language] : []
  }
  const browserLanguages = getBrowserLanguages().map((lang) => lang.toLowerCase())

  // 取得したブラウザの言語設定から、最も優先度が高い有効な言語を返却する
  for (const lang of browserLanguages) {
    const convertedLang = convertLang(lang)
    if (supportedLocales.includes(convertedLang)) {
      return convertedLang
    }
  }

  return DEFAULT_LANGUAGE
}

const convertLang = (lang: string): Locale => {
  // jaから始まる場合はjaに変換
  if (lang.startsWith('ja')) return 'ja-JP'

  // idから始まる場合はidに変換
  if (lang.startsWith('id')) return 'id-ID'

  // enから始まる場合はen-usに変換
  if (lang.startsWith('en')) return 'en-US'

  // ptから始まる場合はptに変換
  if (lang.startsWith('pt')) return 'pt-BR'

  // viから始まる場合はviに変換
  if (lang.startsWith('vi')) return 'vi-VN'

  // koから始まる場合はkoに変換
  if (lang.startsWith('ko')) return 'ko-KR'

  // zh-cn, zh-hansから始まる場合はzh-cnに変換
  if (lang.startsWith('zh-cn') || lang.startsWith('zh-hans')) return 'zh-Hans-CN'

  // zh-tw, zh-hant, zh-hkから始まる場合はzh-twに変換
  if (lang.startsWith('zh-tw') || lang.startsWith('zh-hant') || lang.startsWith('zh-hk')) return 'zh-Hant-TW'

  // 上記のチェックに当てはまらなかったzhから始まるものはzh-cnに変換
  if (lang.startsWith('zh')) return 'zh-Hans-CN'

  return DEFAULT_LANGUAGE
}

/**
 * cookieから指定されたキーの値を取得し、有効なロケールの場合のみ返す
 */
const getCookieLocale = (cookieKey: string): Locale | null => {
  // サーバーサイドではcookieが利用できないためnullを返す
  if (typeof document === 'undefined') return null

  // cookieの値を取得
  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${cookieKey}=`))
    ?.split('=')[1]

  // cookieの値が存在しない場合はnullを返す
  if (!cookieValue) return null

  // 有効なロケールの場合のみ返す
  return validateLocale(cookieValue) ? cookieValue : null
}

const validateLocale = (locale: string): locale is Locale => {
  const validLocales: Locale[] = [
    'ja-JP',
    'en-US',
    'ko-KR',
    'zh-Hant-TW',
    'zh-Hans-CN',
    'vi-VN',
    'pt-BR',
    'ja-JP-x-easy',
    'id-ID',
  ]
  return validLocales.some((validLocale) => validLocale === locale)
}
