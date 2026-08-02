import { test, expect } from '../src/fixtures/test'

test.describe('Health', () => {
  test('GET /health returns ok status', async ({ ordersApi }) => {
    const { response, body } = await ordersApi.health()

    expect(response.status()).toBe(200)
    expect(body.status).toBe('ok')
    expect(body.ts).toBeDefined()
  })
})
