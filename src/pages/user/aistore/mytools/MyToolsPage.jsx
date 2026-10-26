import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import SearchHeader from '../../../../components/search/SearchHeader.jsx';
import StoreToolIcon from '../components/StoreToolIcon.jsx';
import { useMyTools } from '../data/manageStore.js';
import { getActiveToolUpdateReview, getToolUpdateReviews } from '../data/reviewRequests.js';

export default function MyToolsPage() {
  const navigate = useNavigate();
  const { myTools } = useMyTools();
  const [search, setSearch] = useState('');
  const updateReviews = useMemo(() => getToolUpdateReviews(), []);
  const approvedTools = useMemo(
    () => myTools.filter(tool => tool.status === '승인 완료'),
    [myTools]
  );

  const filteredTools = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return approvedTools.filter(tool => {
      return `${tool.name} ${tool.summary} ${tool.category} ${tool.type}`
        .toLowerCase()
        .includes(keyword);
    });
  }, [approvedTools, search]);

  return (
    <div className="w-full">
      <h1 className="sr-only">내 도구</h1>
      <SearchHeader
        value={search}
        onSearchChange={setSearch}
        placeholder="내 도구 검색"
        ariaLabel="내 도구 검색"
      />

      <section className="mt-4" aria-label="승인된 도구 목록">
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
            {search.trim() ? '조건에 맞는 승인 도구가 없습니다.' : '승인된 도구가 없습니다.'}
          </p>
        )}
      </section>
    </div>
  );
}
