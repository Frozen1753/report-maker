import fs from "node:fs";
import path from "node:path";
import { resolvePath } from "../paths.ts";

const warned = new Set<string>();
/** Several plugins scan the pages in the same build: say each thing once. */
function warnOnce(message: string): void {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(message);
}

export interface PageFile {
  /** Route the page is served at: "/", "/docs", "/docs/callout". */
  route: string;
  /** Absolute path of the .mdx file. */
  file: string;
}

/**
 * "docs/callout.mdx" -> "/docs/callout"; "docs/index.page.mdx" -> "/docs"; "index.page.mdx" -> "/".
 * `relativeFile` uses posix separators.
 */
export function routeOf(relativeFile: string): string {
  const withoutExt = relativeFile.replace(/\.page\.mdx$/, "");
  const route = "/" + withoutExt.replace(/(^|\/)index$/, "");
  return route.length > 1 ? route.replace(/\/$/, "") : "/";
}

/** .mdx files under `dir`, posix-relative, sorted. Names starting with "_" or "." are private: not pages. */
function listMdx(dir: string, base = ""): string[] {
  if (!fs.existsSync(dir)) return [];
  const found: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) found.push(...listMdx(path.join(dir, entry.name), rel));
    else if (entry.name.endsWith(".page.mdx")) found.push(rel);
  }
  return found.sort();
}

/**
 * The pages that go into the build, the home page first. The single place that
 * knows where pages live: the shiki and mermaid plugins both read this list.
 */
export function scanPages(root: string = process.cwd()): PageFile[] {
  const index = resolvePath("index", root);
  if (!fs.existsSync(index)) {
    throw new Error(`[pages] the home page is missing: expected ${path.relative(root, index)}`);
  }

  const pages: PageFile[] = [{ route: "/", file: index }];
  const dir = resolvePath("pages", root);

  for (const rel of listMdx(dir)) {
    const route = routeOf(rel);
    const clash = pages.find((p) => p.route === route);
    if (clash) {
      warnOnce(
        `[pages] ${rel} maps to ${route}, already served by ${path.relative(root, clash.file).split(path.sep).join("/")}: ignored.`,
      );
      continue;
    }
    if (!/^[A-Za-z0-9._~\/-]+$/.test(route)) {
      warnOnce(`[pages] ${rel} gives the route "${route}": avoid spaces and special characters in page names.`);
    }
    pages.push({ route, file: path.join(dir, rel) });
  }
  return pages;
}
