import { useTranslations } from 'use-intl'

import { useIntlImpl } from './useIntlImpl'

export const useIntl = () => useIntlImpl(useTranslations)
