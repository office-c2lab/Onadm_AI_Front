export const REVIEW_REQUESTS_KEY = 'ondam:register:uploads';

export function addReviewRequest(request) {
  const stored = window.localStorage.getItem(REVIEW_REQUESTS_KEY);
  const parsed = stored ? JSON.parse(stored) : [];
  if (!Array.isArray(parsed)) throw new Error('Invalid review requests');
  window.localStorage.setItem(REVIEW_REQUESTS_KEY, JSON.stringify([request, ...parsed]));
}

export function formatReviewDate(date) {
  const twoDigits = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}. ${twoDigits(date.getMonth() + 1)}. ${twoDigits(date.getDate())}. ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
}
