import { CreateOrderInput, OrderItemInput } from '../api-clients/OrdersApiClient'

export const TEST_USER_ID = '11111111-1111-1111-1111-111111111111'

export const buildOrderItem = (overrides: Partial<OrderItemInput> = {}): OrderItemInput => {
  return {
    productId: 'prod-001',
    name: 'Test Product',
    quantity: 2,
    unitPrice: 25.0,
    ...overrides,
  }
}

export const buildCreateOrderPayload = (overrides: Partial<CreateOrderInput> = {}): CreateOrderInput => {
  return {
    userId: TEST_USER_ID,
    currency: 'USD',
    items: [buildOrderItem()],
    ...overrides,
  }
}

