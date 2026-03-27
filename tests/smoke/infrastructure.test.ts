import { describe, it, expect } from 'vitest'
import { GetQueueAttributesCommand } from '@aws-sdk/client-sqs'
import { DescribeTableCommand } from '@aws-sdk/client-dynamodb'
import { sqs, dynamo } from '../../src/db/aws.js'

describe('Infrastructure smoke tests', () => {
  it('SQS orders queue is accessible', async () => {
    const res = await sqs.send(
      new GetQueueAttributesCommand({
        QueueUrl: process.env.SQS_ORDERS_QUEUE_URL,
        AttributeNames: ['ApproximateNumberOfMessages'],
      })
    )

    expect(res.Attributes).toBeDefined()
  })

  it('DynamoDB idempotency table is accessible', async () => {
    const res = await dynamo.send(
      new DescribeTableCommand({
        TableName: process.env.DYNAMODB_TABLE_IDEMPOTENCY,
      })
    )

    expect(res.Table?.TableStatus).toBe('ACTIVE')
  })
})
