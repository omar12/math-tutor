import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from './db'
import { recordSessionAndUpdateProgress } from '../screens/PracticeScreen'

beforeEach(async () => {
  await db.appConfig.clear()
  await db.sessions.clear()
  await db.topicProgress.clear()
})

describe('TopicProgress aggregate upsert', () => {
  it('accuracy = sum(correctCount) / sum(totalCount) across two sessions for same topic', async () => {
    await recordSessionAndUpdateProgress('addition-grade1-01', 'addition', 1, 3, 5)
    await recordSessionAndUpdateProgress('addition-grade1-02', 'addition', 1, 4, 5)

    const progress = await db.topicProgress.get('addition')
    expect(progress).toBeDefined()
    expect(progress!.accuracy).toBeCloseTo(0.7, 5)  // 7/10 = 0.7
    expect(progress!.attemptCount).toBe(2)
  })

  it('put() is an upsert — calling it twice for same topic does not throw', async () => {
    await expect(
      recordSessionAndUpdateProgress('addition-grade1-01', 'addition', 1, 5, 5)
    ).resolves.not.toThrow()
    await expect(
      recordSessionAndUpdateProgress('addition-grade1-02', 'addition', 1, 5, 5)
    ).resolves.not.toThrow()

    const progress = await db.topicProgress.get('addition')
    expect(progress!.attemptCount).toBe(2)
  })

  it('totalCount === 0 guard: no session written when totalCount is 0', async () => {
    await recordSessionAndUpdateProgress('addition-grade1-01', 'addition', 1, 0, 0)
    const sessions = await db.sessions.toArray()
    expect(sessions).toHaveLength(0)
  })

  it('transaction atomicity: if topicProgress.put throws, session.add is rolled back', async () => {
    // Spy on topicProgress.put to throw after session add succeeds
    const putSpy = vi.spyOn(db.topicProgress, 'put').mockRejectedValueOnce(new Error('forced put failure'))

    await expect(
      recordSessionAndUpdateProgress('addition-grade1-01', 'addition', 1, 5, 5)
    ).rejects.toThrow()

    // Both writes should have rolled back
    const sessions = await db.sessions.toArray()
    expect(sessions).toHaveLength(0)

    putSpy.mockRestore()
  })
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
