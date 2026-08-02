import { test, expect } from '../src/fixtures/test'
import { buildCreateOrderPayload } from '../src/utils/factories'
import { OrderSchema } from '../src/schemas/order.schema'

test.describe('GET /orders/:id', () => {
  test('returns the created order by id', async ({ ordersApi }) => {
    const created = await ordersApi.createOrder(buildCreateOrderPayload())
    const orderId = created.body.data.id

    const { response, body } = await ordersApi.getOrderById(orderId)

    expect(response.status()).toBe(200)
    expect(OrderSchema.safeParse(body.data).success).toBe(true)
    expect(body.data.id).toBe(orderId)
  })

  test('returns 404 for a well-formed but unknown uuid', async ({ ordersApi }) => {
    const { response, body } = await ordersApi.getOrderById(crypto.randomUUID())

    expect(response.status()).toBe(404)
    expect(body.error).toMatch(/not found/i)
  })

  test('returns 400/500 for a malformed id (not a uuid)', async ({ ordersApi }) => {
    const { response } = await ordersApi.getOrderById('not-a-uuid')

    expect(response.status()).toBeGreaterThanOrEqual(400)
  })
})
