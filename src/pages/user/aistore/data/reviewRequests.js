export const REVIEW_REQUESTS_KEY = 'ondam:register:uploads';
export const CURRENT_TOOL_MAKER = {
  maker: '경영지원팀',
  makerPosition: '대리',
  makerName: '김서연',
};

export const MOCK_TOOL_UPDATE_REVIEW = {
  id: 'mock-report-writer-update-v130',
  toolId: 'mine-1',
  name: '보고서 작성 도우미',
  fileName: 'report_writer_v1.3.0.zip',
  size: '4.6 MB',
  createdAt: '2026. 10. 21. 10:15',
  requestType: '업데이트',
  previousVersion: '1.2.0',
  version: '1.3.0',
  updateNotes: '표 자동 생성 기능을 추가하고 문서 내보내기 속도를 개선했습니다.',
  status: '심사 진행중',
};

const reviewStatusAliases = {
  '등록 대기': '검사 대기',
  '제출 준비': '검사 대기',
  '승인 대기': '검사 대기',
  '검사 중': '심사 진행중',
  '검토 중': '심사 진행중',
  '보완 필요': '반려',
  '등록 완료': '승인 완료',
};

export function normalizeReviewStatus(status) {
  return reviewStatusAliases[status] ?? status;
}

export function readSavedReviewRequests() {
  if (typeof window === 'undefined') return [];

  try {
    const saved = window.localStorage.getItem(REVIEW_REQUESTS_KEY);
    const requests = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(requests)) return [];
    return requests.map(request => ({
      ...request,
      status: normalizeReviewStatus(request.status),
    }));
  } catch {
    return [];
  }
}

export function getToolUpdateReviews() {
  const savedRequests = readSavedReviewRequests().filter(
    request => request.requestType === '업데이트'
  );
  const hasMockRequest = savedRequests.some(request => request.id === MOCK_TOOL_UPDATE_REVIEW.id);
  return hasMockRequest ? savedRequests : [...savedRequests, MOCK_TOOL_UPDATE_REVIEW];
}

function isReviewForTool(review, tool) {
  return review.toolId ? review.toolId === tool.id : review.name === tool.name;
}

export function getActiveToolUpdateReview(tool, reviews = getToolUpdateReviews()) {
  return reviews.find(
    review => isReviewForTool(review, tool) && ['검사 대기', '심사 진행중'].includes(review.status)
  );
}

export function getApprovedToolUpdateReview(tool, reviews = getToolUpdateReviews()) {
  return reviews.find(review => isReviewForTool(review, tool) && review.status === '승인 완료');
}

function removeLargePreviewData(request) {
  return {
    ...request,
    iconData: '',
    screenshots: (request.screenshots ?? []).map(screenshot => ({
      name: screenshot.name,
      data: '',
    })),
  };
}

export function saveReviewRequests(requests) {
  try {
    window.localStorage.setItem(REVIEW_REQUESTS_KEY, JSON.stringify(requests));
  } catch {
    const compactRequests = requests.map(removeLargePreviewData);
    window.localStorage.setItem(REVIEW_REQUESTS_KEY, JSON.stringify(compactRequests));
  }
}

export function addReviewRequest(request) {
  const stored = window.localStorage.getItem(REVIEW_REQUESTS_KEY);
  const parsed = stored ? JSON.parse(stored) : [];
  if (!Array.isArray(parsed)) throw new Error('Invalid review requests');
  saveReviewRequests([request, ...parsed]);
}

export function formatReviewDate(date) {
  const twoDigits = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}. ${twoDigits(date.getMonth() + 1)}. ${twoDigits(date.getDate())}. ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
}
