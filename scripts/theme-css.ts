import postcss, { type Root, type Rule, type ChildNode } from 'postcss'

export type ThemeVars = Record<string, string>

export interface ParsedTheme {
  /** Variables declared in :root */
  light: ThemeVars
  /** Variables declared in :root[data-theme="dark"] (overrides only) */
  dark: ThemeVars
}

export const DARK_SELECTOR = ':root[data-theme="dark"]'
export const FONTS_BLOCK_START = 'theme-panel:fonts:start'
export const FONTS_BLOCK_END = 'theme-panel:fonts:end'

const normalize = (selector: string) => selector.replace(/\s+/g, '').replace(/["']/g, '')

const isLightRule = (rule: Rule) => normalize(rule.selector) === ':root'
const isDarkRule = (rule: Rule) => {
  const s = normalize(rule.selector)
  return s === ':root[data-theme=dark]' || s === '[data-theme=dark]'
}

/** Top-level rules only: we never touch variables nested in @media, etc. */
function topLevelRules(root: Root, match: (rule: Rule) => boolean): Rule[] {
  return root.nodes.filter((n): n is Rule => n.type === 'rule' && match(n))
}

function collect(rules: Rule[]): ThemeVars {
  const vars: ThemeVars = {}
  for (const rule of rules) {
    rule.each((node) => {
      if (node.type === 'decl' && node.prop.startsWith('--')) vars[node.prop] = node.value
    })
  }
  return vars
}

export function parseTheme(css: string): ParsedTheme {
  const root = postcss.parse(css)
  return {
    light: collect(topLevelRules(root, isLightRule)),
    dark: collect(topLevelRules(root, isDarkRule)),
  }
}

function setDecl(rules: Rule[], prop: string, value: string): boolean {
  let found = false
  for (const rule of rules) {
    rule.each((node) => {
      if (node.type === 'decl' && node.prop === prop) {
        node.value = value
        found = true
      }
    })
  }
  return found
}

function removeDecl(rules: Rule[], prop: string) {
  for (const rule of rules) {
    rule.each((node) => {
      if (node.type === 'decl' && node.prop === prop) node.remove()
    })
  }
}

export interface UpdateThemeInput {
  /** Full set of light values to write (only the given keys are touched) */
  light: ThemeVars
  /** Dark OVERRIDES: a dark value equal to the light one is dropped from the dark block */
  dark: ThemeVars
  /** Variables to delete from :root (and from the dark block) */
  remove?: string[]
  /**
   * Raw CSS for the managed fonts block (@import / @font-face). Optional —
   * the panel UI no longer sends this (dropped in favor of hand-writing
   * fonts directly in style.css), but the engine still supports it if you
   * want to drive it some other way later. Omitted/empty removes the block.
   */
  fontsBlock?: string
}

export function updateTheme(css: string, input: UpdateThemeInput): string {
  const root = postcss.parse(css)

  // ---------- light ----------
  let lightRules = topLevelRules(root, isLightRule)
  if (lightRules.length === 0) {
    const created = postcss.rule({ selector: ':root', raws: { before: '\n\n', between: ' ', after: '\n' } })
    root.append(created)
    lightRules = [created]
  }
  for (const [prop, value] of Object.entries(input.light)) {
    if (!setDecl(lightRules, prop, value)) {
      lightRules[lightRules.length - 1].append(postcss.decl({ prop, value }))
    }
  }

  // ---------- dark (overrides only) ----------
  let darkRules = topLevelRules(root, isDarkRule)
  for (const [prop, value] of Object.entries(input.dark)) {
    if (value === input.light[prop]) {
      removeDecl(darkRules, prop)
      continue
    }
    if (darkRules.length === 0) {
      const created = postcss.rule({ selector: DARK_SELECTOR, raws: { before: '\n\n', between: ' ', after: '\n' } })
      root.insertAfter(lightRules[lightRules.length - 1], created)
      darkRules = [created]
    }
    if (!setDecl(darkRules, prop, value)) {
      darkRules[darkRules.length - 1].append(postcss.decl({ prop, value }))
    }
  }
  // Dark vars that the panel no longer sends are dropped too (user reset them)
  const keepDark = new Set(Object.keys(input.dark))
  for (const rule of darkRules) {
    rule.each((node) => {
      if (node.type === 'decl' && node.prop.startsWith('--') && !keepDark.has(node.prop)) {
        // only drop vars the panel knows about (present in light map)
        if (node.prop in input.light) node.remove()
      }
    })
  }

  for (const prop of input.remove ?? []) {
    removeDecl(lightRules, prop)
    removeDecl(darkRules, prop)
  }
  for (const rule of darkRules) if (rule.nodes.length === 0) rule.remove()

  // ---------- managed fonts block (optional, see UpdateThemeInput) ----------
  applyFontsBlock(root, input.fontsBlock ?? '')

  return root.toString()
}

function applyFontsBlock(root: Root, block: string) {
  const isMarker = (n: ChildNode, marker: string) => n.type === 'comment' && n.text.trim().startsWith(marker)
  const start = root.nodes.findIndex((n) => isMarker(n, FONTS_BLOCK_START))
  const end = root.nodes.findIndex((n) => isMarker(n, FONTS_BLOCK_END))
  if (start !== -1 && end !== -1 && end >= start) {
    for (const node of root.nodes.slice(start, end + 1)) node.remove()
  }
  if (!block.trim()) return

  const nodes = [...postcss.parse(block).nodes] // copy: prepend/insertAfter move nodes out of the source root

  // @import must come first — but after an optional @charset
  const first = root.nodes[0]
  if (first && first.type === 'atrule' && first.name === 'charset') {
    root.insertAfter(first, nodes)
  } else {
    root.prepend(...nodes)
  }

  // PostCSS rewrites raws.before on insertion, so set the layout AFTER inserting:
  // one node per line, blank line between the managed block and the rest of the file.
  nodes.forEach((n, i) => {
    n.raws.before = i === 0 ? '' : '\n'
  })
  const after = nodes[nodes.length - 1].next()
  if (after) after.raws.before = '\n\n'
}
