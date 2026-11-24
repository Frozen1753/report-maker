import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

/**
 * Which browser renders the diagrams, and which mermaid it loads. No browser is
 * downloaded: the person's own Chrome / Edge / Chromium is used.
 */

/** Where a browser usually lives, tried in order after the explicit path and the environment variables. */
const BROWSER_CANDIDATES: string[] = [
  // Windows
  ...['PROGRAMFILES', 'PROGRAMFILES(X86)', 'LOCALAPPDATA'].flatMap((name) => {
    const dir = process.env[name]
    return dir
      ? [
          path.join(dir, 'Google', 'Chrome', 'Application', 'chrome.exe'),
          path.join(dir, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
        ]
      : []
  }),
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  // Linux
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/microsoft-edge',
  '/usr/bin/firefox'
]

/** The executable to launch: `explicit`, then the environment, then the usual install locations. */
export function findBrowser(explicit?: string): string | null {
  const candidates = [
    explicit,
    process.env.REPORT_MERMAID_BROWSER,
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    ...BROWSER_CANDIDATES,
  ]
  return candidates.find((c): c is string => !!c && fs.existsSync(c)) ?? null
}

export const BROWSER_HINT =
  '[mermaid] no Chrome / Edge / Chromium found to pre-render the diagrams. ' +
  'Install one, or give its path: mermaidPlugin({ browserPath: "C:/…/chrome.exe" }) or the REPORT_MERMAID_BROWSER environment variable.'

/** The browser bundle of the project's own mermaid (UMD, exposes the global `mermaid`). */
export function resolveMermaidBundle(root: string): string {
  try {
    return createRequire(path.join(root, 'package.json')).resolve('mermaid/dist/mermaid.js')
  } catch {
    return path.join(root, 'node_modules', 'mermaid', 'dist', 'mermaid.js')
  }
}
