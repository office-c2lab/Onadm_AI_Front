import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ClipboardList, Plus, RefreshCw } from 'lucide-react';
import SearchHeader from '../../../../components/search/SearchHeader.jsx';
import zipFileImage from '../../../../assets/images/zipfile.png';
import {
  cancelReviewRequest,
  MOCK_TOOL_UPDATE_REVIEW,
  normalizeReviewStatus,
  REVIEW_REQUESTS_KEY,
} from '../data/reviewRequests.js';
import { reviewSteps } from '../data/reviewSteps.js';
import AiStoreActionButton from '../components/AiStoreActionButton.jsx';
import AiStoreConfirmModal from '../components/AiStoreConfirmModal.jsx';
import ReviewProgress from '../components/ReviewProgress.jsx';

const reviewTabs = ['전체', '심사 중', '승인 완료', '반려'];
const MOCK_UPLOADS = [
  MOCK_TOOL_UPDATE_REVIEW,
  {
    id: 'mock-contract-review',
    name: '계약서 검토 도우미',
    fileName: 'contract_review_assistant.zip',
    size: '2.4 MB',
    createdAt: '2026. 10. 20. 09:42',
    status: '심사 진행중',
  },
  {
    id: 'mock-inquiry-sorter',
    name: '고객 문의 분류 에이전트',
    fileName: 'inquiry_sorter_agent.zip',
    size: '1.8 MB',
    createdAt: '2026. 10. 19. 16:18',
    status: '심사 대기',
  },
  {
    id: 'mock-meeting-summary',
    name: '회의록 요약 도우미',
    fileName: 'meeting_summary_assistant.zip',
    size: '3.1 MB',
    createdAt: '2026. 10. 18. 14:05',
    status: '승인 완료',
  },
  {
    id: 'mock-data-export',
    name: '고객 데이터 내보내기',
    fileName: 'customer_data_export.zip',
    size: '1.2 MB',
    createdAt: '2026. 10. 17. 11:26',
    summary: '고객 데이터를 조건별로 정리해 파일로 내보내는 도구',
    type: '자동화 도구',
    category: '데이터·분석',
    description:
      '고객 데이터를 선택한 조건에 따라 조회하고 업무에 활용할 수 있는 파일로 내보냅니다.',
    features:
      '기간과 고객 유형별 데이터를 조회할 수 있으며 결과를 표준 파일 형식으로 내보낼 수 있습니다.',
    instructions:
      '조회 조건을 선택한 뒤 미리보기에서 항목을 확인하고 내보내기 버튼을 눌러 결과를 저장합니다.',
    version: '0.9.0',
    supportEnvironment: {
      audience: '고객지원팀 및 영업팀',
      operatingSystem: 'Windows 11, macOS 14 이상',
      browser: 'Chrome, Edge 최신 버전',
      other: '사내 네트워크 연결 필요',
    },
    status: '반려',
    rejectionReason:
      '고객 개인정보가 포함된 원본 데이터를 외부 파일로 저장할 수 있습니다. 개인정보 마스킹과 다운로드 권한 제한을 적용한 후 다시 요청해 주세요.',
  },
];

function readUploads() {
  if (typeof window === 'undefined') return MOCK_UPLOADS;

  try {
    const saved = window.localStorage.getItem(REVIEW_REQUESTS_KEY);
    const rows = saved ? JSON.parse(saved) : [];
    const normalizedRows = Array.isArray(rows)
      ? rows.map(row => ({
          ...row,
          status: normalizeReviewStatus(row.status),
        }))
      : [];
    const savedIds = new Set(normalizedRows.map(row => row.id));
    const uploads = normalizedRows.filter(row => !row.cancelled);
    return [...uploads, ...MOCK_UPLOADS.filter(row => !savedIds.has(row.id))];
  } catch {
    return MOCK_UPLOADS;
  }
}

const updateReviewSteps = [
  {
    label: '업데이트 정보 준비',
    description: '변경된 도구 정보를 확인합니다.',
    checks: ['필수 정보 확인', '버전 확인', '변경 내용 기록'],
    duration: '2s',
  },
  {
    label: '업데이트 요청 접수',
    description: '변경 내용을 심사 목록에 접수합니다.',
    checks: ['요청 정보 저장', '아이콘 형식 확인', '검토 대기열 등록'],
    duration: '18s',
  },
  reviewSteps[2],
  {
    label: '승인 및 반영',
    description: '승인 후 내 도구의 정보에 변경 내용을 반영합니다.',
    checks: ['최종 승인 확인', '업데이트 반영'],
    duration: '—',
  },
];

function ReviewDetails({ upload, onCancel, onRetry }) {
  const steps = upload.requestType === '업데이트' ? updateReviewSteps : reviewSteps;
  const progressUpload = {
    ...upload,
    displayLabel:
      upload.requestType === '업데이트' ? `업데이트 요청 · v${upload.version}` : upload.fileName,
  };
  return (
    <ReviewProgress upload={progressUpload} steps={steps} onCancel={onCancel} onRetry={onRetry} />
  );
}

function ReviewStatus({ status }) {
  const isApproved = status === '승인 완료';
  const isRejected = status === '반려';
  const color = isApproved
    ? 'bg-emerald-50 text-emerald-700'
    : isRejected
      ? 'bg-red-50 text-red-700'
      : status === '심사 진행중'
        ? 'bg-blue-50 text-blue-700'
        : 'bg-slate-100 text-slate-700';

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ${color}`}
    >
      {status}
    </span>
  );
}

function reviewStatusTab(status) {
  if (['심사 대기', '심사 진행중'].includes(status)) return '심사 중';
  return status;
}

export default function RegisterPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [uploads, setUploads] = useState(() => {
    const savedUploads = readUploads();
    const submittedReview = location.state?.submittedReview;
    if (!submittedReview) return savedUploads;
    return [submittedReview, ...savedUploads.filter(upload => upload.id !== submittedReview.id)];
  });
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(location.state?.activeTab ?? '전체');
  const [openUploadId, setOpenUploadId] = useState(location.state?.openReviewId ?? null);
  const [reviewAction, setReviewAction] = useState(null);
  const [cancelError, setCancelError] = useState('');
  useEffect(() => {
    if (!location.state) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const cancelUpload = () => {
    if (!reviewAction?.upload) return;
    try {
      cancelReviewRequest(reviewAction.upload);
      setUploads(current => current.filter(item => item.id !== reviewAction.upload.id));
      setOpenUploadId(null);
      setReviewAction(null);
      setCancelError('');
    } catch {
      setCancelError('심사 요청을 취소하지 못했습니다. 다시 시도해 주세요.');
    }
  };
  const keyword = search.trim().toLowerCase();
  const tabCounts = Object.fromEntries(
    reviewTabs.map(tab => [
      tab,
      tab === '전체'
        ? uploads.length
        : uploads.filter(upload => reviewStatusTab(upload.status) === tab).length,
    ])
  );
  const filteredUploads = uploads.filter(upload => {
    const matchesTab = activeTab === '전체' || reviewStatusTab(upload.status) === activeTab;
    const matchesKeyword =
      `${upload.fileName} ${upload.name} ${upload.status} ${upload.requestType || ''}`
        .toLowerCase()
        .includes(keyword);
    return matchesTab && matchesKeyword;
  });

  return (
    <div className="w-full">
      <SearchHeader
        value={search}
        onSearchChange={setSearch}
        placeholder="도구명, 파일명 또는 요청 유형 검색"
        ariaLabel="등록 목록 검색"
      />

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap items-center gap-1" aria-label="등록 및 심사 상태">
          {reviewTabs.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setOpenUploadId(null);
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
          onClick={() => navigate('/user/aistore/register/new')}
          icon={Plus}
          className="self-start sm:self-auto"
        >
          새 도구 등록
        </AiStoreActionButton>
      </div>

      <section className="mt-5">
        {filteredUploads.length ? (
          <div className="grid gap-2">
            {filteredUploads.map(upload => (
              <article
                key={upload.id}
                className={`group relative min-w-0 rounded-xl border transition hover:z-20 hover:border-slate-100 hover:bg-[#f5f5f5] hover:shadow-sm focus-within:z-20 ${openUploadId === upload.id ? 'border-slate-200 bg-[#f5f5f5] shadow-sm' : 'border-transparent'}`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenUploadId(current => (current === upload.id ? null : upload.id))
                  }
                  aria-expanded={openUploadId === upload.id}
                  aria-controls={`review-detail-${upload.id}`}
                  className="flex min-h-[82px] w-full cursor-pointer items-center gap-4 rounded-xl px-3 py-3 text-left"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-4">
                    {upload.iconData ? (
                      <img
                        src={upload.iconData}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 bg-white object-cover"
                        aria-hidden="true"
                      />
                    ) : upload.requestType === '업데이트' ? (
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                        <RefreshCw size={24} strokeWidth={1.8} aria-hidden="true" />
                      </span>
                    ) : (
                      <img
                        src={zipFileImage}
                        alt=""
                        className="h-12 w-12 shrink-0 object-contain"
                        aria-hidden="true"
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="min-w-0 truncate text-base font-semibold text-slate-900"
                          title={upload.name}
                        >
                          {upload.name}
                        </span>
                        <span
                          className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                            upload.requestType === '업데이트'
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-200 bg-white text-slate-600'
                          }`}
                        >
                          {upload.requestType === '업데이트' ? '업데이트' : '신규 등록'}
                        </span>
                      </span>
                      <span className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
                        <span className="truncate" title={upload.fileName || 'ZIP 파일 미첨부'}>
                          {upload.fileName || 'ZIP 파일 미첨부'}
                        </span>
                        <span className="shrink-0 text-slate-300">·</span>
                        <span className="shrink-0">{upload.size || '미첨부'}</span>
                        {upload.requestType === '업데이트' && upload.version && (
                          <>
                            <span className="shrink-0 text-slate-300">·</span>
                            <span className="shrink-0 font-medium text-blue-600">
                              {upload.previousVersion
                                ? `v${upload.previousVersion} → v${upload.version}`
                                : `v${upload.version}`}
                            </span>
                          </>
                        )}
                      </span>
                    </span>
                  </span>
                  <span className="hidden shrink-0 text-sm text-slate-500 md:inline">
                    <span className="sr-only">목록 추가 </span>
                    {upload.createdAt}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <ReviewStatus status={upload.status} />
                    <ChevronDown
                      size={19}
                      className={`shrink-0 text-slate-500 transition-transform ${openUploadId === upload.id ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </span>
                </button>
                {openUploadId === upload.id && (
                  <ReviewDetails
                    upload={upload}
                    onCancel={() => {
                      setCancelError('');
                      setReviewAction({ action: 'cancel', upload });
                    }}
                    onRetry={() => {
                      setCancelError('');
                      setReviewAction({ action: 'retry', upload });
                    }}
                  />
                )}
              </article>
            ))}
          </div>
        ) : keyword ? (
          <p className="py-12 text-center text-sm text-slate-500">
            검색 조건에 맞는 심사 요청이 없습니다.
          </p>
        ) : activeTab !== '전체' ? (
          <p className="py-12 text-center text-sm text-slate-500">
            {activeTab} 상태의 심사 요청이 없습니다.
          </p>
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-10 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-blue-500">
              <ClipboardList size={25} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">등록한 도구가 없습니다.</h3>
            <p className="mt-1 text-xs text-slate-500">지금 바로 새로운 도구를 등록해 보세요.</p>
          </div>
        )}
      </section>
      {reviewAction && (
        <AiStoreConfirmModal
          open
          title={
            reviewAction.action === 'cancel'
              ? '심사를 취소하시겠습니까?'
              : '수정 후 다시 요청하시겠습니까?'
          }
          confirmLabel={reviewAction.action === 'cancel' ? '심사 취소' : '수정 후 다시 요청'}
          error={cancelError}
          onClose={() => {
            setReviewAction(null);
            setCancelError('');
          }}
          onConfirm={() => {
            if (reviewAction.action === 'cancel') {
              cancelUpload();
              return;
            }
            navigate('/user/aistore/register/new', {
              state: { draft: reviewAction.upload },
            });
          }}
        >
          {reviewAction.action === 'cancel' ? (
            <>
              <strong className="font-semibold text-slate-900">{reviewAction.upload.name}</strong>의
              심사가 중단되며, 현재까지의 심사 결과는 저장되지 않습니다.
            </>
          ) : (
            <>
              <strong className="font-semibold text-slate-900">{reviewAction.upload.name}</strong>의
              기존 정보를 불러옵니다. 반려 사유를 보완하고 ZIP 파일을 다시 첨부해 주세요.
            </>
          )}
        </AiStoreConfirmModal>
      )}
    </div>
  );
}
