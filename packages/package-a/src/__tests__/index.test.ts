import { fnA, fnAB } from '../index'

describe('package-a', () => {
  describe('fnA', () => {
    it('should return A', () => {
      expect(fnA()).toBe('A')
    })
  })
  describe('fnAB', () => {
    it('should return AB', () => {
      expect(fnAB()).toBe('AB')
    })
  })
})
