import type { Plugin } from 'vite'
import type { MdxOptions } from '../pages/parse.ts'
import { collectReferenced, type Diagram, type DynamicChart } from './collect.ts'
import { mermaidSvgEndpoint } from './dev-api.ts'
import { prerenderOnChange } from './dev-watch.ts'
import { prerenderMissing } from './render.ts'
import { reportBuild } from './report.ts'
import { buildRuntime, DEV_RUNTIME, RESOLVED_ID, VIRTUAL_ID } from './runtime.ts'

// Re-exported: other build plugins may import it from here.
export { collectMermaid } from './collect.ts'

/**
 * Mermaid pre-rendering: the Vite plugin only wires the pieces together.
 *
 *   collect.ts    finds the diagrams in the pages (and their partials)
 *   svg-store.ts  the folder of pre-rendered SVGs
 *   browser.ts    which browser / which mermaid bundle
 *   render.ts     renders the missing SVGs (puppeteer-core)
 *   runtime.ts    the virtual module Mermaid.tsx imports (dev: live, build: SVGs)
 *   dev-api.ts    POST /api/mermaid-svg: the dev renderer saves its SVGs
 *   dev-watch.ts  dev: pre-render at start and on every .mdx change
 *   report.ts     build: warnings and summary
 *
 * dev   : missing SVGs are rendered at start and on every .mdx change; Mermaid.tsx
 *         still renders live (syntax errors show up while you edit).
 * build : missing SVGs are rendered first, then the runtime only contains the
 *         SVGs the pages use. The `mermaid` package is never in the bundle.
 */

export interface MermaidPluginOptions {
  /** The SAME remark plugins as mdx(): the pages are parsed here too (see pages/parse.ts). */
  remarkPlugins?: MdxOptions['remarkPlugins']
  /** Path of the Chrome / Edge / Chromium executable. Found automatically when omitted. */
  browserPath?: string
}

export function mermaidPlugin({ remarkPlugins, browserPath }: MermaidPluginOptions = {}): Plugin {
  let isBuild = false
  let root = process.cwd()
  let referenced = new Map<string, Diagram>() // key -> diagram used by at least one page
  let dynamic: DynamicChart[] = [] // <Mermaid chart={...}> that isn't a static string

  return {
    name: 'report-maker:mermaid',

    config(_config, { command }) {
      // The only import of `mermaid` lives in a virtual module the dependency
      // scanner may not see: pre-bundle it explicitly to avoid a reload on first load.
      if (command === 'serve') return { optimizeDeps: { include: ['mermaid'] } }
    },

    configResolved(config) {
      isBuild = config.command === 'build'
      root = config.root
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },

    async buildStart() {
      if (!isBuild) return
        ; ({ referenced, dynamic } = collectReferenced(root, remarkPlugins, 'build'))
      // Before load() builds the runtime: the SVGs rendered here are bundled.
      await prerenderMissing(root, referenced, { info: (m) => console.log(m), warn: (m) => this.warn(m) }, browserPath)
    },

    load(id) {
      if (id !== RESOLVED_ID) return
      return isBuild ? buildRuntime(root, referenced) : DEV_RUNTIME
    },

    configureServer(server) {
      prerenderOnChange(server, root, remarkPlugins, browserPath)
      server.middlewares.use('/api/mermaid-svg', mermaidSvgEndpoint(root))
    },

    buildEnd(error) {
      if (error || !isBuild) return
      reportBuild(root, referenced, dynamic, (m) => this.warn(m))
    },
  }
}
