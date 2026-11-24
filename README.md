# Report Maker

Write a report in **MDX** : plain Markdown for the text, real React components wherever Markdown alone isn't enough; and compile it to a single `index.html` (just like a PDF), with no extra runtime.

- **Headings number themselves**, and the table of contents and the list of figures build themselves.
- **A set of ready-made components**: callouts, tabs, collapsibles, comparisons, figures with a lightbox, code blocks, terms with tooltips, a glossary.
- **Multi-page reports**: every `*.page.mdx` file is a page, routed from its file path.
- **Diagrams** with [Mermaid](https://mermaid.js.org/), pre-rendered to SVG: no `mermaid.js` in the build.
- **Syntax highlighting** with [Shiki](https://shiki.style/), done at build time: no Shiki in the build.
- **Theming** through CSS variables, light and dark mode, and a live theme editor in dev.
- **Three build modes**: `folder`, `singlefile` and `hybrid`, plus an export panel to run them from the browser.

The full guide is a Report Maker report itself: run the project and read it.

## Getting started

### Prerequisites

- **Node.js 20.19+ or 22.12+** (the minimum of Vite 8, which builds your report)
- **npm**

### Install and run

```sh
git clone https://github.com/Frozen1753/report-maker.git my-report
cd my-report
npm install
npm run dev
```

To start from the files without this repository's history, use `degit` (`npx degit Frozen1753/report-maker my-report`) or the `Use this template` button on GitHub. If you want to pull future updates, clone or fork instead.

## Writing your report

Everything you edit lives in `report/`:

```
report/
  index.page.mdx           the home page of the report (route "/")
  pages/                   more pages: pages/docs/guide.page.mdx is served at /docs/guide
  report.config.tsx        title, cover page and header
  assets/                  images, gifs and videos you import into your pages
  custom/
    glossary.tsx           the terms behind :term[...]
    mdx-components.ts      optional: extra MDX components
  generated/
    mermaid/               pre-rendered diagrams (commit them)
    style/theme.css        your color overrides, written by the theme editor
  assets.config.json       which assets stay external in "hybrid" builds
  favicon.svg

src/core/                  the engine: components, styles, utilities
src/app/                   the page around your report: header, cover, buttons, dev panels
build/                     the Vite configuration and its plugins (Mermaid, Shiki, theme, export...)
```

Only files ending in `.page.mdx` are pages; any other `.mdx` file is a component a page can import. A page can configure itself (title, slug, header, cover, table of contents...) with a frontmatter block.

## Building

```sh
npm run build:folder      # index.html + a separate assets/ folder
npm run build:singlefile  # one index.html, everything inlined
npm run build:hybrid      # one index.html, large assets stay external
```

The result lands in `dist/<mode>/`. In `hybrid` mode, `report/assets.config.json` decides which assets stay external.

### About Mermaid diagrams

Diagrams are **SVG files** generated once and saved in `report/generated/mermaid/`; a build only embeds the ones your pages use. Missing SVGs are rendered automatically when `npm run dev` starts, when an `.mdx` file changes, and at the start of a build.

Rendering needs a **Chrome, Edge or Chromium already installed** on the machine (nothing is downloaded). It is found automatically; to point to one yourself, set the `REPORT_MERMAID_BROWSER` environment variable. Commit `report/generated/mermaid/`: with the SVGs in the repository, a browser is only needed to add or change a diagram.

## Project rules

Dependencies go one way: `report/` → `src/app` → `src/core`. A small script checks it:

```sh
node build/check-boundaries.mjs
```

## License

Report Maker is released under the [MIT License](LICENSE).

The built report embeds a few third-party packages (React, React Router, Floating UI, Lucide and their dependencies). Their licenses are reproduced in [THIRD-PARTY-LICENSES.txt](THIRD-PARTY-LICENSES.txt).

Icons from [Lucide](https://lucide.dev/) are under the ISC license. The logos and icons of the project are original works released under the same MIT License.

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/Frozen1753/report-maker). If you build something with Report Maker, improve on it, or find something that is wrong, we would like to hear about it.
