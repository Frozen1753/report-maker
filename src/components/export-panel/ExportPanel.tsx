import { Download } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import './ExportPanel.css';

type ReportBuildMode = 'folder' | 'singlefile' | 'hybrid';

interface ExportResult {
  ok: boolean;
  log: string;
  outDir: string;
}

const MODE_INFO: { value: ReportBuildMode; label: string; description: string }[] = [
  {
    value: 'folder',
    label: 'Folder',
    description: 'index.html + a separate assets/ folder (default Vite output).',
  },
  {
    value: 'singlefile',
    label: 'Single file',
    description: 'Everything — JS, CSS, every image/gif/video — inlined into one .html.',
  },
  {
    value: 'hybrid',
    label: 'Hybrid',
    description: 'One .html for JS/CSS, but the assets you exclude below stay in assets/.',
  },
];

const KNOWN_EXTENSIONS = ['.gif', '.mp4', '.mov', '.webm'] as const;

export function ExportPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ReportBuildMode>('hybrid');
  const [excludedExt, setExcludedExt] = useState<Set<string>>(
    new Set(['.gif', '.mp4', '.mov', '.webm']),
  );
  const [maxImageWidth, setMaxImageWidth] = useState(3000);
  const [excludedFiles, setExcludedFiles] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);

  const [detectedAssets, setDetectedAssets] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/assets')
      .then((r) => r.json())
      .then((d) => setDetectedAssets(d.files));
  }, []);

  // Must depend on detectedAssets: it now arrives asynchronously from the
  // fetch above, not synchronously from import.meta.glob like before — an
  // empty dependency array would freeze this at the first render's "[]".
  const largeAssets = useMemo(
    () =>
      detectedAssets.filter((f) => KNOWN_EXTENSIONS.some((ext) => f.toLowerCase().endsWith(ext))),
    [detectedAssets],
  );

  function toggleSet(set: Set<string>, setSet: (s: Set<string>) => void, value: string) {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setSet(next);
  }

  async function handleExport() {
    setIsExporting(true);
    setResult(null);
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          excludeExtensions: Array.from(excludedExt),
          maxImageWidth,
          excludeFiles: Array.from(excludedFiles),
        }),
      });
      const data: ExportResult = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ ok: false, log: err instanceof Error ? err.message : String(err), outDir: '' });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="report-export-fab"
        onClick={() => setIsOpen(true)}
        aria-label="Open export panel"
        title="Export report"
      >
        <Download />
      </button>

      {isOpen && (
        <div
          className="report-export-backdrop"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
        >
          <div
            className="report-export-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Export report"
          >
            <header className="report-export-header">
              <h2>Export report</h2>
              <button
                type="button"
                className="report-export-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </header>

            <div className="report-export-body">
              <fieldset className="report-export-modes">
                <legend>Build mode</legend>
                {MODE_INFO.map((m) => (
                  <label key={m.value} className="report-export-mode-option">
                    <input
                      type="radio"
                      name="report-export-mode"
                      value={m.value}
                      checked={mode === m.value}
                      onChange={() => setMode(m.value)}
                    />
                    <span>
                      <strong>{m.label}</strong>
                      <small>{m.description}</small>
                    </span>
                  </label>
                ))}
              </fieldset>

              {mode === 'hybrid' && (
                <fieldset className="report-export-hybrid-options">
                  <legend>Keep external (don't inline)</legend>

                  <div className="report-export-checkbox-group">
                    {KNOWN_EXTENSIONS.map((ext) => (
                      <label key={ext} className="report-export-checkbox">
                        <input
                          type="checkbox"
                          checked={excludedExt.has(ext)}
                          onChange={() => toggleSet(excludedExt, setExcludedExt, ext)}
                        />
                        all {ext} files
                      </label>
                    ))}
                  </div>

                  <label className="report-export-width">
                    Exclude images wider than
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={maxImageWidth}
                      onChange={(e) => setMaxImageWidth(Number(e.target.value))}
                    />
                    px
                  </label>

                  {largeAssets.length > 0 && (
                    <>
                      <p className="report-export-detected-label">
                        Detected gif/video assets — exclude individually:
                      </p>
                      <div className="report-export-checkbox-group report-export-file-list">
                        {largeAssets.map((f) => (
                          <label key={f} className="report-export-checkbox">
                            <input
                              type="checkbox"
                              checked={excludedFiles.has(f)}
                              onChange={() => toggleSet(excludedFiles, setExcludedFiles, f)}
                            />
                            {f}
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </fieldset>
              )}

              {result && (
                <div className={`report-export-result ${result.ok ? 'is-success' : 'is-error'}`}>
                  <p>{result.ok ? `✓ Built to ${result.outDir}/` : '✗ Build failed'}</p>
                  {result.log && <pre>{result.log}</pre>}
                </div>
              )}
            </div>

            <footer className="report-export-footer">
              <button
                type="button"
                className="report-export-cancel"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="report-export-submit"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? 'Building…' : 'Export'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
