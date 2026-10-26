const REVIEW_DECISIONS_KEY = 'ondam:admin:review-decisions';

export function getReviewDecisions() {
  if (typeof window === 'undefined') return {};

  try {
    const saved = window.localStorage.getItem(REVIEW_DECISIONS_KEY);
    const decisions = saved ? JSON.parse(saved) : {};
    return decisions && typeof decisions === 'object' && !Array.isArray(decisions) ? decisions : {};
  } catch {
    return {};
  }
}

export function applyReviewDecision(review) {
  const decision = getReviewDecisions()[review.id];
  return decision ? { ...review, ...decision } : review;
}

export function saveReviewDecision(reviewId, decision) {
  const decisions = getReviewDecisions();
  window.localStorage.setItem(
    REVIEW_DECISIONS_KEY,
    JSON.stringify({ ...decisions, [reviewId]: decision })
  );
}
