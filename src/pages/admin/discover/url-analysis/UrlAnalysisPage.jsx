import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  FileSearch,
  Globe2,
  Link2,
  LoaderCircle,
  PanelLeft,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import CustomDropdown from '../../../../components/dropdown/CustomDropdown.jsx';
import urlImage from '../../../../assets/images/url.png';

const sampleHistory = [
  {
    id: 1,
    domain: 'writerflow.ai',
    ai: 'AI 서비스',
    kind: '생성형 AI',
    db: '신규 후보',
    time: '10.20 11:21',
    confidence: 92,
  },
  {
    id: 2,
    domain: 'claude.ai',
    ai: 'AI 서비스',
    kind: '생성형 AI',
    db: '등록됨',
    time: '10.20 10:48',
    confidence: 99,
  },
  {
    id: 3,
    domain: 'newai.example',
    ai: '판단 불가',
    kind: '—',
    db: '검토 필요',
    time: '10.20 10:35',
    confidence: null,
  },
  {
    id: 4,
    domain: 'perplexity.ai',
    ai: 'AI 서비스',
    kind: 'AI 검색',
    db: '등록됨',
    time: '10.20 09:43',
    confidence: 98,
  },
  {
    id: 5,
    domain: 'portal.example',
    ai: '비AI 서비스',
    kind: '일반 웹사이트',
    db: '—',
    time: '10.19 17:12',
    confidence: 96,
  },
  {
    id: 6,
    domain: 'midjourney.com',
    ai: 'AI 서비스',
    kind: '이미지 생성',
    db: '등록됨',
    time: '10.19 16:03',
    confidence: 99,
  },
  {
    id: 7,
    domain: 'cursor.com',
    ai: 'AI 서비스',
    kind: 'AI 코딩',
    db: '등록됨',
    time: '10.19 14:37',
    confidence: 97,
  },
];

const aiFilterOptions = [
  { value: 'all', label: 'AI 서비스 여부' },
  { value: 'AI 서비스', label: 'AI 서비스' },
  { value: '비AI 서비스', label: '비AI 서비스' },
  { value: '판단 불가', label: '판단 불가' },
];

const dbFilterOptions = [
  { value: 'all', label: '분석 상태' },
  { value: '등록됨', label: '등록됨' },
  { value: '신규 후보', label: '신규 후보' },
  { value: '검토 필요', label: '검토 필요' },
  { value: '—', label: '미등록' },
];

const analysisSteps = [
  {
    label: '웹사이트 정보 수집',
    description: 'URL에 접속해 공개 페이지와 메타데이터를 확인합니다.',
  },
  {
    label: 'AI 서비스 식별',
    description: '서비스 설명과 주요 기능을 기반으로 AI 서비스 여부를 판별합니다.',
  },
  {
    label: 'Intelligence DB 확인',
    description: '기존 등록 정보와 비교해 신규 후보 또는 등록 상태를 확인합니다.',
  },
];

function Badge({ value }) {
  if (value === '—') return <span className="text-[#9aa7b8]">—</span>;
  const color =
    value === 'AI 서비스' || value.startsWith('높음')
      ? 'bg-[#eaf1ff] text-[#3774ee]'
      : value === '등록됨'
        ? 'bg-[#e4f7ee] text-[#18a66b]'
        : value === '신규 후보' || value === '검토 필요'
          ? 'bg-[#fff2dc] text-[#c78819]'
          : 'bg-[#eef2f6] text-[#6b7a90]';
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${color}`}>{value}</span>
  );
}

function AnalysisDetails({ item, onShowResult }) {
  const completedSteps = item.progress ?? analysisSteps.length;
  const isRunning = completedSteps < analysisSteps.length;

  return (
    <div
      id={`analysis-detail-${item.id}`}
      role="region"
      aria-label={`${item.domain} 분석 진행 내역`}
      className="border-t border-slate-100 bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">분석 진행 내역</h3>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${isRunning ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}
            >
              {isRunning ? '분석 중' : '모든 작업 완료'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {item.domain} · {item.time}
          </p>
        </div>
        <span className="text-xs font-medium text-blue-600">
          {completedSteps}/{analysisSteps.length}단계 완료
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${item.domain} 분석 완료 단계`}
        aria-valuemin={0}
        aria-valuemax={analysisSteps.length}
        aria-valuenow={completedSteps}
        className="h-1 bg-slate-100"
      >
        <div
          className="h-full bg-blue-600 transition-[width] duration-500"
          style={{ width: `${(completedSteps / analysisSteps.length) * 100}%` }}
        />
      </div>
      <ol className="divide-y divide-slate-100">
        {analysisSteps.map((step, index) => {
          const complete = index < completedSteps;
          const running = index === completedSteps && isRunning;

          return (
            <li key={step.label} className="flex min-h-[72px] items-start gap-3 px-4 py-4 sm:px-6">
              {complete ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              ) : running ? (
                <LoaderCircle className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-blue-600" />
              ) : (
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-slate-200" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-medium text-slate-900">{step.label}</h4>
                  <span
                    className={`shrink-0 text-xs ${complete ? 'text-emerald-600' : running ? 'text-blue-600' : 'text-slate-400'}`}
                  >
                    {complete ? '완료' : running ? '진행 중' : '대기'}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {!isRunning && (
        <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onShowResult}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            분석 결과 확인 <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function DetailModal({ item, onClose }) {
  const [tab, setTab] = useState('result');
  const isAi = item.ai === 'AI 서비스';
  const status = item.db === '검토 필요' ? '검토 필요' : '분석 완료';

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="url-analysis-modal-title"
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[440px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/15"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
          aria-label="분석 결과 닫기"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 pr-9">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#eaf1ff] text-xl font-semibold text-[#3978f3]">
            {item.domain[0].toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="url-analysis-modal-title"
              className="truncate text-sm font-semibold text-slate-900"
            >
              {item.domain}
            </h2>
            <p className="mt-1 truncate text-xs text-slate-500">URL 검사 결과 · {item.time}</p>
          </div>
          <span
            className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${status === '분석 완료' ? 'bg-[#e4f7ee] text-[#18a66b]' : 'bg-[#fff2dc] text-[#c78819]'}`}
          >
            {status}
          </span>
        </div>

        <div
          className="mt-5 flex gap-5 border-b border-slate-200"
          role="tablist"
          aria-label="분석 상세 탭"
        >
          {[
            ['result', '식별 결과'],
            ['evidence', '분석 근거'],
            ['history', '검사 이력'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`relative pb-3 text-sm ${tab === id ? 'font-semibold text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {label}
              {tab === id && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600" />
              )}
            </button>
          ))}
        </div>

        {tab === 'result' && (
          <div className="pt-4">
            <h3
              className={`flex items-center gap-2 text-sm font-semibold ${isAi ? 'text-[#10a779]' : 'text-[#d08d1d]'}`}
            >
              {isAi ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {isAi
                ? 'AI 서비스 식별'
                : item.ai === '비AI 서비스'
                  ? '비AI 서비스 식별'
                  : '추가 검토 필요'}
            </h3>
            <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              {isAi
                ? '텍스트 생성 기능과 관련된 사이트 정보가 확인되어 생성형 AI 서비스로 분류되었습니다.'
                : item.ai === '비AI 서비스'
                  ? '일반 웹사이트로 분류되었습니다. 핵심 AI 서비스 기능은 식별되지 않았습니다.'
                  : '서비스 정보를 충분히 확인하지 못했습니다. 담당자의 검토가 필요합니다.'}
            </p>
            <dl className="mt-5 space-y-4 text-sm text-slate-900">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">서비스 유형</dt>
                <dd className="font-medium">{item.kind}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">식별 신뢰도</dt>
                <dd>{item.confidence ? <Badge value={`높음 · ${item.confidence}%`} /> : '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">DB 등록 여부</dt>
                <dd>
                  <Badge value={item.db} />
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">검사 상태</dt>
                <dd className="font-medium">{status}</dd>
              </div>
            </dl>
            <div className="mt-6 border-t border-slate-200 pt-5">
              <h4 className="text-sm font-semibold">주요 식별 근거</h4>
              <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
                {(isAi
                  ? [
                      'AI 기반 글쓰기 기능 설명 확인',
                      '메타데이터에서 생성형 AI 키워드 발견',
                      '페이지 내 텍스트 생성 기능 확인',
                    ]
                  : ['사이트 기본 정보 확인', '서비스 기능 재검토 권장', '분류 데이터 확인 필요']
                ).map(reason => (
                  <li key={reason} className="flex gap-2">
                    <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#e4f7ee] text-[#15a572]">
                      ✓
                    </span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {tab === 'evidence' && (
          <div className="space-y-4 pt-5 text-sm text-slate-600">
            <p className="rounded-xl bg-slate-50 p-4 leading-6">
              현재는 예시 분석 데이터입니다. 실제 판정 근거는 분석 API 연결 후 표시됩니다.
            </p>
            <p className="flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-[#5a86df]" /> 서비스 설명 및 메타데이터
            </p>
            <p className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-[#5a86df]" /> 도메인 및 공개 페이지 정보
            </p>
          </div>
        )}
        {tab === 'history' && (
          <div className="pt-5">
            <div className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              <Clock3 className="h-4 w-4 shrink-0 text-[#5a86df]" />
              <div>
                <p className="font-medium text-slate-900">{status}</p>
                <p className="mt-1">{item.time} · URL 분석 요청 기록</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>,
    document.body
  );
}

function exportCsv(rows) {
  const lines = [
    ['URL / 도메인', 'AI 서비스 여부', '서비스 유형', 'DB 등록', '분석 일시'],
    ...rows.map(row => [row.domain, row.ai, row.kind, row.db, row.time]),
  ];
  const csv = lines
    .map(columns => columns.map(value => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const href = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = href;
  link.download = 'url-analysis-results.csv';
  link.click();
  URL.revokeObjectURL(href);
}

export default function UrlAnalysisPage() {
  const [history, setHistory] = useState(sampleHistory);
  const [selectedId, setSelectedId] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [openHistoryId, setOpenHistoryId] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [aiFilter, setAiFilter] = useState('all');
  const [dbFilter, setDbFilter] = useState('all');
  const [error, setError] = useState('');
  const historyRef = useRef(null);
  const selected = history.find(item => item.id === selectedId);
  const hasRunningAnalysis = history.some(
    item => item.progress !== undefined && item.progress < analysisSteps.length
  );

  useEffect(() => {
    if (!hasRunningAnalysis) return undefined;

    const timer = window.setInterval(() => {
      setHistory(items =>
        items.map(item =>
          item.progress !== undefined && item.progress < analysisSteps.length
            ? { ...item, progress: item.progress + 1 }
            : item
        )
      );
    }, 900);

    return () => window.clearInterval(timer);
  }, [hasRunningAnalysis]);
  const visible = useMemo(
    () =>
      history.filter(
        item =>
          item.domain.toLowerCase().includes(search.trim().toLowerCase()) &&
          (aiFilter === 'all' || item.ai === aiFilter) &&
          (dbFilter === 'all' || item.db === dbFilter)
      ),
    [history, search, aiFilter, dbFilter]
  );

  const analyze = event => {
    event.preventDefault();
    let parsed;
    try {
      parsed = new URL(urlInput.trim());
      if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname.includes('.'))
        throw new Error('invalid URL');
    } catch {
      setError('http:// 또는 https://로 시작하는 올바른 URL을 입력해 주세요.');
      return;
    }
    const domain = parsed.hostname.replace(/^www\./, '');
    const now = new Date();
    const time = `${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const existing = history.find(item => item.domain === domain);
    if (existing) {
      setHistory(items => [
        { ...existing, time, progress: 0 },
        ...items.filter(item => item.id !== existing.id),
      ]);
      setOpenHistoryId(existing.id);
    } else {
      const next = {
        id: Date.now(),
        domain,
        ai: '판단 불가',
        kind: '—',
        db: '검토 필요',
        time,
        confidence: null,
        progress: 0,
      };
      setHistory(items => [next, ...items]);
      setOpenHistoryId(next.id);
    }
    setSelectedId(null);
    setUrlInput('');
    setSearchInput('');
    setSearch('');
    setAiFilter('all');
    setDbFilter('all');
    setError('');
    window.requestAnimationFrame(() =>
      historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
  };

  return (
    <div className="w-full space-y-6 text-slate-900">
      <section aria-labelledby="url-analysis-title">
       
        <div className="flex min-h-[330px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-10 text-center">
          <img src={urlImage} alt="" className="h-40 w-40 object-contain" aria-hidden="true" />
          <h2 className="mt-6 text-lg font-semibold text-slate-900">
            새로운 웹사이트를 분석해 보세요.
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            URL을 입력하면 AI 서비스 여부와 유형을 확인하고
            <br className="hidden sm:block" /> 분석 이력에서 결과를 다시 살펴볼 수 있습니다.
          </p>
          <form onSubmit={analyze} className="mt-6 w-full max-w-xl">
            <label htmlFor="analysis-url" className="sr-only">
              분석할 URL
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-left transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <Link2 className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                <input
                  id="analysis-url"
                  type="text"
                  inputMode="url"
                  value={urlInput}
                  onChange={event => {
                    setUrlInput(event.target.value);
                    setError('');
                  }}
                  placeholder="https://example.com"
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                <FileSearch size={17} aria-hidden="true" /> URL 분석 시작
              </button>
            </div>
            {error ? (
              <p role="alert" className="mt-2 text-center text-xs text-red-600">
                {error}
              </p>
            ) : (
              <p className="mt-2 text-center text-xs text-slate-500">
                http:// 또는 https://로 시작하는 주소를 입력해 주세요.
              </p>
            )}
          </form>
        </div>
      </section>

      <section ref={historyRef} className="min-w-0 scroll-mt-6" aria-label="URL 분석 이력">
        <form
          onSubmit={event => {
            event.preventDefault();
            setSearch(searchInput);
          }}
          role="search"
          aria-label="URL 분석 이력 검색 및 필터"
          className="grid gap-3 pb-5 sm:grid-cols-2 xl:grid-cols-[minmax(145px,0.8fr)_minmax(145px,0.8fr)_minmax(0,2.2fr)]"
        >
          <CustomDropdown
            value={aiFilter}
            options={aiFilterOptions}
            onChange={setAiFilter}
            ariaLabel="AI 서비스 여부 필터"
            className="[&>button]:h-12 [&>button]:rounded-xl"
          />
          <CustomDropdown
            value={dbFilter}
            options={dbFilterOptions}
            onChange={setDbFilter}
            ariaLabel="분석 상태 필터"
            className="[&>button]:h-12 [&>button]:rounded-xl"
          />
          <div className="flex min-w-0 flex-wrap gap-2 sm:col-span-2 xl:col-span-1">
            <label className="relative min-w-[160px] flex-[1_1_160px]">
              <span className="sr-only">URL 또는 도메인 검색</span>
              <input
                type="search"
                value={searchInput}
                onChange={event => setSearchInput(event.target.value)}
                placeholder="URL 또는 도메인 검색"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <Search
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </label>
            <button
              type="submit"
              className="h-12 shrink-0 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              검색
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setSearch('');
                setAiFilter('all');
                setDbFilter('all');
              }}
              aria-label="검색 조건 초기화"
              title="초기화"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-600"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => exportCsv(visible)}
              aria-label="결과 CSV 다운로드"
              title="CSV 다운로드"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-600"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>
        <div className="grid gap-2">
          {visible.map(item => {
            const isOpen = openHistoryId === item.id;
            const isRunning = item.progress !== undefined && item.progress < analysisSteps.length;

            return (
              <article
                key={item.id}
                className={`group min-w-0 overflow-hidden rounded-xl border transition hover:border-slate-100 hover:bg-white hover:shadow-sm ${isOpen ? 'border-slate-100 bg-white shadow-sm' : 'border-transparent'}`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenHistoryId(current => (current === item.id ? null : item.id))
                  }
                  aria-expanded={isOpen}
                  aria-controls={`analysis-detail-${item.id}`}
                  className="flex min-h-[82px] w-full items-center gap-4 rounded-xl px-3 py-3 text-left"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Globe2 size={24} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate text-base font-semibold text-slate-900"
                      title={item.domain}
                    >
                      {item.domain}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      {isRunning ? '웹사이트 검사 진행 중' : `${item.kind} · ${item.db}`}
                      <span className="text-slate-300">·</span>
                      {item.time}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    {isRunning ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />{' '}
                        분석 중
                      </span>
                    ) : (
                      <Badge value={item.ai} />
                    )}
                    <ChevronDown
                      size={19}
                      className={`shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </span>
                </button>
                {isOpen && (
                  <AnalysisDetails item={item} onShowResult={() => setSelectedId(item.id)} />
                )}
              </article>
            );
          })}
          {visible.length === 0 && (
            <p className="py-12 text-center text-sm text-slate-500">
              조건에 맞는 분석 이력이 없습니다.
            </p>
          )}
        </div>
      </section>
      {selected && (
        <DetailModal key={selected.id} item={selected} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
