# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orders-idempotency.spec.ts >> POST /orders — idempotency >> replaying the same Idempotency-Key returns the original order, not a duplicate
- Location: tests/orders-idempotency.spec.ts:14:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 500
```

# Test source

```ts
  1  | import { test, expect } from '../src/fixtures/test'
  2  | import { buildCreateOrderPayload } from '../src/utils/factories'
  3  | 
  4  | test.describe('POST /orders — idempotency', () => {
  5  |   test('rejects requests without an Idempotency-Key header', async ({ ordersApi }) => {
  6  |     const { response, body } = await ordersApi.createOrder(buildCreateOrderPayload(), {
  7  |       idempotencyKey: null,
  8  |     })
  9  | 
  10 |     expect(response.status()).toBe(400)
  11 |     expect(body.error).toMatch(/idempotency-key/i)
  12 |   })
  13 | 
  14 |   test('replaying the same Idempotency-Key returns the original order, not a duplicate', async ({ ordersApi }) => {
  15 |     const idempotencyKey = crypto.randomUUID()
  16 |     const payload = buildCreateOrderPayload()
  17 | 
  18 |     const first = await ordersApi.createOrder(payload, { idempotencyKey })
  19 |     const second = await ordersApi.createOrder(payload, { idempotencyKey })
  20 | 
> 21 |     expect(first.response.status()).toBe(201)
     |                                     ^ Error: expect(received).toBe(expected) // Object.is equality
  22 |     // Replays are expected to short-circuit before creating a new row.
  23 |     expect(second.body.data.id ?? second.body.data.orderId).toBe(
  24 |       first.body.data.id ?? first.body.data.orderId
  25 |     )
  26 |   })
  27 | 
  28 |   test('two different Idempotency-Keys with identical payload create two distinct orders', async ({
  29 |     ordersApi,
  30 |   }) => {
  31 |     const payload = buildCreateOrderPayload()
  32 | 
  33 |     const first = await ordersApi.createOrder(payload)
  34 |     const second = await ordersApi.createOrder(payload)
  35 | 
  36 |     expect(first.body.data.id).not.toBe(second.body.data.id)
  37 |   })
  38 | })
  39 | 
```