import type { Diagram, DynamicChart } from './collect.ts'
import { listSvgKeys, svgDir } from './svg-store.ts'

/** End of a build: what is missing, what can't be pre-rendered, what is unused. */
export function reportBuild(
  root: string,
  referenced: Map<string, Diagram>,
  dynamic: DynamicChart[],
  warn: (message: string) => void,
): void {
  const available = listSvgKeys(svgDir(root))
  const preview = (chart: string) => chart.split('\n')[0].slice(0, 60)

  let missing = 0
  for (const [key, { chart, pages }] of referenced) {
    if (available.has(key)) continue
    missing++
    warn(
      `[mermaid] ${key}.svg could not be found for the diagram "${preview(chart)}…" (${[...pages].join(', ')}) — the report will show an error there. ` +
      'Check the diagram syntax (see the render error above), or run `npm run dev` and open that page so it renders once in the browser, then rebuild.',
    )
  }
  for (const { page, line } of dynamic) {
    warn(`[mermaid] <Mermaid chart={…}> in ${page} near line ${line} is not a static string and can't be pre-rendered.`)
  }
  for (const key of available) {
    if (!referenced.has(key)) {
      warn(`[mermaid] ${key}.svg isn't used by any page: it is not bundled (delete it to keep the folder clean).`)
    }
  }

  console.log(`[mermaid] ${referenced.size - missing}/${referenced.size} diagram(s) pre-rendered, no mermaid.js in the bundle`)
}
