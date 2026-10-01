# TODO — report-maker

## Compilation / script
- [x] Plugin remark qui numérote automatiquement les \<h1>-\<h6> (1, 1.1, 1.2, 2, 2.1...)
- [x] Génération d'un `export const toc = [...]` directement dans le module MDX compilé
- [x] Slugs stables + uniques pour les ancres (`#section-name`)
- [x] Trois modes de build : `folder`, `singlefile`, `hybrid`
- [x] Logique d'exclusion d'assets (extension, taille d'image) pour le mode hybride
- [x] Endpoint dev `/api/export` prêt à être appelé par un bouton (build déclenché en arrière-plan)

## Composants
- [ ] Project (ReportMaker)
  - [X] Logo + Icon
  - [ ] Colors
  - [ ] Sort style.css
    - [ ] Split component css from global css
    - [ ] Remove unused style
    - [ ] Rename styles for more coherant names
  - [ ] A report that explains how to use report-maker, made by the very same tool XD
- [X] `<Header">`
- [X] `<CoverPage>`
- [X] `<Separator/>`
- [X] Headings styles (h3, h4, h5, etc.)
- [X] `<TableOfContents items={toc} />`
- [X] `<Collapsible title="...">`
- [X] `<Tabs/>`
  - [X] `<BeforeAfter before="..." after="..." />`
- [X] `<Figure src="..." caption="..." />`
  - [X] figure numbering
  - [X] Zoom
- [X] `<Callout type="info|warning|note|...">`
- [X] `<Code type="inline|bloc">`
  - [X] File name + language indicator 
  - [X] Easy copy
- [X] `<ExportPanel>` : toggle folder/singlefile/hybrid + checkboxes (exclure gifs, vidéos, images > X px)
  - [ ] Pannel style
  - [ ] Tab Title editor
  - [x] folder
  - [x] singlefile
  - [ ] hybrid
    - [ ] Détection "image 4K" actuellement basée sur la largeur en px (`maxImageWidth` dans `report.assets.config.json`) — ajuster le seuil si besoin
    - [ ] Décider si `useRecommendedBuildConfig: false` en mode hybride a des effets de bord à corriger au cas par cas (voir commentaires dans `vite.config.ts`)
- [X] Top link
- [X] Light mode / dark mode
- [ ] `<ThemePanel>`
  - [X] CSS var edition
  - [X] preview
  - [ ] Fonts import 
  - [ ] Pannel style
  - [ ] Select highlight js