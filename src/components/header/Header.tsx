import type { ReactNode } from 'react';
import ReportMakerLogo from '../../assets/report-maker_logo.svg?react';

type HeaderProps = {
  title?: string;
  logo?: ReactNode;
  logoAlt?: string;
};

export function Header({
  title = '[report title]',
  logo = <ReportMakerLogo aria-label="Report Maker" />,
  logoAlt = 'Logo',
}: HeaderProps) {
  return (
    <header className="gap bg bg-primary sticky top-0 z-1000 flex items-center justify-between gap-4 px-15 py-3 shadow-(--shadow-soft)">
      <span className="header-title">{title}</span>

      <div
        className="header-logo"
        role={logoAlt ? 'img' : undefined}
        aria-label={logoAlt || undefined}
      >
        {logo}
      </div>
    </header>
  );
}
