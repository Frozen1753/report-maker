import { createElement, type ReactNode } from "react";
import type { Author, CoverMedia, ReportConfig } from "../../config";
import type { AssetRef, PageFrontmatter, TitleSetting } from "../../types/frontmatter";

/** "<page> — <report>": the page first, because tabs cut the end of long titles. */
export function resolveDocumentTitle(reportTitle: string, setting?: TitleSetting): string {
  if (!setting) return reportTitle;
  if (typeof setting === "string") return `${setting} — ${reportTitle}`;
  return setting.concatenate === false ? setting.value : `${setting.value} — ${reportTitle}`;
}

/** "2026-11-13" is shown in the reader's language; anything else is shown as written. */
export function formatCoverDate(date?: string): string | undefined {
  if (!date) return undefined;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!iso) return date;

  const [year, month, day] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  const parsed = new Date(year, month - 1, day);
  if (parsed.getMonth() !== month - 1 || parsed.getDate() !== day) return date; // 2026-02-31

  return parsed.toLocaleDateString(typeof navigator === "undefined" ? undefined : navigator.languages, {
    dateStyle: "long",
  });
}

/** A URL goes in an <img>; a component (from "./x.svg?react") is rendered as is. */
function assetToNode(asset: AssetRef | undefined, alt?: string): ReactNode {
  if (!asset) return undefined;
  if (typeof asset === "string") return createElement("img", { src: asset, alt: alt ?? "" });
  return createElement(asset, { "aria-label": alt });
}

export interface ResolvedHeader {
  title: string;
  logo?: ReactNode;
  logoAlt?: string;
}

export interface ResolvedCover {
  title: string;
  coverMedia?: CoverMedia;
  date?: string;
  authors?: Author[];
  affiliations?: string[];
}

export interface ResolvedPage {
  documentTitle: string;
  header: ResolvedHeader;
  /** null: no cover page on this page. */
  cover: ResolvedCover | null;
  toc: boolean;
  tocTitle?: string;
  lof: boolean;
  lofTitle?: string;
}

/**
 * What a page shows, from report.config.tsx and the frontmatter of the page.
 * The frontmatter wins, field by field; lists (authors, affiliations) are
 * replaced, not merged. The cover page is shown on the home page and on any page
 * whose frontmatter has a `cover` object; `cover: false` hides it.
 */
export function resolvePageConfig(
  config: ReportConfig,
  frontmatter: PageFrontmatter = {},
  isHome = false,
): ResolvedPage {
  const fmHeader = frontmatter.header;
  const logoAlt = fmHeader?.logoAlt ?? config.header?.logoAlt;
  const header: ResolvedHeader = {
    title: fmHeader?.title ?? config.header?.title ?? config.title,
    logo: fmHeader?.logo ? assetToNode(fmHeader.logo, logoAlt) : config.header?.logo,
    logoAlt,
  };

  const fmCover = typeof frontmatter.cover === "object" ? frontmatter.cover : undefined;
  const wantsCover = frontmatter.cover === undefined ? isHome : frontmatter.cover !== false;

  let cover: ResolvedCover | null = null;
  if (wantsCover) {
    const fmMedia = fmCover?.media;
    const baseMedia = config.cover?.media;
    const content = fmMedia?.img ? assetToNode(fmMedia.img, fmMedia.alt) : baseMedia?.content;

    cover = {
      title: fmCover?.title ?? config.cover?.title ?? config.title,
      coverMedia: content
        ? { content, href: fmMedia?.href ?? baseMedia?.href, ariaLabel: fmMedia?.alt ?? baseMedia?.ariaLabel }
        : undefined,
      date: formatCoverDate(fmCover?.date ?? config.cover?.date),
      authors: fmCover?.authors ?? config.cover?.authors,
      affiliations: fmCover?.affiliations ?? config.cover?.affiliations,
    };
  }

  return {
    documentTitle: resolveDocumentTitle(config.title, frontmatter.title),
    header,
    cover,
    toc: frontmatter.toc !== false,
    tocTitle: typeof frontmatter.toc === "object"
      ? frontmatter.toc.title
      : config.toc?.title,
    lof: frontmatter.lof !== false,
    lofTitle: typeof frontmatter.lof === "object"
      ? frontmatter.lof.title
      : config.lof?.title,
  };
}
