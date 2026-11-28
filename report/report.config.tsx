import { defineReport } from "@report-maker";
import ReportMakerIcon from "@report/assets/report-maker_icon.svg?react";
import ReportMakerLogo from "@report/assets/report-maker_logo.svg?react";

/*
 * Priority order:
 * - frontmatter (yaml head of a .page.mdx)
 * - report.config.tsx
 * - components default values
 */
export default defineReport({
  title: "How to use Report Maker ?", /* act as the project title */

  header: {
    title: undefined, /* takes page title instead */
    logo: <ReportMakerLogo />,
    logoAlt: "Logo de Report Maker"
  },

  cover: {
    title: undefined, /* takes page title instead */
    date: "2026-11-25",
    media: {
      content: <ReportMakerIcon />,
      href: "https://github.com/Frozen1753/report-maker",
      ariaLabel: "Icon de Report Maker"
    },
    authors: [
      { firstName: "Frozen1753", href: "https://github.com/Frozen1753" },
      { firstName: "ElPotatoCorp", href: "https://github.com/ElPotatoCorp" },
    ],
    affiliations: ["Programmer, procrastinator and cat-lover"],
  },

  toc: {
    title: "Table of Content"
  },

  lof: {
    title: "List of Figures"
  }

  /*
  You can disable the toc and lof by default:

  toc: false,
  lof: false

  */
});

/* Here is the exact same config as a frontmatter:

  ---
  title: "How to use Report Maker ?" # act as the page title (completes the project title if it exists : "<PageTitle> - <Project Title>")
  header:
    title: "How to use Report Maker ?"
    logo: "./assets/report-maker_logo.svg?react"
    logoAlt: "Logo de Report Maker"
  },
  cover:
      title: "How to use Report Maker ?",
      date: "2026-11-25"
      media:
          href: "https://github.com/Frozen1753/report-maker"
          img: "./assets/report-maker_icon.svg?react"
          alt: "Report Maker Icon"
      authors: 
      -   firstName: "Frozen1753"
          href: "https://github.com/Frozen1753"
      -   firstName: "ElPotatoCorp"
          href: "https://github.com/ElPotatoCorp"
      affiliations:
      -   "Programmers, deadline rushers and over-optimizers"

  toc:
    title: "Table of Content"
  lof:
    title: "List of Figures"
  ---

  You can also disable toc and lof :

  ---
  toc: false
  lof: false
  ---

*/