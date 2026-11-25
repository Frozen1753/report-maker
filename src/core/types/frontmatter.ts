import type { ComponentType } from "react";
import type { Author } from "../config";

/**
 * "<value> · <report title>" by default; the object form can drop the report title.
 *   title: "Home"
 *   title: { value: "Report Maker - Home", concatenate: false }
 */
export type TitleSetting = string | { value: string; concatenate?: boolean };

/**
 * In the YAML, an asset is a path relative to the page: "./logo.svg" (a URL, shown
 * in an <img>) or "./logo.svg?react" (a component, which follows the theme through
 * currentColor). The build turns the path into the imported value.
 */
export type AssetRef = string | ComponentType<{ "aria-label"?: string }>;

/** The YAML frontmatter of a page. Every field is optional. */
export interface PageFrontmatter {
  title?: TitleSetting;
  /** Replaces the last segment of the route; a leading "/" gives the whole route. Read at build time. */
  slug?: string;
  /** In dev only: the page is not part of the build. Read at build time. */
  devOnly?: boolean;
  /** Overrides report.config.tsx for this page. */
  header?: { title?: string; logo?: AssetRef; logoAlt?: string };
  /** `false` hides the cover page; an object shows it and overrides report.config.tsx. */
  cover?:
  | false
  | {
    title?: string;
    /** "YYYY-MM-DD" (quoted), shown in the reader's language. */
    date?: string;
    media?: { img?: AssetRef; href?: string; alt?: string };
    authors?: Author[];
    affiliations?: string[];
  };
  /** Table of contents. Default: true. */
  toc?: boolean | { title?: string };
  /** List of figures. Default: true. */
  lof?: boolean | { title?: string };
}
