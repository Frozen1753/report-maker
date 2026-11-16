import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router";
import ReportMakerLogo from "../../assets/report-maker_logo.svg?react";
import styles from "./Header.module.css";

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
    <header className={styles.header}>
      <RouterLink to="/" className={styles.title}>
        {title}
      </RouterLink>

      <div
        className={styles.logo}
        role={logoAlt ? "img" : undefined}
        aria-label={logoAlt || undefined}
      >
        {logo}
      </div>
    </header>
  );
}
