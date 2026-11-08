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
  - [ ] Restructure
    - [ ] app
    - [ ] core
    - [ ] custom
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
- [x] `<ExportPanel/>` :
  - [ ] modes :
    - [x] folder
    - [x] singlefile
    - [ ] hybrid
  - [ ] Assets weight display, filter by dimensions, weight, etc.
  - [ ] Exclud individual files

## Bugfixes

- [ ] nested `<Collapsible />` inner collapsible arrow animation not working
- [ ] `<ThemeToggle>` stops working after style edition preview
- [ ] `<ExportPanel>` doesn't display logs on build