import fs from 'node:fs'
import path from 'node:path'
import { PATHS } from '../paths.ts'

/**
 * The folder of pre-rendered SVGs (report/generated/mermaid/<key>.svg): the
 * single place that knows how they are named, listed and written.
 */

/** Project-relative, posix separators. */
export const SVG_DIR = PATHS.mermaidSvgs

/** A diagram key: the 14 hex characters of mermaidKey(). */
export const KEY_RE = /^[0-9a-f]{14}$/

export function svgDir(root: string): string {
  return path.resolve(root, SVG_DIR)
}

/** The keys of the SVGs on disk. */
export function listSvgKeys(dir: string): Set<string> {
  return new Set(
    fs.existsSync(dir)
      ? fs
          .readdirSync(dir)
          .filter((f) => f.endsWith('.svg'))
          .map((f) => f.slice(0, -4))
          .filter((k) => KEY_RE.test(k))
      : [],
  )
}

/** Writes `<key>.svg`, unless it already holds exactly this SVG (no pointless file-watcher noise). */
export function writeSvg(dir: string, key: string, svg: string): void {
  const file = path.join(dir, `${key}.svg`)
  fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf-8') !== svg) fs.writeFileSync(file, svg)
}
