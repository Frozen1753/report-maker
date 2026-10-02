import type { ReactNode } from "react";
import SimuLABleLogo from "../../assets/SimuLABle_logo_dark.svg?react";

type HeaderProps = {
    title?: string;
    logo?: ReactNode;
    logoAlt?: string;
};

export function Header({
    title = "[report title]",
    logo = <SimuLABleLogo aria-label="SimuLABle" />,
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