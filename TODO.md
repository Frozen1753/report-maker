# TODO — report-maker

## Features

- [ ] Panel components redesign 
  - [X] `<ExportPanel/>` :
  - [ ] `<ThemePanel/>` :
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
- [ ] Langs (multiple index for /EN/\*, /FR/\*, etc.)
- [ ] CommentsPanel (toggle export / config)
- [ ] NavPanel

## Bugfixes

- [ ] nested `<Collapsible />` inner collapsible arrow animation not working
- [ ] `<ThemeToggle>` stops working after theme edition preview
- [ ] Build time in hybrid increases with lower image width filter
- [ ] Default date in cover page always display Date.now() and not build date
- [ ] check-boundaries.mjs doesn't work without .git
- [ ] horizontal scroll bar seems to appear on some instance of a table
- [ ] Collapsible / Tabs should let anchors goto