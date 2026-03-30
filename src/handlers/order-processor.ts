import { StartExecutionCommand } from '@aws-sdk/client-sfn'
import { SQSHandler, SQSEvent, SQSRecord } from 'aws-lambda'
import { sfn } from '../services/aws'

const SAGA_ARN = process.env.STEP_FUNCTIONS_ORDER_SAGA_ARN

export const handler: SQSHandler = async (event: SQSEvent) => {
  console.log(`Processing batch of ${event.Records.length} messages`)

  const results = await Promise.allSettled(
    event.Records.map(async (record: SQSRecord) => {
      const { orderId, userId } = JSON.parse(record.body)

      console.log(`Starting SAGA for order ${orderId}`)

      await sfn.send(
        new StartExecutionCommand({
          stateMachineArn: SAGA_ARN,
          name: `order-${orderId}-${Date.now()}`,
          input: JSON.stringify({ orderId, userId }),
        })
      )
    })
  )

  const failures = results.filter((r: { status: string }) => r.status === 'rejected')

  if (failures.length > 0) {
    console.error(`Failed to start ${failures.length} SAGA executions:`, failures)
    // SQS will retry them based on the redrive policy
    throw new Error('Some messages failed to process')
  }

  console.log('Batch processed successfully')
}
