import { AppTheme } from '../types';

const THEME_STORAGE_KEY = 'vibe_theme';

export function getInitialTheme(): AppTheme {
  if (typeof window === 'undefined') return 'vibrant-dark';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme | null;
    if (saved === 'clean-light' || saved === 'vibrant-dark') {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return 'vibrant-dark';
}

export function applyThemeToDocument(theme: AppTheme): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore
  }

  const root = document.documentElement;
  root.setAttribute('data-theme', theme);

  if (theme === 'clean-light') {
    root.classList.add('clean-light');
    root.classList.remove('vibrant-dark');
    document.body.style.backgroundColor = '#f8fafc';
    document.body.style.color = '#0f172a';
  } else {
    root.classList.add('vibrant-dark');
    root.classList.remove('clean-light');
    document.body.style.backgroundColor = '#0c0a1d';
    document.body.style.color = '#f8fafc';
  }
}
