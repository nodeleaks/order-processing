import { describe, it, expect, vi } from 'vitest'
import { retryWithBackoff } from '../../src/utils/retry.js'

describe('retryWithBackoff', () => {
  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const result = await retryWithBackoff(fn)
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries on failure and succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok')

    const result = await retryWithBackoff(fn, { baseDelayMs: 1 })
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('throws after max attempts', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'))

    await expect(
      retryWithBackoff(fn, { maxAttempts: 3, baseDelayMs: 1 })
    ).rejects.toThrow('always fails')

    expect(fn).toHaveBeenCalledTimes(3)
  })
})
