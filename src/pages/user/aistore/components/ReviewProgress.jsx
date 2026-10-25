import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  LoaderCircle,
  XCircle,
} from 'lucide-react';
import AiStoreActionButton from './AiStoreActionButton.jsx';
import {
  AUTOMATED_REVIEW_DURATION_MS,
  reviewSteps,
  ZIP_PREPARATION_DURATION_MS,
} from '../data/reviewSteps.js';

function getStepState(status, index) {
  if (status === '승인 완료') return 'complete';
  if (status === '검사 대기') return 'pending';
  if (index < 2) return 'complete';
  if (index !== 2) return 'pending';
  if (status === '심사 진행중') return 'running';
  if (status === '반려') return 'failed';
  return 'pending';
}

const stepVisuals = {
  complete: { Icon: CheckCircle2, color: 'text-emerald-600', label: '완료' },
  running: { Icon: LoaderCircle, color: 'text-blue-600', label: '진행 중' },
  queued: { Icon: Clock3, color: 'text-slate-500', label: '대기 중' },
  failed: { Icon: XCircle, color: 'text-red-600', label: '확인 필요' },
  pending: { Icon: Circle, color: 'text-slate-300', label: '대기' },
};

function getCheckState(stepState, checkIndex) {
  if (stepState === 'complete') return 'complete';
  if (stepState === 'running' && checkIndex === 0) return 'complete';
  if (stepState === 'running' && checkIndex === 1) return 'running';
  return 'pending';
}

const checkLabels = { complete: '확인 완료', running: '확인 중', pending: '대기' };

function getAutomatedReviewStates(elapsed, stepCount) {
  const states = Array.from({ length: stepCount }, () => 'pending');
  if (elapsed < ZIP_PREPARATION_DURATION_MS) {
    states[0] = 'running';
    return states;
  }

  states[0] = 'complete';
  if (elapsed < AUTOMATED_REVIEW_DURATION_MS) {
    states[1] = 'running';
    return states;
  }

  states[1] = 'complete';
  if (states.length > 2) states[2] = 'running';
  return states;
}

export default function ReviewProgress({
  upload,
  stageStates,
  steps = reviewSteps,
  duration,
  onCancel,
  onRetry,
}) {
  const reviewStartedAt = Date.parse(upload.reviewStartedAt ?? '');
  const isAutomatedReviewRunning =
    upload.status === '심사 진행중' && Number.isFinite(reviewStartedAt);
  const [clock, setClock] = useState(() => Date.now());
  const elapsed = isAutomatedReviewRunning ? Math.max(0, clock - reviewStartedAt) : 0;
  const states =
    stageStates ??
    (isAutomatedReviewRunning
      ? getAutomatedReviewStates(elapsed, steps.length)
      : steps.map((_, index) => getStepState(upload.status, index)));
  const completedCount = states.filter(state => state === 'complete').length;
  const runningStep = states.findIndex(state => state === 'running');
  const [selectedOpenStep, setSelectedOpenStep] = useState(null);
  const [hasSelectedStep, setHasSelectedStep] = useState(false);
  const openStep = hasSelectedStep ? selectedOpenStep : runningStep >= 0 ? runningStep : null;
  const isComplete = states.every(state => state === 'complete');
  const isWaiting = upload.status === '검사 대기';
  const isRejected = upload.status === '반려';

  useEffect(() => {
    if (!isAutomatedReviewRunning || elapsed >= AUTOMATED_REVIEW_DURATION_MS) return undefined;
    const timer = window.setInterval(() => setClock(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [elapsed, isAutomatedReviewRunning]);

  return (
    <div
      id={`review-detail-${upload.id}`}
      role="region"
      aria-label={`${upload.name} 심사 진행 내역`}
      className="border-t border-slate-200 bg-transparent"
    >
      <div className="flex flex-wrap items-end justify-between gap-2 px-4 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-slate-950">심사 진행 내역</h4>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {upload.displayLabel ?? upload.fileName} · {upload.createdAt}
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-[5rem_6.5rem] items-center gap-3 text-sm">
          <span className="text-right text-slate-500">
            {isComplete ? '소요' : '경과'}{' '}
            {duration ?? (isComplete ? '1m 24s' : completedCount ? '20s' : '0s')}
          </span>
          <span className="text-right font-semibold whitespace-nowrap text-blue-600">
            {completedCount}/{steps.length}단계 완료
          </span>
        </div>
      </div>
      <ol className="divide-y divide-slate-100">
        {steps.map((step, index) => {
          const state = states[index];
          const { Icon, color, label } = stepVisuals[state];
          const isOpen = openStep === index;
          const stepDuration =
            state === 'complete' ? step.duration : state === 'running' ? '진행 중' : '—';
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
                <Icon
                  size={18}
                  strokeWidth={2.1}
                  className={`shrink-0 ${color} ${state === 'running' ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
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
                    const checkState = getCheckState(state, checkIndex);
                    const timestamp = `00:00:${String(checkIndex * 2 + 1).padStart(2, '0')}`;
                    return (
                      <p key={check} className="flex gap-3">
                        <span className="shrink-0 select-none text-slate-400">{timestamp}</span>
                        <span
                          className={
                            checkState === 'complete'
                              ? 'text-emerald-600'
                              : checkState === 'running'
                                ? 'text-blue-600'
                                : 'text-slate-400'
                          }
                        >
                          {checkState === 'complete' ? '✓' : checkState === 'running' ? '●' : '○'}{' '}
                          {check} — {checkLabels[checkState]}
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
        className={`flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm leading-6 sm:px-6 ${
          isRejected
            ? 'border-red-100 bg-red-50/70 text-red-700'
            : isComplete
              ? 'border-emerald-100 bg-emerald-50/60 text-emerald-700'
              : isWaiting
                ? 'border-slate-100 bg-slate-50/60 text-slate-600'
                : 'border-blue-100 bg-blue-50/60 text-blue-700'
        }`}
      >
        {isRejected ? (
          <div className="min-w-0 flex-1">
            <strong className="font-semibold">관리자 반려 사유</strong>
            <p className="mt-1 text-slate-700">
              {upload.rejectionReason ??
                '심사 기준을 충족하지 못했습니다. 필요한 내용을 수정한 후 다시 요청해 주세요.'}
            </p>
          </div>
        ) : (
          <p className="min-w-0 flex-1">
            {isComplete
              ? '모든 심사를 통과해 도구 등록이 승인되었습니다.'
              : isWaiting
                ? '요청이 접수되었습니다. 자동 검사가 시작되면 심사 진행중으로 변경됩니다.'
                : '자동 검사 결과를 바탕으로 관리자가 도구의 운영 적합성을 검토하고 있습니다.'}
          </p>
        )}
        {isRejected ? (
          <AiStoreActionButton
            to="/user/aistore/register/new"
            state={{ draft: upload }}
            variant="danger"
            size="small"
            onClick={
              onRetry
                ? event => {
                    event.preventDefault();
                    onRetry();
                  }
                : undefined
            }
          >
            수정 후 다시 요청
          </AiStoreActionButton>
        ) : isComplete ? (
          <AiStoreActionButton to="/user/aistore/mytools" variant="success" size="small">
            내 도구 보기
          </AiStoreActionButton>
        ) : onCancel ? (
          <AiStoreActionButton variant="danger" size="small" onClick={onCancel}>
            검사 취소
          </AiStoreActionButton>
        ) : null}
      </div>
    </div>
  );
}
