import type { ReactNode } from "react";
import ReportMakerLogo from "../../assets/report-maker_logo.svg?react";

type HeaderProps = {
  title?: string;
  logo?: ReactNode;
  logoAlt?: string;
};

export function Header({
  title = "[report title]",
  logo = <ReportMakerLogo aria-label="Report Maker" />,
  logoAlt = "Logo",
}: HeaderProps) {
  return (
    <header className="gap bg bg-primary shadow-soft sticky top-0 z-1 flex items-center justify-between gap-4 px-15 py-3">
      <span className="text-text-on-accent text-xl font-bold">{title}</span>

      <div
        className="text-text-on-accent h-10 content-center object-contain"
        role={logoAlt ? "img" : undefined}
        aria-label={logoAlt || undefined}
      >
        {logo}
      </div>
    </header>
  );
}
