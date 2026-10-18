import ReportMakerIcon from "./assets/report-maker_icon.svg?react";
import { CoverPage } from "./components/cover-page/CoverPage";
import { ExportPanel } from "./components/export-panel/ExportPanel";
import { FigureProvider } from "./components/figure/FigureProvider";
import { Header } from "./components/header/Header";
import { ThemeToggle } from "./components/theme-toggle/ThemeToggle";
import { ThemePanel } from "./components/theme-panel/ThemePanel";
import { TableOfContent } from "./components/toc/TableOfContent";
import { TopButton } from "./components/top-button/TopButton";
import Report, { toc } from "./report.mdx";
import "./custom/variables";
import { mdxComponents } from "./overrides";

export default function App() {
  return (
    <div className="page">
      <Header title="How to use Report Maker ?" />
      <main>
        <CoverPage
          title="How to use Report Maker ?"
          coverMedia={{
            content: <ReportMakerIcon width={256} height={256} />,
            href: "https://github.com/Frozen1753/report-maker",
            ariaLabel: "Icon de Report Maker",
          }}
          authors={[
            {
              firstName: "Frozen1753",
              href: "https://github.com/Frozen1753",
            },
            {
              firstName: "ElPotatoCorp",
              href: "https://github.com/ElPotatoCorp",
            },
          ]}
          affiliations={["Programmer, procrastinator and cat-lover"]}
        />

        <TableOfContent items={toc} />

        <div className="content">
          <FigureProvider>
            <Report components={mdxComponents} />
          </FigureProvider>
        </div>
      </main>

      <TopButton />
      <div className="floating-buttons">
        <ThemeToggle />
        {import.meta.env.DEV && (
          <>
            <ExportPanel />
            <ThemePanel />
          </>
        )}
      </div>
    </div>
  );
}
