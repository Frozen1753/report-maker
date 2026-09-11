# TODO — report-maker

## Ce qui est déjà fonctionnel ("compiler")
- [x] Plugin remark qui numérote automatiquement les \<h1>-\<h6> (1, 1.1, 1.2, 2, 2.1...)
- [x] Génération d'un `export const toc = [...]` directement dans le module MDX compilé
- [x] Slugs stables + uniques pour les ancres (`#section-name`)
- [x] Trois modes de build : `folder`, `singlefile`, `hybrid`
- [x] Logique d'exclusion d'assets (extension, taille d'image) pour le mode hybride
- [x] Endpoint dev `/api/export` prêt à être appelé par un bouton (build déclenché en arrière-plan)

## À faire — composants (tu les fais toi-même, mais voici la liste)
- [ ] `<TableOfContents items={toc} />` — remplace le `<ul>` brut de `App.example.tsx`
- [ ] `<Collapsible title="...">` — utilise `<details>/<summary>` en interne pour l'accessibilité gratuite
- [ ] `<BeforeAfter before="..." after="..." />` — slider ou côte-à-côte
- [ ] `<Figure src="..." caption="..." />` — image/gif/vidéo + légende + lightbox optionnelle
- [ ] `<Callout type="info|warning|note">` — encadrés d'admonition
- [ ] `theme.css` — variables CSS globales (`--color-bg`, `--color-accent`, `--font-heading`, etc.)

## À faire — le panneau d'export (le "bouton")
- [ ] `<ExportPanel>` : toggle folder/singlefile/hybrid + checkboxes (exclure gifs, vidéos, images > X px)
- [ ] Appel `fetch('/api/export', { method: 'POST', body: JSON.stringify(options) })` (voir `scripts/export-server-plugin.ts`)
- [ ] Afficher le `log` retourné (succès/erreur) et un lien vers `dist/<mode>/`
- [ ] Idée : lister les assets détectés via `import.meta.glob('/src/assets/**')` pour peupler les checkboxes automatiquement

## Décisions à prendre / à affiner
- [ ] Détection "image 4K" actuellement basée sur la largeur en px (`maxImageWidth` dans `report.assets.config.json`) — ajuster le seuil si besoin
- [ ] Vérifier que `tsconfig.json` a bien `"jsx": "react-jsx"` et inclut `src/types/mdx.d.ts`
- [ ] Ajouter un `report.config.json` optionnel (titre, auteur, date) si tu veux une page de garde générée automatiquement
- [ ] Tester le mode hybride avec une vraie vidéo + un vrai gif pour valider que les tailles de fichier sont correctes
- [ ] Décider si `useRecommendedBuildConfig: false` en mode hybride a des effets de bord à corriger au cas par cas (voir commentaires dans `vite.config.ts`)
