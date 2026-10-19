import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import SearchHeader from '../components/search/SearchHeader.jsx';

const tabs = [
  { label: '다운로드한 도구', to: 'downloads' },
  { label: '즐겨찾기', to: 'favorites' },
];

export default function LibraryLayout() {
  const [keyword, setKeyword] = useState('');

  return (
    <div className="mx-auto w-full max-w-7xl px-5  md:px-8">
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
          </NavLink>
        ))}
      </nav>

      <Outlet context={{ keyword }} />
    </div>
  );
}
