import { defineReport } from "report-maker";
import ReportMakerIcon from "./assets/report-maker_icon.svg?react";

export default defineReport({
  title: "How to use Report Maker ?",

  cover: {
    media: {
      content: <ReportMakerIcon width={256} height={256} />,
      href: "https://github.com/Frozen1753/report-maker",
      ariaLabel: "Icon de Report Maker",
    },
    authors: [
      { firstName: "Frozen1753", href: "https://github.com/Frozen1753" },
      { firstName: "ElPotatoCorp", href: "https://github.com/ElPotatoCorp" },
    ],
    affiliations: ["Programmer, procrastinator and cat-lover"],
  },

  /*
  // defaults: the title above + the Report Maker logo
  header: { 
    title: "...",
    logo: <MyLogo />,
    logoAlt: "..."
  }, 
  */
});
