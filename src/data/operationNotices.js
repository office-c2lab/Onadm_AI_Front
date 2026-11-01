const STORAGE_KEY = 'ondam:system-operation-notices';

export const NOTICE_CATEGORIES = ['긴급', '시스템 업데이트', '점검 안내', '운영 안내'];

export const DEFAULT_OPERATION_NOTICES = [
  {
    id: 'notice-1',
    title: 'Control 내부 정기 점검 안내',
    description: '정책 엔진 업데이트를 위한 정기 점검이 진행될 예정입니다.',
    category: '점검 안내',
    startAt: '2026-10-28T14:30',
    endAt: '2026-11-30T18:00',
    status: '게시 중',
  },
  {
    id: 'notice-2',
    title: 'AI Policy Engine 업데이트 안내',
    description: '정책 처리 성능과 요청 라우팅 안정성이 개선되었습니다.',
    category: '시스템 업데이트',
    startAt: '2026-10-25T09:00',
    endAt: '2026-11-30T23:59',
    status: '게시 중',
  },
  {
    id: 'notice-3',
    title: '외부 AI 연동 장애 긴급 안내',
    description: '일부 외부 AI 서비스 연동이 지연되어 현재 긴급 복구를 진행하고 있습니다.',
    category: '긴급',
    startAt: '2026-10-30T16:20',
    endAt: '2026-11-10T18:00',
    status: '게시 중',
  },
  {
    id: 'notice-4',
    title: 'AI App Store 운영 정책 안내',
    description: '앱 등록 기준과 심사 요청 절차가 일부 변경되었습니다.',
    category: '운영 안내',
    startAt: '2026-10-27T10:00',
    endAt: '2026-11-30T23:59',
    status: '게시 중',
  },
];

export function readOperationNotices() {
  if (typeof window === 'undefined') return DEFAULT_OPERATION_NOTICES;

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) return DEFAULT_OPERATION_NOTICES;

    const notices = JSON.parse(storedValue);
    return Array.isArray(notices)
      ? notices.map(notice => ({
          ...notice,
          category: NOTICE_CATEGORIES.includes(notice.category) ? notice.category : '운영 안내',
        }))
      : DEFAULT_OPERATION_NOTICES;
  } catch {
    return DEFAULT_OPERATION_NOTICES;
  }
}

export function writeOperationNotices(notices) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
}
