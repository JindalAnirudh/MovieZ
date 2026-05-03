import { setInterval as setInt, clearInterval as clearInt } from 'timers'

const clients = new Set()

export const addClient = (res) => {
  clients.add(res)
}

export const removeClient = (res) => {
  clients.delete(res)
}

export const broadcast = (event, data = {}) => {
  const payload = `event: ${event}\ndata: ${JSON.stringify({ ...data, ts: Date.now() })}\n\n`
  for (const res of clients) {
    try { res.write(payload) } catch {}
  }
}

export const sendDashboardUpdate = () => broadcast('dashboard:update', {})

export const initSSE = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  res.write(`event: connected\ndata: {"ok":true}\n\n`)
  addClient(res)
  const hb = setInt(() => {
    try { res.write(`: hb\n\n`) } catch {}
  }, 15000)
  req.on('close', () => {
    clearInt(hb)
    removeClient(res)
    try { res.end() } catch {}
  })
}
