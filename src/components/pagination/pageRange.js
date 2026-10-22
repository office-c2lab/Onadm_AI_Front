export function normalizePagination(currentPage, totalPages) {
  const total = Number.isFinite(totalPages) ? Math.max(0, Math.floor(totalPages)) : 0;
  const current = Number.isFinite(currentPage) ? Math.floor(currentPage) : 1;
  return { totalPages: total, currentPage: Math.max(1, Math.min(current, total || 1)) };
}

export function buildPageRange(currentPage, totalPages, windowSize = 5) {
  const normalized = normalizePagination(currentPage, totalPages);
  const size = Number.isFinite(windowSize) ? Math.max(1, Math.floor(windowSize)) : 5;
  const count = Math.min(normalized.totalPages, size);
  const start = Math.max(
    1,
    Math.min(normalized.currentPage - Math.floor(count / 2), normalized.totalPages - count + 1)
  );
  return Array.from({ length: count }, (_, index) => start + index);
}
