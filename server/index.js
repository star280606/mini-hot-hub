const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 3001
const HOST = '0.0.0.0'
const CLIENT_ORIGIN = 'http://localhost:5173'

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  }),
)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`)
})
