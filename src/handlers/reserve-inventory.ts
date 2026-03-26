import { eq, and, ne } from 'drizzle-orm'
import { db } from '../db/postgres'
import { orders } from '../db/schema'

interface ReserveInventoryEvent {
  orderId: string
  items?: Array<{ productId: string; quantity: number }>
  action?: 'RESERVE' | 'RELEASE'
}

export const handler = async (event: ReserveInventoryEvent) => {
  const { orderId, action = 'RESERVE' } = event

  console.log({ orderId, action })

  if (action === 'RELEASE') {
    // Compensation — idempotent, don't update already cancelled
    await db
      .update(orders)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(and(eq(orders.id, orderId), ne(orders.status, 'cancelled')))

    console.log(`Inventory released for order ${orderId}`)
    return { orderId, action: 'RELEASED' }
  }

  // RESERVE
  const [updated] = await db
    .update(orders)
    .set({ status: 'processing', updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.status, 'pending')))
    .returning()

  if (!updated) {
    const err = new Error(`Insufficient stock for order ${orderId}`)
    err.name = 'InsufficientStockError'
    throw err
  }

  console.log(`Inventory reserved for order ${orderId}`)
  return { orderId, action: 'RESERVED' }
}
