import { SendMessageCommand } from '@aws-sdk/client-sqs'
import { sqs } from '../db/aws'

interface SendNotificationEvent {
  orderId: string
  userId: string
}

export const handler = async (event: SendNotificationEvent) => {
  const { orderId, userId } = event

  await sqs.send(
    new SendMessageCommand({
      QueueUrl: process.env.SQS_NOTIFICATIONS_QUEUE_URL,
      MessageBody: JSON.stringify({
        type: 'ORDER_CONFIRMED',
        orderId,
        userId,
        timestamp: new Date().toISOString(),
      }),
    })
  )

  console.log(`Notification queued for order ${orderId}`)
  return { orderId, notificationQueued: true }
}
