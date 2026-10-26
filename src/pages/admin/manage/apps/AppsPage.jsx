import { useMemo, useState } from 'react';
import { Ban, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Drawer, EmptyState, SearchField, StatusBadge, ToolAvatar } from '../components.jsx';
import { appRecords } from '../data.js';
import {
  detailContent,
  supportedEnvironment,
} from '../../../user/aistore/data/storeDetailContent.js';
import {
  StoreToolPreviewScreen,
  storePreviewTabs,
} from '../../../user/aistore/components/StoreToolPreviewScreen.jsx';

const publicationTabs = ['전체', '게시 중', '숨김'];

function DetailSection({ title, children }) {
  return (
    <section className="border-t border-slate-200 py-5 first:border-t-0 first:pt-0">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function AppsPage() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [activePreview, setActivePreview] = useState(0);
  const [publication, setPublication] = useState('게시 중');
  const [apps, setApps] = useState(appRecords);

  const approvedApps = useMemo(
    () => apps.filter(item => item.scan === '통과' && item.approval === '승인'),
    [apps]
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

  const setAppPublication = (app, nextStatus) => {
    setApps(current =>
      current.map(item => (item.id === app.id ? { ...item, publication: nextStatus } : item))
    );
    setSelected(current =>
      current?.id === app.id ? { ...current, publication: nextStatus } : current
    );
  };

  const selectedContent = selected
    ? (detailContent[selected.storeId] ?? {
        description: [selected.description || selected.summary],
        usage:
          '업무 목적과 필요한 내용을 입력한 뒤 결과를 원자료와 대조해 확인해 주세요. 필요한 내용을 수정하고 담당자의 검토를 거쳐 활용할 수 있습니다.',
      })
    : null;
  const selectedStoreTool = selected ? { ...selected, id: selected.storeId ?? selected.id } : null;
  const openDetails = item => {
    setSelected(item);
    setActivePreview(0);
  };

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
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors ${publication === item ? 'bg-[#ededed] font-medium text-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
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
                className="group relative flex min-h-[82px] min-w-0 flex-wrap items-center gap-4 rounded-xl border border-transparent px-3 py-3 transition hover:z-20 hover:border-slate-100 hover:bg-[#f5f5f5] hover:shadow-sm focus-within:z-20 focus-within:border-slate-100 focus-within:bg-[#f5f5f5]"
              >
                <button
                  type="button"
                  onClick={() => openDetails(item)}
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
                  <StatusBadge>{item.publication === '게시 중' ? '게시 중' : '숨김'}</StatusBadge>
                  {item.operation === '중지' ? <StatusBadge>중지</StatusBadge> : null}
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
          subtitle={`${selected.type} · ${selected.storeCategory || selected.category}`}
          onClose={() => setSelected(null)}
          footer={
            <div className="flex justify-end">
              <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600">
                <Ban size={14} /> 운영 중지
              </button>
            </div>
          }
        >
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <ToolAvatar type={selected.type} size="lg" />
            <div className="min-w-0">
              <p className="mt-1 text-sm leading-6 text-slate-500">{selected.summary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <FileText size={14} /> v{selected.version}
                </span>
                <span>사내 등록 도구</span>
                <span>{selected.maker || selected.owner}</span>
              </div>
            </div>
          </div>
          <DetailSection title="스크린샷">
            <div className="relative rounded-2xl bg-gradient-to-br from-sky-50 via-white to-indigo-100 px-5 py-7 sm:px-12 sm:py-10">
              <StoreToolPreviewScreen tool={selectedStoreTool} activeIndex={activePreview} />
              <button
                type="button"
                onClick={() =>
                  setActivePreview(
                    current => (current + storePreviewTabs.length - 1) % storePreviewTabs.length
                  )
                }
                aria-label="이전 미리보기"
                className="absolute left-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white text-blue-600 shadow-md hover:bg-blue-50 sm:left-5"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setActivePreview(current => (current + 1) % storePreviewTabs.length)}
                aria-label="다음 미리보기"
                className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white text-blue-600 shadow-md hover:bg-blue-50 sm:right-5"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div
              className="mt-3 flex items-center justify-center gap-2"
              aria-label="미리보기 페이지"
            >
              {storePreviewTabs.map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActivePreview(index)}
                  aria-label={`${tab} 미리보기`}
                  aria-current={activePreview === index ? 'true' : undefined}
                  className={`h-2 rounded-full transition-all ${activePreview === index ? 'w-5 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
                />
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-slate-400">화면 구성 예시</p>
          </DetailSection>
          <DetailSection title="설명">
            <div className="max-w-3xl space-y-3 text-sm leading-7 text-slate-600">
              {selectedContent.description.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </DetailSection>
          <DetailSection title="주요 기능">
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              {selectedContent.features ?? selected.summary}
            </p>
          </DetailSection>
          <DetailSection title="사용 방법">
            <p className="max-w-3xl text-sm leading-7 text-slate-600">{selectedContent.usage}</p>
          </DetailSection>
          <DetailSection title="지원 환경">
            <dl className="max-w-3xl divide-y divide-slate-100 text-sm">
              {supportedEnvironment.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-center gap-4 py-3 sm:grid-cols-[14rem_1fr]"
                >
                  <dt className="flex items-center gap-3 text-slate-600">
                    <Icon size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
                    {label}
                  </dt>
                  <dd className="font-medium text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </DetailSection>
          <DetailSection title="도구 정보">
            <dl className="max-w-3xl divide-y divide-slate-100 text-sm">
              {[
                ['도구 유형', selected.type],
                ['카테고리', selected.category],
                ['제작자', selected.maker || selected.owner],
                ['제공 위치', 'ONDAM AI App Store'],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[8rem_1fr] gap-4 py-2.5">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </DetailSection>
          <DetailSection title="버전 정보">
            <div className="flex max-w-3xl items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 text-sm">
              <span className="font-semibold text-blue-600">v{selected.version}</span>
              <span className="text-slate-500">현재 제공 버전</span>
            </div>
          </DetailSection>
          <DetailSection title="관리 정보">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['보안검사', selected.scan],
                ['관리자 승인', selected.approval],
                ['운영 상태', selected.operation],
                ['스토어 게시', selected.publication === '게시 중' ? '게시 중' : '숨김'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-[11px] text-slate-400">{label}</p>
                  <div className="mt-2">
                    <StatusBadge>{value}</StatusBadge>
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
          <DetailSection title="스토어 노출">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
              <div>
                <p className="mt-1 text-xs text-slate-500">
                  {selected.publication === '게시 중'
                    ? '스토어에 게시되어 있습니다.'
                    : '현재 스토어에 노출되지 않습니다.'}
                </p>
              </div>
              <label className="flex cursor-pointer items-center gap-3">
                <span className="text-xs font-medium text-slate-500">
                  {selected.publication === '게시 중' ? '게시 중' : '숨김'}
                </span>
                <input
                  className="peer sr-only"
                  type="checkbox"
                  checked={selected.publication === '게시 중'}
                  onChange={event =>
                    setAppPublication(selected, event.target.checked ? '게시 중' : '숨김')
                  }
                  aria-label={`${selected.name} 스토어 노출`}
                />
                <span className="relative h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-blue-600 after:absolute after:top-1 after:left-1 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
              </label>
            </div>
          </DetailSection>
        </Drawer>
      ) : null}
    </div>
  );
}
