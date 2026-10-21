export const MAX_SCREENSHOTS = 3;
export const TOOL_TYPE_OPTIONS = ['AI App', 'AI Agent', '자동화 도구'];
export const CATEGORY_OPTIONS = ['문서·생산성', '데이터 분석', '커뮤니케이션', '개발', '기타'];
export const SUPPORT_ENVIRONMENT_FIELDS = [
  { key: 'audience', label: '사용 가능 대상', placeholder: '예: PC (사내망)', required: true },
  { key: 'operatingSystem', label: '운영체제', placeholder: '예: Windows 10 이상', required: true },
  { key: 'browser', label: '브라우저', placeholder: '예: Chrome, Edge 최신 버전', required: true },
  { key: 'memory', label: '메모리', placeholder: '예: 최소 4GB, 권장 8GB' },
  { key: 'other', label: '기타', placeholder: '예: 별도 설치 없이 사용 가능' },
];

export const EMPTY_SUPPORT_ENVIRONMENT = {
  audience: '',
  operatingSystem: '',
  browser: '',
  memory: '',
  other: '',
};
