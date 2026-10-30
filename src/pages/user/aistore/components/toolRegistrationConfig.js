export const MAX_SCREENSHOTS = 3;
export const TOOL_TYPE_OPTIONS = ['AI App', 'AI Agent', '자동화 도구', '일반 업무 도구'];
export const CATEGORY_OPTIONS = [
  '문서·생산성',
  '업무 자동화',
  '데이터·분석',
  '개발·IT',
  '고객·지원',
  '기타',
];
export const SUPPORT_ENVIRONMENT_FIELDS = [
  {
    key: 'audience',
    label: '사용 가능 대상',
    placeholder: '사용 가능 대상을 선택해 주세요.',
    customPlaceholder: '사용 가능 대상을 직접 입력해 주세요.',
    required: true,
    options: ['PC (사내망)', 'PC (인터넷망)', 'PC 및 모바일', '모바일', '모든 기기'],
  },
  {
    key: 'operatingSystem',
    label: '운영체제',
    placeholder: '운영체제를 선택해 주세요.',
    customPlaceholder: '운영체제와 최소 버전을 직접 입력해 주세요.',
    required: true,
    options: [
      'Windows 10 이상',
      'Windows 11 이상',
      'macOS 13 이상',
      'Windows 10 이상, macOS 13 이상',
      '운영체제 무관',
    ],
  },
  {
    key: 'browser',
    label: '브라우저',
    placeholder: '브라우저를 선택해 주세요.',
    customPlaceholder: '지원 브라우저와 최소 버전을 직접 입력해 주세요.',
    required: true,
    options: [
      'Chrome 최신 버전',
      'Edge 최신 버전',
      'Chrome, Edge 최신 버전',
      'Safari 최신 버전',
      '주요 브라우저 최신 버전',
      '브라우저 무관',
    ],
  },
  { key: 'memory', label: '메모리', placeholder: '예: 최소 4GB, 권장 8GB' },
  { key: 'other', label: '기타 요구사항', placeholder: '예: 별도 설치 없이 사용 가능' },
];

export const CUSTOM_SUPPORT_ENVIRONMENT_OPTION = '기타 (직접 입력)';

export const EMPTY_SUPPORT_ENVIRONMENT = {
  audience: '',
  operatingSystem: '',
  browser: '',
  memory: '',
  other: '',
};
