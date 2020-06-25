import { fnB } from '@smarthr/package-b'

export const fnA = () => 'A'
export const fnAB = () => fnA() + fnB()
