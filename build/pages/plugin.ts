import path from "node:path";
import type { Plugin } from "vite";
import { resolvePath } from "../paths.ts";
import { scanPages, type PageFile } from "./scan.ts";

/**
 * `virtual:report-pages`: the route table of the report, generated from the
 * files on disk (see scan.ts). The app imports this and nothing else about pages.
 *
 *   export const pages    // [{ route, module?, load() }]  (404 excluded)
 *   export const notFound // the 404 page entry, or null
 *
 * Single-file and hybrid builds use static imports: every chunk would be inlined
 * into the one HTML anyway, so there is nothing to gain from import(). Dev and
 * folder builds import lazily, one chunk per page.
 */

const VIRTUAL_ID = "virtual:report-pages";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

export interface PagesPluginOptions {
  /** Static imports (single-file / hybrid builds). Only applies to `vite build`. */
  eager: boolean;
}

/** Root-relative module id Vite resolves on every OS: "/report/pages/docs/callout.mdx". */
function moduleId(root: string, file: string): string {
  return "/" + path.relative(root, file).split(path.sep).join("/");
}

export function generatePagesModule(pages: PageFile[], root: string, eager: boolean): string {
  const imports: string[] = [];

  const entryOf = (page: PageFile, index: number): string => {
    const id = JSON.stringify(moduleId(root, page.file));
    const route = JSON.stringify(page.route);
    if (!eager) return `{ route: ${route}, load: () => import(${id}) }`;
    imports.push(`import * as page_${index} from ${id}`);
    return `{ route: ${route}, module: page_${index}, load: () => Promise.resolve(page_${index}) }`;
  };

  const entries = pages.map((page, index) => ({ page, source: entryOf(page, index) }));
  const regular = entries.filter(({ page }) => page.route !== "/[not_found]").map(({ source }) => source);
  const notFound = entries.find(({ page }) => page.route === "/[not_found]")?.source ?? "null";

  return [
    ...imports,
    `export const pages = [\n  ${regular.join(",\n  ")}\n]`,
    `export const notFound = ${notFound}`,
  ].join("\n");
}

export function pagesPlugin({ eager }: PagesPluginOptions): Plugin {
  let root = process.cwd();
  let isBuild = false;

  return {
    name: "report-maker:pages",

    configResolved(config) {
      root = config.root;
      isBuild = config.command === "build";
    },

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    load(id) {
      if (id !== RESOLVED_ID) return;
      return generatePagesModule(scanPages(root), root, isBuild && eager);
    },

    configureServer(server) {
      // A page added or removed changes the route table: regenerate it and reload.
      const isPageFile = (file: string) => {
        const f = path.resolve(file);
        return (
          f.endsWith(".page.mdx") &&
          (f === resolvePath("index", root) || f.startsWith(resolvePath("pages", root) + path.sep))
        );
      };
      const refresh = (file: string) => {
        if (!isPageFile(file)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.hot.send({ type: "full-reload" });
      };
      server.watcher.on("add", refresh);
      server.watcher.on("unlink", refresh);
    },
  };
}
