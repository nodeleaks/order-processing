import { describe, it, expect } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import { ReceiveMessageCommand } from '@aws-sdk/client-sqs'
import { sqs } from '../../src/db/aws'

const BASE_URL = process.env.API_URL ?? 'http://localhost:3000'
const TEST_USER_ID = '11111111-1111-1111-1111-111111111111'

const createOrderPayload = () => ({
  userId: TEST_USER_ID,
  currency: 'USD',
  items: [
    {
      productId: 'prod-001',
      name: 'Test Product',
      quantity: 2,
      unitPrice: 25.0,
    },
  ],
})

describe('Orders API — integration', () => {
  it('GET /health returns ok', async () => {
    const res = await fetch(`${BASE_URL}/health`)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.status).toBe('ok')
  })

  it('POST /orders — creates order with idempotency key', async () => {
    const idempotencyKey = uuidv4()
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
        'Authorization': 'Bearer local-secret-key',
      },
      body: JSON.stringify(createOrderPayload()),
    })
    expect(res.status).toBe(201)

    const body = await res.json()
    expect(body.data).toMatchObject({
      userId: TEST_USER_ID,
      status: 'pending',
      totalAmount: '50.00',
    })
  })

  it('POST /orders — same idempotency key returns same result', async () => {
    const idempotencyKey = uuidv4()
    const payload = createOrderPayload()

    const res1 = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey, 'Authorization': 'Bearer local-secret-key' },
      body: JSON.stringify(payload),
    })

    const body1 = await res1.json()

    const res2 = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey, 'Authorization': 'Bearer local-secret-key' },
      body: JSON.stringify(payload),
    })

    const body2 = await res2.json()

    expect(body2.data.orderId).toBe(body1.data.orderId ?? body1.data.id)
  })

  it('POST /orders — fails without idempotency key', async () => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer local-secret-key' },
      body: JSON.stringify(createOrderPayload()),
    })

    expect(res.status).toBe(400)
  })

  it('GET /orders/:id — returns 404 for unknown id', async () => {
    const res = await fetch(`${BASE_URL}/orders/${uuidv4()}`, {
      headers: { 'Authorization': 'Bearer local-secret-key' },
    })

    expect(res.status).toBe(404)
  })

  it('GET /orders?userId= — returns user orders', async () => {
    await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': uuidv4(),
        'Authorization': 'Bearer local-secret-key',
      },
      body: JSON.stringify(createOrderPayload()),
    })

    const res = await fetch(`${BASE_URL}/orders?userId=${TEST_USER_ID}`, {
      headers: { 'Authorization': 'Bearer local-secret-key' },
    })

    expect(res.status).toBe(200)

    const body = await res.json()

    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
  })
})

it('POST /orders — sends message to SQS', async () => {
  await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': uuidv4(),
      'Authorization': 'Bearer local-secret-key',
    },
    body: JSON.stringify(createOrderPayload()),
  })

  const result = await sqs.send(
    new ReceiveMessageCommand({
      QueueUrl: process.env.SQS_ORDERS_QUEUE_URL,
      WaitTimeSeconds: 5,
      MaxNumberOfMessages: 1,
    })
  )

  expect(result.Messages).toBeDefined()
  expect(result.Messages!.length).toBeGreaterThan(0)

  const body = JSON.parse(result.Messages![0].Body!)
  expect(body.userId).toBe(TEST_USER_ID)
}, 10000)
