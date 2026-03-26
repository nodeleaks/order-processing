interface RetryOptions {
  maxAttempts?: number
  baseDelayMs?: number
  maxDelayMs?: number
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 200, maxDelayMs = 5000 } = options

  const execute = async (attempt: number): Promise<T> => {
    try {
      return await fn()
    } catch (err) {
      if (attempt >= maxAttempts) throw err

      // Exponential backoff + jitter to avoid thundering herd
      const exponential = baseDelayMs * 2 ** attempt
      const jitter = Math.random() * 100
      const delay = Math.min(exponential + jitter, maxDelayMs)

      console.warn(`Attempt ${attempt} failed, retrying in ${Math.round(delay)}ms...`)
      await new Promise((r) => setTimeout(r, delay))

      return execute(attempt + 1)
    }
  }

  return execute(1)
}
