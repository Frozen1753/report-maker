import { ExternalLinkIcon, LinkIcon } from "lucide-react";
import type { AnchorHTMLAttributes } from "react";
import { Link as RouterLink } from "react-router";
import styles from "./Link.module.css";

export type LinkProps = Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
> & {
    href: string;
    icon?: boolean;
};

function isExternalLink(href: string): boolean {
    // mailto:, tel: et javascript: ne sont pas des liens web externes.
    if (!/^https?:\/\//i.test(href)) return false;

    // rendu sans window, SSR, etc., toute URL absolue est externe.
    if (typeof window === "undefined") return true;

    try {
        return new URL(href).origin !== window.location.origin;
    } catch {
        return false;
    }
}

/** "/docs/callout" or "/docs#intro": a page of the report (not "//host/..."). */
function isPageLink(href: string): boolean {
    return href.startsWith("/") && !href.startsWith("//");
}

export function Link({ href, children, icon, ...props }: LinkProps) {
    // Pages and in-page anchors go through the router: with a hash router, a bare
    // <a href="#section"> would be read as the route "/section".
    if (isPageLink(href) || href.startsWith("#")) {
        return (
            <RouterLink
                to={href.startsWith("#") ? { hash: href } : href}
                className={styles.link}
                {...props}
            >
                {children}
                {icon && <LinkIcon />}
            </RouterLink>
        );
    }

    const external = isExternalLink(href);

    return (
        <a
            href={href}
            className={styles.link}
            {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            {...props}
        >
            {children}
            {icon && (external ? <ExternalLinkIcon /> : <LinkIcon />)}
        </a>
    );
}
