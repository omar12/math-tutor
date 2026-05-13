import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'

beforeEach(async () => {
  await db.appConfig.clear()
})

describe('AppConfig persistence', () => {
  it('writes and reads back a key-value record', async () => {
    await db.appConfig.put({ key: 'onboardingComplete', value: 'false' })
    const result = await db.appConfig.get('onboardingComplete')
    expect(result?.value).toBe('false')
  })

  it('overwrites existing key with put()', async () => {
    await db.appConfig.put({ key: 'pinHash', value: 'abc' })
    await db.appConfig.put({ key: 'pinHash', value: 'xyz' })
    const result = await db.appConfig.get('pinHash')
    expect(result?.value).toBe('xyz')
  })
})
