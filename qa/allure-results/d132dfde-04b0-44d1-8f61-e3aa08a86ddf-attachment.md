# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orders-list.spec.ts >> GET /orders — list & filter >> filters by status when provided
- Location: tests/orders-list.spec.ts:23:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 500
```

# Test source

```ts
  1  | import { test, expect } from '../src/fixtures/test'
  2  | import { buildCreateOrderPayload, TEST_USER_ID } from '../src/utils/factories'
  3  | import { OrderListResponseSchema } from '../src/schemas/order.schema'
  4  | 
  5  | test.describe('GET /orders — list & filter', () => {
  6  |   test('requires a userId query param', async ({ ordersApi }) => {
  7  |     const { response, body } = await ordersApi.listOrders({})
  8  | 
  9  |     expect(response.status()).toBe(400)
  10 |     expect(body.error).toMatch(/userId/i)
  11 |   })
  12 | 
  13 |   test('returns only orders belonging to the requested userId', async ({ ordersApi }) => {
  14 |     await ordersApi.createOrder(buildCreateOrderPayload())
  15 | 
  16 |     const { response, body } = await ordersApi.listOrders({ userId: TEST_USER_ID })
  17 | 
  18 |     expect(response.status()).toBe(200)
  19 |     expect(OrderListResponseSchema.safeParse(body).success).toBe(true)
  20 |     expect(body.data.every((order: any) => order.userId === TEST_USER_ID)).toBe(true)
  21 |   })
  22 | 
  23 |   test('filters by status when provided', async ({ ordersApi }) => {
  24 |     await ordersApi.createOrder(buildCreateOrderPayload())
  25 | 
  26 |     const { response, body } = await ordersApi.listOrders({
  27 |       userId: TEST_USER_ID,
  28 |       status: 'pending',
  29 |     })
  30 | 
> 31 |     expect(response.status()).toBe(200)
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  32 |     expect(body.data.every((order: any) => order.status === 'pending')).toBe(true)
  33 |   })
  34 | 
  35 |   test('returns an empty array for a userId with no orders', async ({ ordersApi }) => {
  36 |     const { response, body } = await ordersApi.listOrders({ userId: crypto.randomUUID() })
  37 | 
  38 |     expect(response.status()).toBe(200)
  39 |     expect(body.data).toEqual([])
  40 |   })
  41 | })
  42 | 
```