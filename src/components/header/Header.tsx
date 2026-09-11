type HeaderProps = {
    title?: string;
    logoSrc?: string;
    logoAlt?: string;
};

export function Header({ title = "[report title]", logoSrc, logoAlt }: HeaderProps) {
    return (
        <header className="sticky-header">
            <span className="header-title">
                {title}
            </span>
            <img src={logoSrc} className="header-logo" alt={logoAlt} />
        </header>
    );
};