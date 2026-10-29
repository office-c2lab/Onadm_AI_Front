import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileSearch,
  Globe2,
  LoaderCircle,
  Plus,
  X,
} from 'lucide-react';
import SearchHeader from '../../../../components/search/SearchHeader.jsx';
import AiStoreActionButton from '../../../user/aistore/components/AiStoreActionButton.jsx';
import AiStoreConfirmModal from '../../../user/aistore/components/AiStoreConfirmModal.jsx';

const sampleHistory = [
  {
    id: 8,
    domain: 'copilotstudio.ai',
    url: 'https://copilotstudio.ai/',
    ip: '203.0.113.18',
    ips: ['203.0.113.18', '203.0.113.19', '2001:db8::18'],
    ai: '판단 불가',
    kind: '—',
    db: '—',
    time: '2026. 10. 29. 10:42',
    confidence: null,
    analysisStatus: '진행 중',
    progress: 1,
  },
  {
    id: 1,
    domain: 'writerflow.ai',
    url: 'https://writerflow.ai/',
    ip: '203.0.113.24',
    ips: ['203.0.113.24', '2001:db8::24'],
    ai: 'AI 서비스',
    kind: '생성형 AI',
    db: '신규 후보',
    time: '2026. 10. 20. 11:21',
    confidence: 92,
    analysisStatus: '분석 완료',
  },
  {
    id: 2,
    domain: 'claude.ai',
    url: 'https://claude.ai/',
    ip: '198.51.100.42',
    ips: ['198.51.100.42', '198.51.100.43'],
    ai: 'AI 서비스',
    kind: '생성형 AI',
    db: '등록됨',
    time: '2026. 10. 20. 10:48',
    confidence: 99,
    analysisStatus: '분석 완료',
  },
  {
    id: 3,
    domain: 'newai.example',
    url: 'https://newai.example/',
    ip: '확인 실패',
    ai: '판단 불가',
    kind: '—',
    db: '검토 필요',
    time: '2026. 10. 20. 10:35',
    confidence: null,
    analysisStatus: '검토 필요',
    progress: 1,
  },
  {
    id: 4,
    domain: 'perplexity.ai',
    url: 'https://perplexity.ai/',
    ip: '198.51.100.57',
    ips: ['198.51.100.57', '2001:db8::57'],
    ai: 'AI 서비스',
    kind: 'AI 검색',
    db: '등록됨',
    time: '2026. 10. 20. 09:43',
    confidence: 98,
    analysisStatus: '분석 완료',
  },
  {
    id: 5,
    domain: 'portal.example',
    url: 'https://portal.example/',
    ip: '조회 대기',
    ai: '비AI 서비스',
    kind: '일반 웹사이트',
    db: '—',
    time: '2026. 10. 19. 17:12',
    confidence: 96,
    analysisStatus: '대기',
    progress: 0,
  },
  {
    id: 6,
    domain: 'midjourney.com',
    url: 'https://midjourney.com/',
    ip: '192.0.2.81',
    ai: 'AI 서비스',
    kind: '이미지 생성',
    db: '등록됨',
    time: '2026. 10. 19. 16:03',
    confidence: 99,
    analysisStatus: '분석 완료',
  },
  {
    id: 7,
    domain: 'cursor.com',
    url: 'https://cursor.com/',
    ip: '192.0.2.96',
    ai: 'AI 서비스',
    kind: 'AI 코딩',
    db: '등록됨',
    time: '2026. 10. 19. 14:37',
    confidence: 97,
    analysisStatus: '분석 완료',
  },
];

const analysisTabs = ['전체', '진행 중', '분석 완료', '검토 필요', '중지됨'];

const analysisSteps = [
  {
    label: '웹사이트 정보 수집',
    description: 'URL에 접속해 공개 페이지와 메타데이터를 확인합니다.',
    checks: ['URL 연결 상태 확인', '공개 페이지 수집', '메타데이터 추출'],
    duration: '8s',
  },
  {
    label: 'AI 서비스 식별',
    description: '서비스 설명과 주요 기능을 기반으로 AI 서비스 여부를 판별합니다.',
    checks: ['서비스 설명 분석', 'AI 기능 키워드 확인', '서비스 유형 분류'],
    duration: '14s',
  },
  {
    label: 'Intelligence DB 확인',
    description: '기존 등록 정보와 비교해 신규 후보 또는 등록 상태를 확인합니다.',
    checks: ['도메인 중복 조회', '기존 등록 정보 대조', '분석 결과 저장'],
    duration: '5s',
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

function getAnalysisStatus(item) {
  if (item.analysisStatus) return item.analysisStatus;
  if (item.progress === 0) return '대기';
  if (item.progress > 0 && item.progress < analysisSteps.length) return '진행 중';
  return item.db === '검토 필요' ? '검토 필요' : '분석 완료';
}

function getAnalysisTab(item) {
  const status = getAnalysisStatus(item);
  return ['대기', '진행 중'].includes(status) ? '진행 중' : status;
}

function getIpSummary(item) {
  const ips = item.ips?.length ? item.ips : item.ip && !item.ip.includes(' ') ? [item.ip] : [];
  if (!ips.length) return item.ip ?? '확인 전';
  return ips.length > 1 ? `${ips[0]} 외 ${ips.length - 1}개` : ips[0];
}

function AnalysisStatus({ item }) {
  const status = getAnalysisStatus(item);
  const color =
    status === '대기'
      ? 'text-slate-500'
      : status === '진행 중'
        ? 'text-blue-600'
        : status === '검토 필요'
          ? 'text-amber-600'
          : status === '중지됨'
            ? 'text-red-600'
            : 'text-emerald-600';

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[clamp(0.86rem,1vw,0.94rem)] font-semibold whitespace-nowrap ${color}`}
    >
      {status === '진행 중' && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {status}
    </span>
  );
}

export function AnalysisDetails({
  item,
  onShowResult,
  onStop,
  standalone = false,
  showActions = true,
}) {
  const completedSteps = item.progress ?? analysisSteps.length;
  const status = getAnalysisStatus(item);
  const isRunning = status === '진행 중';
  const isWaiting = status === '대기';
  const needsReview = status === '검토 필요';
  const isStopped = status === '중지됨';
  const activeStep = isRunning || needsReview || isStopped ? completedSteps : -1;
  const [selectedOpenStep, setSelectedOpenStep] = useState(null);
  const [hasSelectedStep, setHasSelectedStep] = useState(false);
  const openStep = hasSelectedStep ? selectedOpenStep : activeStep >= 0 ? activeStep : null;

  const getStepState = index => {
    if (index < completedSteps) return 'complete';
    if (index === completedSteps && isRunning) return 'running';
    if (index === completedSteps && needsReview) return 'failed';
    if (index === completedSteps && isStopped) return 'stopped';
    return 'pending';
  };

  const stepVisuals = {
    complete: { Icon: CheckCircle2, color: 'text-emerald-600', label: '완료' },
    running: { Icon: LoaderCircle, color: 'text-blue-600', label: '진행 중' },
    failed: { Icon: AlertCircle, color: 'text-amber-600', label: '확인 필요' },
    stopped: { Icon: X, color: 'text-red-600', label: '중지됨' },
    pending: { Icon: null, color: 'text-slate-300', label: '대기' },
  };

  return (
    <div
      id={`analysis-detail-${item.id}`}
      role="region"
      aria-label={`${item.domain} 분석 진행 내역`}
      className={standalone ? 'bg-transparent' : 'border-t border-slate-200 bg-transparent'}
    >
      <div className="flex flex-wrap items-end justify-between gap-2 px-4 py-4 sm:px-6">
        <div>
          <h3 className="text-base font-semibold text-slate-950">분석 진행 내역</h3>
        </div>
        <div className="grid shrink-0 grid-cols-[5rem_6.5rem] items-center gap-3 text-sm">
          <span className="text-right text-slate-500">
            {status === '분석 완료' ? '소요 27s' : isWaiting ? '경과 0s' : '경과 12s'}
          </span>
          <span className="text-right font-semibold whitespace-nowrap text-blue-600">
            {completedSteps}/{analysisSteps.length}단계 완료
          </span>
        </div>
      </div>
      <ol className="divide-y divide-slate-100">
        {analysisSteps.map((step, index) => {
          const stepState = getStepState(index);
          const { Icon, color, label } = stepVisuals[stepState];
          const isOpen = openStep === index;
          const stepDuration =
            stepState === 'complete'
              ? step.duration
              : stepState === 'running'
                ? '진행 중'
                : stepState === 'failed'
                  ? '중단'
                  : stepState === 'stopped'
                    ? '중지'
                    : '—';

          return (
            <li key={step.label}>
              <button
                type="button"
                onClick={() => {
                  setHasSelectedStep(true);
                  setSelectedOpenStep(current => (current === index ? null : index));
                }}
                aria-expanded={isOpen}
                className="flex min-h-14 w-full items-center gap-2.5 px-4 text-left transition-colors hover:bg-blue-50/40 sm:px-6"
              >
                {isOpen ? (
                  <ChevronDown size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
                ) : (
                  <ChevronRight size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
                )}
                {Icon ? (
                  <Icon
                    size={18}
                    strokeWidth={2.1}
                    className={`shrink-0 ${color} ${stepState === 'running' ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                ) : (
                  <span className="h-[18px] w-[18px] shrink-0 rounded-full border-2 border-slate-200" />
                )}
                <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-slate-900">
                  {step.label}
                </span>
                <span className="grid shrink-0 grid-cols-[3.5rem] items-center gap-3 sm:grid-cols-[5rem_6.5rem]">
                  <span className="text-right text-sm text-slate-500">{stepDuration}</span>
                  <span
                    className={`hidden text-right text-sm font-medium whitespace-nowrap sm:inline ${color}`}
                  >
                    {label}
                  </span>
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 font-mono text-xs leading-6 text-slate-700 sm:px-14 sm:text-[13px]">
                  <p className="mb-2 font-sans text-sm text-slate-600">{step.description}</p>
                  {step.checks.map((check, checkIndex) => {
                    const checkState =
                      stepState === 'complete' ||
                      (['running', 'failed'].includes(stepState) && checkIndex === 0)
                        ? 'complete'
                        : stepState === 'stopped' && checkIndex === 0
                          ? 'stopped'
                          : stepState === 'running' && checkIndex === 1
                            ? 'running'
                            : stepState === 'failed' && checkIndex === 1
                              ? 'failed'
                              : stepState === 'stopped' && checkIndex === 1
                                ? 'stopped'
                                : 'pending';
                    return (
                      <p key={check} className="flex gap-3">
                        <span className="shrink-0 select-none text-slate-400">
                          00:00:{String(checkIndex * 3 + 1).padStart(2, '0')}
                        </span>
                        <span
                          className={
                            checkState === 'complete'
                              ? 'text-emerald-600'
                              : checkState === 'running'
                                ? 'text-blue-600'
                                : checkState === 'failed'
                                  ? 'text-amber-600'
                                  : checkState === 'stopped'
                                    ? 'text-red-600'
                                    : 'text-slate-400'
                          }
                        >
                          {checkState === 'complete'
                            ? '✓'
                            : checkState === 'running'
                              ? '●'
                              : checkState === 'failed'
                                ? '!'
                                : checkState === 'stopped'
                                  ? '×'
                                  : '○'}{' '}
                          {check} —{' '}
                          {checkState === 'complete'
                            ? '확인 완료'
                            : checkState === 'running'
                              ? '확인 중'
                              : checkState === 'failed'
                                ? '확인 실패'
                                : checkState === 'stopped'
                                  ? '검사 중지'
                                  : '대기'}
                        </span>
                      </p>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm leading-6 sm:px-6 ${needsReview ? 'border-amber-100 bg-amber-50/70 text-amber-700' : isStopped ? 'border-red-100 bg-red-50/70 text-red-700' : status === '분석 완료' ? 'border-emerald-100 bg-emerald-50/60 text-emerald-700' : isWaiting ? 'border-slate-100 bg-slate-50/60 text-slate-600' : 'border-blue-100 bg-blue-50/60 text-blue-700'}`}
      >
        <p className="min-w-0 flex-1">
          {needsReview
            ? '웹사이트 정보를 충분히 수집하지 못해 검사가 중단되었습니다. 접근 상태와 공개 정보를 확인한 후 다시 검사해 주세요.'
            : isStopped
              ? '사용자가 분석을 중지했습니다. 완료된 단계의 검사 기록은 이력에 보관됩니다.'
              : status === '분석 완료'
                ? '모든 검사가 완료되었습니다. 분석 결과에서 AI 서비스 식별 내용을 확인해 주세요.'
                : isWaiting
                  ? '분석 요청이 접수되었습니다. 잠시 후 웹사이트 검사를 시작합니다.'
                  : '웹사이트 공개 정보와 Intelligence DB를 순서대로 검사하고 있습니다.'}
        </p>
        {showActions && status === '분석 완료' && (
          <AiStoreActionButton size="small" variant="success" onClick={onShowResult}>
            분석 결과 확인
          </AiStoreActionButton>
        )}
        {showActions && (isWaiting || isRunning) && (
          <AiStoreActionButton size="small" variant="danger" onClick={onStop}>
            분석 중지
          </AiStoreActionButton>
        )}
      </div>
    </div>
  );
}

export function AnalysisCard({ item, open, onToggle, onOpenDetail, onShowResult, onStop }) {
  const canOpenDetail = getAnalysisStatus(item) === '분석 완료';

  return (
    <article
      className={`group relative min-w-0 overflow-hidden rounded-xl border transition hover:z-20 hover:border-slate-100 hover:bg-[#f5f5f5] hover:shadow-sm focus-within:z-20 ${open ? 'border-slate-200 bg-[#f5f5f5] shadow-sm' : 'border-transparent'}`}
    >
      <div className="flex min-h-[82px] w-full items-center gap-4 rounded-xl px-3 py-3 text-left">
        <button
          type="button"
          onClick={canOpenDetail ? onOpenDetail : onToggle}
          className="flex min-w-0 flex-1 items-center gap-4 text-left"
          aria-label={
            canOpenDetail
              ? `${item.domain} 분석 상세 보기`
              : `${item.domain} 분석 진행 내역 ${open ? '접기' : '펼치기'}`
          }
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
            <span className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
              <span className="truncate" title={item.url ?? `https://${item.domain}/`}>
                {item.url ?? `https://${item.domain}/`}
              </span>
              <span className="shrink-0 text-slate-300">·</span>
              <span
                className="shrink-0 font-mono text-[13px] text-slate-500"
                title={item.ips?.length ? item.ips.join(', ') : item.ip}
              >
                접속 IP {getIpSummary(item)}
              </span>
            </span>
          </span>
        </button>
        <span className="mr-4 hidden w-44 shrink-0 text-right text-sm text-slate-500 md:inline">
          <span className="sr-only">검사 시작 일시 </span>
          {item.time}
        </span>
        <span className="flex w-32 shrink-0 items-center justify-end gap-3">
          <AnalysisStatus item={item} />
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={`analysis-detail-${item.id}`}
            aria-label={`${item.domain} 분석 진행 내역 ${open ? '접기' : '펼치기'}`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <ChevronDown
              size={19}
              className={`transition-transform ${open ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
        </span>
      </div>
      {open && <AnalysisDetails item={item} onShowResult={onShowResult} onStop={onStop} />}
    </article>
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

export default function UrlAnalysisPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const submittedAnalysis = location.state?.submittedAnalysis;
  const [history, setHistory] = useState(() =>
    submittedAnalysis
      ? [
          submittedAnalysis,
          ...sampleHistory.filter(item => item.domain !== submittedAnalysis.domain),
        ]
      : sampleHistory
  );
  const [openHistoryId, setOpenHistoryId] = useState(submittedAnalysis?.id ?? null);
  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState('전체');
  const [stopTarget, setStopTarget] = useState(null);
  const hasRunningAnalysis = history.some(
    item => item.autoProgress && ['대기', '진행 중'].includes(getAnalysisStatus(item))
  );

  useEffect(() => {
    if (!location.state) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!hasRunningAnalysis) return undefined;

    const timer = window.setInterval(() => {
      setHistory(items =>
        items.map(item => {
          if (!item.autoProgress) return item;
          const status = getAnalysisStatus(item);
          if (status === '대기') return { ...item, analysisStatus: '진행 중', progress: 0 };
          if (status !== '진행 중') return item;

          const nextProgress = Math.min((item.progress ?? 0) + 1, analysisSteps.length);
          return {
            ...item,
            progress: nextProgress,
            analysisStatus: nextProgress === analysisSteps.length ? '분석 완료' : '진행 중',
            ip: item.ip === '조회 대기' ? '203.0.113.80' : item.ip,
            ips: item.ip === '조회 대기' ? ['203.0.113.80', '2001:db8::80'] : item.ips,
          };
        })
      );
    }, 900);

    return () => window.clearInterval(timer);
  }, [hasRunningAnalysis]);
  const tabCounts = Object.fromEntries(
    analysisTabs.map(tab => [
      tab,
      tab === '전체' ? history.length : history.filter(item => getAnalysisTab(item) === tab).length,
    ])
  );
  const visible = useMemo(
    () =>
      history.filter(
        item =>
          `${item.domain} ${item.url} ${item.ip} ${item.ai} ${item.kind} ${item.db} ${item.time}`
            .toLowerCase()
            .includes(searchInput.trim().toLowerCase()) &&
          (activeTab === '전체' || getAnalysisTab(item) === activeTab)
      ),
    [history, searchInput, activeTab]
  );

  const requestStopAnalysis = item => {
    setHistory(items =>
      items.map(historyItem =>
        historyItem.id === item.id ? { ...historyItem, autoProgress: false } : historyItem
      )
    );
    setStopTarget({ ...item, resumeAutoProgress: item.autoProgress });
  };

  const closeStopConfirmation = () => {
    if (stopTarget?.resumeAutoProgress) {
      setHistory(items =>
        items.map(item => (item.id === stopTarget.id ? { ...item, autoProgress: true } : item))
      );
    }
    setStopTarget(null);
  };

  const confirmStopAnalysis = () => {
    if (!stopTarget) return;
    setHistory(items =>
      items.map(item =>
        item.id === stopTarget.id
          ? { ...item, analysisStatus: '중지됨', autoProgress: false }
          : item
      )
    );
    setStopTarget(null);
  };

  return (
    <div className="w-full text-slate-900">
      <SearchHeader
        value={searchInput}
        onSearchChange={setSearchInput}
        placeholder="URL, 서비스 유형 또는 분석 상태 검색"
        ariaLabel="URL 분석 목록 검색"
      />

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap items-center gap-1" aria-label="URL 분석 상태">
          {analysisTabs.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setOpenHistoryId(null);
              }}
              aria-pressed={activeTab === tab}
              className={`inline-flex h-8 items-center rounded-full px-4 text-sm transition-colors ${activeTab === tab ? 'bg-[#ededed] font-medium text-[#333]' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              {tab}
              <span className="ml-1.5 text-xs tabular-nums text-slate-400">{tabCounts[tab]}</span>
            </button>
          ))}
        </nav>
        <AiStoreActionButton
          onClick={() => navigate('/admin/discover/url-analysis/new')}
          icon={Plus}
          className="self-start sm:self-auto"
        >
          새 URL 분석
        </AiStoreActionButton>
      </div>

      <section className="mt-5 min-w-0" aria-label="URL 분석 이력">
        <div className="grid gap-2">
          {visible.map(item => {
            const isOpen = openHistoryId === item.id;

            return (
              <AnalysisCard
                key={item.id}
                item={item}
                open={isOpen}
                onToggle={() => setOpenHistoryId(current => (current === item.id ? null : item.id))}
                onOpenDetail={() =>
                  navigate(`/admin/discover/url-analysis/${item.id}`, { state: { analysis: item } })
                }
                onShowResult={() =>
                  navigate(`/admin/discover/url-analysis/${item.id}`, { state: { analysis: item } })
                }
                onStop={() => requestStopAnalysis(item)}
              />
            );
          })}
          {visible.length === 0 && (
            <p className="py-12 text-center text-sm text-slate-500">
              조건에 맞는 분석 이력이 없습니다.
            </p>
          )}
        </div>
      </section>
      <AiStoreConfirmModal
        open={Boolean(stopTarget)}
        title="분석을 중지할까요?"
        confirmLabel="분석 중지"
        cancelLabel="계속 분석"
        onClose={closeStopConfirmation}
        onConfirm={confirmStopAnalysis}
      >
        <strong className="font-semibold text-slate-900">{stopTarget?.domain}</strong> 분석을
        중지합니다. 완료된 단계의 검사 기록은 이력에 보관됩니다.
      </AiStoreConfirmModal>
    </div>
  );
}
