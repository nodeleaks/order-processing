import { test, expect } from '../src/fixtures/test'
import { buildCreateOrderPayload, TEST_USER_ID } from '../src/utils/factories'
import { OrderListResponseSchema } from '../src/schemas/order.schema'

test.describe('GET /orders — list & filter', () => {
  test('requires a userId query param', async ({ ordersApi }) => {
    const { response, body } = await ordersApi.listOrders({})

    expect(response.status()).toBe(400)
    expect(body.error).toMatch(/userId/i)
  })

  test('returns only orders belonging to the requested userId', async ({ ordersApi }) => {
    await ordersApi.createOrder(buildCreateOrderPayload())

    const { response, body } = await ordersApi.listOrders({ userId: TEST_USER_ID })

    expect(response.status()).toBe(200)
    expect(OrderListResponseSchema.safeParse(body).success).toBe(true)
    expect(body.data.every((order: any) => order.userId === TEST_USER_ID)).toBe(true)
  })

  test('filters by status when provided', async ({ ordersApi }) => {
    await ordersApi.createOrder(buildCreateOrderPayload())

    const { response, body } = await ordersApi.listOrders({
      userId: TEST_USER_ID,
      status: 'pending',
    })

    expect(response.status()).toBe(200)
    expect(body.data.every((order: any) => order.status === 'pending')).toBe(true)
  })

  test('returns an empty array for a userId with no orders', async ({ ordersApi }) => {
    const { response, body } = await ordersApi.listOrders({ userId: crypto.randomUUID() })

    expect(response.status()).toBe(200)
    expect(body.data).toEqual([])
  })
})
