import { AppTheme } from '../types';

// Force dark mode and remove any stale clean-light preferences
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('vibe_theme');
    const root = document.documentElement;
    root.classList.remove('clean-light');
    root.classList.add('vibrant-dark');
    root.setAttribute('data-theme', 'vibrant-dark');
    document.body.style.backgroundColor = '#0c0a1d';
    document.body.style.color = '#f8fafc';
  } catch {
    // Ignore
  }
}

export function getInitialTheme(): AppTheme {
  return 'vibrant-dark';
}

export function applyThemeToDocument(_theme?: AppTheme): void {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('clean-light');
  root.classList.add('vibrant-dark');
  root.setAttribute('data-theme', 'vibrant-dark');
  document.body.style.backgroundColor = '#0c0a1d';
  document.body.style.color = '#f8fafc';
}
