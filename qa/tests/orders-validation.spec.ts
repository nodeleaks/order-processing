import { test, expect } from '../src/fixtures/test'
import { buildCreateOrderPayload, buildOrderItem } from '../src/utils/factories'
import type { CreateOrderInput } from '../src/api-clients/OrdersApiClient'

const invalidPayloads: { name: string; payload: CreateOrderInput }[] = [
  {
    name: 'missing userId',
    payload: buildCreateOrderPayload({ userId: '' as any }),
  },
  {
    name: 'empty items array',
    payload: buildCreateOrderPayload({ items: [] }),
  },
  {
    name: 'zero quantity',
    payload: buildCreateOrderPayload({ items: [buildOrderItem({ quantity: 0 })] }),
  },
  {
    name: 'negative quantity',
    payload: buildCreateOrderPayload({ items: [buildOrderItem({ quantity: -1 })] }),
  },
  {
    name: 'negative unitPrice',
    payload: buildCreateOrderPayload({ items: [buildOrderItem({ unitPrice: -10 })] }),
  },
  {
    name: 'missing productId',
    payload: buildCreateOrderPayload({ items: [buildOrderItem({ productId: '' })] }),
  },
]

test.describe('POST /orders — input validation', () => {
  for (const { name, payload } of invalidPayloads) {
    test(`rejects payload with ${name}`, async ({ ordersApi }) => {
      const { response } = await ordersApi.createOrder(payload)
      expect(response.status()).toBe(400)
    })
  }

  test('rejects malformed JSON body gracefully', async ({ request }) => {
    const response = await request.post('/orders', {
      headers: {
        Authorization: 'Bearer local-secret-key',
        'Idempotency-Key': crypto.randomUUID(),
        'Content-Type': 'application/json',
      },
      data: '{ this is not valid json',
    })

    expect([400, 500]).toContain(response.status())
  })
})
