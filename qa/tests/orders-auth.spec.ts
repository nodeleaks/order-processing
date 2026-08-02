import { test, expect } from '../src/fixtures/test'
import { OrdersApiClient } from '../src/api-clients/OrdersApiClient'
import { buildCreateOrderPayload, TEST_USER_ID } from '../src/utils/factories'

test.describe('Bearer auth on /orders endpoints', () => {
  test('POST /orders without Authorization header returns 401', async ({ ordersApi }) => {
    const { response } = await ordersApi.createOrder(buildCreateOrderPayload(), { auth: false })
    expect(response.status()).toBe(401)
  })

  test('GET /orders/:id without Authorization header returns 401', async ({ ordersApi }) => {
    const { response } = await ordersApi.getOrderById(crypto.randomUUID(), { auth: false })
    expect(response.status()).toBe(401)
  })

  test('GET /orders without Authorization header returns 401', async ({ ordersApi }) => {
    const { response } = await ordersApi.listOrders({ userId: TEST_USER_ID }, { auth: false })
    expect(response.status()).toBe(401)
  })

  test('requests with a wrong bearer token are rejected', async ({ request }) => {
    const wrongKeyClient = new OrdersApiClient(request, 'definitely-not-the-key')

    const { response } = await wrongKeyClient.createOrder(buildCreateOrderPayload())
    expect(response.status()).toBe(401)
  })
})
