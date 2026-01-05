import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Cloud Run sets PORT (default 8080). Bind to 0.0.0.0.
const port = Number.parseInt(process.env.PORT || '8080', 10)
const host = '0.0.0.0'

// Basic health endpoint for Cloud Run / LB checks
app.get('/healthz', (_req, res) => res.status(200).send('ok'))

// Serve built static assets
const distDir = path.join(__dirname, 'dist')
app.use(express.static(distDir, { index: false }))

// SPA fallback: send index.html for any non-file route
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on http://${host}:${port}`)
})

