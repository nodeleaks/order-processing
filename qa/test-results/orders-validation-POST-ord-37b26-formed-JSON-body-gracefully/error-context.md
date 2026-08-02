# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orders-validation.spec.ts >> POST /orders — input validation >> rejects malformed JSON body gracefully
- Location: tests/orders-validation.spec.ts:40:3

# Error details

```
TypeError: apiRequestContext.post: Invalid URL
```

# Test source

```ts
  1  | import { test, expect } from '../src/fixtures/test'
  2  | import { buildCreateOrderPayload, buildOrderItem } from '../src/utils/factories'
  3  | import type { CreateOrderInput } from '../src/api-clients/OrdersApiClient'
  4  | 
  5  | const invalidPayloads: { name: string; payload: CreateOrderInput }[] = [
  6  |   {
  7  |     name: 'missing userId',
  8  |     payload: buildCreateOrderPayload({ userId: '' as any }),
  9  |   },
  10 |   {
  11 |     name: 'empty items array',
  12 |     payload: buildCreateOrderPayload({ items: [] }),
  13 |   },
  14 |   {
  15 |     name: 'zero quantity',
  16 |     payload: buildCreateOrderPayload({ items: [buildOrderItem({ quantity: 0 })] }),
  17 |   },
  18 |   {
  19 |     name: 'negative quantity',
  20 |     payload: buildCreateOrderPayload({ items: [buildOrderItem({ quantity: -1 })] }),
  21 |   },
  22 |   {
  23 |     name: 'negative unitPrice',
  24 |     payload: buildCreateOrderPayload({ items: [buildOrderItem({ unitPrice: -10 })] }),
  25 |   },
  26 |   {
  27 |     name: 'missing productId',
  28 |     payload: buildCreateOrderPayload({ items: [buildOrderItem({ productId: '' })] }),
  29 |   },
  30 | ]
  31 | 
  32 | test.describe('POST /orders — input validation', () => {
  33 |   for (const { name, payload } of invalidPayloads) {
  34 |     test(`rejects payload with ${name}`, async ({ ordersApi }) => {
  35 |       const { response } = await ordersApi.createOrder(payload)
  36 |       expect(response.status()).toBe(400)
  37 |     })
  38 |   }
  39 | 
  40 |   test('rejects malformed JSON body gracefully', async ({ request }) => {
> 41 |     const response = await request.post('/orders', {
     |                                    ^ TypeError: apiRequestContext.post: Invalid URL
  42 |       headers: {
  43 |         Authorization: 'Bearer local-secret-key',
  44 |         'Idempotency-Key': crypto.randomUUID(),
  45 |         'Content-Type': 'application/json',
  46 |       },
  47 |       data: '{ this is not valid json',
  48 |     })
  49 | 
  50 |     expect([400, 500]).toContain(response.status())
  51 |   })
  52 | })
  53 | 
```