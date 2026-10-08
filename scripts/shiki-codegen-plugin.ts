import type { Plugin } from 'vite'
import path from 'node:path'
import { generateShikiBundle } from './shiki-codegen.ts'

export function shikiCodegenPlugin(): Plugin {
  return {
    name: 'report-maker:shiki-codegen',
    apply: 'build', // never runs in `vite dev` — dev uses the full shiki bundle directly
    buildStart() {
      generateShikiBundle({
        reportMdxPath: path.resolve(process.cwd(), 'src/report.mdx'),
        styleCssPath: path.resolve(process.cwd(), 'src/styles/style.css'),
        outPath: path.resolve(process.cwd(), 'src/generated/shiki-bundle.generated.ts'),
      })
    },
  }
}
