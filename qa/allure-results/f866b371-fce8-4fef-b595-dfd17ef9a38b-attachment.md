# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orders-idempotency.spec.ts >> POST /orders — idempotency >> two different Idempotency-Keys with identical payload create two distinct orders
- Location: tests/orders-idempotency.spec.ts:28:3

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
    - Idempotency-Key: 03a8bf1b-e44e-4a12-9114-a13b865a8e13
    - content-length: 151

```