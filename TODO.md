# TODO — report-maker

## Features

- [?] Markdown-friendly syntax
  - [X] `<Tabs/>`
  - [X] `<Comparison/>`
  - [X] `<Term/>`
  - [X] `<Code/>`
  - [X] `<Mermaid/>`
  - [X] `<Callout/>`
  - [X] `<Separator/>`
  - [?] `<Collapsible/>`
  - [?] `<Figure/>`
- [ ] Panel components redesign 
  - [X] `<ExportPanel/>` :
  - [ ] `<ThemePanel/>` :
- [ ] MDX files
  - [X] multiple pages
  - [X] ::include{src="./part.mdx"} directive
  - [X] automate page pre-rendering
  - [X] frontmatter node et resolver de config
  - [ ] asset plugin for frontmatter
  - [ ] toc / tof title property frontmatter
- [X] Responsive
- [ ] Docs
  - [ ] Components
  - [ ] Frontmatter
  - [ ] Header
  - [ ] CoverPage
  - [ ] report.config
  - [ ] TOC
  - [ ] LOF
  - [ ] Pages
  - [ ] Build
  - [ ] Panels
  - [ ] index (intro, getting started, ->docs, author's note)
  - [ ] FR/EN

## Bugfixes

- [ ] nested `<Collapsible />` inner collapsible arrow animation not working
- [ ] `<ThemeToggle>` stops working after theme edition preview
- [ ] Build time in hybrid increases with lower image width filter
- [ ] Default date in cover page always display Date.now() and not build date
- [ ] check-boundaries.mjs doesn't work without .git
- [ ] horizontal scroll bar seems to appear on some instance of a table