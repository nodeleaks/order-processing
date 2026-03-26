import { eq, and, desc } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/postgres'
import { orders } from '../db/schema'
import { sqs } from '../db/aws'
import { SendMessageCommand } from '@aws-sdk/client-sqs'
import type { CreateOrderInput } from '../types/index'
import type { Order } from '../db/schema'

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const id = uuidv4()
  const totalAmount = input.items
    .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    .toFixed(2)

  const [order] = await db
    .insert(orders)
    .values({
      id,
      userId: input.userId,
      totalAmount,
      currency: input.currency ?? 'USD',
      items: input.items,
    })
    .returning()

  await sqs.send(
    new SendMessageCommand({
      QueueUrl: process.env.SQS_ORDERS_QUEUE_URL,
      MessageBody: JSON.stringify({ orderId: order.id, userId: order.userId }),
      MessageGroupId: `user-${input.userId}`,
      MessageDeduplicationId: id,
    })
  )

  return order
}

export async function getOrderById(id: string): Promise<Order | null> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1)

  return order ?? null
}

export async function getOrdersByUser(
  userId: string,
  status?: string,
  limit = 20
): Promise<Order[]> {
  const where = status
    ? and(eq(orders.userId, userId), eq(orders.status, status))
    : eq(orders.userId, userId)

  return db
    .select()
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(limit)
}
