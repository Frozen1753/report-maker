import { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, theme: 'neutral' });

interface MermaidProps {
  chart: string;
}

/**
 * Renders a mermaid diagram from its source text. Mermaid draws real SVG at
 * runtime (not build time), so — unlike highlight.js — the `mermaid` package
 * does ship to the browser. In singlefile/hybrid builds it's just part of
 * your one big inlined JS bundle; no separate asset handling needed since
 * it's code, not media.
 */
export function Mermaid({ chart }: MermaidProps) {
  const id = useId().replace(/:/g, '');
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    mermaid.render(`mermaid-${id}`, chart.trim()).then(({ svg }) => {
      if (!cancelled) setSvg(svg);
    });
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (!svg) return <pre className="mermaid-loading">Rendering diagram…</pre>;
  // eslint-disable-next-line react/no-danger -- mermaid's own SVG output
  return <div className="mermaid-diagram" dangerouslySetInnerHTML={{ __html: svg }} />;
}
