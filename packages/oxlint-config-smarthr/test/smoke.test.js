import { expect, test } from 'vitest'
import config from '../index.js'

test('config をインポートしてオブジェクトとして評価できる', () => {
  expect(config).toBeDefined()
  expect(typeof config).toBe('object')
  expect(config.rules).toBeDefined()
  expect(config.plugins).toBeDefined()
  expect(config.overrides).toBeDefined()
})
