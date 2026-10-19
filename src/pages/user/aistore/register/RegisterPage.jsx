import { useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  CloudUpload,
  FileArchive,
  XCircle,
} from 'lucide-react';
import SearchHeader from '../../../../components/search/SearchHeader.jsx';

const STORAGE_KEY = 'ondam:register:uploads';
const MAX_ZIP_BYTES = 500 * 1024 * 1024;

const sampleUploads = [
  {
    id: 'sample-report',
    fileName: 'report-assistant.zip',
    name: '보고서 작성 도우미',
    size: '12.4 MB',
    createdAt: '2026. 10. 18. 14:32',
    status: '승인 대기',
  },
  {
    id: 'sample-meeting',
    fileName: 'meeting-summarizer.zip',
    name: '회의록 정리 도우미',
    size: '8.7 MB',
    createdAt: '2026. 10. 17. 10:15',
    status: '승인 완료',
  },
  {
    id: 'sample-analysis',
    fileName: 'data-analyzer.zip',
    name: '데이터 분석 도구',
    size: '28.1 MB',
    createdAt: '2026. 10. 16. 16:08',
    status: '검토 중',
  },
];

function readUploads() {
  if (typeof window === 'undefined') return sampleUploads;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return sampleUploads;
    const rows = JSON.parse(saved);
    return Array.isArray(rows)
      ? rows.map(row => ({
          ...row,
          status:
            row.status === '등록 대기'
              ? '제출 준비'
              : row.status === '등록 완료'
                ? '승인 완료'
                : row.status,
        }))
      : sampleUploads;
  } catch {
    return sampleUploads;
  }
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date) {
  const twoDigits = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}. ${twoDigits(date.getMonth() + 1)}. ${twoDigits(date.getDate())}. ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
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
  },
  {
    label: '파일 제출·보안 검사',
    description: '서버에 접수된 파일의 안전성을 검사합니다.',
    checks: ['파일 수신 및 압축 구조 확인', '악성 파일 검사', '요청 권한과 외부 연결 확인'],
  },
  {
    label: '관리자 검토',
    description: '담당자가 도구의 운영 적합성을 검토합니다.',
    checks: ['도구 목적과 설명 검토', '사내 데이터 접근 범위 확인', '운영 정책 적합성 검토'],
  },
  {
    label: '승인 및 게시',
    description: '최종 승인 후 운영 목록에 반영합니다.',
    checks: ['최종 승인 확인', '내 도구에 게시'],
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
  running: { Icon: Clock3, color: 'text-blue-600', label: '진행 중' },
  queued: { Icon: Clock3, color: 'text-amber-600', label: '검토 대기' },
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
  const completedCount = reviewSteps.filter(
    (_, index) => getStepState(upload.status, index) === 'complete'
  ).length;
  const isLocalDraft = upload.status === '제출 준비';

  return (
    <div
      id={`review-detail-${upload.id}`}
      role="region"
      aria-label={`${upload.name} 심사 진행 내역`}
      className="border-t border-slate-100 px-4 pb-5 pt-4 sm:px-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">심사 진행 내역</h4>
          <p className="mt-1 text-xs text-slate-500">
            {isLocalDraft ? '제출 전 파일 정보 확인 단계' : '심사 단계별 진행 예시'}
          </p>
        </div>
        <span className="text-sm font-medium text-blue-600">
          {completedCount}/{reviewSteps.length}단계 완료
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="완료된 심사 단계"
        aria-valuemin={0}
        aria-valuemax={reviewSteps.length}
        aria-valuenow={completedCount}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${(completedCount / reviewSteps.length) * 100}%` }}
        />
      </div>

      <ol className="mt-5 space-y-3">
        {reviewSteps.map((step, index) => {
          const state = getStepState(upload.status, index);
          const { Icon, color, label } = stepVisuals[state];
          return (
            <li
              key={step.label}
              className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 sm:p-4"
            >
              <div className="flex items-start gap-3">
                <Icon size={20} className={`mt-0.5 shrink-0 ${color}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-semibold text-slate-800">
                      {index + 1}. {step.label}
                    </span>
                    <span className={`font-medium ${color}`}>{label}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{step.description}</p>
                  <ul className="mt-3 space-y-1 border-t border-slate-200/70 pt-3">
                    {step.checks.map((check, checkIndex) => {
                      const checkState = getCheckState(state, checkIndex);
                      const CheckIcon = stepVisuals[checkState].Icon;
                      return (
                        <li
                          key={check}
                          className={`flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-xs ${checkState === 'complete' ? 'bg-emerald-50/60' : checkState === 'running' ? 'bg-blue-50/70' : ''}`}
                        >
                          <span className="flex min-w-0 items-center gap-2 text-slate-700">
                            <CheckIcon
                              size={15}
                              className={`shrink-0 ${stepVisuals[checkState].color}`}
                              aria-hidden="true"
                            />
                            {check}
                          </span>
                          <span className={`shrink-0 ${stepVisuals[checkState].color}`}>
                            {checkLabels[checkState]}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
        {isLocalDraft
          ? '파일 정보만 브라우저에 저장되었습니다. 실제 파일 제출과 심사는 아직 시작되지 않았습니다.'
          : '위 체크 표시는 화면 예시이며 실제 검사 결과가 아닙니다. 검사 로그와 보완 사유는 서버 연동 후 확인할 수 있습니다.'}
      </p>
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
  const inputRef = useRef(null);
  const [uploads, setUploads] = useState(readUploads);
  const [search, setSearch] = useState('');
  const [openUploadId, setOpenUploadId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const keyword = search.trim().toLowerCase();
  const filteredUploads = uploads.filter(upload =>
    `${upload.fileName} ${upload.name} ${upload.status}`.toLowerCase().includes(keyword)
  );

  const saveUploads = next => {
    setUploads(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setError('목록을 브라우저에 저장하지 못했습니다. 저장 공간을 확인해 주세요.');
    }
  };

  const addFiles = fileList => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const invalidTypes = files.filter(file => !file.name.toLowerCase().endsWith('.zip'));
    const oversized = files.filter(
      file => file.name.toLowerCase().endsWith('.zip') && file.size > MAX_ZIP_BYTES
    );
    const accepted = files.filter(
      file => file.name.toLowerCase().endsWith('.zip') && file.size <= MAX_ZIP_BYTES
    );

    const errors = [];
    if (invalidTypes.length) errors.push('ZIP 형식의 파일만 선택할 수 있습니다.');
    if (oversized.length) errors.push('파일당 최대 크기는 500MB입니다.');
    setError(errors.join(' '));

    if (!accepted.length) return;

    const now = new Date();
    const nextRows = accepted.map((file, index) => ({
      id: `upload-${now.getTime()}-${index}-${Math.random().toString(36).slice(2)}`,
      fileName: file.name,
      name: file.name.replace(/\.zip$/i, '').replace(/[-_]+/g, ' '),
      size: formatSize(file.size),
      createdAt: formatDate(now),
      status: '제출 준비',
    }));

    saveUploads([...nextRows, ...uploads]);
    setSearch('');
    setMessage(
      `${accepted.length}개 파일 정보를 제출 준비 목록에 추가했습니다. 실제 제출과 심사는 서버 연동 후 제공됩니다.`
    );
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
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={event => {
          addFiles(event.target.files);
          event.target.value = '';
        }}
      />

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
          addFiles(event.dataTransfer.files);
        }}
        aria-label="ZIP 파일 선택 또는 드래그 앤 드롭"
        className={`flex min-h-[238px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-6 text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'}`}
      >
        <ZipIcon large />
        <strong className="mt-4 text-lg font-semibold text-slate-900">
          승인 요청할 ZIP 파일을 선택하세요
        </strong>
        <span className="mt-1 text-sm text-slate-500">
          파일을 드래그하거나 클릭하여 선택할 수 있습니다.
        </span>
        <span className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          <CloudUpload size={16} aria-hidden="true" />
          파일 선택
        </span>
        <span className="mt-3 text-xs text-slate-500">
          ZIP 형식의 파일만 업로드할 수 있습니다. (최대 500MB)
        </span>
        <span className="mt-1 text-xs text-slate-400">
          현재는 파일 정보만 저장되며 실제 파일 전송은 지원하지 않습니다.
        </span>
      </button>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mt-3 rounded-lg bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
          {message}
        </p>
      )}

      <section
        className="mt-5 rounded-xl border border-slate-200 bg-white px-5 py-4"
        aria-label="도구 승인 절차"
      >
        <h2 className="text-sm font-semibold text-slate-900">도구 승인 절차</h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {reviewSteps.map((step, index) => (
            <li key={step.label} className="flex items-center gap-2 text-sm text-slate-600">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                {index + 1}
              </span>
              {step.label}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-slate-500">
          현재는 화면 시안으로, 파일 제출·보안 검사·관리자 승인은 서버 연동 전까지 진행되지
          않습니다.
        </p>
      </section>

      <section className="mt-7">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900">등록 및 심사 목록</h2>
            <p className="mt-1 text-sm text-slate-500">
              신규 도구의 심사 상태를 확인합니다. 승인된 도구는 내 도구에서 관리하세요.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-sm text-slate-500">
              {keyword
                ? `검색 결과 ${filteredUploads.length}개 / 총 ${uploads.length}개`
                : `총 ${uploads.length}개`}
            </span>
          </div>
        </div>

        {filteredUploads.length ? (
          <div className="grid gap-3">
            {filteredUploads.map(upload => (
              <article
                key={upload.id}
                className="min-w-0 rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenUploadId(current => (current === upload.id ? null : upload.id))
                  }
                  aria-expanded={openUploadId === upload.id}
                  aria-controls={`review-detail-${upload.id}`}
                  className="flex min-h-[100px] w-full cursor-pointer flex-wrap items-center gap-x-4 gap-y-3 rounded-xl p-4 text-left"
                >
                  <span className="flex min-w-[220px] flex-[1_1_300px] items-center gap-3">
                    <ZipIcon />
                    <span className="min-w-0 flex-1">
                      <span
                        className="block truncate text-base font-semibold text-slate-900"
                        title={upload.name}
                      >
                        {upload.name}
                      </span>
                      <span
                        className="mt-1 block truncate text-sm text-slate-500"
                        title={upload.fileName}
                      >
                        {upload.fileName}
                      </span>
                    </span>
                  </span>
                  <span className="min-w-[80px] shrink-0 text-xs leading-5 text-slate-500">
                    <span className="block">파일 크기</span>
                    <span className="block font-medium text-slate-700">{upload.size}</span>
                  </span>
                  <span className="min-w-[155px] shrink-0 text-xs leading-5 text-slate-500">
                    <span className="block">목록 추가</span>
                    <span className="block font-medium text-slate-700">{upload.createdAt}</span>
                  </span>
                  <span className="ml-auto flex shrink-0 items-center gap-3">
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
        ) : (
          <p className="py-12 text-center text-sm text-slate-500">
            {keyword ? '검색 조건에 맞는 ZIP 파일이 없습니다.' : '등록된 ZIP 파일이 없습니다.'}
          </p>
        )}
      </section>
    </div>
  );
}
