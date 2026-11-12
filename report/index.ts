import type { MDXModule } from "../src/core/types/mdx-exports";

export const MDX_MODULES = import.meta.glob<MDXModule>("report/**/*.mdx");

export const MDX_PATHS = {
  INDEX: Object.keys(MDX_MODULES).find(file => file.endsWith("index.mdx"))!,
  PAGES: Object.keys(MDX_MODULES).filter(file => !file.endsWith("index.mdx"))
}
