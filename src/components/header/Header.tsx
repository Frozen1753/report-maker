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
        <header className="sticky-header">
            <span className="header-title">
                {title}
            </span>

            <div
                className="header-logo"
                role={logoAlt ? "img" : undefined}
                aria-label={logoAlt || undefined}
            >
                {logo}
            </div>
        </header>
    );
}