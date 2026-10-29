const STORAGE_KEY = 'ondam-url-analyses-v1';

function readSavedAnalyses() {
  if (typeof window === 'undefined') return [];
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function loadUrlAnalyses(defaultAnalyses = []) {
  const saved = readSavedAnalyses();
  const savedIds = new Set(saved.map(item => String(item.id)));
  return [...saved, ...defaultAnalyses.filter(item => !savedIds.has(String(item.id)))];
}

export function saveUrlAnalysis(analysis) {
  if (typeof window === 'undefined' || !analysis) return;
  const saved = readSavedAnalyses();
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([analysis, ...saved.filter(item => String(item.id) !== String(analysis.id))])
  );
}

export function saveUrlAnalyses(analyses) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
}
