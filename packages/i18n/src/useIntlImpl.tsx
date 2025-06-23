import { useCallback } from 'react'

import type { RichTranslationValues, useTranslations } from 'use-intl'

type UseTranslations = typeof useTranslations

/**
 * 与えられた辞書型(Dictionary)の全てのキーを「ドット区切りの文字列」として再帰的に抽出する型です。
 *
 * 例えば、以下のような辞書型があるとします:
 *
 * type Messages = {
 *   hello: string;
 *   user: {
 *     name: string;
 *     profile: {
 *       age: string;
 *     };
 *   };
 * }
 *
 * この場合、TargetKeys<Messages>は次のようなユニオン型になります:
 *
 * "hello" | "user.name" | "user.profile.age"
 *
 * - 文字列型(string)の値を持つキーはそのまま抽出されます。
 * - オブジェクト型の場合は、キーをドットで連結して再帰的に展開します。
 */
type TargetKeys<Dictionary> = {
  [Key in keyof Dictionary & string]: Dictionary[Key] extends string ? Key : `${Key}.${TargetKeys<Dictionary[Key]>}`
}[keyof Dictionary & string]

/**
 * 国際化（i18n）のメッセージフォーマッターを提供するカスタムフックです。
 *
 * @template Messages - 翻訳メッセージの型を表します。
 * @param useTranslations - 翻訳関数`t`を返すuse-intlまたはnext-intlのフックです。
 * @returns メッセージを整形する`formatMessage`関数を含むオブジェクトを返します。
 *
 * @example
 * const { formatMessage } = useIntlImpl<MyMessages>(useTranslations);
 * const message = formatMessage('greeting', { values: { name: 'Alice' } });
 */
export const useIntlImpl = <Messages,>(useTranslations: UseTranslations) => {
  const t = useTranslations()

  /**
   * 指定されたメッセージIDと任意の値を使って、メッセージを整形します。
   *
   * @param id - 整形するメッセージのキー。`strict`が`true`の場合はメッセージキーの厳密な型、そうでない場合は任意の文字列が許可されます。
   * @param options - オプションの設定オブジェクト。
   * @param options.strict - `true`の場合、メッセージキーの厳密な型チェックを行います。
   * @param options.values - メッセージ内で補間する値。use-intl / next-intlのrichメソッドのフォーマットに対応しています。
   * @returns 整形されたメッセージ。
   */
  const formatMessage = useCallback(
    <TargetKey extends TargetKeys<Messages> = never, Strict extends boolean | undefined = true>(
      id: [Strict] extends [true] ? TargetKey : string,
      options?: {
        strict?: Strict
        values?: RichTranslationValues
      },
    ) =>
      /**
       * strictがfalseの場合に任意の文字列を許容する必要があるため、idをanyとして扱う
       */
      t.rich(id as any, {
        ...options?.values,
        br: () => <br />,
      }),
    [t],
  )

  return {
    formatMessage,
  }
}
