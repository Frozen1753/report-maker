import { useEffect } from "react";
import { CoverPage } from "../cover-page/CoverPage";
import { ExportPanel } from "../../dev/export-panel/ExportPanel";
import { FloatingButtons } from "../floating-button";
import { Header } from "../header/Header";
import { ThemePanel } from "../../dev/theme-panel/ThemePanel";
import { ThemeToggle } from "../theme-toggle/ThemeToggle";
import { TopButton } from "../top-button/TopButton";
import config from "../../../../report/report.config";
import { Outlet } from "react-router-dom";

export default function LayoutDom() {
  const { title, header, cover } = config;

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div>
      <Header
        title={header?.title ?? title}
        logo={header?.logo}
        logoAlt={header?.logoAlt}
      />
      <main>
        <CoverPage
          title={cover?.title ?? title}
          coverMedia={cover?.media}
          date={cover?.date}
          authors={cover?.authors}
          affiliations={cover?.affiliations}
        />

        <Outlet />
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
