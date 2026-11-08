import ReportMakerIcon from "./assets/report-maker_icon.svg?react";
import { CoverPage } from "./components/cover-page/CoverPage";
import { ExportPanel } from "./components/export-panel/ExportPanel";
import { FloatingButtons } from "./components/floating-button";
import { Header } from "./components/header/Header";
import { ThemePanel } from "./components/theme-panel/ThemePanel";
import { ThemeToggle } from "./components/theme-toggle/ThemeToggle";
import { ListOfFigures } from "./components/toc/ListOfFigures";
import { TableOfContent } from "./components/toc/TableOfContent";
import { TopButton } from "./components/top-button/TopButton";
import { mdxComponents } from "./overrides";
import Report, { figures, toc } from "./report.mdx";

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
        <ListOfFigures items={figures} />

        <div className="content">
          <Report components={mdxComponents} />
        </div>
      </main>

      <TopButton />
      <FloatingButtons>
        <ThemeToggle />
        {import.meta.env.DEV && (<><ExportPanel /><ThemePanel /></>)}
      </FloatingButtons>
    </div>
  );
}
