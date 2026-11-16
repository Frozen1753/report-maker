import path from "node:path";
import type { Root } from "mdast";
import type { Plugin } from "unified";
import { expandIncludes, type MdNode } from "./include.ts";

/**
 * page file -> the partials it includes, filled while pages are compiled.
 * The dev server uses it to reload a page when one of its partials changes
 * (Vite doesn't know about this dependency).
 */
export const includeGraph = new Map<string, Set<string>>();

export const normalizeFile = (file: string) => path.resolve(file.replace(/\?.*$/, "")).replace(/\\/g, "/");

/**
 * Must come BEFORE the numbering plugins (remark-heading-numbers, remark-figures)
 * in the remark plugin list, so the included content is numbered with the page.
 */
const remarkInclude: Plugin<[], Root> = function () {
  const processor = this;

  return (tree, file) => {
    // Without the path of the page, "./part.mdx" can't be resolved: fail loudly rather than leave a raw ::include.
    if (!file.path) throw new Error("[include] the MDX compiler gave no file path, so ::include can't resolve relative sources.");

    const dependencies = new Set<string>();
    expandIncludes(tree as unknown as MdNode, {
      file: file.path.replace(/\?.*$/, ""),
      parse: (source) => processor.parse(source) as unknown as MdNode,
      onDependency: (dependency) => dependencies.add(normalizeFile(dependency)),
    });
    includeGraph.set(normalizeFile(file.path), dependencies);
  };
};

export default remarkInclude;
