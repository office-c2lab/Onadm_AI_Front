import RouteTabs from '../components/ui/RouteTabs.jsx';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SearchHeader from '../components/search/SearchHeader.jsx';

const tabs = [
  { label: '다운로드한 도구', to: 'downloads' },
  { label: '즐겨찾기', to: 'favorites' },
];

export default function LibraryLayout() {
  const [keyword, setKeyword] = useState('');

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

      <RouteTabs
        tabs={tabs}
        ariaLabel="라이브러리 탭"
        className="mt-5 flex items-center gap-1"
        end
      />

      <Outlet context={{ keyword }} />
    </div>
  );
}
