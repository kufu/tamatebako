import { type Messages, useTranslations } from 'next-intl'

import { useIntlImpl } from './useIntlImpl'

export const useNextIntl = <OwnMessages extends Messages = Messages>() => useIntlImpl<OwnMessages>(useTranslations)
