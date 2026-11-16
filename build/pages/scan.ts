import fs from "node:fs";
import path from "node:path";
import type { PageFrontmatter } from "../../src/core/types/frontmatter.ts";
import { resolvePath } from "../paths.ts";
import { readFrontmatter, validateFrontmatter } from "./frontmatter.ts";

/** Only these files are pages. Any other .mdx is a component a page can import. */
export const PAGE_SUFFIX = ".page.mdx";
/** The page shown for an unknown route: report/pages/[not_found].page.mdx */
export const NOT_FOUND_ROUTE = "/[not_found]";
const NOT_FOUND_FILE = `[not_found]${PAGE_SUFFIX}`;

const SLUG = /^\/?[A-Za-z0-9._~-]+(?:\/[A-Za-z0-9._~-]+)*$/;

const warned = new Set<string>();
/** Several plugins scan the pages in the same build: say each thing once. */
function warnOnce(message: string): void {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(message);
}

export interface PageFile {
  /** Route the page is served at: "/", "/docs", "/docs/callout" (or NOT_FOUND_ROUTE). */
  route: string;
  /** Absolute path of the .page.mdx file. */
  file: string;
  /** Project-relative path, for messages. */
  label: string;
  /** Validated frontmatter ({} when the page has none). */
  frontmatter: PageFrontmatter;
}

/**
 * "docs/callout.page.mdx" -> "/docs/callout"; "docs/index.page.mdx" -> "/docs"; "index.page.mdx" -> "/".
 * `relativeFile` uses posix separators.
 */
export function routeOf(relativeFile: string): string {
  const withoutExt = relativeFile.endsWith(PAGE_SUFFIX) ? relativeFile.slice(0, -PAGE_SUFFIX.length) : relativeFile;
  const route = "/" + withoutExt.replace(/(^|\/)index$/, "");
  return route.length > 1 ? route.replace(/\/$/, "") : "/";
}

/** `slug` replaces the last segment of the route; with a leading "/" it is the whole route. */
export function applySlug(route: string, slug: string, label: string): string {
  if (!SLUG.test(slug)) {
    throw new Error(`[pages] ${label}: the slug "${slug}" is not valid. Use letters, digits and . _ ~ - (with "/" between segments).`);
  }
  if (slug.startsWith("/")) return slug;
  const segments = route.split("/").filter(Boolean);
  segments[segments.length - 1] = slug;
  return "/" + segments.join("/");
}

function listPages(dir: string, base = ""): string[] {
  if (!fs.existsSync(dir)) return [];
  const found: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) found.push(...listPages(path.join(dir, entry.name), rel));
    else if (entry.name.endsWith(PAGE_SUFFIX)) found.push(rel);
  }
  return found.sort();
}

export type ScanCommand = "serve" | "build";

/**
 * The pages of the report, the home page first. The single place that knows
 * where pages live and what their routes are: the pages plugin, shiki and
 * mermaid all read this list.
 *
 * `devOnly` pages are left out of a build. Two pages resolving to the same
 * route is an error in both modes, so it shows up while writing, not at release.
 */
export function scanPages(root: string = process.cwd(), command: ScanCommand = "build"): PageFile[] {
  const index = resolvePath("index", root);
  if (!fs.existsSync(index)) {
    throw new Error(`[pages] the home page is missing: expected ${path.relative(root, index).split(path.sep).join("/")}`);
  }

  const pagesDir = resolvePath("pages", root);
  const sources = [
    { file: index, rel: null as string | null },
    ...listPages(pagesDir).map((rel) => ({ file: path.join(pagesDir, rel), rel })),
  ];

  const byRoute = new Map<string, PageFile>();
  for (const { file, rel } of sources) {
    const label = path.relative(root, file).split(path.sep).join("/");
    const frontmatter = validateFrontmatter(readFrontmatter(fs.readFileSync(file, "utf-8"), label), label, warnOnce);

    const home = rel === null;
    const notFound = rel === NOT_FOUND_FILE;
    if ((home || notFound) && frontmatter.slug !== undefined) {
      throw new Error(`[pages] ${label}: ${home ? "the home page is always served at /" : "the not-found page has no route"}, remove "slug".`);
    }

    let route: string;
    if (home) route = "/";
    else if (notFound) route = NOT_FOUND_ROUTE;
    else {
      route = routeOf(rel);
      if (frontmatter.slug !== undefined) route = applySlug(route, frontmatter.slug, label);
      else if (!/^[A-Za-z0-9._~/-]+$/.test(route)) {
        warnOnce(`[pages] ${label} gives the route "${route}": avoid spaces and special characters in page names.`);
      }
    }

    const clash = byRoute.get(route);
    if (clash) throw new Error(`[pages] ${clash.label} and ${label} both resolve to ${route}: give one of them a different "slug".`);
    byRoute.set(route, { route, file, label, frontmatter });
  }

  const pages = [...byRoute.values()];
  return command === "build" ? pages.filter((page) => !page.frontmatter.devOnly) : pages;
}
