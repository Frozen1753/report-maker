import postcss, {
  type AtRule,
  type ChildNode,
  type Root,
  type Rule,
} from "postcss";

export type ThemeVars = Record<string, string>;

export interface ParsedTheme {
  /** Variables declared in the top-level @theme block(s) */
  light: ThemeVars;
  /** Variables declared in [data-theme="dark"] (overrides only) */
  dark: ThemeVars;
}

export const LIGHT_AT_RULE = "theme";
export const DARK_SELECTOR = '[data-theme="dark"]';
export const FONTS_BLOCK_START = "theme-panel:fonts:start";
export const FONTS_BLOCK_END = "theme-panel:fonts:end";

/** A node holding declarations: both `@theme { }` and `[data-theme="dark"] { }` qualify. */
type Block = AtRule | Rule;

const normalize = (selector: string) =>
  selector.replace(/\s+/g, "").replace(/["']/g, "");

/** `@theme`, `@theme inline`, `@theme static`: all hold light values */
const isLightBlock = (n: ChildNode): n is AtRule =>
  n.type === "atrule" && n.name === LIGHT_AT_RULE;

const isDarkBlock = (n: ChildNode): n is Rule => {
  if (n.type !== "rule") return false;
  const s = normalize(n.selector);
  return s === "[data-theme=dark]" || s === ":root[data-theme=dark]";
};

/** Top-level blocks only: we never touch variables nested in @media, @layer, etc. */
function topLevelBlocks<T extends Block>(
  root: Root,
  match: (node: ChildNode) => node is T,
): T[] {
  return root.nodes.filter(match);
}

function collect(blocks: Block[]): ThemeVars {
  const vars: ThemeVars = {};
  for (const block of blocks) {
    block.each((node) => {
      if (node.type !== "decl" || !node.prop.startsWith("--")) return;
      // Namespace resets such as `--color-*: initial` are not editable values
      if (node.prop.includes("*")) return;
      vars[node.prop] = node.value;
    });
  }
  return vars;
}

export function parseTheme(css: string): ParsedTheme {
  const root = postcss.parse(css);
  return {
    light: collect(topLevelBlocks(root, isLightBlock)),
    dark: collect(topLevelBlocks(root, isDarkBlock)),
  };
}

function setDecl(blocks: Block[], prop: string, value: string): boolean {
  let found = false;
  for (const block of blocks) {
    block.each((node) => {
      if (node.type === "decl" && node.prop === prop) {
        node.value = value;
        found = true;
      }
    });
  }
  return found;
}

function removeDecl(blocks: Block[], prop: string) {
  for (const block of blocks) {
    block.each((node) => {
      if (node.type === "decl" && node.prop === prop) node.remove();
    });
  }
}

export interface UpdateThemeInput {
  /** Full set of light values to write (only the given keys are touched) */
  light: ThemeVars;
  /** Dark OVERRIDES: a dark value equal to the light one is dropped from the dark block */
  dark: ThemeVars;
  /** Variables to delete from @theme (and from the dark block) */
  remove?: string[];
  /**
   * Raw CSS for the managed fonts block (@import / @font-face). Optional:
   * the panel UI no longer sends this (dropped in favor of hand-writing
   * fonts directly in style.css), but the engine still supports it if you
   * want to drive it some other way later. Omitted/empty removes the block.
   */
  fontsBlock?: string;
}

export function updateTheme(css: string, input: UpdateThemeInput): string {
  const root = postcss.parse(css);

  // ---------- light (@theme) ----------
  const foundLight = topLevelBlocks(root, isLightBlock);
  let lastLight: Block | undefined = foundLight.at(-1);
  if (!lastLight) {
    lastLight = postcss.atRule({
      name: LIGHT_AT_RULE,
      nodes: [],
      raws: { before: "\n\n", between: " ", after: "\n" },
    });
    root.append(lastLight);
  }
  const lightBlocks: Block[] = foundLight.length > 0 ? foundLight : [lastLight];

  for (const [prop, value] of Object.entries(input.light)) {
    if (!setDecl(lightBlocks, prop, value)) {
      lastLight.append(postcss.decl({ prop, value }));
    }
  }

  // ---------- dark (overrides only) ----------
  let darkBlocks: Block[] = topLevelBlocks(root, isDarkBlock);
  let lastDark: Block | undefined = darkBlocks.at(-1);

  for (const [prop, value] of Object.entries(input.dark)) {
    if (value === input.light[prop]) {
      removeDecl(darkBlocks, prop);
      continue;
    }
    if (!lastDark) {
      lastDark = postcss.rule({
        selector: DARK_SELECTOR,
        raws: { before: "\n\n", between: " ", after: "\n" },
      });
      root.insertAfter(lastLight, lastDark);
      darkBlocks = [lastDark];
    }
    if (!setDecl(darkBlocks, prop, value)) {
      lastDark.append(postcss.decl({ prop, value }));
    }
  }

  // Dark vars that the panel no longer sends are dropped too (user reset them)
  const keepDark = new Set(Object.keys(input.dark));
  for (const block of darkBlocks) {
    block.each((node) => {
      if (
        node.type !== "decl" ||
        !node.prop.startsWith("--") ||
        keepDark.has(node.prop)
      )
        return;
      // only drop vars the panel knows about (present in light map)
      if (node.prop in input.light) node.remove();
    });
  }

  for (const prop of input.remove ?? []) {
    removeDecl(lightBlocks, prop);
    removeDecl(darkBlocks, prop);
  }
  // `first` is undefined for an empty block, and (unlike `nodes`) is safely typed
  for (const block of darkBlocks) if (block.first === undefined) block.remove();

  // ---------- managed fonts block (optional, see UpdateThemeInput) ----------
  applyFontsBlock(root, input.fontsBlock ?? "");

  return root.toString();
}

function applyFontsBlock(root: Root, block: string) {
  const isMarker = (n: ChildNode, marker: string) =>
    n.type === "comment" && n.text.trim().startsWith(marker);
  const start = root.nodes.findIndex((n) => isMarker(n, FONTS_BLOCK_START));
  const end = root.nodes.findIndex((n) => isMarker(n, FONTS_BLOCK_END));
  if (start !== -1 && end !== -1 && end >= start) {
    for (const node of root.nodes.slice(start, end + 1)) node.remove();
  }
  if (!block.trim()) return;

  const nodes = [...postcss.parse(block).nodes]; // copy: prepend/insertAfter move nodes out of the source root

  // @import must come first, but after an optional @charset
  const first = root.nodes[0];
  if (first && first.type === "atrule" && first.name === "charset") {
    root.insertAfter(first, nodes);
  } else {
    root.prepend(...nodes);
  }

  // PostCSS rewrites raws.before on insertion, so set the layout AFTER inserting:
  // one node per line, blank line between the managed block and the rest of the file.
  nodes.forEach((n, i) => {
    n.raws.before = i === 0 ? "" : "\n";
  });
  const after = nodes.at(-1)?.next();
  if (after) after.raws.before = "\n\n";
}
