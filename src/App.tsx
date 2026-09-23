import type { ReactElement } from "react";
import coverImg from "./assets/default-og-image.png";
import { CoverPage } from './components/cover-page/CoverPage';
import { ExportPanel } from "./components/export-panel/ExportPanel";
import { Header } from './components/header/Header';
import { Mermaid } from "./components/report/Mermaid";
import { TableOfContent } from "./components/toc/TableOfContent";
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
      <Header title="My report" logoAlt="logo here" />

      <main>
        <CoverPage
          title="Rapport SAÉ 4.01 - Qualité"
          coverImg={
            {
              coverImgAlt: "cover page",
              coverImgHref: "https://github.com/ElPotatoCorp/UnlockIt",
              coverImgSrc: `${coverImg}`
            }
          }
          date="Mars – Juin 2026"
          authors={
            [
              { firstName: "?", lastName: "?", alias: "Frozen1753", authorHref: "https://github.com/Frozen1753" },
              { firstName: "?", lastName: "?", alias: "ElPotato", authorHref: "https://github.com/ElPotatoCorp" },
            ]
          }
          authorAffiliation={["IUT de Nevers, BUT Informatique"]}
        />

        <TableOfContent items={toc} />

        <div className="content">
          <Report components={{ pre: PreOrMermaid }} />
        </div>
      </main>

      {import.meta.env.DEV && <ExportPanel />}
    </div>
  )
}