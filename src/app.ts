import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { bearerAuth } from 'hono/bearer-auth'
import { ordersRouter } from './handlers/orders'

const app = new Hono()

app.use('*', logger())

app.get('/health', (c) => c.json({ status: 'ok', ts: new Date().toISOString() }))

const apiKey = process.env.API_KEY || 'local-secret-key'

app.use('/orders', bearerAuth({ token: apiKey }))
app.use('/orders/*', bearerAuth({ token: apiKey }))
app.route('/orders', ordersRouter)

app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app
