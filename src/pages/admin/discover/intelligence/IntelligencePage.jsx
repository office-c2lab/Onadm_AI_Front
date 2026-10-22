import DialogLayer from '../../../../components/ui/DialogLayer.jsx';
import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Database,
  FileSearch,
  FileText,
  Globe2,
  MoreVertical,
  Newspaper,
  Search,
  ShieldAlert,
  Ban,
  X,
} from 'lucide-react';

const intelligenceItems = [
  {
    id: 'intel-001',
    title: 'writerflow.ai',
    category: 'AI 보안',
    type: '위협 인텔리전스',
    source: 'KISA 보안 공지',
    summary: '프롬프트 인젝션과 데이터 유출 공격 사례 및 대응 권고안을 정리했습니다.',
    updatedAt: '2026.10.20',
    status: '분석 완료',
    icon: ShieldAlert,
    color: 'bg-rose-50 text-rose-500',
  },
  {
    id: 'intel-002',
    title: 'claude.ai',
    category: '정책·규제',
    type: '규제 브리핑',
    source: 'EU AI Office',
    summary: 'EU AI Act 시행 일정과 고위험 AI 시스템의 최근 준수 요건을 제공합니다.',
    updatedAt: '2026.10.19',
    status: '분석 완료',
    icon: Globe2,
    color: 'bg-blue-50 text-blue-500',
  },
  {
    id: 'intel-003',
    title: 'newai.example',
    category: '시장 분석',
    type: '산업 리포트',
    source: 'AI 산업 연구원',
    summary: '국내 기업용 LLM 도입률과 주요 서비스별 활용 분야를 비교 분석합니다.',
    updatedAt: '2026.10.18',
    status: '최신',
    icon: Newspaper,
    color: 'bg-violet-50 text-violet-500',
  },
  {
    id: 'intel-004',
    title: 'perplexity.ai',
    category: '기술 자료',
    type: '백서',
    source: 'ON:담 Research',
    summary: '멀티 에이전트 오케스트레이션 구조와 도구 승인 설계 원칙을 설명합니다.',
    updatedAt: '2026.10.17',
    status: '검토 중',
    icon: FileText,
    color: 'bg-amber-50 text-amber-500',
  },
  {
    id: 'intel-005',
    title: 'portal.example',
    category: '취약점',
    type: '구조화 데이터',
    source: 'CVE Intelligence',
    summary: 'AI 런타임과 모델 공급망에서 발견된 주요 취약점과 영향 범위를 제공합니다.',
    updatedAt: '2026.10.16',
    status: '분석 완료',
    icon: Database,
    color: 'bg-cyan-50 text-cyan-600',
  },
];

const tabs = [
  { id: 'all', label: '전체 서비스' },
  { id: 'allowed', label: '허용된 서비스' },
  { id: 'blocked', label: '차단된 서비스' },
];

function IntelligenceRow({ item, blocked, onToggleBlocked, onOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const Icon = item.icon;

  return (
    <article
      className={`group relative flex min-h-[82px] min-w-0 flex-wrap items-center gap-4 rounded-xl border px-3 py-3 transition hover:z-20 hover:border-slate-100 hover:bg-white hover:shadow-sm focus-within:z-20 ${
        menuOpen ? 'z-30 border-slate-100 bg-white shadow-sm' : 'border-transparent'
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="flex min-w-[190px] flex-1 items-center gap-4 text-left"
        aria-label={`${item.title} 상세 보기`}
      >
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${item.color}`}>
          <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-semibold text-slate-900">
            {item.title}
          </span>
          <span className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <span className="truncate">{item.category}</span>
            <span className="h-0.5 w-0.5 shrink-0 rounded-full bg-slate-300" />
            <span className="truncate">{item.source}</span>
          </span>
        </span>
      </button>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <span
          className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ${
            blocked ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          {blocked ? (
            <Ban size={14} aria-hidden="true" />
          ) : (
            <CheckCircle2 size={14} aria-hidden="true" />
          )}
          {blocked ? '차단됨' : '허용됨'}
        </span>
        <div
          className="relative"
          onBlur={event => {
            if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
          }}
        >
          <button
            type="button"
            onClick={() => setMenuOpen(open => !open)}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label={`${item.title} 더보기`}
            aria-expanded={menuOpen}
          >
            <MoreVertical size={17} aria-hidden="true" />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-full z-30 mt-1 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpen(item);
                }}
                className="w-full rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
              >
                상세 보기
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onToggleBlocked(item.id);
                }}
                className="w-full rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
              >
                {blocked ? '차단 해제' : '서비스 차단'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function DetailModal({ item, blocked, onToggleBlocked, onClose }) {
  if (!item) return null;
  const Icon = item.icon;

  return (
    <DialogLayer onClose={onClose} className="fixed inset-0 z-[100] grid place-items-center p-4">
      <button
        type="button"
        aria-label="상세 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="intelligence-detail-title"
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${item.color}`}>
              <Icon size={23} strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-blue-600">{item.category}</p>
              <h2
                id="intelligence-detail-title"
                className="mt-1 truncate text-xl font-bold text-slate-900"
              >
                {item.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </header>
        <div className="px-6 py-6">
          <p className="text-sm leading-7 text-slate-600">{item.summary}</p>
          <dl className="mt-6 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
            {[
              ['자료 유형', item.type],
              ['출처', item.source],
              ['서비스 상태', blocked ? '차단됨' : '허용됨'],
              ['업데이트', item.updatedAt],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold text-slate-400">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-700">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <footer className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={() => onToggleBlocked(item.id)}
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
              blocked
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
            }`}
          >
            {blocked ? <CheckCircle2 size={16} /> : <Ban size={16} />}
            {blocked ? '차단 해제' : '서비스 차단'}
          </button>
          <button
            type="button"
            className="h-10 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            원문 보기
          </button>
        </footer>
      </section>
    </DialogLayer>
  );
}

export default function IntelligencePage() {
  const [keyword, setKeyword] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [blockedServices, setBlockedServices] = useState(['intel-001', 'intel-003']);
  const [selectedItem, setSelectedItem] = useState(null);

  const toggleBlocked = id => {
    setBlockedServices(current =>
      current.includes(id) ? current.filter(itemId => itemId !== id) : [...current, id]
    );
  };

  const visibleItems = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return intelligenceItems.filter(item => {
      const isBlocked = blockedServices.includes(item.id);
      const matchesTab = activeTab === 'all' || (activeTab === 'blocked' ? isBlocked : !isBlocked);
      const matchesQuery =
        `${item.title} ${item.category} ${item.type} ${item.source} ${item.summary}`
          .toLowerCase()
          .includes(query);
      return matchesTab && matchesQuery;
    });
  }, [activeTab, blockedServices, keyword]);

  return (
    <div className="w-full">
      <div className="sticky top-0 z-30 -mx-5 bg-canvas/95 px-5 py-3 backdrop-blur md:-mx-8 md:px-8">
        <label className="mx-auto flex h-11 w-full max-w-xl items-center gap-3 rounded-lg bg-search-surface px-4 text-slate-500 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20">
          <Search size={19} strokeWidth={2} aria-hidden="true" />
          <input
            type="search"
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            placeholder="Intelligence DB 검색"
            aria-label="Intelligence DB 검색"
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-600"
          />
        </label>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <nav className="flex items-center gap-1" aria-label="Intelligence DB 탭">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-1 text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-tab-active font-medium text-palette-neutral-27'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <p className="hidden text-sm text-slate-400 sm:block">총 {visibleItems.length}개 서비스</p>
      </div>

      <section className="mt-7">
        {visibleItems.length ? (
          <div className="grid gap-2 md:grid-cols-2">
            {visibleItems.map(item => (
              <IntelligenceRow
                key={item.id}
                item={item}
                blocked={blockedServices.includes(item.id)}
                onToggleBlocked={toggleBlocked}
                onOpen={setSelectedItem}
              />
            ))}
          </div>
        ) : (
          <div className="px-4 py-16 text-center">
            {activeTab === 'blocked' ? (
              <Ban className="mx-auto text-slate-300" size={30} />
            ) : (
              <CheckCircle2 className="mx-auto text-slate-300" size={30} />
            )}
            <p className="mt-4 font-medium text-slate-900">
              {keyword
                ? '검색 결과가 없습니다.'
                : activeTab === 'blocked'
                  ? '차단된 서비스가 없습니다.'
                  : activeTab === 'allowed'
                    ? '허용된 서비스가 없습니다.'
                    : '등록된 서비스가 없습니다.'}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {keyword
                ? '다른 검색어로 다시 찾아보세요.'
                : '서비스를 등록하거나 상태를 변경해 보세요.'}
            </p>
          </div>
        )}
      </section>

      <DetailModal
        item={selectedItem}
        blocked={selectedItem ? blockedServices.includes(selectedItem.id) : false}
        onToggleBlocked={toggleBlocked}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
