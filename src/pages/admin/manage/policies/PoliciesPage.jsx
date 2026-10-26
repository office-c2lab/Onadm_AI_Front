import { useMemo, useState } from 'react';
import { BellRing, ChevronRight, FileCheck2, Plus, ScanSearch, Workflow } from 'lucide-react';
import { Drawer, SearchField, StatusBadge, cardClass } from '../components.jsx';
import { policyRows } from '../data.js';

const settingGroups = [
  {
    icon: FileCheck2,
    title: '등록 기준',
    description: '등록 가능 유형, 필수 정보, 파일 형식과 용량',
    value: '필수 항목 9개',
  },
  {
    icon: ScanSearch,
    title: '위험도·차단 기준',
    description: '심사 항목별 위험도와 자동 차단 조건',
    value: '차단 규칙 7개',
  },
  {
    icon: Workflow,
    title: '승인 워크플로',
    description: '유형·위험도별 승인 단계와 담당 역할',
    value: '승인 흐름 3개',
  },
  {
    icon: BellRing,
    title: 'SLA·알림',
    description: '처리 기한과 단계별 알림 수신 대상',
    value: '기본 SLA 48시간',
  },
];

export default function PoliciesPage() {
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('전체 유형');

  const visiblePolicies = useMemo(
    () =>
      policyRows.filter(item => {
        const matchesScope =
          scope === '전체 유형' || item.scope === scope || item.scope === '전체 유형';
        const matchesQuery = `${item.name} ${item.id} ${item.owner}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesScope && matchesQuery;
      }),
    [query, scope]
  );

  return (
    <div className="space-y-5">
      {notice ? (
        <div
          role="status"
          className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700"
        >
          {notice}
        </div>
      ) : null}
      <div className="sticky top-0 z-20 -mx-4 bg-white/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="mx-auto flex max-w-xl items-center">
          <SearchField value={query} onChange={setQuery} placeholder="심사 정책 검색" />
        </div>
      </div>
      <nav className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max min-w-full justify-center gap-1">
          {['전체 유형', 'AI App', 'AI Agent', '자동화 도구'].map(item => (
            <button
              key={item}
              type="button"
              onClick={() => setScope(item)}
              aria-pressed={scope === item}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors ${scope === item ? 'bg-[#ededed] font-medium text-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </nav>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {settingGroups.map(({ icon: Icon, title, description, value }) => (
          <button
            key={title}
            onClick={() => setNotice(`${title} 설정을 선택했습니다.`)}
            className={`${cardClass} p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Icon size={18} />
              </span>
              <ChevronRight size={17} className="text-slate-300" />
            </div>
            <h2 className="mt-4 text-sm font-bold text-slate-900">{title}</h2>
            <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{description}</p>
            <p className="mt-3 text-[11px] font-semibold text-blue-600">{value}</p>
          </button>
        ))}
      </div>
      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-0.5 text-[17px] font-bold text-slate-900">
              심사 정책 <ChevronRight size={18} />
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">총 {visiblePolicies.length}개</span>
            <button
              type="button"
              onClick={() =>
                setNotice('새 정책 작성 화면은 다음 단계에서 서버 저장 기능과 연결할 수 있습니다.')
              }
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={14} /> 새 정책
            </button>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {visiblePolicies.map(item => (
            <article
              key={item.id}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-12 place-items-center rounded-xl bg-[#EEF4FF] text-[#2463D3]">
                  <FileCheck2 size={23} strokeWidth={1.7} />
                </span>
                <StatusBadge>{item.status}</StatusBadge>
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-slate-900">{item.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {item.scope} 대상 · 심사 항목 {item.checks}개
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5 text-xs text-slate-600">
                <span className="rounded-md bg-slate-100 px-2 py-1">{item.scope}</span>
                <span className="rounded-md bg-slate-100 px-2 py-1">{item.version}</span>
                <span className="rounded-md bg-slate-100 px-2 py-1">{item.owner}</span>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span>최근 수정 {item.updatedAt}</span>
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className="font-medium text-blue-600 hover:underline"
                >
                  자세히 보기 →
                </button>
              </div>
            </article>
          ))}
        </div>
        {!visiblePolicies.length ? (
          <p className="py-16 text-center text-sm text-slate-500">
            조건에 맞는 심사 정책이 없습니다.
          </p>
        ) : null}
      </section>
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
        <strong>정책 변경 원칙</strong> · 시행 중인 정책은 직접 수정하지 않고 새 버전을 만들어야
        합니다. 변경 사항을 기존 앱에 소급 적용할 경우 재심사 대상을 먼저 확인하세요.
      </div>

      {selected ? (
        <Drawer
          title={selected.name}
          subtitle={`${selected.id} · ${selected.version}`}
          onClose={() => setSelected(null)}
          footer={
            <div className="flex justify-end gap-2">
              <button className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600">
                복제
              </button>
              <button className="h-9 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white">
                새 버전 만들기
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              ['적용 대상', selected.scope],
              ['상태', selected.status],
              ['심사 항목', `${selected.checks}개`],
              ['담당 조직', selected.owner],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 p-3">
                <p className="text-[11px] text-slate-400">{label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>
          <h3 className="mt-6 text-sm font-bold text-slate-900">주요 심사 규칙</h3>
          <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
            {[
              '악성 파일 및 실행 코드 확인',
              '비밀키·개인정보 탐지',
              '외부 네트워크 연결 검토',
              '요청 권한 최소화 확인',
              '오픈소스 라이선스 확인',
            ].map((rule, index) => (
              <div key={rule} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-slate-700">{rule}</span>
                <StatusBadge>{index < 2 ? '필수' : '경고'}</StatusBadge>
              </div>
            ))}
          </div>
          <h3 className="mt-6 text-sm font-bold text-slate-900">버전 이력</h3>
          <div className="mt-3 space-y-3 border-l-2 border-slate-100 pl-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">{selected.version} · 현재</p>
              <p className="mt-1 text-xs text-slate-400">
                {selected.updatedAt} · 외부 연결 심사 기준 강화
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">이전 버전</p>
              <p className="mt-1 text-xs text-slate-400">2026.09.12 · 개인정보 탐지 규칙 추가</p>
            </div>
          </div>
        </Drawer>
      ) : null}
    </div>
  );
}
