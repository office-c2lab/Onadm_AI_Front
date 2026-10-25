const AI_STORE_STORAGE_VERSION_KEY = 'ondam:aistore:data-version';

// 목업 데이터 구조를 크게 변경할 때 이 값만 올리면 기존 데이터가 한 번 정리됩니다.
const AI_STORE_STORAGE_VERSION = '2026-10-25-v1';

const RESETTABLE_AI_STORE_KEYS = [
  'ondam:manage:favorites',
  'ondam:manage:downloads',
  'ondam:manage:downloadVersions',
  'ondam:manage:mytools',
  'ondam:register:uploads',
];

export function ensureAiStoreStorageVersion() {
  if (typeof window === 'undefined') return;

  try {
    const savedVersion = window.localStorage.getItem(AI_STORE_STORAGE_VERSION_KEY);
    if (savedVersion === AI_STORE_STORAGE_VERSION) return;

    RESETTABLE_AI_STORE_KEYS.forEach(key => window.localStorage.removeItem(key));
    window.localStorage.setItem(AI_STORE_STORAGE_VERSION_KEY, AI_STORE_STORAGE_VERSION);
  } catch {
    // 저장소 사용이 제한된 환경에서도 페이지 렌더링은 계속합니다.
  }
}
