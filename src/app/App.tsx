import { HashRouter, Route, Routes } from "react-router";
import { notFound, pages } from "virtual:report-pages";
import { NotFound } from "./shell/NotFound";
import { PageRoute } from "./shell/PageRoute";
import { Shell } from "./shell/Shell";

/**
 * HashRouter on purpose: a single-file report is opened from disk (file://) or
 * sent by mail, where the history API and server-side fallbacks don't exist.
 * Routes look like index.html/#/path/to/page/mypage
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Shell />}>
          {pages.map((page) => (
            <Route
              key={page.route}
              path={page.route}
              element={<PageRoute key={page.route} entry={page} />}
            />
          ))}
          <Route
            path="*"
            element={notFound ? <PageRoute key="/404" entry={notFound} /> : <NotFound />}
          />
        </Route>
      </Routes>
    </HashRouter>
  );
}