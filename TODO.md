# TODO — report-maker

## Compilation / script
- [x] Plugin remark qui numérote automatiquement les \<h1>-\<h6> (1, 1.1, 1.2, 2, 2.1...)
- [x] Génération d'un `export const toc = [...]` directement dans le module MDX compilé
- [x] Slugs stables + uniques pour les ancres (`#section-name`)
- [x] Trois modes de build : `folder`, `singlefile`, `hybrid`
- [x] Logique d'exclusion d'assets (extension, taille d'image) pour le mode hybride
- [x] Endpoint dev `/api/export` prêt à être appelé par un bouton (build déclenché en arrière-plan)

## Composants
- [X] `<Header">`
- [X] `<CoverPage">`
- [ ] `<Separator">`
- [ ] `<TableOfContents items={toc} />` — remplace le `<ul>` brut de `App.example.tsx`
- [ ] `<Collapsible title="...">` — utilise `<details>/<summary>` en interne pour l'accessibilité gratuite
- [ ] `<BeforeAfter before="..." after="..." />` — slider ou côte-à-côte
- [ ] `<Figure src="..." caption="..." />` — image/gif/vidéo + légende + lightbox optionnelle
- [ ] `<Callout type="info|warning|note">` — encadrés d'admonition
- [ ] `<Code type="inline|bloc">`
- [ ] `theme.css` — variables CSS globales (`--color-bg`, `--color-accent`, `--font-heading`, etc.)
- [ ] `<ExportPanel>` : toggle folder/singlefile/hybrid + checkboxes (exclure gifs, vidéos, images > X px)
  - [ ] Appel `fetch('/api/export', { method: 'POST', body: JSON.stringify(options) })` (voir `scripts/export-server-plugin.ts`)
  - [ ] Afficher le `log` retourné (succès/erreur) et un lien vers `dist/<mode>/`
  - [ ] Idée : lister les assets détectés via `import.meta.glob('/src/assets/**')` pour peupler les checkboxes automatiquement

## Autre
- [ ] Détection "image 4K" actuellement basée sur la largeur en px (`maxImageWidth` dans `report.assets.config.json`) — ajuster le seuil si besoin
- [ ] Tester le mode hybride avec une vraie vidéo + un vrai gif pour valider que les tailles de fichier sont correctes
- [ ] Décider si `useRecommendedBuildConfig: false` en mode hybride a des effets de bord à corriger au cas par cas (voir commentaires dans `vite.config.ts`)
