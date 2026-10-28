const STORAGE_KEY = 'ondam:system-operation-notices';

export const DEFAULT_OPERATION_NOTICES = [
  {
    id: 'notice-1',
    title: 'Control 내부 정기 점검 안내',
    description: '정책 엔진 업데이트를 위한 정기 점검이 진행될 예정입니다.',
    startAt: '2026-10-28T14:30',
    endAt: '2026-10-31T18:00',
    status: '게시 중',
  },
  {
    id: 'notice-2',
    title: 'AI Policy Engine 업데이트 안내',
    description: '정책 처리 성능과 요청 라우팅 안정성이 개선되었습니다.',
    startAt: '2026-10-25T09:00',
    endAt: '2026-11-08T23:59',
    status: '게시 중',
  },
  {
    id: 'notice-3',
    title: '모니터링 수집 지연 정상화 안내',
    description: '일부 외부 AI 모니터링 데이터의 수집 지연이 정상화되었습니다.',
    startAt: '2026-10-23T16:20',
    endAt: '2026-10-25T18:00',
    status: '게시 종료',
  },
];

export function readOperationNotices() {
  if (typeof window === 'undefined') return DEFAULT_OPERATION_NOTICES;

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) return DEFAULT_OPERATION_NOTICES;

    const notices = JSON.parse(storedValue);
    return Array.isArray(notices) ? notices : DEFAULT_OPERATION_NOTICES;
  } catch {
    return DEFAULT_OPERATION_NOTICES;
  }
}

export function writeOperationNotices(notices) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
}
