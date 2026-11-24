import type { Diagram } from './collect.ts'
import { listSvgKeys, SVG_DIR, svgDir } from './svg-store.ts'

/**
 * `virtual:mermaid-runtime`, imported by Mermaid.tsx. Two sources:
 *
 * dev   : renders live with the real `mermaid` package (syntax errors show up
 *         while you edit) and POSTs each SVG to /api/mermaid-svg (see dev-api.ts).
 * build : a stub that only contains the SVGs of the diagrams the pages use; the
 *         `mermaid` package is never imported.
 *
 * A virtual module (instead of `if (import.meta.env.DEV)`) guarantees the
 * bundler never even sees the `mermaid` import in a build — no reliance on
 * tree-shaking.
 */

export const VIRTUAL_ID = 'virtual:mermaid-runtime'
export const RESOLVED_ID = '\0' + VIRTUAL_ID

export const DEV_RUNTIME = `
import mermaid from 'mermaid'

let initialized = false
const posted = new Set()

// Always undefined in dev: diagrams are rendered live.
export function peekMermaid() {
  return undefined
}

export async function renderMermaid(chart, key, config) {
  if (!initialized) {
    mermaid.initialize(config)
    initialized = true
  }
  // The id ends up inside the SVG (styles, markers): deriving it from the key
  // keeps ids unique across diagrams once they are all inlined in one page.
  const id = 'mermaid-' + key
  let svg
  try {
    ;({ svg } = await mermaid.render(id, chart))
  } catch (err) {
    // On syntax errors mermaid leaves a temp element in <body>.
    document.getElementById('d' + id)?.remove()
    document.getElementById(id)?.remove()
    throw err
  }
  if (!posted.has(key)) {
    posted.add(key)
    fetch('/api/mermaid-svg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, svg }),
    }).catch(() => posted.delete(key))
  }
  return svg
}
`

export function buildRuntime(root: string, referenced: Map<string, Diagram>): string {
  const available = listSvgKeys(svgDir(root))
  // Only the diagrams the pages use: an SVG nobody references is not worth bytes.
  const keys = [...referenced.keys()].filter((k) => available.has(k))

  // Root-relative ids: resolved the same way on every OS.
  const imports = keys.map((k, i) => `import svg_${i} from ${JSON.stringify(`/${SVG_DIR}/${k}.svg?raw`)}`)
  const entries = keys.map((k, i) => `${JSON.stringify(k)}: svg_${i}`)

  return [
    ...imports,
    `const svgs = { ${entries.join(', ')} }`,
    'export function peekMermaid(key) { return svgs[key] }',
    'export async function renderMermaid(_chart, key) {',
    "  throw new Error('Diagram not pre-rendered: ' + key + '.svg is missing. Run npm run dev, open the report so the diagram renders once, then rebuild.')",
    '}',
  ].join('\n')
}
