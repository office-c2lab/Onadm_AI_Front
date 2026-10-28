import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import SearchHeader from '../../../../components/search/SearchHeader.jsx';
import StoreToolIcon from '../components/StoreToolIcon.jsx';
import { storeCategories, useMyTools } from '../data/manageStore.js';
import { getActiveToolUpdateReview, getToolUpdateReviews } from '../data/reviewRequests.js';

export default function MyToolsPage() {
  const navigate = useNavigate();
  const categoryScrollRef = useRef(null);
  const categoryButtonRefs = useRef(new Map());
  const { myTools } = useMyTools();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [categoryScrollState, setCategoryScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });
  const [fullyVisibleCategories, setFullyVisibleCategories] = useState(storeCategories);
  const updateReviews = useMemo(() => getToolUpdateReviews(), []);
  const approvedTools = useMemo(
    () => myTools.filter(tool => tool.status === '승인 완료'),
    [myTools]
  );

  const filteredTools = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return approvedTools.filter(tool => {
      const matchesCategory =
        selectedCategory === '전체' || tool.storeTags?.includes(selectedCategory);
      const matchesSearch = `${tool.name} ${tool.summary} ${tool.category} ${tool.type}`
        .toLowerCase()
        .includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [approvedTools, search, selectedCategory]);

  const updateCategoryScrollState = () => {
    const container = categoryScrollRef.current;
    if (!container) return;

    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
    const canScrollLeft = container.scrollLeft > 2;
    const canScrollRight = container.scrollLeft < maxScrollLeft - 2;
    setCategoryScrollState({ canScrollLeft, canScrollRight });

    const containerRect = container.getBoundingClientRect();
    const leftEdge = containerRect.left + (canScrollLeft ? 48 : 0);
    const rightEdge = containerRect.right - (canScrollRight ? 48 : 0);
    const nextVisibleCategories = storeCategories.filter(category => {
      const button = categoryButtonRefs.current.get(category);
      if (!button) return false;
      const buttonRect = button.getBoundingClientRect();
      return buttonRect.left >= leftEdge - 1 && buttonRect.right <= rightEdge + 1;
    });

    setFullyVisibleCategories(current => {
      if (
        current.length === nextVisibleCategories.length &&
        current.every((category, index) => category === nextVisibleCategories[index])
      ) {
        return current;
      }
      return nextVisibleCategories;
    });
  };

  const scrollCategories = direction => {
    const container = categoryScrollRef.current;
    if (!container) return;
    container.scrollBy({
      left: direction * Math.max(240, container.clientWidth * 0.65),
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const container = categoryScrollRef.current;
    if (!container) return undefined;

    updateCategoryScrollState();
    const resizeObserver = new ResizeObserver(updateCategoryScrollState);
    resizeObserver.observe(container);
    if (container.firstElementChild) resizeObserver.observe(container.firstElementChild);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    categoryButtonRefs.current.get(selectedCategory)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [selectedCategory]);

  return (
    <div className="w-full">
      <h1 className="sr-only">내 도구</h1>
      <SearchHeader
        value={search}
        onSearchChange={setSearch}
        placeholder="내 도구 검색"
        ariaLabel="내 도구 검색"
      />

      <div className="relative mt-2">
        <nav
          ref={categoryScrollRef}
          aria-label="내 도구 카테고리"
          onScroll={updateCategoryScrollState}
          className="touch-pan-x overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div
            className={`flex w-max min-w-full justify-center gap-1 ${categoryScrollState.canScrollLeft || categoryScrollState.canScrollRight ? 'px-12' : ''}`}
          >
            {storeCategories.map(category => (
              <button
                key={category}
                ref={node => {
                  if (node) categoryButtonRefs.current.set(category, node);
                  else categoryButtonRefs.current.delete(category);
                }}
                type="button"
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
                tabIndex={fullyVisibleCategories.includes(category) ? undefined : -1}
                className={`inline-flex h-8 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-full px-4 text-sm transition-colors ${
                  fullyVisibleCategories.includes(category)
                    ? 'opacity-100'
                    : 'pointer-events-none opacity-0'
                } ${
                  selectedCategory === category
                    ? 'bg-[#ededed] font-medium text-[#333]'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </nav>

        {categoryScrollState.canScrollLeft ? (
          <button
            type="button"
            onClick={() => scrollCategories(-1)}
            aria-label="이전 카테고리 보기"
            className="absolute left-1 top-4 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            <ChevronLeft size={17} aria-hidden="true" />
          </button>
        ) : null}
        {categoryScrollState.canScrollRight ? (
          <button
            type="button"
            onClick={() => scrollCategories(1)}
            aria-label="다음 카테고리 보기"
            className="absolute right-1 top-4 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          >
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <section className="mt-2" aria-label="승인된 도구 목록">
        {filteredTools.length > 0 ? (
          <div className="grid gap-2">
            {filteredTools.map(tool => {
              const activeUpdate = getActiveToolUpdateReview(tool, updateReviews);

              return (
                <article
                  key={tool.id}
                  className="group relative flex min-h-[82px] min-w-0 items-center gap-4 rounded-xl border border-transparent px-3 py-3 transition hover:z-20 hover:border-slate-100 hover:bg-[#f5f5f5] hover:shadow-sm focus-within:z-20 focus-within:border-slate-100"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/user/aistore/mytools/${tool.id}`)}
                    aria-label={`${tool.name} 상세 정보 보기`}
                    className="absolute inset-0 z-0 cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                  />
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <StoreToolIcon tool={tool} small />
                    <div className="min-w-0 flex-1">
                      <span className="flex min-w-0 items-center gap-2">
                        <strong className="min-w-0 truncate text-left text-base font-semibold text-slate-900">
                          {tool.name}
                        </strong>
                        {activeUpdate && (
                          <span className="inline-flex shrink-0 items-center rounded-md border border-blue-600 bg-blue-600 px-2 py-0.5 text-[11px] font-medium text-white">
                            업데이트 {activeUpdate.status}
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block truncate text-sm text-slate-500">
                        {tool.type} · {tool.storeCategory || tool.category}
                      </span>
                    </div>
                  </div>
                  <span className="hidden shrink-0 items-center gap-1.5 text-sm text-slate-600 md:inline-flex">
                    <Download size={16} className="text-blue-600" aria-hidden="true" />
                    <span className="text-slate-500">
                      다운로드{' '}
                      <strong className="font-semibold text-slate-800">
                        {(tool.downloadCount ?? tool.usageCount ?? 0).toLocaleString('ko-KR')}회
                      </strong>
                    </span>
                  </span>
                  <span className="hidden shrink-0 text-sm text-slate-500 xl:inline">
                    등록 {tool.createdAt || tool.updatedAt || '—'} ·{' '}
                    <strong className="font-semibold text-blue-600">v{tool.version}</strong>
                  </span>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-slate-500">
            {search.trim() || selectedCategory !== '전체'
              ? '조건에 맞는 승인 도구가 없습니다.'
              : '승인된 도구가 없습니다.'}
          </p>
        )}
      </section>
    </div>
  );
}
