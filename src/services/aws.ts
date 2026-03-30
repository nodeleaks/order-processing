import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { SQSClient } from '@aws-sdk/client-sqs'
import { SNSClient } from '@aws-sdk/client-sns'
import { SFNClient } from '@aws-sdk/client-sfn'

const isLocal = process.env.IS_LOCAL === 'true'

const awsConfig = {
  region: process.env.AWS_REGION ?? 'eu-central-1',
  ...(isLocal && {
    endpoint: process.env.AWS_ENDPOINT ?? 'http://localhost:4566',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
  }),
}

const dynamoClient = new DynamoDBClient(awsConfig)

export const dynamo = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: { removeUndefinedValues: true },
})

export const sqs = new SQSClient(awsConfig)
export const sns = new SNSClient(awsConfig)
export const sfn = new SFNClient(awsConfig)
