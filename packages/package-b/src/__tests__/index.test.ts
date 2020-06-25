import { fnB } from '../index'

describe('package-b', () => {
  it('should return B', () => {
    expect(fnB()).toBe('B')
  })
})
