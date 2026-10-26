import { useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  HardDrive,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { appRecords, reviewRequests } from '../data.js';
import AiStoreActionButton from '../../../user/aistore/components/AiStoreActionButton.jsx';
import StoreToolIcon from '../../../user/aistore/components/StoreToolIcon.jsx';
import {
  StoreToolPreviewScreen,
  storePreviewTabs,
} from '../../../user/aistore/components/StoreToolPreviewScreen.jsx';
import {
  detailContent,
  supportedEnvironment,
} from '../../../user/aistore/data/storeDetailContent.js';

function DetailSection({ title, children }) {
  return (
    <section className="border-t border-slate-200 py-9 sm:py-10">
      <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function SecurityDetailPage() {
  const { reviewId } = useParams();
  const [activePreview, setActivePreview] = useState(0);
  const [decision, setDecision] = useState('');
  const [rejectionOpen, setRejectionOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const review = reviewRequests.find(item => item.id === reviewId);
  const app = review ? appRecords.find(item => item.id === review.appId) : null;

  if (!review || !app) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-semibold text-slate-900">심사 요청을 찾을 수 없습니다.</h1>
        <Link
          to="/admin/manage/security"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          심사 관리로 돌아가기
        </Link>
      </div>
    );
  }

  const content = detailContent[app.storeId] ?? {
    description: [app.description || app.summary],
    features: app.summary,
    usage:
      '도구를 실행한 뒤 처리할 내용을 입력하고 결과를 확인합니다. 업무에 활용하기 전에 원본 자료와 결과를 비교해 주세요.',
  };
  const registrantLabel = [
    review.registrant.department,
    review.registrant.position,
    review.registrant.name,
  ].join(' · ');
  const previewTool = { ...app, id: app.storeId ?? app.id };
  const versionLabel = review.previousVersion
    ? `v${review.previousVersion} → v${review.version}`
    : `v${review.version}`;
  const specifications = [
    ['도구 유형', app.type],
    ['카테고리', app.category],
    ['파일 용량', review.size],
    ['등록자', registrantLabel],
    ['제공 위치', 'ONDAM AI App Store'],
  ];
  const versionHistory = [
    { version: review.version, updatedAt: review.submittedAt },
    ...(review.previousVersion
      ? [{ version: review.previousVersion, updatedAt: '기존 제공 버전' }]
      : []),
  ];

  return (
    <div className="pb-14 pt-6 text-slate-900">
      <Link
        to="/admin/manage/security"
        className="inline-flex h-9 items-center gap-2 rounded-lg pr-3 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
      >
        <ArrowLeft size={16} /> 심사 관리로 돌아가기
      </Link>

      <article className="mt-2">
        <header className="flex flex-col gap-6 py-8 sm:flex-row sm:items-start sm:justify-between sm:py-10">
          <div className="flex min-w-0 items-start gap-5">
            <StoreToolIcon tool={previewTool} featured />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl">
                {review.name}
              </h1>
              <p className="mt-1.5 text-sm font-semibold text-blue-600">
                {app.type} · {app.storeCategory || app.category}
              </p>
              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">{app.summary}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm font-semibold text-slate-700">
                <span className="inline-flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" /> {versionLabel}
                </span>
                <span className="inline-flex items-center gap-2">
                  <HardDrive size={16} className="text-blue-600" /> {review.size}
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck size={16} className="text-blue-600" /> 자동 심사 통과
                </span>
                <span className="inline-flex items-center gap-2">
                  <UserRound size={16} className="text-blue-600" /> {registrantLabel}
                </span>
              </div>
            </div>
          </div>
        </header>

        <DetailSection title="스크린샷">
          <div className="relative rounded-2xl border border-blue-100/80 bg-gradient-to-br from-sky-50 via-white to-indigo-100 px-5 py-7 sm:px-12 sm:py-10">
            <StoreToolPreviewScreen tool={previewTool} activeIndex={activePreview} />
            <button
              type="button"
              onClick={() =>
                setActivePreview(
                  current => (current + storePreviewTabs.length - 1) % storePreviewTabs.length
                )
              }
              aria-label="이전 미리보기"
              className="absolute left-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white text-blue-600 shadow-md transition-colors hover:bg-blue-50 sm:left-5"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setActivePreview(current => (current + 1) % storePreviewTabs.length)}
              aria-label="다음 미리보기"
              className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white text-blue-600 shadow-md transition-colors hover:bg-blue-50 sm:right-5"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2" aria-label="미리보기 페이지">
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
          <p className="mt-2 text-center text-xs text-slate-500">
            화면 구성 예시 · {storePreviewTabs[activePreview]}
          </p>
        </DetailSection>

        <DetailSection title="설명">
          <div className="max-w-[52rem] space-y-4 text-[15px] leading-7 text-slate-600">
            {content.description.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </DetailSection>

        <DetailSection title="주요 기능">
          <p className="max-w-[52rem] text-[15px] leading-7 text-slate-600">
            {content.features ?? app.summary}
          </p>
        </DetailSection>

        <DetailSection title="사용 방법">
          <p className="max-w-[52rem] text-[15px] leading-7 text-slate-600">{content.usage}</p>
        </DetailSection>

        {review.updateNotes && (
          <DetailSection title="업데이트 내용">
            <div className="max-w-[52rem]">
              <h3 className="text-sm font-semibold text-slate-800">변경 사항</h3>
              <ul className="mt-3 space-y-2 text-[15px] leading-7 text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="mt-3 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <span>{review.updateNotes}</span>
                </li>
              </ul>
            </div>
          </DetailSection>
        )}

        <DetailSection title="지원 환경">
          <dl className="max-w-4xl divide-y divide-slate-200/80 border-y border-slate-200/80 text-sm">
            {supportedEnvironment.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:items-center sm:gap-4"
              >
                <dt className="flex items-center gap-3 font-medium text-slate-600">
                  <Icon size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
                  {label}
                </dt>
                <dd className="font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </DetailSection>

        <DetailSection title="도구 정보">
          <dl className="max-w-4xl divide-y divide-slate-200/80 border-y border-slate-200/80 text-sm">
            {specifications.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:gap-4">
                <dt className="font-medium text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </DetailSection>

        <DetailSection title="버전 정보">
          <ol className="max-w-4xl divide-y divide-slate-200/80 border-y border-slate-200/80 text-sm">
            {versionHistory.map((item, index) => (
              <li
                key={`${item.version}-${item.updatedAt}`}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 py-4 sm:grid-cols-[14rem_1fr]"
              >
                <time className="text-slate-500">{item.updatedAt}</time>
                <span className="flex items-center justify-end gap-3 sm:justify-start">
                  <strong className="font-semibold text-blue-600">v{item.version}</strong>
                  {index === 0 && (
                    <span className="text-xs font-medium text-blue-600">심사 요청 버전</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </DetailSection>

        <DetailSection title="심사 요청 정보">
          <dl className="max-w-4xl divide-y divide-slate-200/80 border-y border-slate-200/80 text-sm">
            {[
              ['요청 유형', review.requestType],
              ['등록 파일', review.fileName],
              ['파일 용량', review.size],
              ['버전', versionLabel],
              ['등록자', registrantLabel],
              ['등록 일시', review.submittedAt],
            ].map(([label, value]) => (
              <div key={label} className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:gap-4">
                <dt className="font-medium text-slate-500">{label}</dt>
                <dd className="break-words font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </DetailSection>

        <div className="border-t border-slate-200 py-7">
          {decision ? (
            <div
              role="status"
              className={`rounded-xl px-4 py-3 text-sm font-medium ${decision === '승인 완료' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
            >
              <p>
                {review.name} 심사 요청을{' '}
                {decision === '승인 완료' ? '승인했습니다.' : '반려했습니다.'}
              </p>
              {decision === '반려' && rejectionReason && (
                <p className="mt-2 font-normal leading-6 text-slate-700">
                  반려 사유: {rejectionReason}
                </p>
              )}
            </div>
          ) : rejectionOpen ? (
            <div>
              <h2 className="text-base font-bold text-slate-900">반려 사유</h2>
              <p className="mt-1 text-sm text-slate-500">
                등록자가 보완할 수 있도록 구체적인 반려 사유를 입력해 주세요.
              </p>
              <textarea
                value={rejectionReason}
                onChange={event => {
                  setRejectionReason(event.target.value);
                  if (rejectionError) setRejectionError('');
                }}
                className="mt-4 min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="반려 사유와 필요한 보완 내용을 입력하세요."
                autoFocus
              />
              {rejectionError && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                  {rejectionError}
                </p>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <AiStoreActionButton
                  variant="secondary"
                  size="large"
                  onClick={() => {
                    setRejectionOpen(false);
                    setRejectionReason('');
                    setRejectionError('');
                  }}
                >
                  취소
                </AiStoreActionButton>
                <AiStoreActionButton
                  variant="danger"
                  size="large"
                  icon={X}
                  onClick={() => {
                    if (!rejectionReason.trim()) {
                      setRejectionError('반려 사유를 입력해 주세요.');
                      return;
                    }
                    setRejectionReason(rejectionReason.trim());
                    setDecision('반려');
                  }}
                >
                  반려 확정
                </AiStoreActionButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">최종 심사 결정</h2>
                <p className="mt-1 text-sm text-slate-500">
                  등록 정보와 자동 심사 결과를 모두 확인한 후 결정해 주세요.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <AiStoreActionButton
                  variant="danger"
                  size="large"
                  icon={X}
                  onClick={() => setRejectionOpen(true)}
                >
                  반려
                </AiStoreActionButton>
                <AiStoreActionButton
                  size="large"
                  icon={Check}
                  onClick={() => setDecision('승인 완료')}
                >
                  승인
                </AiStoreActionButton>
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
