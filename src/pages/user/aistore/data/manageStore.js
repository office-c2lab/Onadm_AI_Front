import { useState } from 'react';
import {
  getApprovedToolUpdateReview,
  getToolUpdateReviews,
  normalizeReviewStatus,
} from './reviewRequests.js';

// 스토어 샘플 데이터
export const publishedTools = [
  {
    id: 'report',
    name: '보고서 작성 도우미',
    summary: '핵검 내용만 입력하면 보고서 초안을 체계적으로 작성해요.',
    type: 'AI App',
    category: '문서·생산성',
    storeCategory: '문서 자동화',
    storeTags: ['문서 작성', '생산성'],
    maker: '경영지원팀',
    makerPosition: '대리',
    makerName: '김서연',
    version: '1.2.0',
    versionHistory: [
      { version: '1.2.0', updatedAt: '2026.10.18' },
      { version: '1.1.0', updatedAt: '2026.09.24' },
      { version: '1.0.0', updatedAt: '2026.08.12' },
    ],
    releaseNotes: [
      '보고서 목적에 맞는 문서 구조 추천 기능을 개선했습니다.',
      '긴 메모를 입력했을 때 핵검 내용을 더 안정적으로 정리합니다.',
      '문서 초안의 문단 간격과 제목 형식을 다듬었습니다.',
    ],
    featured: true,
    description: '업무 보고서 및 기획안의 초안을 작성하는 사내 도구입니다.',
  },
  {
    id: 'meeting',
    name: '회의록 정리 도우미',
    summary: '회의 내용을 요약하고 결정 사항과 할 일을 정리해요.',
    type: 'AI App',
    category: '문서·생산성',
    storeTags: ['회의·요약', '문서 작성', '협업', '생산성'],
    maker: '전략기획팀',
    makerPosition: '과장',
    makerName: '박준호',
    version: '1.4.1',
    versionHistory: [
      { version: '1.4.1', updatedAt: '2026.10.22' },
      { version: '1.4.0', updatedAt: '2026.10.08' },
      { version: '1.3.0', updatedAt: '2026.09.12' },
    ],
    releaseNotes: [
      '참석자별 발언 구분 정확도를 개선했습니다.',
      '결정 사항과 후속 작업을 별도 항목으로 정리합니다.',
      '담당자와 완료 기한 인식 오류를 수정했습니다.',
    ],
    featured: true,
    description: '회의 내용을 바탕으로 결정 사항과 담당자별 작업을 정리합니다.',
  },
  {
    id: 'workflow',
    name: '업무 요청 자동 분류',
    summary: '접수된 업무 요청을 담당 부서로 자동 배정해요.',
    type: '자동화 도구',
    category: '업무 자동화',
    storeTags: ['업무 자동화', '협업', '사내 업무'],
    maker: '운영혁신팀',
    makerPosition: '매니저',
    makerName: '이지훈',
    version: '2.0.0',
    versionHistory: [
      { version: '2.0.0', updatedAt: '2026.10.20' },
      { version: '1.5.2', updatedAt: '2026.09.29' },
      { version: '1.5.0', updatedAt: '2026.08.21' },
    ],
    releaseNotes: [
      '여러 부서에 걸친 요청의 분류 기준을 개선했습니다.',
      '우선순위와 담당 부서를 함께 추천하도록 변경했습니다.',
      '분류 예외 규칙을 안정적으로 적용하도록 수정했습니다.',
    ],
    featured: true,
    description: '규칙에 따라 요청을 구분하고 관련 부서로 전달합니다.',
  },
  {
    id: 'analysis',
    name: '데이터 분석 도우미',
    summary: '표 데이터를 분석하고 주요 인사이트를 정리해요.',
    type: 'AI Agent',
    category: '데이터·분석',
    storeTags: ['데이터 분석', '업무 자동화', 'AI 에이전트'],
    maker: '데이터팀',
    makerPosition: '데이터 분석가',
    makerName: '최유진',
    version: '0.9.2',
    versionHistory: [
      { version: '0.9.2', updatedAt: '2026.10.16' },
      { version: '0.9.1', updatedAt: '2026.09.18' },
      { version: '0.9.0', updatedAt: '2026.08.27' },
    ],
    releaseNotes: [
      '기간별 추세와 이상값 탐지 정확도를 개선했습니다.',
      '누락된 데이터가 있을 때 안내 문구를 추가했습니다.',
      '분석 결과의 핵검 지표 표시 방식을 정리했습니다.',
    ],
    description: '표 데이터의 추세와 이상값을 분석합니다.',
  },
  {
    id: 'review',
    name: '코드 리뷰 도우미',
    summary: '코드 품질과 잠재적인 오류를 검토해요.',
    type: 'AI App',
    category: '개발·IT',
    storeTags: ['개발·IT', '생산성'],
    maker: '개발팀',
    makerPosition: '시니어 엔지니어',
    makerName: '정민수',
    version: '1.1.0',
    versionHistory: [
      { version: '1.1.0', updatedAt: '2026.10.14' },
      { version: '1.0.1', updatedAt: '2026.09.10' },
      { version: '1.0.0', updatedAt: '2026.08.05' },
    ],
    releaseNotes: [
      '잠재적인 오류와 가독성 개선 제안을 구분해 표시합니다.',
      '긴 코드 입력의 분석 안정성을 개선했습니다.',
      '일부 언어에서 발생하던 구문 분석 오류를 수정했습니다.',
    ],
    description: '코드 품질 개선을 위한 피드백을 제공합니다.',
  },
  {
    id: 'expense',
    name: '정산 파일 일괄 취합',
    summary: '여러 엑셀 파일을 동일한 양식으로 취합해요.',
    type: '자동화 도구',
    category: '업무 자동화',
    storeTags: ['업무 자동화', '파일·정산'],
    maker: '재무팀',
    makerPosition: '대리',
    makerName: '한지민',
    version: '1.0.2',
    versionHistory: [
      { version: '1.0.2', updatedAt: '2026.10.11' },
      { version: '1.0.1', updatedAt: '2026.09.03' },
      { version: '1.0.0', updatedAt: '2026.07.28' },
    ],
    releaseNotes: [
      '서로 다른 열 이름을 가진 파일의 취합 규칙을 개선했습니다.',
      '중복 행과 누락 항목 확인 기능을 보완했습니다.',
      '대용량 파일 처리 중 발생하던 오류를 수정했습니다.',
    ],
    description: 'AI 모델을 사용하지 않는 파일 취합 자동화입니다.',
  },
  {
    id: 'translate',
    name: '문서 번역 도구',
    summary: '업무 문서를 빠르게 번역하고 용어를 통일해요.',
    type: 'AI App',
    category: '문서·생산성',
    storeTags: ['번역', '문서 작성', '협업', '생산성'],
    maker: '글로벌사업팀',
    makerPosition: '매니저',
    makerName: '윤서아',
    version: '1.3.0',
    versionHistory: [
      { version: '1.3.0', updatedAt: '2026.10.19' },
      { version: '1.2.1', updatedAt: '2026.09.16' },
      { version: '1.2.0', updatedAt: '2026.08.14' },
    ],
    releaseNotes: [
      '사내 용어집 적용 범위를 확대했습니다.',
      '문서의 말투와 형식을 유지하는 기능을 개선했습니다.',
      '숫자와 고유명사 번역 오류를 수정했습니다.',
    ],
    description: '사내 용어집을 참고해 번역을 제공합니다.',
  },
  {
    id: 'support',
    name: '문의 응대 에이전트',
    summary: '자주 묻는 사내 문의에 답변을 제공해요.',
    type: 'AI Agent',
    category: '고객·지원',
    storeTags: ['고객 지원', '문서 작성', '업무 자동화', 'AI 에이전트', '사내 업무'],
    maker: '인사총무팀',
    makerPosition: '주임',
    makerName: '오현우',
    version: '1.0.0',
    versionHistory: [{ version: '1.0.0', updatedAt: '2026.10.07' }],
    releaseNotes: [
      '질문과 관련된 사내 FAQ 검색 정확도를 개선했습니다.',
      '답변에 관련 정책과 담당 부서 정보를 함께 표시합니다.',
      '최신 공지 우선순위 적용 방식을 보완했습니다.',
    ],
    description: '사내 FAQ를 바탕으로 안내합니다.',
  },
  {
    id: 'contract',
    name: '계약서 검토 에이전트',
    summary: '계약서의 위험 조항과 빠진 내용을 찾아 정리해요.',
    type: 'AI Agent',
    category: '문서·생산성',
    storeTags: ['문서 작성', 'AI 에이전트', '협업'],
    maker: '법무팀',
    makerPosition: '변호사',
    makerName: '김도윤',
    version: '1.1.0',
    versionHistory: [
      { version: '1.1.0', updatedAt: '2026.10.21' },
      { version: '1.0.0', updatedAt: '2026.09.02' },
    ],
    releaseNotes: [
      '위험 조항과 검토 필요 항목의 구분을 개선했습니다.',
      '표준 계약서와 비교한 차이점을 함께 안내합니다.',
      '긴 문서에서 일부 조항이 누락되던 오류를 수정했습니다.',
    ],
    description: '계약서의 주요 조항을 검토하고 확인할 내용을 정리합니다.',
  },
  {
    id: 'email',
    name: '이메일 작성 에이전트',
    summary: '상황과 목적에 맞는 업무 이메일 초안을 작성해요.',
    type: 'AI Agent',
    category: '문서·생산성',
    storeTags: ['문서 작성', 'AI 에이전트', '생산성'],
    maker: '커뮤니케이션팀',
    makerPosition: '매니저',
    makerName: '서지아',
    version: '1.0.3',
    versionHistory: [
      { version: '1.0.3', updatedAt: '2026.10.17' },
      { version: '1.0.2', updatedAt: '2026.09.26' },
      { version: '1.0.0', updatedAt: '2026.08.19' },
    ],
    releaseNotes: [
      '수신자와 업무 상황에 맞는 말투 선택 기능을 추가했습니다.',
      '제목과 본문을 함께 추천하도록 개선했습니다.',
      '날짜와 이름이 잘못 바뀌는 문제를 수정했습니다.',
    ],
    description: '업무 목적에 맞는 이메일 제목과 본문 초안을 작성합니다.',
  },
  {
    id: 'inquiry',
    name: '고객 문의 분류 에이전트',
    summary: '고객 문의를 유형과 우선순위에 따라 자동 분류해요.',
    type: 'AI Agent',
    category: '고객·지원',
    storeTags: ['고객 지원', '업무 자동화', 'AI 에이전트', '협업'],
    maker: '고객경험팀',
    makerPosition: '선임',
    makerName: '이수빈',
    version: '1.2.1',
    versionHistory: [
      { version: '1.2.1', updatedAt: '2026.10.15' },
      { version: '1.2.0', updatedAt: '2026.09.20' },
      { version: '1.1.0', updatedAt: '2026.08.25' },
    ],
    releaseNotes: [
      '긴급 문의의 우선순위 판단 기준을 개선했습니다.',
      '문의 유형별 담당 팀 추천 기능을 추가했습니다.',
      '유사 문의가 중복 분류되던 문제를 수정했습니다.',
    ],
    description: '접수된 고객 문의를 분류하고 담당 팀을 추천합니다.',
  },
  {
    id: 'schedule',
    name: '일정 조율 에이전트',
    summary: '참석자 일정과 조건을 확인해 가능한 시간을 찾아줘요.',
    type: 'AI Agent',
    category: '업무 자동화',
    storeTags: ['업무 자동화', 'AI 에이전트', '협업', '생산성'],
    maker: '업무지원팀',
    makerPosition: '주임',
    makerName: '장하늘',
    version: '0.9.5',
    versionHistory: [
      { version: '0.9.5', updatedAt: '2026.10.13' },
      { version: '0.9.0', updatedAt: '2026.09.05' },
    ],
    releaseNotes: [
      '참석자별 가능 시간을 비교하는 방식을 개선했습니다.',
      '회의실과 화상 회의 조건을 함께 반영합니다.',
      '반복 일정에서 시간대가 어긋나던 문제를 수정했습니다.',
    ],
    description: '참석자의 일정과 회의 조건을 바탕으로 가능한 시간을 추천합니다.',
  },
];

// 카테고리
export const categories = [
  '전체',
  '문서·생산성',
  '업무 자동화',
  '데이터·분석',
  '개발·IT',
  '고객·지원',
];

// 스토어 탐색용 카테고리. 등록 폼의 대표 카테고리와 별도로 여러 주제로 탐색할 수 있습니다.
export const storeCategories = [
  '전체',
  '문서 작성',
  '회의·요약',
  '번역',
  '업무 자동화',
  '파일·정산',
  '데이터 분석',
  '개발·IT',
  '고객 지원',
  'AI 에이전트',
  '협업',
  '생산성',
  '사내 업무',
];

// 도구 유형
export const toolTypes = ['전체 유형', 'AI App', 'AI Agent', '자동화 도구', '일반 업무 도구'];

// 브라우저 저장소 키
const FAVORITES_KEY = 'ondam:manage:favorites';
const DOWNLOADS_KEY = 'ondam:manage:downloads';
const DOWNLOAD_VERSIONS_KEY = 'ondam:manage:downloadVersions';
const MY_TOOLS_KEY = 'ondam:manage:mytools';

// 내 도구 샘플 데이터
const initialMyTools = [
  {
    id: 'mine-1',
    name: '보고서 작성 도우미',
    summary: '팀 내 보고서 초안 자동 작성',
    type: 'AI App',
    category: '문서·생산성',
    version: '1.2.0',
    versionHistory: [
      {
        version: '1.2.0',
        updatedAt: '2026.10.18',
        notes: [
          '보고서 목적에 맞는 문서 구조 추천 기능을 개선했습니다.',
          '긴 메모를 입력했을 때 핵검 내용을 더 안정적으로 정리합니다.',
          '문서 초안의 문단 간격과 제목 형식을 다듬었습니다.',
        ],
      },
      {
        version: '1.1.0',
        updatedAt: '2026.09.24',
        notes: ['보고서 유형별 기본 목차와 문장 추천 기능을 추가했습니다.'],
      },
      {
        version: '1.0.0',
        updatedAt: '2026.08.12',
        notes: ['보고서 작성 도우미를 처음 등록했습니다.'],
      },
    ],
    status: '승인 완료',
    updatedAt: '2026.10.18',
    createdAt: '2026.10.18 14:32',
    usageCount: 1240,
    description: '팀에서 공유 중인 문서 작성 도구입니다.',
    review: '필수 심사 항목을 통과했습니다.',
  },
  {
    id: 'mine-2',
    name: '엑셀 데이터 정리',
    summary: '정형 파일의 중복값과 누락 항목 정리',
    type: '자동화 도구',
    category: '업무 자동화',
    version: '0.8.0',
    status: '심사 대기',
    updatedAt: '2026.10.17',
    createdAt: '2026.10.17 10:15',
    usageCount: 0,
    description: '엑셀 데이터 전처리 자동화 도구입니다.',
    review: '관리자 검토를 기다리고 있습니다.',
  },
  {
    id: 'mine-3',
    name: '근태 요청 자동화',
    summary: '반복되는 근태 요청 접수 자동화',
    type: '자동화 도구',
    category: '업무 자동화',
    version: '0.3.1',
    status: '심사 진행중',
    updatedAt: '2026.10.16',
    createdAt: '2026.10.16 09:42',
    usageCount: 0,
    description: '근태 신청 프로세스를 간소화하는 도구입니다.',
    review: '심사 결과가 아직 생성되지 않았습니다.',
  },
  {
    id: 'mine-4',
    name: '사내 지식 검색',
    summary: '사내 지식베이스에서 문서 검색',
    type: 'AI Agent',
    category: '문서·생산성',
    version: '0.5.0',
    status: '반려',
    updatedAt: '2026.10.13',
    createdAt: '2026.10.13 13:21',
    usageCount: 0,
    description: '내부 문서 검색 및 질의응답 도구입니다.',
    review: '문서별 접근 권한 설정을 확인해 주세요.',
  },
  {
    id: 'mine-5',
    name: '회의록 정리 도우미',
    summary: '회의 내용을 요약하고 할 일을 자동으로 정리합니다.',
    type: 'AI Agent',
    category: '문서·생산성',
    version: '0.9.1',
    status: '승인 완료',
    updatedAt: '2026.10.12',
    createdAt: '2026.10.12 10:15',
    usageCount: 860,
    description: '회의 내용에서 요약, 결정 사항, 담당자별 할 일을 추출합니다.',
    review: '필수 심사 항목을 통과했습니다.',
  },
  {
    id: 'mine-6',
    name: '업무 요청 자동 분류',
    summary: '접수된 업무 요청을 분석하여 담당 부서로 배정합니다.',
    type: 'AI Agent',
    category: '업무 자동화',
    version: '1.0.0',
    status: '승인 완료',
    updatedAt: '2026.10.11',
    createdAt: '2026.10.11 09:42',
    usageCount: 2340,
    description: '업무 요청의 내용을 분석해 적절한 담당 부서를 추천합니다.',
    review: '필수 심사 항목을 통과했습니다.',
  },
  {
    id: 'mine-7',
    name: '데이터 분석 도우미',
    summary: '데이터를 분석하고 인사이트를 시각화합니다.',
    type: 'AI App',
    category: '데이터·분석',
    version: '1.1.0',
    status: '승인 완료',
    updatedAt: '2026.10.10',
    createdAt: '2026.10.10 16:08',
    usageCount: 980,
    description: '표 데이터를 요약하고 주요 지표를 시각화합니다.',
    review: '필수 심사 항목을 통과했습니다.',
  },
  {
    id: 'mine-8',
    name: '코드 리뷰 도우미',
    summary: '코드를 분석하고 개선점을 제안합니다.',
    type: 'AI Agent',
    category: '개발·IT',
    version: '0.8.0',
    status: '반려',
    updatedAt: '2026.10.09',
    createdAt: '2026.10.09 13:21',
    usageCount: 320,
    description: '코드 품질과 잠재적인 오류를 검토합니다.',
    review: '필수 보안 설정을 보완해 다시 등록해 주세요.',
  },
  {
    id: 'mine-9',
    name: '이미지 생성 도구',
    summary: '텍스트를 기반으로 이미지를 생성합니다.',
    type: 'AI App',
    category: '문서·생산성',
    version: '1.0.5',
    status: '승인 완료',
    updatedAt: '2026.10.08',
    createdAt: '2026.10.08 11:37',
    usageCount: 1120,
    description: '업무 자료에 사용할 이미지를 생성합니다.',
    review: '필수 심사 항목을 통과했습니다.',
  },
  {
    id: 'mine-10',
    name: '고객 문의 분류',
    summary: '고객 문의를 주제별로 분류하고 우선순위를 정합니다.',
    type: 'AI Agent',
    category: '고객·지원',
    version: '1.3.0',
    status: '승인 완료',
    updatedAt: '2026.10.07',
    createdAt: '2026.10.07 15:20',
    usageCount: 645,
    description: '고객 문의 유형을 자동 분류합니다.',
    review: '필수 심사 항목을 통과했습니다.',
  },
  {
    id: 'mine-11',
    name: '문서 번역 도구',
    summary: '업무 문서를 번역하고 사내 용어를 통일합니다.',
    type: 'AI App',
    category: '문서·생산성',
    version: '1.2.0',
    status: '승인 완료',
    updatedAt: '2026.10.06',
    createdAt: '2026.10.06 14:10',
    usageCount: 780,
    description: '사내 용어집을 참고하여 문서를 번역합니다.',
    review: '필수 심사 항목을 통과했습니다.',
  },
  {
    id: 'mine-12',
    name: '일정 요약 에이전트',
    summary: '팀 일정을 요약하고 회의 준비를 도와줍니다.',
    type: 'AI Agent',
    category: '업무 자동화',
    version: '0.7.2',
    status: '승인 완료',
    updatedAt: '2026.10.05',
    createdAt: '2026.10.05 08:45',
    usageCount: 510,
    description: '팀의 예정된 일정을 요약합니다.',
    review: '필수 심사 항목을 통과했습니다.',
  },
];

// 데이터 읽기
function load(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const saved = window.localStorage.getItem(key);

    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

// 즐겨찾기 관리
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => load(FAVORITES_KEY, ['report', 'workflow']));

  const toggleFavorite = id => {
    setFavorites(current => {
      const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id];

      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));

      return next;
    });
  };

  return {
    favorites,
    toggleFavorite,
  };
}

// 다운로드한 도구 관리
export function useDownloads() {
  const [downloads, setDownloads] = useState(() => load(DOWNLOADS_KEY, ['meeting', 'analysis']));
  const [installedVersions, setInstalledVersions] = useState(() =>
    load(DOWNLOAD_VERSIONS_KEY, { meeting: '1.3.0', analysis: '0.9.2' })
  );

  const addDownload = id => {
    setDownloads(current => {
      if (current.includes(id)) return current;

      const next = [...current, id];
      window.localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(next));
      return next;
    });

    const tool = publishedTools.find(item => item.id === id);
    if (tool) {
      setInstalledVersions(current => {
        const next = { ...current, [id]: tool.version };
        window.localStorage.setItem(DOWNLOAD_VERSIONS_KEY, JSON.stringify(next));
        return next;
      });
    }
  };

  const removeDownload = id => {
    setDownloads(current => {
      const next = current.filter(item => item !== id);
      window.localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(next));
      return next;
    });
    setInstalledVersions(current => {
      const next = { ...current };
      delete next[id];
      window.localStorage.setItem(DOWNLOAD_VERSIONS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const updateDownload = tool => {
    setInstalledVersions(current => {
      const next = { ...current, [tool.id]: tool.version };
      window.localStorage.setItem(DOWNLOAD_VERSIONS_KEY, JSON.stringify(next));
      return next;
    });
  };

  return { downloads, installedVersions, addDownload, removeDownload, updateDownload };
}

// 내 도구 관리
export function useMyTools() {
  const [myTools, setMyTools] = useState(() => {
    const updateReviews = getToolUpdateReviews();

    return load(MY_TOOLS_KEY, initialMyTools)
      .map(tool => ({ ...tool, status: normalizeReviewStatus(tool.status) }))
      .map(tool => {
        const approvedUpdate = getApprovedToolUpdateReview(tool, updateReviews);
        if (!approvedUpdate || approvedUpdate.version === tool.version) return tool;

        return {
          ...tool,
          name: approvedUpdate.name || tool.name,
          summary: approvedUpdate.summary || tool.summary,
          type: approvedUpdate.type || tool.type,
          category: approvedUpdate.category || tool.category,
          description: approvedUpdate.description || tool.description,
          features: approvedUpdate.features || tool.features,
          instructions: approvedUpdate.instructions || tool.instructions,
          version: approvedUpdate.version,
          versionHistory: approvedUpdate.versionHistory || tool.versionHistory,
          updateNotes: approvedUpdate.updateNotes,
          fileName: approvedUpdate.fileName || tool.fileName,
          size: approvedUpdate.size || tool.size,
          iconName: approvedUpdate.iconName || tool.iconName,
          iconData: approvedUpdate.iconData || tool.iconData,
          screenshots: approvedUpdate.screenshots?.length
            ? approvedUpdate.screenshots
            : tool.screenshots,
          supportEnvironment: approvedUpdate.supportEnvironment || tool.supportEnvironment,
          updatedAt: approvedUpdate.updatedAt || approvedUpdate.createdAt || tool.updatedAt,
        };
      });
  });

  const addMyTool = tool => {
    const next = [tool, ...load(MY_TOOLS_KEY, initialMyTools)];

    window.localStorage.setItem(MY_TOOLS_KEY, JSON.stringify(next));

    setMyTools(next);
  };

  const updateMyTool = (id, changes) => {
    setMyTools(current => {
      const next = current.map(tool => (tool.id === id ? { ...tool, ...changes } : tool));
      window.localStorage.setItem(MY_TOOLS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const removeMyTools = ids => {
    setMyTools(current => {
      const next = current.filter(tool => !ids.includes(tool.id));
      window.localStorage.setItem(MY_TOOLS_KEY, JSON.stringify(next));
      return next;
    });
  };

  return {
    myTools,
    addMyTool,
    updateMyTool,
    removeMyTools,
  };
}
