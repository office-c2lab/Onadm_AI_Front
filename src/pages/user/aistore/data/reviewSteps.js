export const ZIP_PREPARATION_DURATION_MS = 2_000;
export const AUTOMATED_REVIEW_DURATION_MS = 20_000;

export const reviewSteps = [
  {
    label: 'ZIP 정보 준비',
    description: '등록에 필요한 기본 파일 정보를 확인합니다.',
    checks: ['ZIP 형식 확인', '파일 열기 확인', '파일명·크기 기록'],
    duration: '2s',
  },
  {
    label: '파일 제출·보안 심사',
    description: '서버에 접수된 파일의 안전성을 심사합니다.',
    checks: ['파일 수신 및 압축 구조 확인', '악성 파일 확인', '요청 권한과 외부 연결 확인'],
    duration: '18s',
  },
  {
    label: '관리자 검토',
    description: '담당자가 도구의 운영 적합성을 검토합니다.',
    checks: ['도구 목적과 설명 검토', '사내 데이터 접근 범위 확인', '운영 정책 적합성 검토'],
    duration: '—',
  },
  {
    label: '승인 및 게시',
    description: '최종 승인 후 운영 목록에 반영합니다.',
    checks: ['최종 승인 확인', '내 도구에 게시'],
    duration: '—',
  },
];
