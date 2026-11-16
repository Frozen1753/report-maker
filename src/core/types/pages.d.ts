declare module "virtual:report-pages" {
  import type { MDXModule } from "./mdx-exports";

  export interface PageEntry {
    route: string;
    module?: MDXModule;
    load: () => Promise<MDXModule>;
  }

  export const pages: PageEntry[];
  export const notFound: PageEntry | null;
}
