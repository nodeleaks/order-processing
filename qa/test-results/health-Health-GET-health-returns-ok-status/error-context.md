# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: health.spec.ts >> Health >> GET /health returns ok status
- Location: tests/health.spec.ts:4:3

# Error details

```
Error: apiRequestContext.get: connect ECONNREFUSED ::1:3000
Call log:
  - → GET http://localhost:3000/health
    - user-agent: Playwright/1.61.1 (arm64; macOS 26.5) node/24.18
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - Content-Type: application/json

```