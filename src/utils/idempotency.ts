import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo } from '../services/aws'
import type { IdempotencyRecord } from '../types/index'

const TABLE = process.env.DYNAMODB_TABLE_IDEMPOTENCY ?? 'idempotency-keys'
const TTL_SECONDS = 60 * 60 * 24 // 24 hours

export async function checkIdempotency(
  key: string
): Promise<IdempotencyRecord | null> {
  const result = await dynamo.send(
    new GetCommand({ TableName: TABLE, Key: { idempotencyKey: key } })
  )
  return (result.Item as IdempotencyRecord) ?? null
}

export async function saveIdempotency(
  key: string,
  orderId: string,
  status: string
): Promise<void> {
  const record: IdempotencyRecord = {
    idempotencyKey: key,
    orderId,
    status: status as IdempotencyRecord['status'],
    createdAt: new Date().toISOString(),
    ttl: Math.floor(Date.now() / 1000) + TTL_SECONDS,
  }

  // conditional write - only save if key doesn't exist
  await dynamo.send(
    new PutCommand({
      TableName: TABLE,
      Item: record,
      ConditionExpression: 'attribute_not_exists(idempotencyKey)',
    })
  )
}
