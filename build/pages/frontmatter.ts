import { parse } from "yaml";
import type { PageFrontmatter } from "../../src/core/types/frontmatter.ts";

/** The YAML between the two "---" lines at the very top of the file, parsed ({} when there is none). */
export function readFrontmatter(source: string, label: string): unknown {
  const lines = source.replace(/^\uFEFF/, "").split(/\r?\n/);
  if (lines[0]?.trimEnd() !== "---") return {};

  const end = lines.findIndex((line, i) => i > 0 && line.trimEnd() === "---");
  if (end === -1) throw new Error(`[pages] the frontmatter of ${label} is never closed: add a closing "---" line.`);

  try {
    return parse(lines.slice(1, end).join("\n")) ?? {};
  } catch (error) {
    throw new Error(`[pages] invalid YAML in the frontmatter of ${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ---------------------------------------------------------------------------

const KEYS = {
  page: ["title", "slug", "devOnly", "header", "cover", "toc", "lof"],
  toc: ["title"],
  lof: ["title"],
  title: ["value", "concatenate"],
  header: ["title", "logo", "logoAlt"],
  cover: ["title", "date", "media", "authors", "affiliations"],
  media: ["img", "href", "alt"],
  author: ["firstName", "lastName", "alias", "href"],
} as const;

const plain = (key: string) => key.toLowerCase().replace(/[_-]/g, "");

/** Edit distance: "titel" is 2 away from "title". */
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[b.length];
}

/** The allowed key the unknown one most likely meant: same letters ("dev_only"), or a typo (2 edits at most). */
function suggest(key: string, allowed: readonly string[]): string | undefined {
  const same = allowed.find((a) => plain(a) === plain(key));
  if (same) return same;
  const near = allowed
    .map((a) => ({ a, d: distance(plain(a), plain(key)) }))
    .filter(({ a, d }) => d <= 2 && plain(a).length >= 4)
    .sort((x, y) => x.d - y.d)[0];
  return near?.a;
}

type Obj = Record<string, unknown>;

/**
 * Checks the frontmatter against PageFrontmatter. A wrong type is an error (it
 * names the page and the field); an unknown key is only a warning, with a
 * suggestion when it looks like a typo ("dev_only" -> "devOnly").
 */
export function validateFrontmatter(data: unknown, label: string, warn: (message: string) => void): PageFrontmatter {
  const fail = (path: string, expected: string): never => {
    throw new Error(`[pages] ${label}: "${path}" in the frontmatter must be ${expected}.`);
  };

  const object = (value: unknown, path: string): Obj =>
    typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Obj) : fail(path, "an object");
  const string = (value: unknown, path: string): void => {
    if (value instanceof Date) fail(path, 'a quoted string (write the date between quotes: "2026-11-13")');
    if (typeof value !== "string") fail(path, "a string");
  };
  const boolean = (value: unknown, path: string): void => {
    if (typeof value !== "boolean") fail(path, "true or false");
  };
  const keys = (value: Obj, allowed: readonly string[], path: string): void => {
    for (const key of Object.keys(value)) {
      if (allowed.includes(key)) continue;
      const guess = suggest(key, allowed);
      warn(`[pages] ${label}: unknown frontmatter key "${path}${key}"${guess ? ` — did you mean "${guess}"?` : ""} (ignored).`);
    }
  };
  const check = (value: Obj, path: string, allowed: readonly string[], types: Record<string, (v: unknown, p: string) => void>) => {
    keys(value, allowed, path);
    for (const [key, validate] of Object.entries(types)) if (value[key] !== undefined) validate(value[key], path + key);
  };

  const page = object(data, "(frontmatter)");
  keys(page, KEYS.page, "");

  const validateSection = (value: unknown, path: string, allowed: readonly string[]) => {
    if (typeof value === "boolean") return;

    check(object(value, path), `${path}.`, allowed, {
      title: string,
    });
  };

  if (page.title !== undefined && typeof page.title !== "string") {
    check(object(page.title, "title"), "title.", KEYS.title, { value: string, concatenate: boolean });
    if (typeof (page.title as Obj).value !== "string") fail("title.value", "a string (it is required in the object form)");
  }
  if (page.slug !== undefined) string(page.slug, "slug");
  if (page.devOnly !== undefined) boolean(page.devOnly, "devOnly");

  if (page.toc !== undefined) validateSection(page.toc, "toc", KEYS.toc);
  if (page.lof !== undefined) validateSection(page.lof, "lof", KEYS.lof);

  if (page.header !== undefined) {
    check(object(page.header, "header"), "header.", KEYS.header, { title: string, logo: string, logoAlt: string });
  }

  if (page.cover !== undefined && page.cover !== false) {
    const cover = object(page.cover, "cover");
    check(cover, "cover.", KEYS.cover, { title: string, date: string });
    if (cover.media !== undefined) {
      check(object(cover.media, "cover.media"), "cover.media.", KEYS.media, { img: string, href: string, alt: string });
    }
    if (cover.authors !== undefined) {
      if (!Array.isArray(cover.authors)) fail("cover.authors", "a list");
      (cover.authors as unknown[]).forEach((author, i) => {
        check(object(author, `cover.authors[${i}]`), `cover.authors[${i}].`, KEYS.author, {
          firstName: string, lastName: string, alias: string, href: string,
        });
      });
    }
    if (cover.affiliations !== undefined) {
      if (!Array.isArray(cover.affiliations)) fail("cover.affiliations", "a list");
      (cover.affiliations as unknown[]).forEach((a, i) => string(a, `cover.affiliations[${i}]`));
    }
  }

  return page as PageFrontmatter;
}
