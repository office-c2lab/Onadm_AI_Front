import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState, SearchField, StatusBadge, ToolAvatar } from '../components.jsx';
import { appRecords } from '../data.js';
import { getDeletedAppIds } from '../../../user/aistore/data/manageStore.js';

const publicationTabs = ['전체', '게시 중', '숨김'];

export default function AppsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [publication, setPublication] = useState('게시 중');
  const [deletedAppIds] = useState(getDeletedAppIds);

  const approvedApps = useMemo(
    () =>
      appRecords.filter(
        item => item.scan === '통과' && item.approval === '승인' && !deletedAppIds.includes(item.id)
      ),
    [deletedAppIds]
  );

  const rows = useMemo(
    () =>
      approvedApps.filter(item => {
        const text = `${item.name} ${item.id} ${item.owner} ${item.department}`.toLowerCase();
        const publicationMatches =
          publication === '전체' ||
          (publication === '숨김'
            ? item.publication !== '게시 중'
            : item.publication === publication);
        return text.includes(query.toLowerCase()) && publicationMatches;
      }),
    [approvedApps, publication, query]
  );
  const publicationCounts = Object.fromEntries(
    publicationTabs.map(item => [
      item,
      item === '전체'
        ? approvedApps.length
        : approvedApps.filter(app =>
            item === '숨김' ? app.publication !== '게시 중' : app.publication === item
          ).length,
    ])
  );

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-20 -mx-4 bg-white/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="mx-auto flex max-w-xl items-center">
          <SearchField value={query} onChange={setQuery} placeholder="이름, ID, 소유자 검색" />
        </div>
      </div>

      <nav
        aria-label="스토어 게시 상태"
        className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max min-w-full justify-start gap-1">
          {publicationTabs.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => setPublication(item)}
              aria-pressed={publication === item}
              className={`inline-flex h-8 shrink-0 items-center rounded-full px-4 text-sm transition-colors ${publication === item ? 'bg-[#ededed] font-medium text-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              {item}
              <span className="ml-1.5 text-xs tabular-nums text-slate-400">
                {publicationCounts[item]}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <section className="mt-4" aria-label="등록된 앱 및 에이전트 목록">
        {rows.length ? (
          <div className="grid gap-2 md:grid-cols-2">
            {rows.map(item => (
              <article
                key={item.id}
                className="group relative flex min-h-[82px] min-w-0 flex-wrap items-center gap-4 rounded-xl border border-transparent px-3 py-3 transition hover:z-20 hover:border-slate-100 hover:bg-[#f5f5f5] hover:shadow-sm focus-within:z-20 focus-within:border-slate-100 focus-within:bg-[#f5f5f5]"
              >
                <button
                  type="button"
                  onClick={() => navigate(`/admin/manage/apps/${item.id}`)}
                  aria-label={`${item.name} 상세 관리`}
                  className="absolute inset-0 z-0 cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                />
                <div className="flex min-w-[180px] flex-1 items-center gap-4">
                  <ToolAvatar type={item.type} />
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-left text-base font-semibold text-slate-900">
                      {item.name}
                    </strong>
                    <span className="mt-1 block truncate text-sm text-slate-500">
                      {item.type} · {item.storeCategory || item.category}
                    </span>
                  </div>
                </div>
                <div className="relative z-10 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-slate-500">
                    <Download size={15} className="text-blue-600" aria-hidden="true" />
                    다운로드{' '}
                    <strong className="font-semibold text-slate-800">
                      {(item.downloadCount ?? item.users ?? 0).toLocaleString('ko-KR')}회
                    </strong>
                  </span>
                  <StatusBadge>{item.publication === '게시 중' ? '게시 중' : '숨김'}</StatusBadge>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="조건에 맞는 앱·에이전트가 없습니다." />
        )}
      </section>
    </div>
  );
}
