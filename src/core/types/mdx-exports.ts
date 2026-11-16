import type { ComponentType, ElementType } from "react";

/**
 * Shapes of the data the remark plugins (build/mdx) inject into the compiled
 * MDX module: `export const toc` and `export const figures`.
 */

export interface TocEntry {
  id: string;
  depth: number;
  /** e.g. "2.1" */
  number: string;
  text: string;
}

export interface FigureEntry {
  id: string;
  /** e.g. "3" */
  number: string;
  /** Plain-text caption ("" if none) */
  caption: string;
}

/** The YAML frontmatter a page may start with. Every field is optional. */
export interface PageFrontmatter {
  /** Browser tab title: "<title> · <report title>". */
  title?: string;
  /** Show the cover page. Default: only on the home page. */
  cover?: boolean;
  /** Show the table of contents. Default: true. */
  toc?: boolean;
  /** Show the list of figures. Default: true. */
  figures?: boolean;
}

/** What importing a compiled .mdx page gives. */
export interface MDXModule {
  default: ComponentType<{ components?: Record<string, ElementType> }>;
  toc: TocEntry[];
  figures: FigureEntry[];
  /** Absent when the page has no frontmatter. */
  frontmatter?: PageFrontmatter;
}
