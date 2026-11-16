import { Suspense, useState } from "react";
import { Outlet } from "react-router";
import config from "../../../report/report.config";
import type { ResolvedHeader } from "../../core/utils/page/resolve-page-config";
import { FloatingButtons } from "../components/floating-button";
import { Header } from "../components/header/Header";
import { ThemeToggle } from "../components/theme-toggle/ThemeToggle";
import { TopButton } from "../components/top-button/TopButton";
import { ExportPanel } from "../dev/export-panel/ExportPanel";
import { ThemePanel } from "../dev/theme-panel/ThemePanel";
import { HeaderProvider } from "./header-context";

/** What stays on screen from one page to the next: header, buttons, the <main> the page renders into. */
export function Shell() {
  const [pageHeader, setPageHeader] = useState<ResolvedHeader | null>(null);

  const header: ResolvedHeader = pageHeader ?? {
    title: config.header?.title ?? config.title,
    logo: config.header?.logo,
    logoAlt: config.header?.logoAlt,
  };

  return (
    <HeaderProvider value={setPageHeader}>
      <div>
        <Header title={header.title} logo={header.logo} logoAlt={header.logoAlt} />

        {/* tabIndex: PageRoute moves the focus here after a navigation. */}
        <main tabIndex={-1}>
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </main>

        <TopButton />
        <FloatingButtons>
          <ThemeToggle />
          {import.meta.env.DEV && (
            <>
              <ExportPanel />
              <ThemePanel />
            </>
          )}
        </FloatingButtons>
      </div>
    </HeaderProvider>
  );
}
