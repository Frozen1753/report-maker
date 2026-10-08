// Checked into git — the matching .ts implementation is regenerated on every
// build by scripts/shiki-codegen.ts and is gitignored. This stub exists so
// `tsc -b` (which runs BEFORE the Vite plugin that generates the real file)
// always has a type to check CodeBlock.tsx's import against.
import type { HighlighterCore } from 'shiki/core';

export declare const highlighterPromise: Promise<HighlighterCore>;
