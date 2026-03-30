import { eq } from 'drizzle-orm'
import { db } from '../db/postgres'
import { orders } from '../db/schema'
import { retryWithBackoff } from '../utils/retry'

interface ProcessPaymentEvent {
  orderId: string
  userId: string
}

async function callPaymentGateway(orderId: string, amount: number) {
  // Simulate 10% failure rate for testing SAGA compensation
  if (Math.random() < 0.1) {
    const err = new Error('Payment gateway declined')
    err.name = 'PaymentFailedError'
    throw err
  }

  return { transactionId: `txn_${Date.now()}`, status: 'success' }
}

export const handler = async (event: ProcessPaymentEvent) => {
  const { orderId } = event

  const [order] = await db
    .select({ totalAmount: orders.totalAmount })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1)

  if (!order) throw new Error(`Order ${orderId} not found`)

  const payment = await retryWithBackoff(
    () => callPaymentGateway(orderId, Number(order.totalAmount)),
    { maxAttempts: 2, baseDelayMs: 500 }
  )

  await db
    .update(orders)
    .set({ status: 'confirmed', updatedAt: new Date() })
    .where(eq(orders.id, orderId))

  console.log(`Payment processed for order ${orderId}:`, payment)
  return { orderId, transactionId: payment.transactionId, totalAmount: order.totalAmount }
}
