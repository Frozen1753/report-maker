import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  getInitialTheme,
  getStoredTheme,
  STORAGE_KEY,
  type Theme,
} from '../../utils/theme/getSystemTheme';

export function ThemeButton() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Follow the OS theme live, but only for readers who never made an explicit
  // choice — once they click the button, their choice is stored and wins.
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (getStoredTheme() === null) setTheme(e.matches ? 'dark' : 'light');
    };
    mql.addEventListener('change', handleSystemChange);
    return () => mql.removeEventListener('change', handleSystemChange);
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable — the toggle still works for this page view,
      // it just won't be remembered on the next visit.
    }
  }

  return (
    <button
      type="button"
      className="theme-button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}
