import { type Messages, useTranslations } from 'use-intl'

import { useIntlImpl } from './useIntlImpl'

/**
 * use-intlを利用して国際化（i18n）ユーティリティを提供するカスタムReactフックです。
 *
 * @template OwnMessages - 翻訳に使用するメッセージの型。デフォルトは `Messages` です。
 * @returns メッセージを整形する`formatMessage`関数を含むオブジェクトを返します。
 *
 * @example
 * const intl = useIntl<MyMessages>();
 * const greeting = intl.formatMessage({ id: 'greeting' });
 */
export const useIntl = <OwnMessages extends Messages = Messages>() => useIntlImpl<OwnMessages>(useTranslations)
