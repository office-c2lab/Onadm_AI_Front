import { useMemo, useState } from 'react';
import { Ban, ExternalLink, RefreshCw } from 'lucide-react';
import { Drawer, EmptyState, SearchField, StatusBadge, ToolAvatar } from '../components.jsx';
import { appRecords } from '../data.js';

const publishedApps = appRecords.filter(
  item =>
    item.scan === '통과' &&
    item.approval === '승인' &&
    item.publication === '게시 중' &&
    item.operation === '정상'
);

const detailRows = item => [
  ['자산 ID', item.id],
  ['유형', item.type],
  ['카테고리', item.category],
  ['소유자', `${item.owner} · ${item.department}`],
  ['현재 버전', `v${item.version}`],
  ['공개 범위', item.visibility],
  ['최근 업데이트', item.updatedAt],
];

export default function AppsPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('전체 유형');
  const [selected, setSelected] = useState(null);

  const rows = useMemo(
    () =>
      publishedApps.filter(item => {
        const text = `${item.name} ${item.id} ${item.owner} ${item.department}`.toLowerCase();
        return text.includes(query.toLowerCase()) && (type === '전체 유형' || item.type === type);
      }),
    [query, type]
  );

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-20 -mx-4 bg-[#f9f9f9]/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="mx-auto flex max-w-xl items-center">
          <SearchField value={query} onChange={setQuery} placeholder="이름, ID, 소유자 검색" />
        </div>
      </div>

      <nav className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max min-w-full items-center justify-center gap-1">
          {['전체 유형', 'AI App', 'AI Agent', '자동화 도구', '일반 업무 도구'].map(item => (
            <button
              key={item}
              type="button"
              onClick={() => setType(item)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors ${type === item ? 'bg-[#ededed] font-medium text-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              {item}
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
                className="group relative flex min-h-[82px] min-w-0 flex-wrap items-center gap-4 rounded-xl border border-transparent px-3 py-3 transition hover:z-20 hover:border-slate-100 hover:bg-white hover:shadow-sm focus-within:z-20 focus-within:border-slate-100 focus-within:bg-white"
              >
                <button
                  type="button"
                  onClick={() => setSelected(item)}
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
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="relative z-10 flex items-center gap-2">
                  <StatusBadge>{item.operation}</StatusBadge>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="inline-flex h-8 cursor-pointer items-center rounded-lg bg-blue-50 px-2.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
                  >
                    관리
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="조건에 맞는 앱·에이전트가 없습니다." />
        )}
      </section>

      {selected ? (
        <Drawer
          title={selected.name}
          subtitle={`${selected.id} · ${selected.type}`}
          onClose={() => setSelected(null)}
          footer={
            <div className="flex justify-end gap-2">
              <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600">
                <RefreshCw size={14} /> 재검사
              </button>
              <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600">
                <Ban size={14} /> 운영 중지
              </button>
            </div>
          }
        >
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <ToolAvatar type={selected.type} size="lg" />
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{selected.name}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{selected.summary}</p>
            </div>
          </div>
          <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">
            {detailRows(selected).map(([label, value]) => (
              <div key={label} className="flex justify-between gap-6 px-4 py-3 text-sm">
                <span className="text-slate-400">{label}</span>
                <strong className="text-right font-medium text-slate-800">{value}</strong>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              ['보안검사', selected.scan],
              ['관리자 승인', selected.approval],
              ['스토어 게시', selected.publication],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 p-3">
                <p className="text-[11px] text-slate-400">{label}</p>
                <div className="mt-2">
                  <StatusBadge>{value}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
            전체 감사 로그 보기 <ExternalLink size={13} />
          </button>
        </Drawer>
      ) : null}
    </div>
  );
}
