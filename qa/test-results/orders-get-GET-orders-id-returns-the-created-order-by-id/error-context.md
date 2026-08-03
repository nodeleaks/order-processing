# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orders-get.spec.ts >> GET /orders/:id >> returns the created order by id
- Location: tests/orders-get.spec.ts:6:3

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED ::1:3000
Call log:
  - → POST http://localhost:3000/orders
    - user-agent: Playwright/1.61.1 (arm64; macOS 26.5) node/24.18
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - Content-Type: application/json
    - Authorization: Bearer local-secret-key
    - Idempotency-Key: 2d266ef7-5484-4c8f-9f94-9bc4e940d7f0
    - content-length: 151

```