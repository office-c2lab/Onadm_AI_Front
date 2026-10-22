import { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  LoaderCircle,
  XCircle,
} from 'lucide-react';
import { reviewSteps } from '../data/reviewSteps.js';

function getStepState(status, index) {
  if (status === '승인 완료') return 'complete';
  if (index === 0) return 'complete';
  if (status === '제출 준비') return 'pending';
  if (index === 1) return 'complete';
  if (index !== 2) return 'pending';
  if (status === '검토 중') return 'running';
  if (status === '보완 필요' || status === '반려') return 'failed';
  return 'queued';
}

const stepVisuals = {
  complete: { Icon: CheckCircle2, color: 'text-emerald-600', label: '완료' },
  running: { Icon: LoaderCircle, color: 'text-blue-600', label: '진행 중' },
  queued: { Icon: Clock3, color: 'text-amber-600', label: '대기 중' },
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

export default function ReviewProgress({ upload, stageStates, steps = reviewSteps, duration }) {
  const states = stageStates ?? steps.map((_, index) => getStepState(upload.status, index));
  const completedCount = states.filter(state => state === 'complete').length;
  const initialOpenStep = states.findIndex(state => state === 'running');
  const [openStep, setOpenStep] = useState(initialOpenStep >= 0 ? initialOpenStep : null);
  const hasFailed = states.includes('failed');
  const isComplete = states.every(state => state === 'complete');
  const isLocalDraft = upload.status === '제출 준비';
  const runStatus = hasFailed ? '일부 검사 실패' : isComplete ? '모든 작업 완료' : '진행 중';
  const runStatusStyle = hasFailed
    ? 'bg-red-50 text-red-700'
    : isComplete
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-blue-50 text-blue-700';

  return (
    <div
      id={`review-detail-${upload.id}`}
      role="region"
      aria-label={`${upload.name} 심사 진행 내역`}
      className="border-t border-slate-100 bg-white"
    >
      <div className="flex flex-wrap items-end justify-between gap-2 px-4 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900">심사 진행 내역</h4>
            <span className={`rounded-full px-2.5 py-1 text-micro font-medium ${runStatusStyle}`}>
              {runStatus}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {upload.displayLabel ?? upload.fileName} · {upload.createdAt}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">
            {duration ?? (isComplete ? '1m 24s' : completedCount ? '20s' : '0s')}
          </span>
          <span className="font-medium text-blue-600">
            {completedCount}/{steps.length}단계 완료
          </span>
        </div>
      </div>
      <div
        role="progressbar"
        aria-label="완료된 심사 단계"
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={completedCount}
        className="h-1 bg-slate-100"
      >
        <div
          className={`h-full transition-[width] ${hasFailed ? 'bg-red-500' : 'bg-blue-600'}`}
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
        />
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
                onClick={() => setOpenStep(current => (current === index ? null : index))}
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
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                  {step.label}
                </span>
                <span className={`hidden shrink-0 text-xs sm:inline ${color}`}>{label}</span>
                <span className="w-14 shrink-0 text-right text-xs text-slate-400">
                  {stepDuration}
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 font-mono text-micro leading-5 text-slate-600 sm:px-14 sm:text-xs">
                  <p className="mb-2 font-sans text-slate-500">{step.description}</p>
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
      <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-3 text-xs leading-5 text-slate-500 sm:px-6">
        {isLocalDraft
          ? '파일 정보만 브라우저에 저장되었습니다. 실제 제출과 심사는 아직 시작되지 않았습니다.'
          : '현재 표시된 로그는 화면 예시입니다. 실제 검사 로그와 보완 사유는 서버 연동 후 제공됩니다.'}
      </div>
    </div>
  );
}
