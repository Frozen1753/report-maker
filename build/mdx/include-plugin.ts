import type { Plugin } from "vite";
import { includeGraph, normalizeFile } from "./remark-include.ts";

/**
 * Dev only: a page and the partials it includes are separate files, but Vite only
 * knows the page. When a partial changes, tell Vite to reload the pages using it.
 */
export function includePlugin(): Plugin {
  return {
    name: "report-maker:include",
    apply: "serve",

    configureServer(server) {
      server.watcher.on("change", (changed) => {
        const file = normalizeFile(changed);

        for (const [page, dependencies] of includeGraph) {
          if (!dependencies.has(file)) continue;

          const modules = server.moduleGraph.getModulesByFile(page);
          if (!modules || modules.size === 0) continue;
          for (const mod of modules) {
            if (typeof server.reloadModule === "function") void server.reloadModule(mod);
            else server.hot.send({ type: "full-reload" });
          }
        }
      });
    },
  };
}
