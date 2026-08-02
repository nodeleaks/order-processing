import { test, expect } from '../src/fixtures/test'
import { buildCreateOrderPayload } from '../src/utils/factories'

test.describe('POST /orders — idempotency', () => {
  test('rejects requests without an Idempotency-Key header', async ({ ordersApi }) => {
    const { response, body } = await ordersApi.createOrder(buildCreateOrderPayload(), {
      idempotencyKey: null,
    })

    expect(response.status()).toBe(400)
    expect(body.error).toMatch(/idempotency-key/i)
  })

  test('replaying the same Idempotency-Key returns the original order, not a duplicate', async ({ ordersApi }) => {
    const idempotencyKey = crypto.randomUUID()
    const payload = buildCreateOrderPayload()

    const first = await ordersApi.createOrder(payload, { idempotencyKey })
    const second = await ordersApi.createOrder(payload, { idempotencyKey })

    expect(first.response.status()).toBe(201)
    // Replays are expected to short-circuit before creating a new row.
    expect(second.body.data.id ?? second.body.data.orderId).toBe(
      first.body.data.id ?? first.body.data.orderId
    )
  })

  test('two different Idempotency-Keys with identical payload create two distinct orders', async ({
    ordersApi,
  }) => {
    const payload = buildCreateOrderPayload()

    const first = await ordersApi.createOrder(payload)
    const second = await ordersApi.createOrder(payload)

    expect(first.body.data.id).not.toBe(second.body.data.id)
  })
})
