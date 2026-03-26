import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { ordersRouter } from './handlers/orders'

const app = new Hono()

app.use('*', logger())

app.get('/health', (c) => c.json({ status: 'ok', ts: new Date().toISOString() }))

app.route('/orders', ordersRouter)

app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app
