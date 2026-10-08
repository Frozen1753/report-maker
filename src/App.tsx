import type { ReactElement } from 'react';
import ReportMakerIcon from './assets/report-maker_icon.svg?react';
import { CoverPage } from './components/cover-page/CoverPage';
import { ExportPanel } from './components/export-panel/ExportPanel';
import { FigureProvider } from './components/figure/FigureProvider';
import { Header } from './components/header/Header';
import { Mermaid } from './components/report/Mermaid';
import { ThemeButton } from './components/theme-button/ThemeButton';
import { ThemePanel } from './components/theme-panel/ThemePanel';
import { TableOfContent } from './components/toc/TableOfContent';
import { TopButton } from './components/top-button/TopButton';
import Report, { toc } from './report.mdx';
import './custom/variables';

// MDX compiles a ```mermaid fence to <pre><code className="language-mermaid">...
// Intercepting `pre` lets every report.mdx just write plain ```mermaid blocks,
// no manual <Mermaid chart="..."> needed.
function PreOrMermaid({
  children,
  ...props
}: {
  children?: ReactElement<{ className?: string; children?: string }>;
}) {
  const isMermaid = children?.props?.className?.includes('language-mermaid');
  if (isMermaid) return <Mermaid chart={String(children?.props?.children ?? '')} />;
  return <pre {...props}>{children}</pre>;
}

export default function App() {
  return (
    <div className="page">
      <Header title="How to use Report Maker ?" />
      <main>
        <CoverPage
          title="How to use Report Maker ?"
          coverMedia={{
            content: <ReportMakerIcon width={256} height={256} />,
            href: 'https://github.com/Frozen1753/report-maker',
            ariaLabel: 'Icon de Report Maker',
          }}
          authors={[
            {
              firstName: 'Frozen1753',
              href: 'https://github.com/Frozen1753',
            },
            {
              firstName: 'ElPotatoCorp',
              href: 'https://github.com/ElPotatoCorp',
            },
          ]}
          affiliations={['Programmer, procrastinator and cat-lover']}
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
  );
}
