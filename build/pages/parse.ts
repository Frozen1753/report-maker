import { createProcessor } from "@mdx-js/mdx";
import fs from "node:fs";
import type { Root } from "mdast";
import { expandIncludes, type MdNode } from "../mdx/include.ts";
import { scanPages, type PageFile, type ScanCommand } from "./scan.ts";

export type MdxOptions = NonNullable<Parameters<typeof createProcessor>[0]>;

export interface ParsedPage extends PageFile {
  /** The syntax tree with every ::include already replaced by its content. */
  tree: Root;
}

interface CacheEntry {
  mtimeMs: number;
  /** The partials the page includes, with their modification time. */
  dependencies: Map<string, number>;
  tree: Root;
}
const cache = new Map<string, CacheEntry>();

const upToDate = (hit: CacheEntry, mtimeMs: number) =>
  hit.mtimeMs === mtimeMs &&
  [...hit.dependencies].every(([file, time]) => fs.existsSync(file) && fs.statSync(file).mtimeMs === time);

/**
 * Every page of the build, parsed (never transformed: only the syntax tree is
 * needed), with its ::include directives expanded. Shared by the shiki and
 * mermaid plugins, so a page is parsed once and the code blocks and diagrams of
 * its partials are seen.
 *
 * `remarkPlugins` must be the SAME as mdx()'s: the parser has to understand the
 * syntax of the pages (frontmatter, directives, GFM...). Only their parser
 * extensions matter here; their transformers are never run.
 */
export function parsePages(
  root: string,
  remarkPlugins: MdxOptions["remarkPlugins"],
  command: ScanCommand = "build",
): ParsedPage[] {
  return scanPages(root, command).map((page) => {
    const { mtimeMs } = fs.statSync(page.file);

    const hit = cache.get(page.file);
    if (hit && upToDate(hit, mtimeMs)) return { ...page, tree: hit.tree };

    const processor = createProcessor({ remarkPlugins });
    const dependencies = new Map<string, number>();
    let tree: Root;
    try {
      tree = processor.parse(fs.readFileSync(page.file, "utf-8"));
      expandIncludes(tree as unknown as MdNode, {
        file: page.file,
        parse: (source) => processor.parse(source) as unknown as MdNode,
        onDependency: (dependency) => dependencies.set(dependency, fs.statSync(dependency).mtimeMs),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // An include error already says where; a parse error doesn't.
      throw new Error(message.startsWith("[include]") ? message : `[pages] couldn't parse ${page.label}: pass the same remarkPlugins as mdx() to the plugin. ${message}`);
    }
    cache.set(page.file, { mtimeMs, dependencies, tree });
    return { ...page, tree };
  });
}
