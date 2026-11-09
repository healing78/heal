export const THEME_STORAGE_KEY = 'healing78_ui_theme_v2';
export const DEFAULT_THEME = 'rose';

export const THEME_OPTIONS = [
  {
    id: 'rose',
    shortLabel: '로즈',
    label: '힐링 로즈 (화사함)',
    themeColor: '#e11d48',
    showDecorations: true
  },
  {
    id: 'mono',
    shortLabel: '무채색',
    label: '오피스 모노 (무채색)',
    themeColor: '#1e293b',
    showDecorations: false
  },
  {
    id: 'excel',
    shortLabel: '엑셀',
    label: '엑셀 시트 (업무모드)',
    themeColor: '#107c41',
    showDecorations: false
  }
];

export function getSavedTheme() {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (THEME_OPTIONS.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_THEME;
}

export function saveAndApplyTheme(themeId) {
  const validTheme =
    THEME_OPTIONS.find((t) => t.id === themeId) || THEME_OPTIONS[0];

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, validTheme.id);
    } catch {
      // ignore storage errors
    }
  }

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', validTheme.id);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', validTheme.themeColor);
    }
  }

  return validTheme.id;
}
