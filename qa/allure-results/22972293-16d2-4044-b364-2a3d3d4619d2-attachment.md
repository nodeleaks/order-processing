# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orders-get.spec.ts >> GET /orders/:id >> returns the created order by id
- Location: tests/orders-get.spec.ts:6:3

# Error details

```
TypeError: Cannot read properties of undefined (reading 'id')
```

# Test source

```ts
  1  | import { test, expect } from '../src/fixtures/test'
  2  | import { buildCreateOrderPayload } from '../src/utils/factories'
  3  | import { OrderSchema } from '../src/schemas/order.schema'
  4  | 
  5  | test.describe('GET /orders/:id', () => {
  6  |   test('returns the created order by id', async ({ ordersApi }) => {
  7  |     const created = await ordersApi.createOrder(buildCreateOrderPayload())
> 8  |     const orderId = created.body.data.id
     |                                       ^ TypeError: Cannot read properties of undefined (reading 'id')
  9  | 
  10 |     const { response, body } = await ordersApi.getOrderById(orderId)
  11 | 
  12 |     expect(response.status()).toBe(200)
  13 |     expect(OrderSchema.safeParse(body.data).success).toBe(true)
  14 |     expect(body.data.id).toBe(orderId)
  15 |   })
  16 | 
  17 |   test('returns 404 for a well-formed but unknown uuid', async ({ ordersApi }) => {
  18 |     const { response, body } = await ordersApi.getOrderById(crypto.randomUUID())
  19 | 
  20 |     expect(response.status()).toBe(404)
  21 |     expect(body.error).toMatch(/not found/i)
  22 |   })
  23 | 
  24 |   test('returns 400/500 for a malformed id (not a uuid)', async ({ ordersApi }) => {
  25 |     const { response } = await ordersApi.getOrderById('not-a-uuid')
  26 | 
  27 |     expect(response.status()).toBeGreaterThanOrEqual(400)
  28 |   })
  29 | })
  30 | 
```