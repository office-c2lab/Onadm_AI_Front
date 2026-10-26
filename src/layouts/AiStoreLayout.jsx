import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import AiStoreSidebar, {
  AiStoreSidebarRail,
} from '../components/usersidebar/aistoresidebar/AiStoreSidebar.jsx';
import SearchHeader from '../components/search/SearchHeader.jsx';
import { useDownloads, useFavorites } from '../pages/user/aistore/data/manageStore.js';
import { ensureAiStoreStorageVersion } from '../pages/user/aistore/data/storageMigration.js';

const libraryTabs = [
  { id: 'downloads', label: '다운로드한 도구', to: '/user/aistore/library/downloads' },
  { id: 'favorites', label: '즐겨찾기', to: '/user/aistore/library/favorites' },
];

ensureAiStoreStorageVersion();

export default function AiStoreLayout() {
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.localStorage.getItem('ai-store-sidebar-open') !== 'false';
  });
  const [libraryKeyword, setLibraryKeyword] = useState('');
  const favoriteState = useFavorites();
  const downloadState = useDownloads();
  const isLibraryPage = pathname.startsWith('/user/aistore/library');
  const libraryCounts = {
    downloads: downloadState.downloads.length,
    favorites: favoriteState.favorites.length,
  };

  const setSidebarOpen = isOpen => {
    setIsSidebarOpen(isOpen);
    window.localStorage.setItem('ai-store-sidebar-open', String(isOpen));
  };

  return (
    <div className="flex min-h-screen bg-white text-[#0d0d0d]">
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

                <nav
                  className="mt-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  aria-label="라이브러리 탭"
                >
                  <div className="flex w-max min-w-full justify-start gap-1">
                    {libraryTabs.map(tab => (
                      <NavLink
                        key={tab.to}
                        to={tab.to}
                        className={({ isActive }) =>
                          `inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-base transition-colors ${
                            isActive
                              ? 'bg-[#ededed] font-medium text-[#333]'
                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                          }`
                        }
                      >
                        {tab.label}
                        <span className="ml-1.5 text-base tabular-nums text-slate-400">
                          {libraryCounts[tab.id]}
                        </span>
                      </NavLink>
                    ))}
                  </div>
                </nav>

                <Outlet
                  context={{
                    keyword: libraryKeyword,
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
