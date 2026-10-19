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
    storeTags: ['문서 작성', '생산성'],
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
    storeTags: ['회의·요약', '협업', '생산성'],
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
    storeTags: ['업무 자동화', '협업', '사내 업무'],
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
    storeTags: ['데이터 분석', 'AI 에이전트'],
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
    storeTags: ['개발·IT', '생산성'],
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
    storeTags: ['업무 자동화', '파일·정산'],
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
    storeTags: ['번역', '문서 작성', '생산성'],
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
    storeTags: ['고객 지원', 'AI 에이전트', '사내 업무'],
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
    status: '승인 완료',
    updatedAt: '2026.10.18',
    createdAt: '2026.10.18 14:32',
    usageCount: 1240,
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
    status: '검사 중',
    updatedAt: '2026.10.16',
    createdAt: '2026.10.16 09:42',
    usageCount: 0,
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
    review: '필수 검사 항목을 통과했습니다.',
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
    review: '필수 검사 항목을 통과했습니다.',
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
    review: '필수 검사 항목을 통과했습니다.',
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
    review: '필수 검사 항목을 통과했습니다.',
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
    review: '필수 검사 항목을 통과했습니다.',
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
    review: '필수 검사 항목을 통과했습니다.',
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
    review: '필수 검사 항목을 통과했습니다.',
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
  const [myTools, setMyTools] = useState(() => load(MY_TOOLS_KEY, initialMyTools));

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
