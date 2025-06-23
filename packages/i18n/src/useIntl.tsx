import { type Messages, useTranslations } from 'use-intl'

import { useIntlImpl } from './useIntlImpl'

export const useIntl = <OwnMessages extends Messages = Messages>() => useIntlImpl<OwnMessages>(useTranslations)
