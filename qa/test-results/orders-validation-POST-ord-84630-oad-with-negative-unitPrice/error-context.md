# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orders-validation.spec.ts >> POST /orders — input validation >> rejects payload with negative unitPrice
- Location: tests/orders-validation.spec.ts:34:5

# Error details

```
TypeError: apiRequestContext.post: Invalid URL
```

# Test source

```ts
  1  | import { APIRequestContext } from '@playwright/test'
  2  | import { BaseApiClient } from './BaseApiClient'
  3  | 
  4  | export interface OrderItemInput {
  5  |   productId: string
  6  |   name: string
  7  |   quantity: number
  8  |   unitPrice: number
  9  | }
  10 | 
  11 | export interface CreateOrderInput {
  12 |   userId: string
  13 |   currency?: string
  14 |   items: OrderItemInput[]
  15 | }
  16 | 
  17 | export interface CreateOrderRequestOptions {
  18 |   idempotencyKey?: string | null // null = deliberately omit the header
  19 |   auth?: boolean // false = send request without Authorization header
  20 | }
  21 | 
  22 | export class OrdersApiClient extends BaseApiClient {
  23 |   constructor(request: APIRequestContext, apiKey?: string) {
  24 |     super(request, { apiKey })
  25 |   }
  26 | 
  27 |   async createOrder(payload: CreateOrderInput, opts: CreateOrderRequestOptions = {}) {
  28 |     const { idempotencyKey, auth = true } = opts
  29 | 
  30 |     const headers: Record<string, string> = {}
  31 |     if (idempotencyKey !== null) {
  32 |       headers['Idempotency-Key'] = idempotencyKey ?? crypto.randomUUID()
  33 |     }
  34 | 
> 35 |     const response = await this.request.post('/orders', {
     |                                         ^ TypeError: apiRequestContext.post: Invalid URL
  36 |       headers: auth ? this.authHeaders(headers) : headers,
  37 |       data: payload,
  38 |     })
  39 | 
  40 |     return { response, body: await this.parseJson(response) }
  41 |   }
  42 | 
  43 |   async getOrderById(id: string, opts: { auth?: boolean } = {}) {
  44 |     const { auth = true } = opts
  45 |     const response = await this.request.get(`/orders/${id}`, {
  46 |       headers: auth ? this.authHeaders() : {},
  47 |     })
  48 |     return { response, body: await this.parseJson(response) }
  49 |   }
  50 | 
  51 |   async listOrders(params: { userId?: string; status?: string }, opts: { auth?: boolean } = {}) {
  52 |     const { auth = true } = opts
  53 |     const query = new URLSearchParams()
  54 |     if (params.userId) query.set('userId', params.userId)
  55 |     if (params.status) query.set('status', params.status)
  56 | 
  57 |     const response = await this.request.get(`/orders?${query.toString()}`, {
  58 |       headers: auth ? this.authHeaders() : {},
  59 |     })
  60 |     return { response, body: await this.parseJson(response) }
  61 |   }
  62 | 
  63 |   async health() {
  64 |     const response = await this.request.get('/health')
  65 |     return { response, body: await this.parseJson(response) }
  66 |   }
  67 | }
  68 | 
```