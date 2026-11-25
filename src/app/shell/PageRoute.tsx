import { use, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router";
import type { PageEntry } from "virtual:report-pages";
import config from "../../../report/report.config";
import { ListOfFigures } from "../../core/components/toc/ListOfFigures";
import { TableOfContent } from "../../core/components/toc/TableOfContent";
import type { MDXModule } from "../../core/types/mdx-exports";
import { resolvePageConfig } from "../../core/utils/page/resolve-page-config";
import { CoverPage } from "../components/cover-page/CoverPage";
import { mdxComponents } from "../overrides";
import { useSetHeader } from "./header-context";

// One load per page, whatever the number of renders: `use` needs a stable promise.
const loading = new Map<string, Promise<MDXModule>>();

function load(entry: PageEntry): Promise<MDXModule> {
  let promise = loading.get(entry.route);
  if (!promise) {
    promise = entry.load();
    loading.set(entry.route, promise);
  }
  return promise;
}

/** One page of the report: the optional cover, table of contents and list of figures, then the MDX itself. */
export function PageRoute({ entry }: { entry: PageEntry }) {
  // Static builds already have the module; lazy ones suspend until it is loaded.
  const mdx = entry.module ?? use(load(entry));
  const Content = mdx.default;

  // Memoized on purpose: the header object goes into an effect below, a new one at each render would loop.
  const page = useMemo(
    () => resolvePageConfig(config, mdx.frontmatter, entry.route === "/"),
    [mdx, entry.route],
  );

  const setHeader = useSetHeader();
  const { pathname, hash } = useLocation();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    document.title = page.documentTitle;
  }, [page.documentTitle]);

  useEffect(() => {
    setHeader(page.header);
    return () => setHeader(null);
  }, [setHeader, page.header]);

  useEffect(() => {
    // Hash router: the route and the in-page anchor both live after the first "#"
    // ("#/docs/callout#section"), so the browser can't scroll by itself.
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);

    // After a page change, put the focus on the new content (keyboard and screen readers).
    if (previousPath.current !== null && previousPath.current !== pathname) {
      document.querySelector("main")?.focus({ preventScroll: true });
    }
    previousPath.current = pathname;
  }, [pathname, hash]);

  return (
    <>
      {page.cover && <CoverPage {...page.cover} />}
      {page.toc && mdx.toc.length > 0 && (
        <TableOfContent
          title={page.tocTitle}
          items={mdx.toc}
        />
      )}
      {page.lof && (
        <ListOfFigures
          title={page.lofTitle}
          items={mdx.figures}
        />
      )}

      <Content components={mdxComponents} />
    </>
  );
}
