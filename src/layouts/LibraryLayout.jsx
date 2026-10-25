import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import SearchHeader from '../components/search/SearchHeader.jsx';
import { useDownloads, useFavorites } from '../pages/user/aistore/data/manageStore.js';

const tabs = [
  { id: 'downloads', label: '다운로드한 도구', to: 'downloads' },
  { id: 'favorites', label: '즐겨찾기', to: 'favorites' },
];

export default function LibraryLayout() {
  const [keyword, setKeyword] = useState('');
  const favoriteState = useFavorites();
  const downloadState = useDownloads();
  const counts = {
    downloads: downloadState.downloads.length,
    favorites: favoriteState.favorites.length,
  };

  return (
    <div className="w-full">
      <SearchHeader
        title="라이브러리"
        description="다운로드한 도구와 즐겨찾기를 한곳에서 관리해 보세요."
        value={keyword}
        onSearchChange={setKeyword}
        placeholder="라이브러리 도구 검색"
        ariaLabel="라이브러리 도구 검색"
      />

      <nav className="mt-5 flex items-center gap-1" aria-label="라이브러리 탭">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end
            className={({ isActive }) =>
              `rounded-full px-4 py-1 text-sm transition-colors ${
                isActive
                  ? 'bg-[#ededed] font-medium text-[#333]'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`
            }
          >
            {tab.label}
            <span className="ml-1.5 text-xs tabular-nums text-slate-400">{counts[tab.id]}</span>
          </NavLink>
        ))}
      </nav>

      <Outlet context={{ keyword, ...favoriteState, ...downloadState }} />
    </div>
  );
}
