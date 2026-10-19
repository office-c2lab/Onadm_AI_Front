import { useState } from 'react';

// 스토어 샘플 데이터
export const publishedTools = [
  {
    id: 'report',
    name: '보고서 작성 도우미',
    summary: '핵심 내용만 입력하면 보고서 초안을 체계적으로 작성해요.',
    type: 'AI App',
    category: '문서·생산성',
    storeCategory: '문서 자동화',
    maker: '경영지원팀',
    version: '1.2.0',
    featured: true,
    description: '업무 보고서 및 기획안의 초안을 작성하는 사내 도구입니다.',
  },
  {
    id: 'meeting',
    name: '회의록 정리 도우미',
    summary: '회의 내용을 요약하고 결정 사항과 할 일을 정리해요.',
    type: 'AI App',
    category: '문서·생산성',
    maker: '전략기획팀',
    version: '1.4.1',
    featured: true,
    description: '회의 내용을 바탕으로 결정 사항과 담당자별 작업을 정리합니다.',
  },
  {
    id: 'workflow',
    name: '업무 요청 자동 분류',
    summary: '접수된 업무 요청을 담당 부서로 자동 배정해요.',
    type: '자동화 도구',
    category: '업무 자동화',
    maker: '운영혁신팀',
    version: '2.0.0',
    featured: true,
    description: '규칙에 따라 요청을 구분하고 관련 부서로 전달합니다.',
  },
  {
    id: 'analysis',
    name: '데이터 분석 도우미',
    summary: '표 데이터를 분석하고 주요 인사이트를 정리해요.',
    type: 'AI Agent',
    category: '데이터·분석',
    maker: '데이터팀',
    version: '0.9.2',
    description: '표 데이터의 추세와 이상값을 분석합니다.',
  },
  {
    id: 'review',
    name: '코드 리뷰 도우미',
    summary: '코드 품질과 잠재적인 오류를 검토해요.',
    type: 'AI App',
    category: '개발·IT',
    maker: '개발팀',
    version: '1.1.0',
    description: '코드 품질 개선을 위한 피드백을 제공합니다.',
  },
  {
    id: 'expense',
    name: '정산 파일 일괄 취합',
    summary: '여러 엑셀 파일을 동일한 양식으로 취합해요.',
    type: '자동화 도구',
    category: '업무 자동화',
    maker: '재무팀',
    version: '1.0.2',
    description: 'AI 모델을 사용하지 않는 파일 취합 자동화입니다.',
  },
  {
    id: 'translate',
    name: '문서 번역 도구',
    summary: '업무 문서를 빠르게 번역하고 용어를 통일해요.',
    type: 'AI App',
    category: '문서·생산성',
    maker: '글로벌사업팀',
    version: '1.3.0',
    description: '사내 용어집을 참고해 번역을 제공합니다.',
  },
  {
    id: 'support',
    name: '문의 응대 에이전트',
    summary: '자주 묻는 사내 문의에 답변을 제공해요.',
    type: 'AI Agent',
    category: '고객·지원',
    maker: '인사총무팀',
    version: '1.0.0',
    description: '사내 FAQ를 바탕으로 안내합니다.',
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

// 도구 유형
export const toolTypes = ['전체 유형', 'AI App', 'AI Agent', '자동화 도구', '일반 업무 도구'];

// 브라우저 저장소 키
const FAVORITES_KEY = 'ondam:manage:favorites';
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
    status: '승인 완료',
    updatedAt: '2026.10.18',
    description: '팀에서 공유 중인 문서 작성 도구입니다.',
    review: '필수 검사 항목을 통과했습니다.',
  },
  {
    id: 'mine-2',
    name: '엑셀 데이터 정리',
    summary: '정형 파일의 중복값과 누락 항목 정리',
    type: '자동화 도구',
    category: '업무 자동화',
    version: '0.8.0',
    status: '검토 대기',
    updatedAt: '2026.10.17',
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
    status: '검사 중',
    updatedAt: '2026.10.16',
    description: '근태 신청 프로세스를 간소화하는 도구입니다.',
    review: '검사 결과가 아직 생성되지 않았습니다.',
  },
  {
    id: 'mine-4',
    name: '사내 지식 검색',
    summary: '사내 지식베이스에서 문서 검색',
    type: 'AI Agent',
    category: '문서·생산성',
    version: '0.5.0',
    status: '보완 필요',
    updatedAt: '2026.10.13',
    description: '내부 문서 검색 및 질의응답 도구입니다.',
    review: '문서별 접근 권한 설정을 확인해 주세요.',
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

// 내 도구 관리
export function useMyTools() {
  const [myTools, setMyTools] = useState(() => load(MY_TOOLS_KEY, initialMyTools));

  const addMyTool = tool => {
    const next = [tool, ...load(MY_TOOLS_KEY, initialMyTools)];

    window.localStorage.setItem(MY_TOOLS_KEY, JSON.stringify(next));

    setMyTools(next);
  };

  return {
    myTools,
    addMyTool,
  };
}
