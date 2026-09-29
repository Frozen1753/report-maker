import { PaintRoller } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import './ThemePanel.css'

type Vars = Record<string, string>
type PreviewMode = 'light' | 'dark'

interface ThemeApiResponse {
  light: Vars
  dark: Vars
}

const HEX_RE = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const isHexColor = (v: string) => HEX_RE.test(v.trim())

const FALLBACK_STACKS = [
  { label: 'System UI', value: 'system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Monospace', value: '"SFMono-Regular", Consolas, monospace' },
]

/**
 * Applies (or clears) a set of CSS custom properties as inline styles on
 * <html>, which override :root/:root[data-theme] from style.css without
 * writing anything to disk — this is the "preview" half of the panel.
 */
function applyPreview(vars: Vars) {
  const root = document.documentElement
  for (const [prop, value] of Object.entries(vars)) root.style.setProperty(prop, value)
}
function clearPreview(props: string[]) {
  const root = document.documentElement
  for (const prop of props) root.style.removeProperty(prop)
}

export function ThemePanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [light, setLight] = useState<Vars>({})
  const [dark, setDark] = useState<Vars>({})
  const [previewMode, setPreviewMode] = useState<PreviewMode>('light')
  const [fontVarName, setFontVarName] = useState('--font-body')
  const [fontFamily, setFontFamily] = useState('')
  const [fontFallback, setFontFallback] = useState(FALLBACK_STACKS[0].value)
  const [fontImportUrl, setFontImportUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  // Load current values once, on first open.
  useEffect(() => {
    if (!isOpen || loaded) return
    fetch('/api/theme')
      .then((r) => r.json())
      .then((data: ThemeApiResponse) => {
        setLight(data.light)
        setDark(data.dark)
        setLoaded(true)
      })
      .catch((err) => setMessage({ ok: false, text: `Could not load theme: ${err.message}` }))
  }, [isOpen, loaded])

  // Live preview whenever a value or the light/dark toggle changes.
  useEffect(() => {
    if (!loaded) return
    document.documentElement.dataset.theme = previewMode
    applyPreview(light)
    if (previewMode === 'dark') applyPreview(dark)
    return () => {
      // Only clean up on unmount (panel closed for good), not on every value change.
    }
  }, [light, dark, previewMode, loaded])

  useEffect(() => {
    return () => {
      // Panel unmounted: drop the forced preview, let the page fall back to
      // its own default (e.g. prefers-color-scheme via CSS, if you use that
      // for first-load, or plain :root if you don't).
      delete document.documentElement.dataset.theme
      clearPreview([...Object.keys(light), ...Object.keys(dark)])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const colorVars = useMemo(() => Object.keys(light).filter((k) => isHexColor(light[k])), [light])
  const otherVars = useMemo(() => Object.keys(light).filter((k) => !isHexColor(light[k])), [light])

  function setLightVar(key: string, value: string) {
    setLight((prev) => ({ ...prev, [key]: value }))
  }
  function setDarkVar(key: string, value: string) {
    setDark((prev) => ({ ...prev, [key]: value }))
  }
  function clearDarkOverride(key: string) {
    setDark((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function buildFontsBlock(): string {
    if (!fontImportUrl.trim()) return ''
    return [
      '/* theme-panel:fonts:start */',
      `@import url("${fontImportUrl.trim()}");`,
      '/* theme-panel:fonts:end */',
    ].join('\n')
  }

  function applyFontVar() {
    if (!fontFamily.trim()) return
    setLightVar(fontVarName, `"${fontFamily.trim()}", ${fontFallback}`)
  }

  async function handleSave() {
    setIsSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ light, dark, fontsBlock: buildFontsBlock() }),
      })
      const data = await res.json()
      setMessage(
        data.ok
          ? { ok: true, text: 'Saved to style.css — Vite will hot-reload it.' }
          : { ok: false, text: data.error ?? 'Save failed.' },
      )
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : String(err) })
    } finally {
      setIsSaving(false)
    }
  }

  function handleReset() {
    clearPreview([...Object.keys(light), ...Object.keys(dark)])
    setLoaded(false) // triggers a fresh GET next render
    setMessage(null)
  }

  return (
    <>
      <button
        type="button"
        className="theme-panel-fab"
        onClick={() => setIsOpen(true)}
        aria-label="Open theme panel"
        title="Edit theme"
      >
        <PaintRoller />
      </button>

      {isOpen && (
        <div
          className="theme-panel-backdrop"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
        >
          <div className="theme-panel-modal" role="dialog" aria-modal="true" aria-label="Theme editor">
            <header className="theme-panel-header">
              <h2>Theme</h2>
              <div className="theme-panel-mode-toggle" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={previewMode === 'light'}
                  className={previewMode === 'light' ? 'active' : ''}
                  onClick={() => setPreviewMode('light')}
                >
                  ☀ Light
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={previewMode === 'dark'}
                  className={previewMode === 'dark' ? 'active' : ''}
                  onClick={() => setPreviewMode('dark')}
                >
                  🌙 Dark
                </button>
              </div>
              <button type="button" className="theme-panel-close" onClick={() => setIsOpen(false)} aria-label="Close">
                ✕
              </button>
            </header>

            {!loaded ? (
              <p className="theme-panel-loading">Loading current theme…</p>
            ) : (
              <div className="theme-panel-body">
                <fieldset>
                  <legend>Colors</legend>
                  {colorVars.map((key) => {
                    const value = previewMode === 'dark' ? (dark[key] ?? light[key]) : light[key]
                    const overridden = previewMode === 'dark' && key in dark
                    return (
                      <label key={key} className="theme-panel-row">
                        <span className="theme-panel-var-name">{key}</span>
                        <input
                          type="color"
                          value={isHexColor(value) ? value : '#000000'}
                          onChange={(e) =>
                            previewMode === 'dark' ? setDarkVar(key, e.target.value) : setLightVar(key, e.target.value)
                          }
                        />
                        <input
                          type="text"
                          className="theme-panel-value-text"
                          value={value}
                          onChange={(e) =>
                            previewMode === 'dark' ? setDarkVar(key, e.target.value) : setLightVar(key, e.target.value)
                          }
                        />
                        {previewMode === 'dark' && (
                          <button
                            type="button"
                            className="theme-panel-clear-override"
                            title="Use the same value as light mode"
                            disabled={!overridden}
                            onClick={() => clearDarkOverride(key)}
                          >
                            ↺
                          </button>
                        )}
                      </label>
                    )
                  })}
                </fieldset>

                <fieldset>
                  <legend>Typography &amp; sizes</legend>
                  {otherVars.map((key) => {
                    const value = previewMode === 'dark' ? (dark[key] ?? light[key]) : light[key]
                    const overridden = previewMode === 'dark' && key in dark
                    return (
                      <label key={key} className="theme-panel-row">
                        <span className="theme-panel-var-name">{key}</span>
                        <input
                          type="text"
                          className="theme-panel-value-text theme-panel-value-wide"
                          value={value}
                          onChange={(e) =>
                            previewMode === 'dark' ? setDarkVar(key, e.target.value) : setLightVar(key, e.target.value)
                          }
                        />
                        {previewMode === 'dark' && (
                          <button
                            type="button"
                            className="theme-panel-clear-override"
                            title="Use the same value as light mode"
                            disabled={!overridden}
                            onClick={() => clearDarkOverride(key)}
                          >
                            ↺
                          </button>
                        )}
                      </label>
                    )
                  })}
                </fieldset>

                <fieldset>
                  <legend>Add a font</legend>
                  <label className="theme-panel-row">
                    <span className="theme-panel-var-name">Import URL</span>
                    <input
                      type="text"
                      className="theme-panel-value-text theme-panel-value-wide"
                      placeholder="https://fonts.googleapis.com/css2?family=..."
                      value={fontImportUrl}
                      onChange={(e) => setFontImportUrl(e.target.value)}
                    />
                  </label>
                  <label className="theme-panel-row">
                    <span className="theme-panel-var-name">Family name</span>
                    <input
                      type="text"
                      className="theme-panel-value-text"
                      placeholder="Inter"
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                    />
                  </label>
                  <label className="theme-panel-row">
                    <span className="theme-panel-var-name">Fallback</span>
                    <select value={fontFallback} onChange={(e) => setFontFallback(e.target.value)}>
                      {FALLBACK_STACKS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="theme-panel-row">
                    <span className="theme-panel-var-name">CSS variable</span>
                    <input
                      type="text"
                      className="theme-panel-value-text"
                      value={fontVarName}
                      onChange={(e) => setFontVarName(e.target.value)}
                    />
                    <button type="button" className="theme-panel-apply-font" onClick={applyFontVar}>
                      Set
                    </button>
                  </label>
                  <p className="theme-panel-hint">
                    The import stays a network font — offline/singlefile builds fall back to the stack above.
                  </p>
                </fieldset>

                {message && (
                  <p className={`theme-panel-message ${message.ok ? 'is-success' : 'is-error'}`}>{message.text}</p>
                )}
              </div>
            )}

            <footer className="theme-panel-footer">
              <button type="button" className="theme-panel-reset" onClick={handleReset}>
                Reset
              </button>
              <button type="button" className="theme-panel-save" onClick={handleSave} disabled={isSaving || !loaded}>
                {isSaving ? 'Saving…' : 'Save to style.css'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  )
}
