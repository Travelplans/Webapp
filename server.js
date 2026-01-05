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
app.use(
  '/assets',
  express.static(path.join(distDir, 'assets'), {
    immutable: true,
    maxAge: '1y',
    index: false,
  }),
)
app.use(
  express.static(distDir, {
    // index.html is handled separately to ensure correct caching headers
    index: false,
    maxAge: '1h',
  }),
)

// SPA fallback: send index.html for any non-file route
app.get('*', (req, res) => {
  // Never serve HTML for file-like requests (prevents "module script MIME type text/html" errors)
  if (req.path.includes('.')) {
    return res.status(404).send('Not Found')
  }

  // Only treat browser navigations as SPA routes
  const accept = req.headers.accept || ''
  if (!accept.includes('text/html')) {
    return res.status(404).send('Not Found')
  }

  // Avoid caching index.html so new builds pick up the latest hashed assets
  res.setHeader('Cache-Control', 'no-store')
  return res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on http://${host}:${port}`)
})

