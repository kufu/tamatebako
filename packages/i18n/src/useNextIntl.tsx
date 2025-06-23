import { useTranslations } from 'next-intl'

import { useIntlImpl } from './useIntlImpl'

export const useNextIntl = () => useIntlImpl(useTranslations)
