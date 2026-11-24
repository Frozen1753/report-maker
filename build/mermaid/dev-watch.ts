import type { ViteDevServer } from 'vite'
import type { MdxOptions } from '../pages/parse.ts'
import { collectReferenced } from './collect.ts'
import { prerenderMissing } from './render.ts'

const DEBOUNCE_MS = 250

/**
 * Dev: renders the missing diagrams when the server starts, then whenever an
 * .mdx file (page or partial) is added, changed or removed. Nobody has to visit
 * a page for its diagrams to exist.
 */
export function prerenderOnChange(
  server: ViteDevServer,
  root: string,
  remarkPlugins: MdxOptions['remarkPlugins'],
  browserPath?: string,
): void {
  const logger = server.config.logger
  const log = { info: (m: string) => logger.info(m), warn: (m: string) => logger.warn(m) }

  const sync = () => {
    try {
      const { referenced } = collectReferenced(root, remarkPlugins, 'serve')
      void prerenderMissing(root, referenced, log, browserPath)
    } catch (error) {
      // A broken page (frontmatter, include...): its own plugin reports it.
      log.warn(`[mermaid] pre-rendering skipped: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  const schedule = (file: string) => {
    if (!file.endsWith('.mdx')) return
    clearTimeout(timer)
    timer = setTimeout(sync, DEBOUNCE_MS)
  }

  server.watcher.on('add', schedule)
  server.watcher.on('change', schedule)
  server.watcher.on('unlink', schedule)
  sync()
}
