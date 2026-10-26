import { catalogItems } from '../data.js';

const SECTIONS_KEY = 'ondam:admin:catalog-sections';
const CATEGORIES_KEY = 'ondam:admin:catalog-categories';

const publishedItems = catalogItems.filter(item => item.publication === '게시 중');
const ids = items => items.map(item => item.id);

const defaultSections = [
  {
    id: 'promotions',
    name: '상단 배너',
    description: '스토어 상단에서 주요 도구를 크게 소개합니다.',
    limit: 4,
    toolIds: ids(publishedItems.slice(0, 4)),
  },
  {
    id: 'featured',
    name: '요즘 주목받는 AI 도구',
    description: '사용자에게 우선 추천할 도구를 보여줍니다.',
    limit: 6,
    toolIds: ids(publishedItems.slice(0, 6)),
  },
  {
    id: 'documents',
    name: '문서 작업을 더 빠르게',
    description: '문서 작성과 요약 업무에 유용한 도구 모음입니다.',
    limit: 6,
    toolIds: ids(publishedItems.filter(item => item.category === '문서·생산성').slice(0, 6)),
  },
  {
    id: 'automation',
    name: '반복 업무를 줄이는 자동화 도구',
    description: '반복 작업과 워크플로를 간소화하는 도구 모음입니다.',
    limit: 6,
    toolIds: ids(publishedItems.filter(item => item.category === '업무 자동화').slice(0, 6)),
  },
  {
    id: 'new-tools',
    name: '신규 등록 도구',
    description: '최근 승인된 도구를 자동으로 보여줍니다.',
    automatic: true,
    limit: 5,
    toolIds: ids(publishedItems.slice(0, 5)),
  },
];

const defaultCategories = [
  {
    id: 'documents',
    name: '문서·생산성',
    sourceName: '문서·생산성',
    description: '문서 작성과 회의 요약, 번역을 돕는 도구를 모아봅니다.',
    active: true,
  },
  {
    id: 'automation',
    name: '업무 자동화',
    sourceName: '업무 자동화',
    description: '반복되는 워크플로와 파일·정산 업무를 자동화합니다.',
    active: true,
  },
  {
    id: 'data',
    name: '데이터·분석',
    sourceName: '데이터·분석',
    description: '데이터 분석과 시각화, 리포트 작성을 지원합니다.',
    active: true,
  },
  {
    id: 'development',
    name: '개발·IT',
    sourceName: '개발·IT',
    description: '코드 리뷰와 개발·운영 업무에 필요한 도구를 제공합니다.',
    active: true,
  },
  {
    id: 'support',
    name: '고객·지원',
    sourceName: '고객·지원',
    description: '고객 문의 분류와 상담 업무를 효율적으로 지원합니다.',
    active: true,
  },
];

function read(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = window.localStorage.getItem(key);
    const value = saved ? JSON.parse(saved) : fallback;
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function getCatalogSections() {
  return read(SECTIONS_KEY, defaultSections).map(section => {
    const normalized = { ...section };
    delete normalized.label;
    if (normalized.id === 'promotions' && normalized.name === '상단 프로모션') {
      normalized.name = '상단 배너';
    }
    return normalized;
  });
}
export function saveCatalogSections(sections) {
  window.localStorage.setItem(SECTIONS_KEY, JSON.stringify(sections));
}
export function updateCatalogSection(section) {
  saveCatalogSections(getCatalogSections().map(item => (item.id === section.id ? section : item)));
}
export function getCatalogCategories() {
  return read(CATEGORIES_KEY, defaultCategories).map(category => ({
    ...category,
    description: category.description ?? category.tags ?? '',
    sourceName:
      category.sourceName ??
      defaultCategories.find(item => item.id === category.id)?.sourceName ??
      category.name,
  }));
}
export function saveCatalogCategories(categories) {
  window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}
