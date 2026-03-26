export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'cancelled'
  | 'failed'

export interface OrderItem {
  productId: string
  name: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  totalAmount: number
  currency: string
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateOrderInput {
  userId: string
  items: OrderItem[]
  currency?: string
}

export interface IdempotencyRecord {
  idempotencyKey: string
  orderId: string
  status: OrderStatus
  createdAt: string
  ttl: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
