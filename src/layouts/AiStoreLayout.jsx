import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import AiStoreSidebar, {
  AiStoreSidebarRail,
} from '../components/usersidebar/aistoresidebar/AiStoreSidebar.jsx';
import SearchHeader from '../components/search/SearchHeader.jsx';
import {
  storeCategories,
  useDownloads,
  useFavorites,
} from '../pages/user/aistore/data/manageStore.js';
import { ensureAiStoreStorageVersion } from '../pages/user/aistore/data/storageMigration.js';
import useSidebarStore from '../stores/sidebarStore.js';

ensureAiStoreStorageVersion();

export default function AiStoreLayout() {
  const { pathname, search } = useLocation();
  const isStorePreview = new URLSearchParams(search).get('preview') === '1';
  const isSidebarOpen = useSidebarStore(state => state.aiStoreOpen);
  const setSidebarOpen = useSidebarStore(state => state.setAiStoreOpen);
  const libraryCategoryScrollRef = useRef(null);
  const libraryCategoryButtonRefs = useRef(new Map());
  const [libraryKeyword, setLibraryKeyword] = useState('');
  const [selectedLibraryCategory, setSelectedLibraryCategory] = useState('전체');
  const [libraryCategoryScrollState, setLibraryCategoryScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });
  const [fullyVisibleLibraryCategories, setFullyVisibleLibraryCategories] =
    useState(storeCategories);
  const favoriteState = useFavorites();
  const downloadState = useDownloads();
  const isLibraryPage = pathname.startsWith('/user/aistore/library');

  const updateLibraryCategoryScrollState = () => {
    const container = libraryCategoryScrollRef.current;
    if (!container) return;

    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
    const canScrollLeft = container.scrollLeft > 2;
    const canScrollRight = container.scrollLeft < maxScrollLeft - 2;
    setLibraryCategoryScrollState({ canScrollLeft, canScrollRight });

    const containerRect = container.getBoundingClientRect();
    const leftEdge = containerRect.left + (canScrollLeft ? 48 : 0);
    const rightEdge = containerRect.right - (canScrollRight ? 48 : 0);
    const nextVisibleCategories = storeCategories.filter(category => {
      const button = libraryCategoryButtonRefs.current.get(category);
      if (!button) return false;
      const buttonRect = button.getBoundingClientRect();
      return buttonRect.left >= leftEdge - 1 && buttonRect.right <= rightEdge + 1;
    });

    setFullyVisibleLibraryCategories(current => {
      if (
        current.length === nextVisibleCategories.length &&
        current.every((category, index) => category === nextVisibleCategories[index])
      ) {
        return current;
      }
      return nextVisibleCategories;
    });
  };

  const scrollLibraryCategories = direction => {
    const container = libraryCategoryScrollRef.current;
    if (!container) return;
    container.scrollBy({
      left: direction * Math.max(240, container.clientWidth * 0.65),
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (!isLibraryPage) return undefined;
    const container = libraryCategoryScrollRef.current;
    if (!container) return undefined;

    updateLibraryCategoryScrollState();
    const resizeObserver = new ResizeObserver(updateLibraryCategoryScrollState);
    resizeObserver.observe(container);
    if (container.firstElementChild) resizeObserver.observe(container.firstElementChild);

    return () => resizeObserver.disconnect();
  }, [isLibraryPage]);

  useEffect(() => {
    if (!isLibraryPage) return;
    libraryCategoryButtonRefs.current.get(selectedLibraryCategory)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [isLibraryPage, selectedLibraryCategory]);

  return (
    <div className="flex min-h-screen bg-white text-[#0d0d0d]">
      {!isStorePreview && (
        <div
          className={`sticky top-0 h-screen shrink-0 overflow-hidden transition-[width] duration-200 ease-out ${
            isSidebarOpen ? 'w-[260px]' : 'w-12'
          }`}
        >
          {isSidebarOpen ? (
            <AiStoreSidebar className="h-screen" onClose={() => setSidebarOpen(false)} />
          ) : (
            <AiStoreSidebarRail onOpen={() => setSidebarOpen(true)} />
          )}
        </div>
      )}

      <main className="relative min-h-screen min-w-0 flex-1 bg-white">
        <div className="mx-auto flex min-h-full w-full max-w-[88rem] px-[clamp(0.875rem,2vw,1.5rem)] pb-[clamp(2rem,4vw,3rem)]">
          <div className="mx-auto w-full max-w-[74rem]">
            {isLibraryPage ? (
              <div className="w-full">
                <SearchHeader
                  title="라이브러리"
                  description="다운로드한 도구와 즐겨찾기를 한곳에서 관리해 보세요."
                  value={libraryKeyword}
                  onSearchChange={setLibraryKeyword}
                  placeholder="라이브러리 도구 검색"
                  ariaLabel="라이브러리 도구 검색"
                />

                <div className="relative mt-2">
                  <nav
                    ref={libraryCategoryScrollRef}
                    aria-label="라이브러리 카테고리"
                    onScroll={updateLibraryCategoryScrollState}
                    className="touch-pan-x overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    <div
                      className={`flex w-max min-w-full justify-center gap-1 ${libraryCategoryScrollState.canScrollLeft || libraryCategoryScrollState.canScrollRight ? 'px-12' : ''}`}
                    >
                      {storeCategories.map(category => (
                        <button
                          key={category}
                          ref={node => {
                            if (node) libraryCategoryButtonRefs.current.set(category, node);
                            else libraryCategoryButtonRefs.current.delete(category);
                          }}
                          type="button"
                          onClick={() => setSelectedLibraryCategory(category)}
                          aria-pressed={selectedLibraryCategory === category}
                          tabIndex={
                            fullyVisibleLibraryCategories.includes(category) ? undefined : -1
                          }
                          className={`inline-flex h-8 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-full px-4 text-sm transition-colors ${
                            fullyVisibleLibraryCategories.includes(category)
                              ? 'opacity-100'
                              : 'pointer-events-none opacity-0'
                          } ${
                            selectedLibraryCategory === category
                              ? 'bg-[#ededed] font-medium text-[#333]'
                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </nav>

                  {libraryCategoryScrollState.canScrollLeft ? (
                    <button
                      type="button"
                      onClick={() => scrollLibraryCategories(-1)}
                      aria-label="이전 카테고리 보기"
                      className="absolute left-1 top-4 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
                    >
                      <ChevronLeft size={17} aria-hidden="true" />
                    </button>
                  ) : null}
                  {libraryCategoryScrollState.canScrollRight ? (
                    <button
                      type="button"
                      onClick={() => scrollLibraryCategories(1)}
                      aria-label="다음 카테고리 보기"
                      className="absolute right-1 top-4 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
                    >
                      <ChevronRight size={17} aria-hidden="true" />
                    </button>
                  ) : null}
                </div>

                <Outlet
                  context={{
                    keyword: libraryKeyword,
                    selectedCategory: selectedLibraryCategory,
                    ...favoriteState,
                    ...downloadState,
                  }}
                />
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
