import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import { viteSingleFile } from 'vite-plugin-singlefile'
import remarkHeadingNumbers from './src/mdx-plugins/remark-heading-numbers.ts'
import { exportServerPlugin } from './scripts/export-server-plugin.ts'
import { loadAssetConfig, shouldInlineAsset } from './scripts/asset-rules.ts'

// Set by scripts/build-report.mjs (see package.json "build:*" scripts):
//   folder     -> normal Vite build, assets emitted to dist/folder/assets/
//   singlefile -> everything (JS, CSS, every asset) inlined into one dist/singlefile/index.html
//   hybrid     -> JS/CSS inlined into one HTML, but assets matching
//                 report.assets.config.json stay external in dist/hybrid/assets/
type ReportBuildMode = 'folder' | 'singlefile' | 'hybrid'
const buildMode = (process.env.REPORT_BUILD_MODE ?? 'folder') as ReportBuildMode

const assetConfig = loadAssetConfig()

export default defineConfig({
  base: buildMode === 'folder' ? '/' : './',

  plugins: [
    // Must run before @vitejs/plugin-react transforms the JSX MDX compiles down to.
    { enforce: 'pre', ...mdx({ remarkPlugins: [remarkGfm, remarkHeadingNumbers] }) },
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),

    exportServerPlugin(),

    // Full single-file mode: let the plugin apply its recommended config
    // (it force-inlines every JS/CSS/asset into one HTML — see its source).
    buildMode === 'singlefile' && viteSingleFile(),

    // Hybrid mode: we still want JS/CSS inlined into one HTML, but NOT its
    // blanket "inline every asset" behavior, so we disable the recommended
    // config and set assetsInlineLimit ourselves below instead.
    buildMode === 'hybrid' && viteSingleFile({ useRecommendedBuildConfig: false }),
  ].filter(Boolean) as PluginOption[],

  build: {
    outDir: `dist/${buildMode}`,
    cssCodeSplit: buildMode === 'folder',
    assetsDir: buildMode === 'folder' ? 'assets' : '',
    chunkSizeWarningLimit: buildMode === 'folder' ? undefined : 100_000_000,
    assetsInlineLimit:
      buildMode === 'hybrid'
        ? (filePath: string, content: Buffer) => shouldInlineAsset(filePath, content, assetConfig)
        : undefined, // folder: Vite's default 4kb threshold · singlefile: forced true by the plugin
  },
})
