import { useCallback } from 'react'

export const useIntl = () => {
  const formatMessage = useCallback(() => {
    throw new Error('Not implemented')
  }, [])

  return {
    formatMessage,
  }
}
