import { type Messages, useTranslations } from 'next-intl'

import { useIntlImpl } from './useIntlImpl'

/**
 * next-intlを利用して国際化（i18n）ユーティリティを提供するカスタムReactフックです。
 *
 * このフックはClient Componentsでのみ動作します。
 * React Server ComponentsはアプリケーションコードでuseIntlImplを利用して専用のフックを実装してください。
 *
 * @template OwnMessages - 翻訳に使用するメッセージの型。デフォルトは `Messages` です。
 * @returns メッセージを整形する`formatMessage`関数を含むオブジェクトを返します。
 *
 * @example
 * const intl = useNextIntl<MyMessages>();
 * const greeting = intl.formatMessage({ id: 'greeting' });
 */
export const useNextIntl = <OwnMessages extends Messages = Messages>() => useIntlImpl<OwnMessages>(useTranslations)
