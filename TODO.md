# TODO — report-maker

## Compilation / script
- [x] Plugin remark qui numérote automatiquement les \<h1>-\<h6> (1, 1.1, 1.2, 2, 2.1...)
- [x] Génération d'un `export const toc = [...]` directement dans le module MDX compilé
- [x] Slugs stables + uniques pour les ancres (`#section-name`)
- [x] Trois modes de build : `folder`, `singlefile`, `hybrid`
- [x] Logique d'exclusion d'assets (extension, taille d'image) pour le mode hybride
- [x] Endpoint dev `/api/export` prêt à être appelé par un bouton (build déclenché en arrière-plan)

## Composants
- [ ] `<Header">` (revisite)
- [ ] `<CoverPage>` (revisite)
- [ ] `<Separator/>` (revisite)
- [X] Headings styles (h3, h4, h5, etc.)
- [X] `<TableOfContents items={toc} />`
- [X] `<Collapsible title="...">`
- [X] `<Tabs/>`
  - [X] `<BeforeAfter before="..." after="..." />`
- [ ] `<Figure src="..." caption="..." />` (revisite)
- [X] `<Callout type="info|warning|note|...">`
- [X] `<Code type="inline|bloc">`
- [X] `<ExportPanel>` : toggle folder/singlefile/hybrid + checkboxes (exclure gifs, vidéos, images > X px)
  - [x] folder
  - [x] singlefile
  - [ ] hybrid
    - [ ] Détection "image 4K" actuellement basée sur la largeur en px (`maxImageWidth` dans `report.assets.config.json`) — ajuster le seuil si besoin
    - [ ] Décider si `useRecommendedBuildConfig: false` en mode hybride a des effets de bord à corriger au cas par cas (voir commentaires dans `vite.config.ts`)
- [ ] Light mode / dark mode
- [ ] `<ThemePanel>` : to change colors and other simple stuff
- [ ] Custom Fonts