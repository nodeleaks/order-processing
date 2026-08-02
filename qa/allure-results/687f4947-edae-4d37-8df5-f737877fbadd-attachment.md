# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: orders-auth.spec.ts >> Bearer auth on /orders endpoints >> POST /orders without Authorization header returns 401
- Location: tests/orders-auth.spec.ts:6:3

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED ::1:3000
Call log:
  - → POST http://localhost:3000/orders
    - user-agent: Playwright/1.61.1 (arm64; macOS 26.5) node/24.18
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - Content-Type: application/json
    - Idempotency-Key: fbb92879-2ad4-43ef-9a6d-b0bd9123cfc4
    - content-length: 151

```