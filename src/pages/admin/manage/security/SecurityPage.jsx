import { useMemo, useState } from 'react';
import { Check, ChevronRight, CircleAlert, Clock3 } from 'lucide-react';
import Drawer from '../../../../components/ui/Drawer.jsx';
import EmptyState from '../../../../components/ui/EmptyState.jsx';
import SearchField from '../../../../components/ui/ValueSearchField.jsx';
import StatusBadge from '../../../../components/ui/StatusBadge.jsx';
import ToolAvatar from '../../../../components/ui/ToolAvatar.jsx';
import { appRecords, reviewRequests } from '../data.js';
import ReviewProgress from '../../../user/aistore/components/ReviewProgress.jsx';

const tabs = ['전체', '자동검사 중', '관리자 검토 필요', '심사 완료'];
const appCategoryById = new Map(appRecords.map(app => [app.id, app.category]));

function getCurrentReviewStage(item) {
  if (item.approval === '승인') return { name: '승인 및 게시', state: '완료' };
  if (item.approval === '반려') return { name: '심사 완료', state: '반려' };
  if (item.scan === '검사 중') return { name: '파일 제출·보안 검사', state: '진행 중' };
  if (item.scan === '실패') return { name: '파일 제출·보안 검사', state: '확인 필요' };
  if (item.approval === '보완 필요') return { name: '관리자 검토', state: '보완 필요' };
  return { name: '관리자 검토', state: '대기 중' };
}

function getReviewStageStates(item) {
  const approved = item.approval === '승인';
  const needsAttention = ['보완 필요', '반려'].includes(item.approval);
  const scanState =
    item.scan === '검사 중' ? 'running' : item.scan === '실패' ? 'failed' : 'complete';
  const adminState = approved ? 'complete' : needsAttention ? 'failed' : 'queued';
  return ['complete', scanState, adminState, approved ? 'complete' : 'pending'];
}

export default function SecurityPage() {
  const [tab, setTab] = useState('관리자 검토 필요');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [requests, setRequests] = useState(reviewRequests);
  const [notice, setNotice] = useState('');
  const rows = useMemo(
    () =>
      requests.filter(item => {
        const matches = `${item.name} ${item.id} ${item.requester}`
          .toLowerCase()
          .includes(query.toLowerCase());
        if (tab === '전체') return matches;
        if (tab === '자동검사 중') return matches && item.scan === '검사 중';
        if (tab === '관리자 검토 필요')
          return (
            matches && ['대기', '보완 필요'].includes(item.approval) && item.scan !== '검사 중'
          );
        return matches && ['승인', '반려'].includes(item.approval);
      }),
    [query, requests, tab]
  );

  const updateApproval = status => {
    setRequests(current =>
      current.map(item =>
        item.id === selected.id ? { ...item, approval: status, assignee: '정하늘' } : item
      )
    );
    setNotice(`${selected.name} 요청을 '${status}' 상태로 변경했습니다.`);
    setSelected(null);
  };

  return (
    <div className="space-y-5">
      {notice ? (
        <div
          role="status"
          className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700"
        >
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-xs font-semibold">
            닫기
          </button>
        </div>
      ) : null}
      <div className="sticky top-0 z-20 -mx-4 bg-canvas/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="mx-auto flex max-w-xl items-center">
          <SearchField value={query} onChange={setQuery} placeholder="앱, 요청 ID, 요청자 검색" />
        </div>
      </div>
      <nav
        aria-label="심사 관리 항목"
        className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max min-w-full justify-start gap-1">
          {tabs.map(item => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors ${tab === item ? 'bg-tab-active font-medium text-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </nav>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-0.5 text-size-17px font-bold text-slate-900">
            {tab} <ChevronRight size={18} />
          </h2>
          <span className="text-xs text-slate-400">{rows.length}건</span>
        </div>
        {rows.length ? (
          <div className="grid gap-2">
            {rows.map(item => (
              <article
                key={item.id}
                className="group relative flex min-h-[92px] min-w-0 flex-col gap-4 rounded-xl border border-transparent px-3 py-3 transition hover:z-10 hover:border-slate-100 hover:bg-white hover:shadow-sm sm:flex-row sm:items-center"
              >
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  aria-label={`${item.name} 심사 상세 보기`}
                  className="absolute inset-0 z-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                />
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <ToolAvatar
                    type={
                      item.name.includes('에이전트') || item.name.includes('검색')
                        ? 'AI Agent'
                        : 'AI App'
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-left text-base font-semibold text-slate-900">
                      {item.name}
                    </strong>
                    <span className="mt-1 block truncate text-sm text-slate-500">
                      {appCategoryById.get(item.appId) ?? '미분류'}
                    </span>
                  </div>
                </div>
                <div className="relative z-10 flex min-w-0 flex-wrap items-center gap-2 text-xs sm:min-w-48 sm:justify-end">
                  <span className="text-slate-500">{getCurrentReviewStage(item).name}</span>
                  <StatusBadge>{getCurrentReviewStage(item).state}</StatusBadge>
                  <span className="text-slate-400">{item.requester}</span>
                  <span className="text-slate-400">· {item.submittedAt}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="이 단계에 해당하는 심사 요청이 없습니다." />
        )}
      </section>

      {selected ? (
        <Drawer
          title={selected.name}
          subtitle={`${selected.id} · ${selected.requestType} · ${selected.requester}`}
          onClose={() => setSelected(null)}
          footer={
            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={() => updateApproval('반려')}
                className="h-9 rounded-lg border border-red-200 px-4 text-xs font-semibold text-red-600"
              >
                반려
              </button>
              <button
                onClick={() => updateApproval('보완 필요')}
                className="h-9 rounded-lg border border-orange-200 px-4 text-xs font-semibold text-orange-600"
              >
                보완 요청
              </button>
              <button
                onClick={() => updateApproval('승인')}
                disabled={selected.scan === '실패' || selected.scan === '검사 중'}
                className="h-9 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                승인
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-3 gap-2">
            {[
              ['위험도', selected.risk],
              ['자동검사', selected.scan],
              ['승인 상태', selected.approval],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 p-3">
                <p className="text-micro text-slate-400">{label}</p>
                <div className="mt-2">
                  <StatusBadge>{value}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-slate-200">
            <ReviewProgress
              upload={{
                id: selected.id,
                name: selected.name,
                status:
                  selected.approval === '승인'
                    ? '승인 완료'
                    : ['보완 필요', '반려'].includes(selected.approval)
                      ? selected.approval
                      : selected.scan === '검사 중'
                        ? '검토 중'
                        : '심사 대기',
                displayLabel: `${selected.requestType} · ${selected.requester}`,
                createdAt: selected.submittedAt,
              }}
              stageStates={getReviewStageStates(selected)}
            />
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <CircleAlert size={16} className="text-blue-600" /> 심사 메모
            </div>
            <textarea
              className="mt-3 min-h-24 w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-400"
              placeholder="승인, 보완 요청 또는 반려 사유를 입력하세요."
            />
            <p className="mt-2 flex items-center gap-1 text-micro text-slate-400">
              <Clock3 size={12} /> 모든 결정과 의견은 감사 로그에 기록됩니다.
            </p>
          </div>
          {selected.scan === '실패' ? (
            <p className="mt-3 flex items-center gap-2 text-xs text-red-600">
              <CircleAlert size={14} /> 검사 실패 항목을 해결하기 전에는 승인할 수 없습니다.
            </p>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
              <Check size={14} /> 필수 승인 조건을 확인했습니다.
            </p>
          )}
        </Drawer>
      ) : null}
    </div>
  );
}
