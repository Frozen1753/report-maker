import type { Browser, SupportedBrowser } from 'puppeteer-core'
import path from 'node:path'
import { MERMAID_CONFIG } from '../../src/core/utils/shared/mermaid-shared.ts'
import { BROWSER_HINT, findBrowser, resolveMermaidBundle } from './browser.ts'
import type { Diagram } from './collect.ts'
import { listSvgKeys, svgDir, writeSvg } from './svg-store.ts'

/**
 * Renders the diagrams whose SVG is missing, from Node: puppeteer-core drives a
 * browser already installed on the machine, which loads the project's own
 * mermaid bundle. Dev tooling only: nothing of this ends up in dist/.
 * `puppeteer-core` is imported lazily, only when an SVG is missing.
 */

export interface Logger {
  info: (message: string) => void
  warn: (message: string) => void
}

/** Runs in the page (kept as a string: this file has no DOM types). Mermaid renders one diagram at a time. */
const PAGE_SCRIPT = `
window.__renderAll = async (config, items) => {
  await document.fonts.ready
  mermaid.initialize(Object.assign({ startOnLoad: false }, config))
  const results = []
  for (const [key, chart] of items) {
    // Same id scheme as the dev runtime: unique ids once all the SVGs share one page.
    const id = 'mermaid-' + key
    try {
      const { svg } = await mermaid.render(id, chart)
      results.push({ key, svg })
    } catch (err) {
      // On syntax errors mermaid leaves a temp element in <body>.
      document.getElementById('d' + id)?.remove()
      document.getElementById(id)?.remove()
      results.push({ key, error: String((err && err.message) || err) })
    }
  }
  return results
}
`

type PageResult = { key: string; svg: string } | { key: string; error: string }

/** Runs never overlap (dev: several file changes in a row). */
let queue: Promise<unknown> = Promise.resolve()

/**
 * Renders the diagrams whose SVG is not on disk yet, in one browser session.
 * A diagram that fails is reported through `log.warn` and left missing (the
 * report shows an error there). Never throws.
 */
export function prerenderMissing(
  root: string,
  referenced: Map<string, Diagram>,
  log: Logger,
  browserPath?: string,
): Promise<void> {
  const run = async () => {
    const dir = svgDir(root)
    const available = listSvgKeys(dir)
    const missing = [...referenced].filter(([key]) => !available.has(key))
    if (missing.length === 0) return

    const executablePath = findBrowser(browserPath)
    if (!executablePath) {
      log.warn(BROWSER_HINT)
      return
    }

    log.info(`[mermaid] rendering ${missing.length} missing diagram(s) in ${path.basename(executablePath)}…`)

    let browser: Browser | undefined
    try {
      const { launch } = await import('puppeteer-core')
      browser = await launch({ executablePath, headless: true, browser: path.basename(executablePath).toLowerCase().includes("firefox") ? "firefox" : "chrome" })
      const page = await browser.newPage()
      await page.setContent('<!doctype html><html><body></body></html>')
      await page.addScriptTag({ path: resolveMermaidBundle(root) })
      await page.addScriptTag({ content: PAGE_SCRIPT })

      const items = missing.map(([key, { chart }]) => [key, chart])
      const results = (await page.evaluate(
        `window.__renderAll(${JSON.stringify(MERMAID_CONFIG)}, ${JSON.stringify(items)})`,
      )) as PageResult[]

      let done = 0
      for (const result of results) {
        if ('svg' in result) {
          writeSvg(dir, result.key, result.svg)
          done++
        } else {
          const pages = [...(referenced.get(result.key)?.pages ?? [])].join(', ')
          log.warn(`[mermaid] could not render ${result.key} (${pages}): ${result.error.split('\n')[0]}`)
        }
      }
      log.info(`[mermaid] ${done}/${missing.length} missing diagram(s) rendered`)
    } catch (error) {
      log.warn(`[mermaid] pre-rendering failed (npm i -D puppeteer-core): ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`)
    } finally {
      await browser?.close().catch(() => undefined)
    }
  }

  const next = queue.then(run, run)
  queue = next.catch(() => undefined)
  return next
}
