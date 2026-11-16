import { createProcessor } from "@mdx-js/mdx";
import fs from "node:fs";
import path from "node:path";
import type { Root } from "mdast";
import { scanPages, type PageFile } from "./scan.ts";

export type MdxOptions = NonNullable<Parameters<typeof createProcessor>[0]>;

export interface ParsedPage extends PageFile {
  /** Project-relative path, for messages: "report/pages/docs/callout.mdx". */
  label: string;
  tree: Root;
}

const cache = new Map<string, { mtimeMs: number; tree: Root }>();

/**
 * Every page of the build, parsed (never transformed: only the syntax tree is
 * needed). Shared by the shiki and mermaid plugins, so a page is parsed once.
 *
 * `remarkPlugins` must be the SAME as mdx()'s: the parser has to understand the
 * syntax of the pages (directives, GFM...). Only their parser extensions matter
 * here; their transformers are never run.
 */
export function parsePages(root: string, remarkPlugins: MdxOptions["remarkPlugins"]): ParsedPage[] {
  return scanPages(root).map((page) => {
    const label = path.relative(root, page.file).split(path.sep).join("/");
    const { mtimeMs } = fs.statSync(page.file);

    const hit = cache.get(page.file);
    if (hit && hit.mtimeMs === mtimeMs) return { ...page, label, tree: hit.tree };

    let tree: Root;
    try {
      tree = createProcessor({ remarkPlugins }).parse(fs.readFileSync(page.file, "utf-8"));
    } catch (error) {
      throw new Error(
        `[pages] couldn't parse ${label}: pass the same remarkPlugins as mdx() to the plugin. ` +
          (error instanceof Error ? error.message : String(error)),
      );
    }
    cache.set(page.file, { mtimeMs, tree });
    return { ...page, label, tree };
  });
}
