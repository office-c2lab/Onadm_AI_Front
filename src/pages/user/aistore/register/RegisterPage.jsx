import { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  ClipboardList,
  Clock3,
  CloudUpload,
  FileArchive,
  LoaderCircle,
  Plus,
  RefreshCw,
  X,
  XCircle,
} from 'lucide-react';
import CustomDropdown from '../../../../components/dropdown/CustomDropdown.jsx';
import SearchHeader from '../../../../components/search/SearchHeader.jsx';
import projectImage from '../../../../assets/images/project.png';
import ToolInfoModalShell from '../components/ToolInfoModalShell.jsx';
import {
  CATEGORY_OPTIONS,
  EMPTY_SUPPORT_ENVIRONMENT,
  MAX_SCREENSHOTS,
  SUPPORT_ENVIRONMENT_FIELDS,
  TOOL_TYPE_OPTIONS,
} from '../components/toolRegistrationConfig.js';
import { formatReviewDate, REVIEW_REQUESTS_KEY } from '../data/reviewRequests.js';

const MAX_ZIP_BYTES = 500 * 1024 * 1024;
const MAX_ICON_BYTES = 2 * 1024 * 1024;
const MAX_SCREENSHOT_BYTES = 500 * 1024;
const MOCK_UPLOADS = [
  {
    id: 'mock-contract-review',
    name: '계약서 검토 도우미',
    fileName: 'contract_review_assistant.zip',
    size: '2.4 MB',
    createdAt: '2026. 10. 20. 09:42',
    status: '검토 중',
  },
  {
    id: 'mock-inquiry-sorter',
    name: '고객 문의 분류 에이전트',
    fileName: 'inquiry_sorter_agent.zip',
    size: '1.8 MB',
    createdAt: '2026. 10. 19. 16:18',
    status: '승인 대기',
  },
];

function readUploads() {
  if (typeof window === 'undefined') return MOCK_UPLOADS;

  try {
    const saved = window.localStorage.getItem(REVIEW_REQUESTS_KEY);
    const rows = saved ? JSON.parse(saved) : [];
    const uploads = Array.isArray(rows)
      ? rows.map(row => ({
          ...row,
          status:
            row.status === '등록 대기'
              ? '제출 준비'
              : row.status === '등록 완료'
                ? '승인 완료'
                : row.status,
        }))
      : [];
    const savedIds = new Set(uploads.map(row => row.id));
    return [...uploads, ...MOCK_UPLOADS.filter(row => !savedIds.has(row.id))];
  } catch {
    return MOCK_UPLOADS;
  }
}

const initialForm = {
  name: '',
  summary: '',
  type: 'AI App',
  category: '문서·생산성',
  description: '',
  features: '',
  instructions: '',
  version: '1.0.0',
  iconName: '',
  iconData: '',
  screenshots: [],
  supportEnvironment: EMPTY_SUPPORT_ENVIRONMENT,
};

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ZipIcon({ large = false }) {
  return (
    <span
      className={`flex shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50 font-semibold text-blue-600 ${large ? 'h-14 w-14 gap-0.5 text-[11px]' : 'h-12 w-12 text-[9px]'}`}
      aria-hidden="true"
    >
      <FileArchive size={large ? 24 : 17} strokeWidth={1.8} />
      ZIP
    </span>
  );
}

const reviewSteps = [
  {
    label: 'ZIP 정보 준비',
    description: '등록에 필요한 기본 파일 정보를 확인합니다.',
    checks: ['ZIP 형식 확인', '파일 크기 500MB 이하 확인', '파일명·크기 기록'],
    duration: '2s',
  },
  {
    label: '파일 제출·보안 검사',
    description: '서버에 접수된 파일의 안전성을 검사합니다.',
    checks: ['파일 수신 및 압축 구조 확인', '악성 파일 검사', '요청 권한과 외부 연결 확인'],
    duration: '18s',
  },
  {
    label: '관리자 검토',
    description: '담당자가 도구의 운영 적합성을 검토합니다.',
    checks: ['도구 목적과 설명 검토', '사내 데이터 접근 범위 확인', '운영 정책 적합성 검토'],
    duration: '—',
  },
  {
    label: '승인 및 게시',
    description: '최종 승인 후 운영 목록에 반영합니다.',
    checks: ['최종 승인 확인', '내 도구에 게시'],
    duration: '—',
  },
];

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

const checkLabels = {
  complete: '확인 완료',
  running: '확인 중',
  pending: '대기',
};

function ReviewDetails({ upload }) {
  const steps = upload.requestType === '업데이트' ? updateReviewSteps : reviewSteps;
  const completedCount = steps.filter(
    (_, index) => getStepState(upload.status, index) === 'complete'
  ).length;
  const isLocalDraft = upload.status === '제출 준비';
  const initialOpenStep = steps.findIndex(
    (_, index) => getStepState(upload.status, index) === 'running'
  );
  const [openStep, setOpenStep] = useState(initialOpenStep >= 0 ? initialOpenStep : null);
  const hasFailed = upload.status === '보완 필요' || upload.status === '반려';
  const isComplete = upload.status === '승인 완료';
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
      <div>
        <div className="flex flex-wrap items-end justify-between gap-2 px-4 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-900">심사 진행 내역</h4>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${runStatusStyle}`}
              >
                {runStatus}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {upload.requestType === '업데이트'
                ? `업데이트 요청 · v${upload.version}`
                : upload.fileName}{' '}
              · {upload.createdAt}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">
              {isComplete ? '1m 24s' : completedCount ? '20s' : '0s'}
            </span>
            <span className="font-medium text-blue-600">
              {completedCount}/{steps.length}단계 완료
            </span>
          </div>
        </div>

        <div>
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
              const state = getStepState(upload.status, index);
              const { Icon, color, label } = stepVisuals[state];
              const isOpen = openStep === index;
              const duration =
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
                      <ChevronDown
                        size={16}
                        className="shrink-0 text-slate-400"
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronRight
                        size={16}
                        className="shrink-0 text-slate-400"
                        aria-hidden="true"
                      />
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
                      {duration}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 font-mono text-[11px] leading-5 text-slate-600 sm:px-14 sm:text-xs">
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
                              {checkState === 'complete'
                                ? '✓'
                                : checkState === 'running'
                                  ? '●'
                                  : '○'}{' '}
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
      </div>
    </div>
  );
}

function ReviewStatus({ status }) {
  const isApproved = status === '승인 완료';
  const isRejected = status === '반려' || status === '보완 필요';
  const Icon = isApproved ? CheckCircle2 : isRejected ? XCircle : Clock3;
  const color = isApproved
    ? 'bg-emerald-50 text-emerald-700'
    : isRejected
      ? 'bg-red-50 text-red-700'
      : status === '검토 중'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-slate-100 text-slate-700';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ${color}`}
    >
      <Icon size={14} aria-hidden="true" />
      {status}
    </span>
  );
}

export default function RegisterPage() {
  const location = useLocation();
  const inputRef = useRef(null);
  const iconInputRef = useRef(null);
  const screenshotInputRef = useRef(null);
  const [uploads, setUploads] = useState(readUploads);
  const [search, setSearch] = useState('');
  const [openUploadId, setOpenUploadId] = useState(location.state?.openReviewId ?? null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const keyword = search.trim().toLowerCase();
  const filteredUploads = uploads.filter(upload =>
    `${upload.fileName} ${upload.name} ${upload.status} ${upload.requestType || ''}`
      .toLowerCase()
      .includes(keyword)
  );

  const saveUploads = next => {
    try {
      window.localStorage.setItem(REVIEW_REQUESTS_KEY, JSON.stringify(next));
      setUploads(next);
      return true;
    } catch {
      setError('목록을 브라우저에 저장하지 못했습니다. 저장 공간을 확인해 주세요.');
      return false;
    }
  };

  const selectZipFile = fileList => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const file = files[0];
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('ZIP 형식의 파일만 선택할 수 있습니다.');
      return;
    }
    if (file.size > MAX_ZIP_BYTES) {
      setError('파일당 최대 크기는 500MB입니다.');
      return;
    }

    setSelectedFile(file);
    setError('');
    setForm(current => ({
      ...current,
      name: current.name || file.name.replace(/\.zip$/i, '').replace(/[-_]+/g, ' '),
    }));
  };

  const updateForm = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const updateEnvironment = (field, value) => {
    setForm(current => ({
      ...current,
      supportEnvironment: { ...current.supportEnvironment, [field]: value },
    }));
  };

  const selectIconFile = fileList => {
    const file = Array.from(fileList || [])[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('도구 아이콘은 PNG, JPG 또는 WEBP 이미지만 사용할 수 있습니다.');
      return;
    }
    if (file.size > MAX_ICON_BYTES) {
      setError('도구 아이콘은 2MB 이하의 이미지를 선택해 주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm(current => ({
        ...current,
        iconName: file.name,
        iconData: typeof reader.result === 'string' ? reader.result : '',
      }));
      setError('');
    };
    reader.onerror = () => setError('아이콘 이미지를 불러오지 못했습니다. 다시 선택해 주세요.');
    reader.readAsDataURL(file);
  };

  const selectScreenshots = async fileList => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    if (files.length + form.screenshots.length > MAX_SCREENSHOTS) {
      setError(`화면 이미지는 최대 ${MAX_SCREENSHOTS}장까지 등록할 수 있습니다.`);
      return;
    }
    if (files.some(file => !['image/png', 'image/jpeg', 'image/webp'].includes(file.type))) {
      setError('화면 이미지는 PNG, JPG 또는 WEBP 형식만 사용할 수 있습니다.');
      return;
    }
    if (files.some(file => file.size > MAX_SCREENSHOT_BYTES)) {
      setError('화면 이미지는 장당 500KB 이하로 선택해 주세요.');
      return;
    }

    try {
      const screenshots = await Promise.all(
        files.map(
          file =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () =>
                resolve({
                  name: file.name,
                  data: typeof reader.result === 'string' ? reader.result : '',
                });
              reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'));
              reader.readAsDataURL(file);
            })
        )
      );
      setForm(current => ({
        ...current,
        screenshots: [...current.screenshots, ...screenshots].slice(0, MAX_SCREENSHOTS),
      }));
      setError('');
    } catch {
      setError('화면 이미지를 불러오지 못했습니다. 다시 선택해 주세요.');
    }
  };

  const closeRegistration = () => {
    setIsRegistering(false);
    setSelectedFile(null);
    setForm(initialForm);
    setError('');
    setIsDragging(false);
  };

  const submitRegistration = () => {
    if (!selectedFile) {
      setError('등록할 ZIP 파일을 먼저 선택해 주세요.');
      return;
    }
    if (
      !form.name.trim() ||
      !form.summary.trim() ||
      !form.description.trim() ||
      !form.features.trim() ||
      !form.instructions.trim() ||
      !form.version.trim()
    ) {
      setError('도구 이름, 설명, 주요 기능, 사용 방법, 버전을 입력해 주세요.');
      return;
    }
    if (
      !form.supportEnvironment.audience.trim() ||
      !form.supportEnvironment.operatingSystem.trim() ||
      !form.supportEnvironment.browser.trim()
    ) {
      setError('지원 환경의 사용 가능 대상, 운영체제, 브라우저를 입력해 주세요.');
      return;
    }

    const now = new Date();
    const nextRow = {
      ...form,
      id: `upload-${now.getTime()}-${Math.random().toString(36).slice(2)}`,
      fileName: selectedFile.name,
      name: form.name.trim(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      features: form.features.trim(),
      instructions: form.instructions.trim(),
      version: form.version.trim(),
      supportEnvironment: Object.fromEntries(
        Object.entries(form.supportEnvironment).map(([key, value]) => [key, value.trim()])
      ),
      size: formatSize(selectedFile.size),
      createdAt: formatReviewDate(now),
      status: '승인 대기',
    };

    if (!saveUploads([nextRow, ...uploads])) return;
    setSearch('');
    setMessage('승인 요청을 접수했습니다. 심사 진행 내역에서 상태를 확인해 주세요.');
    closeRegistration();
  };

  return (
    <div className="w-full">
      <SearchHeader
        value={search}
        onSearchChange={setSearch}
        placeholder="등록한 도구 또는 ZIP 파일 검색"
        ariaLabel="등록 목록 검색"
      />
      <input
        ref={inputRef}
        type="file"
        accept=".zip,application/zip,application/x-zip-compressed"
        className="sr-only"
        tabIndex={-1}
        onChange={event => {
          selectZipFile(event.target.files);
          event.target.value = '';
        }}
      />
      <input
        ref={iconInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={event => {
          selectIconFile(event.target.files);
          event.target.value = '';
        }}
      />
      <input
        ref={screenshotInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={event => {
          void selectScreenshots(event.target.files);
          event.target.value = '';
        }}
      />

      <header className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">새 도구 등록</h1>
        <p className="mt-1 text-sm text-slate-500">
          개발한 AI 도구를 등록하고 사내 스토어에 배포해 보세요.
        </p>
      </header>

      <section className="flex min-h-[330px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-10 text-center">
        <img src={projectImage} alt="" className="h-32 w-40 object-contain" aria-hidden="true" />
        <h2 className="mt-6 text-lg font-semibold text-slate-900">
          {uploads.length ? '새로운 도구를 등록해 보세요.' : '아직 등록된 도구가 없습니다.'}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          ZIP 파일을 업로드하고 도구 정보를 입력한 후<br className="hidden sm:block" /> 승인 요청을
          진행할 수 있습니다.
        </p>
        <button
          type="button"
          onClick={() => {
            setIsRegistering(true);
            setMessage('');
            setError('');
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus size={17} aria-hidden="true" />새 도구 등록
        </button>
      </section>

      {isRegistering && (
        <ToolInfoModalShell
          title="도구 등록 정보"
          description="파일과 정보를 입력한 후 승인을 요청하세요."
          onClose={closeRegistration}
          onSubmit={event => {
            event.preventDefault();
            submitRegistration();
          }}
          footer={
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              승인 요청
            </button>
          }
        >
          <ol className="grid grid-cols-3 border-b border-slate-100 px-5 py-4 text-xs sm:px-6">
            {['파일 업로드', '도구 정보 입력', '승인 요청'].map((label, index) => (
              <li key={label} className="flex items-center text-slate-500">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-600 font-semibold text-white">
                  {index + 1}
                </span>
                <span className="ml-2 hidden font-medium sm:inline">{label}</span>
                {index < 2 && <span className="mx-3 h-px flex-1 bg-slate-200" />}
              </li>
            ))}
          </ol>

          {error && (
            <p
              role="alert"
              className="mx-5 mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 sm:mx-6"
            >
              {error}
            </p>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragEnter={event => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={event => event.preventDefault()}
              onDragLeave={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false);
              }}
              onDrop={event => {
                event.preventDefault();
                setIsDragging(false);
                selectZipFile(event.dataTransfer.files);
              }}
              aria-label="ZIP 파일 선택 또는 드래그 앤 드롭"
              className={`flex min-h-[190px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-6 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : selectedFile
                    ? 'border-blue-300 bg-blue-50/40'
                    : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              <ZipIcon large />
              <strong className="mt-3 text-sm font-semibold text-slate-900">
                {selectedFile ? selectedFile.name : '도구의 ZIP 파일을 업로드하세요'}
              </strong>
              <span className="mt-1 text-xs text-slate-500">
                {selectedFile
                  ? `${formatSize(selectedFile.size)} · 클릭하여 파일 변경`
                  : '파일을 드래그하거나 클릭하여 선택할 수 있습니다. (최대 500MB)'}
              </span>
              {!selectedFile && (
                <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white">
                  <CloudUpload size={15} aria-hidden="true" />
                  파일 선택
                </span>
              )}
            </button>

            <fieldset className="mt-7">
              <legend className="text-base font-semibold text-slate-900">도구 정보 입력</legend>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  도구 이름 <span className="text-red-500">*</span>
                  <input
                    value={form.name}
                    onChange={event => updateForm('name', event.target.value)}
                    placeholder="예: 보고서 작성 도우미"
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  한 줄 설명 <span className="text-red-500">*</span>
                  <input
                    value={form.summary}
                    onChange={event => updateForm('summary', event.target.value)}
                    placeholder="어떤 도구인지 간단히 설명해 주세요."
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </label>
                <div className="text-sm font-medium text-slate-700">
                  <span>
                    도구 유형 <span className="text-red-500">*</span>
                  </span>
                  <CustomDropdown
                    value={form.type}
                    options={TOOL_TYPE_OPTIONS}
                    onChange={value => updateForm('type', value)}
                    ariaLabel="도구 유형 선택"
                    className="mt-2"
                  />
                </div>
                <div className="text-sm font-medium text-slate-700">
                  <span>
                    카테고리 <span className="text-red-500">*</span>
                  </span>
                  <CustomDropdown
                    value={form.category}
                    options={CATEGORY_OPTIONS}
                    onChange={value => updateForm('category', value)}
                    ariaLabel="카테고리 선택"
                    className="mt-2"
                  />
                </div>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  상세 설명 <span className="text-red-500">*</span>
                  <textarea
                    value={form.description}
                    onChange={event => updateForm('description', event.target.value)}
                    placeholder="도구의 주요 기능과 활용 목적을 자세히 작성해 주세요."
                    rows={4}
                    className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  주요 기능 <span className="text-red-500">*</span>
                  <textarea
                    value={form.features}
                    onChange={event => updateForm('features', event.target.value)}
                    placeholder="주요 기능을 한 줄에 하나씩 작성해 주세요."
                    rows={4}
                    required
                    className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  사용 방법
                  <span className="ml-1 text-red-500">*</span>
                  <textarea
                    value={form.instructions}
                    onChange={event => updateForm('instructions', event.target.value)}
                    placeholder="입력할 내용과 결과 확인 방법을 문장으로 자세히 작성해 주세요."
                    rows={4}
                    required
                    className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  버전 <span className="text-red-500">*</span>
                  <input
                    value={form.version}
                    onChange={event => updateForm('version', event.target.value)}
                    placeholder="예: 1.0.0"
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </label>
                <div className="text-sm font-medium text-slate-700 sm:col-span-2">
                  도구 아이콘 <span className="text-xs font-normal text-slate-400">(선택)</span>
                  <button
                    type="button"
                    onClick={() => iconInputRef.current?.click()}
                    className="mt-2 flex w-full items-center gap-3 rounded-lg border border-dashed border-slate-200 px-4 py-3 text-left text-sm font-normal text-slate-500 hover:border-blue-300 hover:bg-blue-50/30"
                  >
                    {form.iconData ? (
                      <img
                        src={form.iconData}
                        alt="업로드한 도구 아이콘 미리보기"
                        className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 bg-white object-cover"
                      />
                    ) : (
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                        <Plus size={18} aria-hidden="true" />
                      </span>
                    )}
                    <span className="min-w-0 truncate">
                      {form.iconName || 'PNG, JPG 또는 WEBP 이미지 (최대 2MB)'}
                    </span>
                  </button>
                </div>
                <div className="text-sm font-medium text-slate-700 sm:col-span-2">
                  화면 이미지{' '}
                  <span className="text-xs font-normal text-slate-400">
                    (선택 · 최대 3장, 장당 500KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => screenshotInputRef.current?.click()}
                    disabled={form.screenshots.length >= MAX_SCREENSHOTS}
                    className="mt-2 flex w-full items-center gap-3 rounded-lg border border-dashed border-slate-200 px-4 py-3 text-left text-sm font-normal text-slate-500 hover:border-blue-300 hover:bg-blue-50/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                      <Plus size={18} aria-hidden="true" />
                    </span>
                    화면 이미지 선택 ({form.screenshots.length}/{MAX_SCREENSHOTS})
                  </button>
                  {form.screenshots.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {form.screenshots.map((screenshot, index) => (
                        <div key={`${screenshot.name}-${index}`} className="min-w-0">
                          <div className="relative">
                            <img
                              src={screenshot.data}
                              alt={`${index + 1}번째 화면 이미지 미리보기`}
                              className="aspect-video w-full rounded-lg border border-slate-200 bg-slate-50 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setForm(current => ({
                                  ...current,
                                  screenshots: current.screenshots.filter(
                                    (_, imageIndex) => imageIndex !== index
                                  ),
                                }))
                              }
                              aria-label={`${screenshot.name} 제거`}
                              className="absolute right-1 top-1 rounded-full bg-slate-900/70 p-1 text-white hover:bg-slate-900"
                            >
                              <X size={13} aria-hidden="true" />
                            </button>
                          </div>
                          <p
                            className="mt-1 truncate text-xs font-normal text-slate-500"
                            title={screenshot.name}
                          >
                            {screenshot.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </fieldset>

            <fieldset className="mt-8 border-t border-slate-100 pt-7">
              <legend className="text-base font-semibold text-slate-900">지원 환경</legend>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                실제로 사용할 수 있는 기기와 환경을 입력해 주세요. 상세 페이지에 표시할 정보입니다.
              </p>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {SUPPORT_ENVIRONMENT_FIELDS.map(field => (
                  <label
                    key={field.key}
                    className={`text-sm font-medium text-slate-700 ${field.key === 'other' ? 'sm:col-span-2' : ''}`}
                  >
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                    <input
                      value={form.supportEnvironment[field.key]}
                      onChange={event => updateEnvironment(field.key, event.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </ToolInfoModalShell>
      )}

      {!isRegistering && error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mt-3 rounded-lg bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
          {message}
        </p>
      )}

      <section className="mt-7">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900">등록 및 심사 목록</h2>
            <p className="mt-1 text-sm text-slate-500">
              신규 도구의 심사 상태를 확인합니다. 승인된 도구는 내 도구에서 관리하세요.
            </p>
          </div>
        </div>

        {filteredUploads.length ? (
          <div className="grid gap-2">
            {filteredUploads.map(upload => (
              <article
                key={upload.id}
                className={`group relative min-w-0 rounded-xl border transition hover:z-20 hover:border-slate-100 hover:bg-white hover:shadow-sm focus-within:z-20 ${openUploadId === upload.id ? 'border-slate-100 bg-white shadow-sm' : 'border-transparent'}`}
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
                      <ZipIcon />
                    )}
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <span
                        className="min-w-0 max-w-full shrink-0 truncate text-base font-semibold text-slate-900 lg:max-w-[55%]"
                        title={upload.name}
                      >
                        {upload.name}
                      </span>
                      <span
                        className="hidden min-w-0 truncate text-xs text-slate-500 lg:block"
                        title={
                          upload.requestType === '업데이트' ? '업데이트 요청' : upload.fileName
                        }
                      >
                        {upload.requestType === '업데이트'
                          ? `업데이트 요청 · v${upload.version}`
                          : upload.fileName}
                      </span>
                    </span>
                  </span>
                  {upload.requestType !== '업데이트' && (
                    <span className="hidden shrink-0 text-xs text-slate-600 sm:inline">
                      <span className="sr-only">파일 크기 </span>
                      {upload.size}
                    </span>
                  )}
                  <span className="hidden shrink-0 text-xs text-slate-500 md:inline">
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
                {openUploadId === upload.id && <ReviewDetails upload={upload} />}
              </article>
            ))}
          </div>
        ) : keyword ? (
          <p className="py-12 text-center text-sm text-slate-500">
            검색 조건에 맞는 ZIP 파일이 없습니다.
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
    </div>
  );
}
