# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orders-create.spec.ts >> POST /orders — create order >> preserves a custom 3-letter currency
- Location: tests/orders-create.spec.ts:38:3

# Error details

```
TypeError: Cannot read properties of undefined (reading 'currency')
```

# Test source

```ts
  1  | import { test, expect } from '../src/fixtures/test'
  2  | import { buildCreateOrderPayload, buildOrderItem, TEST_USER_ID } from '../src/utils/factories'
  3  | import { CreateOrderResponseSchema } from '../src/schemas/order.schema'
  4  | 
  5  | test.describe('POST /orders — create order', () => {
  6  |   test('creates an order and matches the response contract', async ({ ordersApi }) => {
  7  |     const { response, body } = await ordersApi.createOrder(buildCreateOrderPayload())
  8  | 
  9  |     expect(response.status()).toBe(201)
  10 | 
  11 |     const parsed = CreateOrderResponseSchema.safeParse(body)
  12 |     expect(parsed.success, JSON.stringify(parsed.error?.issues)).toBe(true)
  13 | 
  14 |     expect(body.data.userId).toBe(TEST_USER_ID)
  15 |     expect(body.data.status).toBe('pending')
  16 |   })
  17 | 
  18 |   test('computes totalAmount as sum of quantity * unitPrice across items', async ({ ordersApi }) => {
  19 |     const payload = buildCreateOrderPayload({
  20 |       items: [
  21 |         buildOrderItem({ productId: 'a', quantity: 2, unitPrice: 10 }), // 20
  22 |         buildOrderItem({ productId: 'b', quantity: 1, unitPrice: 15.5 }), // 15.5
  23 |       ],
  24 |     })
  25 | 
  26 |     const { body } = await ordersApi.createOrder(payload)
  27 | 
  28 |     expect(Number(body.data.totalAmount)).toBeCloseTo(35.5, 2)
  29 |   })
  30 | 
  31 |   test('defaults currency to USD when omitted', async ({ ordersApi }) => {
  32 |     const { userId, items } = buildCreateOrderPayload()
  33 |     const { body } = await ordersApi.createOrder({ userId, items })
  34 | 
  35 |     expect(body.data.currency).toBe('USD')
  36 |   })
  37 | 
  38 |   test('preserves a custom 3-letter currency', async ({ ordersApi }) => {
  39 |     const { body } = await ordersApi.createOrder(buildCreateOrderPayload({ currency: 'EUR' }))
  40 | 
> 41 |     expect(body.data.currency).toBe('EUR')
     |                      ^ TypeError: Cannot read properties of undefined (reading 'currency')
  42 |   })
  43 | })
  44 | 
```