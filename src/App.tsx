import type { ReactElement } from "react";
import SimuLABleIcon from "./assets/SimuLABle_icon_dark.svg?react";
import SimuLABleLogo from "./assets/SimuLABle_logo.svg?react";
import { CoverPage } from './components/cover-page/CoverPage';
import { ExportPanel } from "./components/export-panel/ExportPanel";
import { FigureProvider } from "./components/figure/FigureProvider";
import { Header } from './components/header/Header';
import { Mermaid } from "./components/report/Mermaid";
import { ThemeButton } from "./components/theme-button/ThemeButton";
import { ThemePanel } from "./components/theme-panel/ThemePanel";
import { TableOfContent } from "./components/toc/TableOfContent";
import { TopButton } from "./components/top-button/TopButton";
import Report, { toc } from './report.mdx';

// MDX compiles a ```mermaid fence to <pre><code className="language-mermaid">...
// Intercepting `pre` lets every report.mdx just write plain ```mermaid blocks,
// no manual <Mermaid chart="..."> needed.
function PreOrMermaid({ children, ...props }: { children?: ReactElement<{ className?: string; children?: string }> }) {
  const isMermaid = children?.props?.className?.includes('language-mermaid')
  if (isMermaid) return <Mermaid chart={String(children?.props?.children ?? '')} />
  return <pre {...props}>{children}</pre>
}

export default function App() {
  return (
    <div className="page">

      <Header
        title="Note de cadrage"
        logo={<SimuLABleLogo className="svg-shadow" />}
        aria-label="SimuLABle"
        logoAlt=""
      />

      <main>

        <CoverPage
          title="SimuLABle - Note de cadrage"
          date="Sep. - Oct. 2026"
          coverMedia={{
            content: <SimuLABleIcon width={256} height={256} />,
            href: "https://github.com/ElPotatoCorp/SimuLABle",
            ariaLabel: "Icon de SimuLABle",
          }}
          authors={[
            {
              firstName: "Eliot",
              lastName: "NADOUCE BOUROTTE",
              alias: "Frozen1753",
              href: "https://github.com/Frozen1753",
            },
            {
              firstName: "Noah",
              lastName: "GAUCHE PEREIRA",
              alias: "ElPotatoCorp",
              href: "https://github.com/ElPotatoCorp",
            },
            {
              firstName: "Grigor",
              lastName: "GASPARYAN",
              alias: "GG-003",
              href: "https://github.com/GG-003",
            },
          ]}
          affiliations={["IUT de Nevers, BUT Informatique"]}
        />

        <TableOfContent items={toc} />

        <div className="content">
          <FigureProvider>
            <Report components={{ pre: PreOrMermaid }} />
          </FigureProvider>
        </div>

      </main>

      <TopButton />
      <ThemeButton />
      {import.meta.env.DEV && <ExportPanel />}
      {import.meta.env.DEV && <ThemePanel />}
    </div>
  )
}