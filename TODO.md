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
  - [ ] plugin d'assets du frontmatter
- [ ] Responsive

## Bugfixes

- [ ] nested `<Collapsible />` inner collapsible arrow animation not working
- [ ] `<ThemeToggle>` stops working after theme edition preview
- [ ] Build time in hybrid increases with lower image width filter
- [ ] Default date in cover page alwways display Date.now() and not build date