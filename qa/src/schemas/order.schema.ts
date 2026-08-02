import { z } from 'zod'

export const OrderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.union([z.number(), z.string()]), // numeric() from Drizzle can serialize as string
})

export const OrderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'cancelled']),
  totalAmount: z.union([z.number(), z.string()]),
  currency: z.string().length(3),
  items: z.array(OrderItemSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const CreateOrderResponseSchema = z.object({
  data: OrderSchema,
})

export const OrderListResponseSchema = z.object({
  data: z.array(OrderSchema),
})

export const ErrorResponseSchema = z.object({
  error: z.string(),
})
