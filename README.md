# report-maker — scaffold

Ces fichiers sont à fusionner dans ton projet React-TypeScript (Vite) existant.

## 1. Installer les dépendances

```bash
npm install -D @mdx-js/rollup remark-gfm unist-util-visit mdast-util-to-string \ github-slugger estree-util-value-to-estree vite-plugin-singlefile image-size \ @types/mdast
```

`@vitejs/plugin-react` est probablement déjà présent dans ton projet blank Vite ; sinon ajoute-le aussi.

## 2. Copier les fichiers

```
vite.config.ts                          → remplace le tien (fusionne si tu as déjà des plugins)
report.assets.config.json               → racine du projet
scripts/build-report.mjs
scripts/asset-rules.ts
scripts/export-server-plugin.ts
src/mdx-plugins/remark-heading-numbers.ts
src/types/mdx.d.ts
src/report.mdx                          → contenu de démo, à remplacer par ton vrai rapport
src/App.example.tsx                     → exemple, à adapter/renommer en App.tsx
TODO.md
```

## 3. Ajouter les scripts npm

Dans `package.json` :

```json
{
  "scripts": {
    "build:folder": "node scripts/build-report.mjs folder",
    "build:singlefile": "node scripts/build-report.mjs singlefile",
    "build:hybrid": "node scripts/build-report.mjs hybrid"
  }
}
```

## 4. Vérifier tsconfig.json

Assure-toi d'avoir :

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "bundler"
  }
}
```

## 5. Tester

```bash
npm run dev              # vérifie que report.mdx s'affiche avec la numérotation
npm run build:folder     # dist/folder/ avec assets séparés
npm run build:singlefile # dist/singlefile/index.html, tout inliné
npm run build:hybrid     # dist/hybrid/index.html + dist/hybrid/assets/ pour les gros fichiers
```

Voir `TODO.md` pour la suite (composants, thème, panneau d'export UI).
