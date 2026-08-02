import { APIRequestContext } from '@playwright/test'
import { BaseApiClient } from './BaseApiClient'

export interface OrderItemInput {
  productId: string
  name: string
  quantity: number
  unitPrice: number
}

export interface CreateOrderInput {
  userId: string
  currency?: string
  items: OrderItemInput[]
}

export interface CreateOrderRequestOptions {
  idempotencyKey?: string | null
  auth?: boolean
}

export class OrdersApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, apiKey?: string) {
    super(request, { apiKey })
  }

  async createOrder(payload: CreateOrderInput, opts: CreateOrderRequestOptions = {}) {
    const { idempotencyKey, auth = true } = opts

    const headers: Record<string, string> = {}
    if (idempotencyKey !== null) {
      headers['Idempotency-Key'] = idempotencyKey ?? crypto.randomUUID()
    }

    const response = await this.request.post('/orders', {
      headers: auth ? this.authHeaders(headers) : headers,
      data: payload,
    })

    return { response, body: await this.parseJson(response) }
  }

  async getOrderById(id: string, opts: { auth?: boolean } = {}) {
    const { auth = true } = opts
    const response = await this.request.get(`/orders/${id}`, {
      headers: auth ? this.authHeaders() : {},
    })
    return { response, body: await this.parseJson(response) }
  }

  async listOrders(params: { userId?: string; status?: string }, opts: { auth?: boolean } = {}) {
    const { auth = true } = opts
    const query = new URLSearchParams()
    if (params.userId) query.set('userId', params.userId)
    if (params.status) query.set('status', params.status)

    const response = await this.request.get(`/orders?${query.toString()}`, {
      headers: auth ? this.authHeaders() : {},
    })
    return { response, body: await this.parseJson(response) }
  }

  async health() {
    const response = await this.request.get('/health')
    return { response, body: await this.parseJson(response) }
  }
}
