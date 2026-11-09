# TODO — report-maker

## Features

- [ ] Project (ReportMaker)
  - [X] Remove tailwind for module.css files
    - [X] toc
      - [X] `<ListOfFigures/>`
      - [X] `<TableOfContent/>`
    - [X] `<CoverPage/>`
    - [X] `report.mdx`
      - [X] `<Callout/>`
      - [X] `<Collapsible/>`
      - [X] `<Comparison/>`
      - [X] `<Figure/>`
        - [X] `<Lightbox/>`
          - [X] `<ZoomPan/>`
      - [X] `<Separator/>`
      - [X] `<Tabs/>`
      - [X] `<Term/>`
      - [X] `<Mermaid/>`
      - [X] `<Code/>`
    - [X] `<ThemePanel/>`
    - [X] `<ThemeToggle/>`
    - [X] `<Header/>`
    - [X] `<ExportPanel/>`
    - [X] `<Panel/>`
    - [X] `<ExportPanel/>`
    - [X] `<TopButton/>`
    - [X] `styles.css`
  - [X] Restructure
    - [X] app
    - [X] core
    - [X] custom
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
  - [ ] `<ExportPanel/>` :
  - [ ] `<ThemePanel/>` :
- [ ] `<ExportPanel/>` :
  - [ ] modes :
    - [x] folder
    - [x] singlefile
    - [ ] hybrid (not tested yet)
  - [ ] Assets weight display, filter by dimensions, weight, etc.
  - [ ] Exclude individual files
- [ ] MDX files
  - [ ] documentation.mdx : "How to use Report-Maker?", appears on /doc (/documentation, /help, etc.) pages, not present in build
    - [ ] update doc first
  - [ ] report.mdx : blank report, only links to /doc page to start

## Bugfixes

- [ ] nested `<Collapsible />` inner collapsible arrow animation not working
- [ ] `<ThemeToggle>` stops working after theme edition preview
- [ ] `<ExportPanel>` throws error on build (despite success) and disappears without printings logs
- [ ] build singlefile creates two files : index.html and favicon-<hash>.svg