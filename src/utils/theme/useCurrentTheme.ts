import { useEffect, useState } from 'react';
import type { Theme } from './getSystemTheme';

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

/**
 * Tracks document.documentElement.dataset.theme as React state.
 *
 * Needed because that attribute is set by ThemeButton (production) or
 * ThemePanel (dev preview) directly on the DOM — React has no idea it
 * changed, so any component that needs to react to the current theme
 * (not just read it once) has to watch for it explicitly.
 */
export function useCurrentTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}
