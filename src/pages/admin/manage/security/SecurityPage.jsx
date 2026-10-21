import { useMemo, useState } from 'react';
import {
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileWarning,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { Drawer, EmptyState, SearchField, StatusBadge, ToolAvatar } from '../components.jsx';
import { reviewRequests } from '../data.js';

const tabs = ['심사 대기', '자동검사 결과', '관리자 승인', '심사 이력'];
const checks = [
  ['악성 파일 및 압축 구조', '통과', '위험한 실행 파일이 발견되지 않았습니다.'],
  ['비밀키·개인정보 탐지', '통과', '노출된 인증정보가 없습니다.'],
  ['외부 네트워크 연결', '경고', 'api.example.com으로의 외부 연결 1건을 확인해 주세요.'],
  ['요청 권한 범위', '경고', '조직 디렉터리 읽기 권한의 필요성을 검토해 주세요.'],
  ['오픈소스 라이선스', '통과', '차단된 라이선스가 없습니다.'],
];

export default function SecurityPage() {
  const [tab, setTab] = useState('심사 대기');
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
        if (tab === '심사 대기') return matches && item.approval === '대기';
        if (tab === '자동검사 결과') return matches;
        if (tab === '관리자 승인')
          return (
            matches && ['대기', '보완 필요'].includes(item.approval) && item.scan !== '검사 중'
          );
        return matches && ['승인', '반려', '보완 필요'].includes(item.approval);
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
      <div className="sticky top-0 z-20 -mx-4 bg-[#f9f9f9]/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="mx-auto flex max-w-xl items-center">
          <SearchField value={query} onChange={setQuery} placeholder="앱, 요청 ID, 요청자 검색" />
        </div>
      </div>
      <nav className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max min-w-full justify-center gap-1">
          {tabs.map(item => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors ${tab === item ? 'bg-[#ededed] font-medium text-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              {item}
              {item === '심사 대기' ? (
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">
                  2
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </nav>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-0.5 text-[17px] font-bold text-slate-900">
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
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="truncate text-base font-semibold text-slate-900">
                        {item.name}
                      </strong>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                        {item.requestType}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {item.requester} · {item.id}
                    </p>
                  </div>
                </div>
                <div className="relative z-10 flex flex-wrap items-center gap-2 sm:justify-end">
                  <StatusBadge>{item.risk}</StatusBadge>
                  <StatusBadge>{item.scan}</StatusBadge>
                  <StatusBadge>{item.approval}</StatusBadge>
                  {item.findings ? (
                    <span className="text-xs font-medium text-red-500">발견 {item.findings}건</span>
                  ) : null}
                </div>
                <div className="relative z-10 flex min-w-24 items-center justify-end gap-2 text-xs text-slate-400">
                  <span>{item.assignee}</span>
                  <span>·</span>
                  <span>{item.elapsed}</span>
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
                <p className="text-[11px] text-slate-400">{label}</p>
                <div className="mt-2">
                  <StatusBadge>{value}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">자동검사 결과</h3>
            <button className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
              <RotateCcw size={13} /> 재검사
            </button>
          </div>
          <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
            {checks.map(([name, status, description]) => (
              <div key={name} className="flex gap-3 p-4">
                {status === '통과' ? (
                  <ShieldCheck className="mt-0.5 shrink-0 text-emerald-500" size={18} />
                ) : (
                  <FileWarning className="mt-0.5 shrink-0 text-amber-500" size={18} />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{name}</p>
                    <StatusBadge>{status}</StatusBadge>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <CircleAlert size={16} className="text-blue-600" /> 심사 메모
            </div>
            <textarea
              className="mt-3 min-h-24 w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-400"
              placeholder="승인, 보완 요청 또는 반려 사유를 입력하세요."
            />
            <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
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
