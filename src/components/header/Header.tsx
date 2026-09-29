type HeaderProps = {
    title?: string;
    logoSrc?: string;
    logoAlt?: string;
};

import ReportMakerLogo from "../../assets/report-maker_logo.svg?react";

export function Header({ title = "[report title]", logoSrc, logoAlt }: HeaderProps) {
    return (
        <header className="sticky-header">
            <span className="header-title">
                {title}
            </span>
            <ReportMakerLogo fill="white" />
            {/*<img src={logoSrc} className="header-logo" alt={logoAlt} />*/}
        </header>
    );
};