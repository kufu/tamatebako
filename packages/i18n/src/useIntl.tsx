import { useCallback } from 'react'
import { type Messages, type RichTranslationValues, useTranslations } from 'use-intl'

/**
 * 翻訳リソースの階層を辿ってドット区切りのキー文字列を再帰的に抽出する型
 */
type TargetKeys<Dictionary> = {
  [Key in keyof Dictionary & string]: Dictionary[Key] extends string ? Key : `${Key}.${TargetKeys<Dictionary[Key]>}`
}[keyof Dictionary & string]

export const useIntl = () => {
  const t = useTranslations()

  const formatMessage = useCallback(
    <TargetKey extends TargetKeys<Messages> = never, Strict extends boolean | undefined = true>(
      id: [Strict] extends [true] ? TargetKey : string,
      options?: {
        strict?: Strict
        values?: RichTranslationValues
      },
    ) =>
      /**
       * strictオプションで型を意図的に弱めるケースに対応するために局所的にanyで扱う
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
