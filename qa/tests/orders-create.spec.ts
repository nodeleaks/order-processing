import { test, expect } from '../src/fixtures/test'
import { buildCreateOrderPayload, buildOrderItem, TEST_USER_ID } from '../src/utils/factories'
import { CreateOrderResponseSchema } from '../src/schemas/order.schema'

test.describe('POST /orders — create order', () => {
  test('creates an order and matches the response contract', async ({ ordersApi }) => {
    const { response, body } = await ordersApi.createOrder(buildCreateOrderPayload())

    expect(response.status()).toBe(201)

    const parsed = CreateOrderResponseSchema.safeParse(body)
    expect(parsed.success, JSON.stringify(parsed.error?.issues)).toBe(true)

    expect(body.data.userId).toBe(TEST_USER_ID)
    expect(body.data.status).toBe('pending')
  })

  test('computes totalAmount as sum of quantity * unitPrice across items', async ({ ordersApi }) => {
    const payload = buildCreateOrderPayload({
      items: [
        buildOrderItem({ productId: 'a', quantity: 2, unitPrice: 10 }), // 20
        buildOrderItem({ productId: 'b', quantity: 1, unitPrice: 15.5 }), // 15.5
      ],
    })

    const { body } = await ordersApi.createOrder(payload)

    expect(Number(body.data.totalAmount)).toBeCloseTo(35.5, 2)
  })

  test('defaults currency to USD when omitted', async ({ ordersApi }) => {
    const { userId, items } = buildCreateOrderPayload()
    const { body } = await ordersApi.createOrder({ userId, items })

    expect(body.data.currency).toBe('USD')
  })

  test('preserves a custom 3-letter currency', async ({ ordersApi }) => {
    const { body } = await ordersApi.createOrder(buildCreateOrderPayload({ currency: 'EUR' }))

    expect(body.data.currency).toBe('EUR')
  })
})
