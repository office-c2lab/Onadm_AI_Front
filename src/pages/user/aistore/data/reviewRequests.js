export const REVIEW_REQUESTS_KEY = 'ondam:register:uploads';
export const CURRENT_TOOL_MAKER = {
  maker: '경영지원팀',
  makerPosition: '대리',
  makerName: '김서연',
};

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
