import { Suspense } from "react";
import { Outlet } from "react-router";
import config from "../../../report/report.config";
import { FloatingButtons } from "../components/floating-button";
import { Header } from "../components/header/Header";
import { ThemeToggle } from "../components/theme-toggle/ThemeToggle";
import { TopButton } from "../components/top-button/TopButton";
import { ExportPanel } from "../dev/export-panel/ExportPanel";
import { ThemePanel } from "../dev/theme-panel/ThemePanel";

export function Shell() {
  const { title, header } = config;

  return (
    <div>
      <Header
        title={header?.title ?? title}
        logo={header?.logo}
        logoAlt={header?.logoAlt}
      />

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
  );
}
