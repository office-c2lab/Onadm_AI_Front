import { useMemo, useState } from 'react';
import { ChevronDown, ClipboardList, RefreshCw } from 'lucide-react';
import zipFileImage from '../../../../assets/images/zipfile.png';
import SearchHeader from '../../../../components/search/SearchHeader.jsx';
import { appRecords, reviewRequests } from '../data.js';
import AdminReviewProgress from './AdminReviewProgress.jsx';

const tabs = ['전체', '자동 심사', '관리자 검토', '승인 완료', '반려'];
const appsById = new Map(appRecords.map(app => [app.id, app]));

function getReviewStatus(item) {
  if (item.approval === '승인') return '승인 완료';
  if (['반려', '보완 필요'].includes(item.approval)) return '반려';
  if (item.scan === '대기') return '심사 대기';
  if (item.scan !== '통과') return '심사 진행중';
  return '관리자 검토';
}

function getReviewTab(item) {
  const status = getReviewStatus(item);
  return ['심사 대기', '심사 진행중'].includes(status) ? '자동 심사' : status;
}

function ReviewStatus({ status }) {
  const color =
    status === '승인 완료'
      ? 'bg-emerald-50 text-emerald-700'
      : status === '반려'
        ? 'bg-red-50 text-red-700'
        : status === '관리자 검토'
          ? 'bg-blue-50 text-blue-700'
          : status === '심사 진행중'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-slate-100 text-slate-700';

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${color}`}
    >
      {status}
    </span>
  );
}

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState('전체');
  const [search, setSearch] = useState('');
  const [openRequestId, setOpenRequestId] = useState(null);
  const requests = reviewRequests;
  const keyword = search.trim().toLowerCase();

  const tabCounts = Object.fromEntries(
    tabs.map(tab => [
      tab,
      tab === '전체' ? requests.length : requests.filter(item => getReviewTab(item) === tab).length,
    ])
  );

  const rows = useMemo(
    () =>
      requests.filter(item => {
        const app = appsById.get(item.appId);
        const matchesTab = activeTab === '전체' || getReviewTab(item) === activeTab;
        const matchesKeyword =
          !keyword ||
          `${item.name} ${item.id} ${item.requester} ${item.requestType} ${app?.category ?? ''}`
            .toLowerCase()
            .includes(keyword);
        return matchesTab && matchesKeyword;
      }),
    [activeTab, keyword, requests]
  );

  return (
    <div className="w-full">
      <SearchHeader
        value={search}
        onSearchChange={setSearch}
        placeholder="도구명, 요청 ID, 요청자 또는 부서 검색"
        ariaLabel="심사 요청 검색"
      />

      <nav
        className="mt-5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="심사 관리 상태"
      >
        <div className="flex w-max min-w-full justify-start gap-1">
          {tabs.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setOpenRequestId(null);
              }}
              aria-pressed={activeTab === tab}
              className={`inline-flex h-8 shrink-0 items-center rounded-full px-4 text-sm transition-colors ${activeTab === tab ? 'bg-[#ededed] font-medium text-[#333]' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              {tab}
              <span className="ml-1.5 text-xs tabular-nums text-slate-400">{tabCounts[tab]}</span>
            </button>
          ))}
        </div>
      </nav>

      <section className="mt-5">
        {rows.length ? (
          <div className="grid gap-2">
            {rows.map(item => {
              const status = getReviewStatus(item);
              const isOpen = openRequestId === item.id;

              return (
                <article
                  key={item.id}
                  className={`group relative min-w-0 rounded-xl border transition hover:z-20 hover:border-slate-100 hover:bg-[#f5f5f5] hover:shadow-sm focus-within:z-20 ${isOpen ? 'border-slate-200 bg-[#f5f5f5] shadow-sm' : 'border-transparent'}`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenRequestId(current => (current === item.id ? null : item.id))
                    }
                    aria-expanded={isOpen}
                    aria-controls={`review-detail-${item.id}`}
                    className="flex min-h-[82px] w-full cursor-pointer items-center gap-4 rounded-xl px-3 py-3 text-left"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-4">
                      {item.requestType === '업데이트' ? (
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                          <RefreshCw size={24} strokeWidth={1.8} aria-hidden="true" />
                        </span>
                      ) : (
                        <img
                          src={zipFileImage}
                          alt=""
                          className="h-12 w-12 shrink-0 object-contain"
                          aria-hidden="true"
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex min-w-0 items-center gap-2">
                          <strong className="min-w-0 truncate text-base font-semibold text-slate-900">
                            {item.name}
                          </strong>
                          <span
                            className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium ${item.requestType === '업데이트' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`}
                          >
                            {item.requestType}
                          </span>
                        </span>
                        <span className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
                          <span className="truncate" title={item.fileName}>
                            {item.fileName}
                          </span>
                          <span className="shrink-0 text-slate-300">·</span>
                          <span className="shrink-0">{item.size}</span>
                          {item.requestType === '업데이트' && item.version && (
                            <>
                              <span className="shrink-0 text-slate-300">·</span>
                              <span className="shrink-0 font-medium text-blue-600">
                                {item.previousVersion
                                  ? `v${item.previousVersion} → v${item.version}`
                                  : `v${item.version}`}
                              </span>
                            </>
                          )}
                        </span>
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-xs text-slate-500 lg:inline">
                      {item.submittedAt}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <ReviewStatus status={status} />
                      <ChevronDown
                        size={19}
                        className={`shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </span>
                  </button>

                  {isOpen && (
                    <AdminReviewProgress
                      review={item}
                      detailTo={`/admin/manage/security/${item.id}`}
                    />
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
            <ClipboardList size={30} className="text-slate-300" />
            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              {keyword ? '검색 조건에 맞는 심사 요청이 없습니다.' : `${activeTab} 요청이 없습니다.`}
            </h3>
            <p className="mt-1 text-xs text-slate-500">다른 상태나 검색 조건을 확인해 보세요.</p>
          </div>
        )}
      </section>
    </div>
  );
}
