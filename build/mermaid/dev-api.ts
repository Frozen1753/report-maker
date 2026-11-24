import type { Connect } from 'vite'
import { KEY_RE, svgDir, writeSvg } from './svg-store.ts'

/**
 * POST /api/mermaid-svg { key, svg }: the dev renderer (see runtime.ts) saves
 * the SVG it just rendered, so the next build finds it on disk.
 */
export function mermaidSvgEndpoint(root: string): Connect.NextHandleFunction {
  const dir = svgDir(root)

  return (req, res) => {
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.end()
      return
    }

    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => {
      try {
        const { key, svg } = JSON.parse(Buffer.concat(chunks).toString('utf-8')) as {
          key?: unknown
          svg?: unknown
        }
        if (typeof key !== 'string' || !KEY_RE.test(key) || typeof svg !== 'string' || !svg.startsWith('<svg')) {
          res.statusCode = 400
          res.end('bad request')
          return
        }
        writeSvg(dir, key, svg)
        res.statusCode = 204
        res.end()
      } catch {
        res.statusCode = 400
        res.end('bad request')
      }
    })
  }
}
