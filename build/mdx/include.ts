import fs from "node:fs";
import path from "node:path";

/**
 * `::include{src="./part.mdx"}` on its own line: the content of another .mdx
 * file is spliced into the page, as if it had been written there.
 *
 * It happens on the syntax tree, BEFORE the numbering plugins run, so headings,
 * figures, the table of contents and the figure list flow through the included
 * content. The scan used by shiki and mermaid calls the same function, so the
 * code blocks and diagrams of a partial are found too.
 *
 * No dependency on purpose (nodes are plain objects): it is used by a remark
 * plugin and by the scan, and it is easy to test.
 */

// mdast nodes come from several packages (directive, mdx...): not worth typing them all.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MdNode = Record<string, any>;

export interface IncludeOptions {
  /** Absolute path of the file `tree` comes from. */
  file: string;
  /** Parses MDX source into a tree, with the same parser as the page. */
  parse: (source: string) => MdNode;
  /** Called for each partial read: dependency tracking (dev reload, cache). */
  onDependency?: (file: string) => void;
  readFile?: (file: string) => string;
}

const posix = (p: string) => p.split(path.sep).join("/");
const shown = (p: string) => posix(path.relative(process.cwd(), p));
const isRelative = (spec: string) => /^\.\.?\//.test(spec);

function where(file: string, node: MdNode): string {
  const line = node.position?.start?.line;
  return `${shown(file)}${line ? `:${line}` : ""}`;
}

function rebaseSpec(spec: string, fromDir: string, toDir: string): string {
  if (!isRelative(spec)) return spec;
  const [, bare, suffix] = /^([^?#]*)(.*)$/.exec(spec)!;
  let next = posix(path.relative(toDir, path.resolve(fromDir, bare)));
  if (!next.startsWith(".")) next = "./" + next;
  return next + suffix;
}

/**
 * The partial was written for its own folder: "./assets/x.png" there is not the
 * same file from the page's folder. Rewrites what is a path to a file: images,
 * src/poster of JSX tags, and the sources of import/export statements.
 */
function rebase(node: MdNode, fromDir: string, toDir: string): void {
  switch (node.type) {
    case "image":
      if (typeof node.url === "string") node.url = rebaseSpec(node.url, fromDir, toDir);
      break;
    case "definition": // [id]: ./x.png  — only when it really points to a file
      if (
        typeof node.url === "string" &&
        isRelative(node.url) &&
        fs.existsSync(path.resolve(fromDir, node.url.replace(/[?#].*$/, "")))
      ) {
        node.url = rebaseSpec(node.url, fromDir, toDir);
      }
      break;
    case "mdxJsxFlowElement":
    case "mdxJsxTextElement":
      for (const attribute of node.attributes ?? []) {
        if (
          attribute.type === "mdxJsxAttribute" &&
          (attribute.name === "src" || attribute.name === "poster") &&
          typeof attribute.value === "string"
        ) {
          attribute.value = rebaseSpec(attribute.value, fromDir, toDir);
        }
      }
      break;
    case "mdxjsEsm":
      for (const statement of node.data?.estree?.body ?? []) {
        const source = statement.source;
        if (source && typeof source.value === "string" && isRelative(source.value)) {
          const originalRaw: string | undefined = source.raw;
          source.value = rebaseSpec(source.value, fromDir, toDir);
          source.raw = JSON.stringify(source.value);
          // Keep the source text in step with the tree: the deduplication of imports compares it.
          if (originalRaw && typeof node.value === "string") node.value = node.value.replace(originalRaw, source.raw);
        }
      }
      break;
  }
  for (const child of node.children ?? []) rebase(child, fromDir, toDir);
}

const normalized = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();

/** import/export statements must be at the top level of the page: move them there, once each. */
function hoist(tree: MdNode, statements: MdNode[]): void {
  if (statements.length === 0) return;
  const children: MdNode[] = (tree.children ??= []);
  const seen = new Set(children.filter((n) => n.type === "mdxjsEsm").map((n) => normalized(n.value)));
  const fresh = statements.filter((n) => {
    const key = normalized(n.value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  let at = 0;
  while (at < children.length && children[at].type === "yaml") at++; // after the frontmatter
  children.splice(at, 0, ...fresh);
}

function expand(tree: MdNode, file: string, stack: string[], options: IncludeOptions): void {
  const read = options.readFile ?? ((f: string) => fs.readFileSync(f, "utf-8"));
  const hoisted: MdNode[] = [];

  const walk = (parent: MdNode): void => {
    const children: MdNode[] | undefined = parent.children;
    if (!children) return;

    for (let i = 0; i < children.length; i++) {
      const node = children[i];

      if (node.name === "include" && node.type !== "leafDirective" && /Directive$/.test(node.type)) {
        throw new Error(`[include] ${where(file, node)}: write it on its own line, as ::include{src="./part.mdx"}.`);
      }
      if (node.type !== "leafDirective" || node.name !== "include") {
        walk(node);
        continue;
      }

      const src = node.attributes?.src;
      if (!src) throw new Error(`[include] ${where(file, node)}: ::include needs a source: ::include{src="./part.mdx"}.`);
      if (!/\.mdx?$/.test(src)) throw new Error(`[include] ${where(file, node)}: "${src}" is not a .mdx file.`);
      if (src.endsWith(".page.mdx")) {
        throw new Error(`[include] ${where(file, node)}: "${src}" is a page (it has its own route and frontmatter): include a plain .mdx file.`);
      }

      const partial = path.resolve(path.dirname(file), src);
      if (stack.includes(partial)) {
        const chain = [...stack, partial].map(shown).join(" -> ");
        throw new Error(`[include] ${where(file, node)}: include cycle: ${chain}`);
      }
      if (!fs.existsSync(partial)) {
        throw new Error(`[include] ${where(file, node)}: "${src}" not found (looked for ${shown(partial)}).`);
      }

      options.onDependency?.(partial);
      const partialTree = options.parse(read(partial));

      // A partial has no frontmatter of its own: it is the page's.
      partialTree.children = (partialTree.children ?? []).filter((n: MdNode) => n.type !== "yaml");

      expand(partialTree, partial, [...stack, partial], options); // its own includes first
      rebase(partialTree, path.dirname(partial), path.dirname(file));

      const blocks: MdNode[] = [];
      for (const n of partialTree.children) (n.type === "mdxjsEsm" ? hoisted : blocks).push(n);

      children.splice(i, 1, ...blocks);
      i += blocks.length - 1;
    }
  };

  walk(tree);
  hoist(tree, hoisted);
}

/** Replaces every ::include of `tree` by the content of the file it names, in place. */
export function expandIncludes(tree: MdNode, options: IncludeOptions): void {
  expand(tree, path.resolve(options.file), [path.resolve(options.file)], options);
}
