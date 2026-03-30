import { SQSEvent } from 'aws-lambda'

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const snsMessage = JSON.parse(record.body)
    const payload = typeof snsMessage.Message === 'string' 
      ? JSON.parse(snsMessage.Message) 
      : snsMessage.Message

    const { orderId, userId, totalAmount, status } = payload

    console.log(`[NOTIFICATION] Order ${status}:`)
    console.log(`- Order: ${orderId}`)
    console.log(`- User: ${userId}`)
    console.log(`- Amount: $${totalAmount}`)
    console.log(`- Status: ${status}`)
  }

  return { success: true }
}
