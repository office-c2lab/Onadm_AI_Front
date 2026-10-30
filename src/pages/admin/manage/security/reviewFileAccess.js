export function canDownloadReviewFile(review) {
  return review?.scan === '통과';
}

export const REVIEW_FILE_DOWNLOAD_UNAVAILABLE_MESSAGE =
  '자동 보안 심사를 통과한 파일만 다운로드할 수 있습니다.';
