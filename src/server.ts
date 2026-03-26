import { serve } from '@hono/node-server'
import { showRoutes } from 'hono/dev'
import app from './app'

const port = Number(process.env.PORT ?? 3000)

serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}`)
  console.log(`LocalStack endpoint: ${process.env.AWS_ENDPOINT}`)
  showRoutes(app)
})
