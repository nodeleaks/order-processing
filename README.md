# Order Processing System

Learning project. Covers SAGA pattern using AWS services.

## Stack

| Category | Technology |
|-----------|-----------|
| Runtime | Node.js 24 + TypeScript |
| Framework | Hono (Lambda + Node.js) |
| ORM | Drizzle ORM + drizzle-zod |
| Validation | Zod v4 |
| Database | PostgreSQL (Drizzle) + DynamoDB (idempotency) |
| Queue | SQS FIFO + DLQ |
| Orchestration | Step Functions (SAGA pattern) |
| Notifications | SNS + SQS |
| IaC | Terraform |
| Tests | Vitest (unit / integration / smoke) |
| CI/CD | GitHub Actions |
| Local AWS | LocalStack |

## Architecture

```text
Client
  └── API Gateway
        └── Lambda (Hono API)
              ├── DynamoDB       — idempotency keys (TTL 24h)
              ├── PostgreSQL     — orders, users (Drizzle ORM)
              └── SQS FIFO       — orders queue
                    └── Lambda (Order Processor)
                          └── Step Functions (SAGA)
                                ├── Reserve inventory  (Lambda)
                                ├── Process payment    (Lambda)
                                │     └── [fail] → Release inventory (compensation)
                                └── Publish events     (Direct SNS Integration)
                                      └── SQS          (Notifications queue)
                                            └── Send notification (Lambda)
```

## Key technical decisions

**Idempotency** — each `POST /orders` requires `Idempotency-Key` header.
Check DynamoDB before processing. Protection against duplicates on retry.

**SQS FIFO + MessageGroupId** — sharding by `userId`.
Order sequence is guaranteed within one user.

**Composite index** — `(user_id, status, created_at DESC)`.
Covers the most frequent query without additional sorting.

**SAGA via Step Functions** — on payment failure
automatically compensate inventory reservation via `Catch`.

**Retry with exponential backoff + jitter** — avoid thundering herd
with temporary failures of external services.

**drizzle-zod** — Zod schemas are generated from Drizzle schema.
Single source of truth — no manual type duplication.

## Quick start

```bash
# 1. Complete local setup (Deps + Infrastructure + Terraform + DB Migrations + Seed)
make setup

# 2. Start server locally
make local
# → http://localhost:3000

# 3. Run tests
make test
```

## API

```
POST /orders
  Headers: Idempotency-Key: <uuid>
  Body: {
    userId: string (uuid),
    currency?: string (3 chars, default: "USD"),
    items: [{
      productId: string,
      name: string,
      quantity: number,
      unitPrice: number
    }]
  }

GET /orders/:id

GET /orders?userId=<uuid>&status=<pending|confirmed|cancelled>
```

## Terraform (LocalStack)

```bash
cd terraform
terraform init
terraform apply -var="environment=local"
```

## Drizzle commands

```bash
npm run db:generate   # generate migrations from schema.ts
npm run db:migrate    # apply migrations
npm run db:studio     # web UI for viewing data
```

## What the project covers

- TypeScript · Node.js · Hono
- AWS Lambda · API Gateway · SQS · SNS · DynamoDB · Step Functions
- PostgreSQL with composite index
- Terraform (IaC)
- Idempotency pattern
- SAGA pattern with compensation
- Retry with exponential backoff + jitter
- Unit · Integration · Smoke tests
- CI/CD via GitHub Actions
- LocalStack for local development without AWS account
