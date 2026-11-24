import type { Root } from 'mdast'
import { visit } from 'unist-util-visit'
import { parsePages, type MdxOptions } from '../pages/parse.ts'
import { mermaidKey, normalizeChart } from '../../src/core/utils/shared/mermaid-shared.ts'

/**
 * Finds the diagrams of the report: ```mermaid fences and <Mermaid chart="…" />,
 * in every page and in the partials they ::include (see pages/parse.ts).
 */

interface EstreeExpression {
  type: string
  value?: unknown
  expressions?: unknown[]
  quasis?: { value: { cooked?: string | null } }[]
}
interface LooseAttr {
  type: string
  name?: string
  value?:
  | string
  | { type: string; value: string; data?: { estree?: { body?: { expression?: EstreeExpression }[] } } }
  | null
}
interface LooseNode {
  type: string
  lang?: string | null
  value?: string
  name?: string | null
  attributes?: LooseAttr[]
  position?: { start: { line: number } }
}

/** The chart attribute as a string, or null if it isn't a static string. */
function staticString(attr: LooseAttr): string | null {
  const v = attr.value
  if (typeof v === 'string') return v
  if (!v) return null

  const expr = v.data?.estree?.body?.[0]?.expression
  if (expr?.type === 'Literal' && typeof expr.value === 'string') return expr.value
  if (expr?.type === 'TemplateLiteral' && expr.expressions?.length === 0) {
    return expr.quasis?.[0]?.value.cooked ?? null
  }

  // No estree available: accept a plain `...` template literal without escapes.
  const raw = v.value.trim()
  if (raw.startsWith('`') && raw.endsWith('`') && !raw.includes('${') && !raw.includes('\\')) {
    return raw.slice(1, -1)
  }
  return null
}

/** Calls `onChart` for every static diagram of the tree, `onDynamic` for the ones that can't be read. */
export function collectMermaid(
  tree: Root,
  onChart: (source: string) => void,
  onDynamic: (line: number) => void,
): void {
  visit(tree, (node) => {
    const n = node as unknown as LooseNode

    // ```mermaid fences
    if (n.type === 'code' && n.lang === 'mermaid' && typeof n.value === 'string') {
      onChart(n.value)
      return
    }

    // <Mermaid chart={`...`} />
    if ((n.type === 'mdxJsxFlowElement' || n.type === 'mdxJsxTextElement') && n.name === 'Mermaid') {
      const attr = n.attributes?.find((a) => a.type === 'mdxJsxAttribute' && a.name === 'chart')
      const source = attr ? staticString(attr) : null
      if (source !== null) onChart(source)
      else onDynamic(n.position?.start.line ?? 0)
    }
  })
}

// ---------------------------------------------------------------------------

export interface Diagram {
  chart: string
  /** Pages using it, for messages. */
  pages: Set<string>
}

export interface DynamicChart {
  page: string
  line: number
}

/** Every static diagram used by the pages (by key), and the `<Mermaid chart={…}>` that can't be read. */
export function collectReferenced(
  root: string,
  remarkPlugins: MdxOptions['remarkPlugins'],
  command: 'serve' | 'build',
): { referenced: Map<string, Diagram>; dynamic: DynamicChart[] } {
  const referenced = new Map<string, Diagram>()
  const dynamic: DynamicChart[] = []
  for (const page of parsePages(root, remarkPlugins, command)) {
    collectMermaid(
      page.tree,
      (source) => {
        const key = mermaidKey(source)
        const known = referenced.get(key) ?? { chart: normalizeChart(source), pages: new Set<string>() }
        known.pages.add(page.label)
        referenced.set(key, known)
      },
      (line) => dynamic.push({ page: page.label, line }),
    )
  }
  return { referenced, dynamic }
}
