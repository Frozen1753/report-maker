import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { parseTheme, updateTheme, type UpdateThemeInput } from './theme-css.ts'

// Adjust if your global stylesheet lives elsewhere.
const STYLE_PATH = path.resolve(process.cwd(), 'src/styles/style.css')

function readBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

/**
 * Dev-only middleware for the ThemePanel:
 *   GET  /api/theme -> { light, dark, css } (css = raw file, so the panel can
 *                        diff / show a preview without re-deriving formatting)
 *   POST /api/theme -> body: UpdateThemeInput, rewrites src/styles/style.css
 *                        in place via PostCSS (only touches declarations that
 *                        changed; comments/formatting elsewhere are untouched)
 *
 * Never bundled into report output — only active while `vite dev` runs.
 */
export function themeServerPlugin(): Plugin {
  return {
    name: 'report-maker:theme-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/theme', async (req, res) => {
        if (req.method === 'GET') {
          const css = fs.readFileSync(STYLE_PATH, 'utf-8')
          const parsed = parseTheme(css)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ...parsed, css }))
          return
        }

        if (req.method === 'POST') {
          try {
            const body = JSON.parse(await readBody(req)) as UpdateThemeInput
            const css = fs.readFileSync(STYLE_PATH, 'utf-8')
            const next = updateTheme(css, body)
            fs.writeFileSync(STYLE_PATH, next)
            // Vite's own watcher picks this up and HMRs the stylesheet —
            // no need to trigger anything manually here.
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (err) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }))
          }
          return
        }

        res.statusCode = 405
        res.end('Method not allowed')
      })
    },
  }
}
