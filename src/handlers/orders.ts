import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod/v4'
import { createInsertSchema } from 'drizzle-zod'
import { orders } from '../db/schema'
import { checkIdempotency, saveIdempotency } from '../utils/idempotency'
import { createOrder, getOrderById, getOrdersByUser } from '../services/order'

const CreateOrderSchema = createInsertSchema(orders, {
  userId: z.string().min(1),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      name: z.string().min(1),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
    })
  ).min(1),
}).omit({
  id: true,
  status: true,
  totalAmount: true,
  createdAt: true,
  updatedAt: true,
})

export const ordersRouter = new Hono()

// POST /orders
ordersRouter.post('/', zValidator('json', CreateOrderSchema as any), async (c) => {
  const idempotencyKey = c.req.header('Idempotency-Key')

  if (!idempotencyKey) {
    return c.json({ error: 'Idempotency-Key header is required' }, 400)
  }

  const existing = await checkIdempotency(idempotencyKey)
  if (existing) return c.json({ data: existing }, 200)

  const input = c.req.valid('json')

  try {
    const order = await createOrder({
      userId: input.userId,
      currency: input.currency ?? 'USD',
      items: input.items,
    })

    await saveIdempotency(idempotencyKey, order.id, order.status)

    return c.json({ data: order }, 201)
  } catch (err) {
    console.error('Failed to create order:', err)
    return c.json({ error: 'Failed to create order' }, 500)
  }
})

// GET /orders/:id
ordersRouter.get('/:id', async (c) => {
  const order = await getOrderById(c.req.param('id'))
  if (!order) return c.json({ error: 'Order not found' }, 404)

  return c.json({ data: order })
})

// GET /orders?userId=...&status=...
ordersRouter.get('/', async (c) => {
  const userId = c.req.query('userId')
  const status = c.req.query('status')

  if (!userId) return c.json({ error: 'userId query param is required' }, 400)

  const result = await getOrdersByUser(userId, status)

  return c.json({ data: result })
})
