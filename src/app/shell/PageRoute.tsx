import { use, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import type { PageEntry } from "virtual:report-pages";
import config from "../../../report/report.config";
import { ListOfFigures } from "../../core/components/toc/ListOfFigures";
import { TableOfContent } from "../../core/components/toc/TableOfContent";
import type { MDXModule } from "../../core/types/mdx-exports";
import { CoverPage } from "../components/cover-page/CoverPage";
import { mdxComponents } from "../overrides";

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
  const frontmatter = mdx.frontmatter ?? {};
  console.log(frontmatter);
  const Content = mdx.default;

  const { pathname, hash } = useLocation();
  const previousPath = useRef<string | null>(null);

  const title = frontmatter.title ?
    (frontmatter.title.value ?
      (frontmatter.title.concatenate ?
        `${config.title} - ${frontmatter.title.value}`
        : `${frontmatter.title.value}`
      )
      : `${config.title} - ${frontmatter.title}`
    )
    : config.title;

  useEffect(() => {
    document.title = title;
  }, [title]);

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
      {(frontmatter.cover ?? entry.route === "/") && (
        <CoverPage
          title={config.cover?.title ?? config.title}
          coverMedia={config.cover?.media}
          date={config.cover?.date}
          authors={config.cover?.authors}
          affiliations={config.cover?.affiliations}
        />
      )}

      {(frontmatter.toc ?? true) && mdx.toc.length > 0 && <TableOfContent items={mdx.toc} />}
      {(frontmatter.lof ?? true) && <ListOfFigures items={mdx.figures} />}

      <Content components={mdxComponents} />
    </>
  );
}
