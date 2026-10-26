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
import AiStoreActionButton from '../../../user/aistore/components/AiStoreActionButton.jsx';

const adminReviewSteps = [
  {
    label: '등록 요청 접수',
    description: '요청 정보와 제출 파일을 확인합니다.',
    checks: ['요청 정보 저장', '파일 형식 확인', '심사 대기열 등록'],
    duration: '2s',
  },
  {
    label: '자동 보안 심사',
    description: '파일과 권한, 데이터 처리 항목을 자동으로 심사합니다.',
    checks: ['악성 코드 확인', '권한 범위 확인', '데이터 처리 위험 분석'],
    duration: '18s',
  },
  {
    label: '관리자 검토',
    description: '자동 심사 결과와 등록 정보를 관리자가 검토합니다.',
    checks: ['심사 결과 확인', '운영 적합성 검토', '검토 의견 기록'],
    duration: '—',
  },
  {
    label: '승인 및 게시',
    description: '최종 결정 후 스토어 게시 상태에 반영합니다.',
    checks: ['최종 승인 확인', '게시 정보 반영'],
    duration: '—',
  },
];

const stepVisuals = {
  complete: { Icon: CheckCircle2, color: 'text-emerald-600', label: '완료' },
  running: { Icon: LoaderCircle, color: 'text-blue-600', label: '진행 중' },
  queued: { Icon: Clock3, color: 'text-slate-500', label: '대기 중' },
  failed: { Icon: XCircle, color: 'text-red-600', label: '확인 필요' },
  pending: { Icon: Circle, color: 'text-slate-300', label: '대기' },
};

const checkLabels = { complete: '확인 완료', running: '확인 중', pending: '대기' };

function getStageStates(review) {
  const scanState =
    review.scan === '심사 중'
      ? 'running'
      : ['실패', '경고'].includes(review.scan)
        ? 'failed'
        : review.scan === '대기'
          ? 'queued'
          : 'complete';
  const adminState =
    review.approval === '승인'
      ? 'complete'
      : ['반려', '보완 필요'].includes(review.approval)
        ? 'failed'
        : review.scan === '심사 중' || review.scan === '대기'
          ? 'queued'
          : 'running';
  const publishState =
    review.approval === '승인' ? 'complete' : review.approval === '반려' ? 'failed' : 'pending';

  return ['complete', scanState, adminState, publishState];
}

function getCheckState(stepState, checkIndex) {
  if (stepState === 'complete') return 'complete';
  if (stepState === 'running' && checkIndex === 0) return 'complete';
  if (stepState === 'running' && checkIndex === 1) return 'running';
  return 'pending';
}

export default function AdminReviewProgress({ review, detailTo }) {
  const states = getStageStates(review);
  const completedCount = states.filter(state => state === 'complete').length;
  const runningStep = states.findIndex(state => state === 'running');
  const failedStep = states.findIndex(state => state === 'failed');
  const initialOpenStep = runningStep >= 0 ? runningStep : failedStep >= 0 ? failedStep : null;
  const [selectedOpenStep, setSelectedOpenStep] = useState(initialOpenStep);
  const isComplete = states.every(state => state === 'complete');
  const needsAttention = states.includes('failed');
  const needsManagerReview = review.scan === '통과' && review.approval === '대기';

  return (
    <div
      id={`review-detail-${review.id}`}
      role="region"
      aria-label={`${review.name} 심사 진행 내역`}
      className="border-t border-slate-200 bg-transparent"
    >
      <div className="flex flex-wrap items-end justify-between gap-2 px-4 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-slate-950">심사 진행 내역</h4>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {review.registrant.department} · {review.registrant.position} · {review.registrant.name}
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-[max-content_6.5rem] items-center gap-3 text-sm">
          <span className="text-right whitespace-nowrap text-slate-500">
            {isComplete ? '소요' : '경과'} {review.elapsed}
          </span>
          <span className="text-right font-semibold whitespace-nowrap text-blue-600">
            {completedCount}/{adminReviewSteps.length}단계 완료
          </span>
        </div>
      </div>

      <ol className="divide-y divide-slate-100 border-t border-slate-100">
        {adminReviewSteps.map((step, index) => {
          const state = states[index];
          const { Icon, color, label } = stepVisuals[state];
          const isOpen = selectedOpenStep === index;
          const stepDuration =
            state === 'complete' ? step.duration : state === 'running' ? '진행 중' : '—';

          return (
            <li key={step.label}>
              <button
                type="button"
                onClick={() => setSelectedOpenStep(current => (current === index ? null : index))}
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
          needsAttention
            ? 'border-red-100 bg-red-50/70 text-red-700'
            : isComplete
              ? 'border-emerald-100 bg-emerald-50/60 text-emerald-700'
              : 'border-blue-100 bg-blue-50/60 text-blue-700'
        }`}
      >
        <p className="min-w-0 flex-1">
          {review.approval === '승인'
            ? '모든 심사를 통과해 승인 및 게시 단계가 완료되었습니다.'
            : review.approval === '반려'
              ? '관리자 검토 결과 반려 처리된 요청입니다.'
              : review.approval === '보완 필요'
                ? '등록자에게 보완을 요청한 상태입니다.'
                : review.scan === '심사 중'
                  ? '자동 보안 심사가 진행 중입니다.'
                  : needsAttention
                    ? '심사 결과에서 확인이 필요한 항목이 발견되었습니다.'
                    : '자동 심사 결과를 바탕으로 관리자의 검토가 필요합니다.'}
        </p>
        {needsManagerReview && detailTo && (
          <AiStoreActionButton to={detailTo} size="small">
            상세 보기
          </AiStoreActionButton>
        )}
      </div>
    </div>
  );
}
