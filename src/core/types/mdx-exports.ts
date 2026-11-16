import type { ComponentType, ElementType } from "react";
import type { PageFrontmatter } from "./frontmatter";

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

/** What importing a compiled .page.mdx gives. */
export interface MDXModule {
  default: ComponentType<{ components?: Record<string, ElementType> }>;
  toc: TocEntry[];
  figures: FigureEntry[];
  /** Absent when the page has no frontmatter. */
  frontmatter?: PageFrontmatter;
}
