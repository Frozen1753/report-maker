export type Theme = 'light' | 'dark'

export function getSystemTheme(): Theme {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Must match the key used in the anti-flash inline script in index.html.
export const STORAGE_KEY = 'report-theme'

export function getStoredTheme(): Theme | null {
    try {
        const v = localStorage.getItem(STORAGE_KEY)
        return v === 'light' || v === 'dark' ? v : null
    } catch {
        return null
    }
}

/**
 * Reads the value the anti-flash script in index.html already set on <html>,
 * so this component's first render matches what's on screen (no re-flicker).
 * Falls back to storage/system only if that script wasn't run (e.g. this
 * component used outside index.html's normal load path).
 */
export function getInitialTheme(): Theme {
    const current = document.documentElement.dataset.theme
    if (current === 'light' || current === 'dark') return current
    return getStoredTheme() ?? getSystemTheme()
}