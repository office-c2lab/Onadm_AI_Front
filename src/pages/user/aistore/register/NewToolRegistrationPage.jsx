import { useRef, useState } from 'react';
import { ArrowLeft, CloudUpload } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import projectImage from '../../../../assets/images/project.png';
import AiStoreActionButton from '../components/AiStoreActionButton.jsx';
import ToolRegistrationFields from '../components/ToolRegistrationFields.jsx';
import {
  EMPTY_SUPPORT_ENVIRONMENT,
  MAX_SCREENSHOTS,
} from '../components/toolRegistrationConfig.js';
import { addReviewRequest, CURRENT_TOOL_MAKER, formatReviewDate } from '../data/reviewRequests.js';

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
  supportEnvironment: { ...EMPTY_SUPPORT_ENVIRONMENT },
};

function createInitialForm(draft) {
  if (!draft) return initialForm;

  return {
    ...initialForm,
    name: draft.name ?? '',
    summary: draft.summary ?? '',
    type: draft.type ?? initialForm.type,
    category: draft.category ?? initialForm.category,
    description: draft.description ?? '',
    features: draft.features ?? '',
    instructions: draft.instructions ?? '',
    version: draft.version ?? initialForm.version,
    iconName: draft.iconName ?? '',
    iconData: draft.iconData ?? '',
    screenshots: draft.screenshots ?? [],
    supportEnvironment: {
      ...EMPTY_SUPPORT_ENVIRONMENT,
      ...(draft.supportEnvironment ?? {}),
    },
  };
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NewToolRegistrationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const resubmissionDraft = location.state?.draft;
  const zipInputRef = useRef(null);
  const iconInputRef = useRef(null);
  const screenshotInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [form, setForm] = useState(() => createInitialForm(resubmissionDraft));
  const [error, setError] = useState('');

  const updateForm = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const updateEnvironment = (field, value) => {
    setForm(current => ({
      ...current,
      supportEnvironment: { ...current.supportEnvironment, [field]: value },
    }));
  };

  const selectZipFile = file => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('ZIP 형식의 파일만 선택할 수 있습니다.');
      return;
    }
    setSelectedFile(file);
    setForm(current => ({
      ...current,
      name: current.name || file.name.replace(/\.zip$/i, '').replace(/[-_]+/g, ' '),
    }));
    setError('');
  };

  const selectIconFile = file => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('도구 아이콘은 PNG, JPG 또는 WEBP 이미지만 사용할 수 있습니다.');
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
              reader.onerror = reject;
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

  const submit = event => {
    event.preventDefault();
    if (!selectedFile) {
      setError('도구의 ZIP 파일을 첨부해 주세요.');
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
    const submittedAt = formatReviewDate(now);
    const request = {
      ...form,
      ...CURRENT_TOOL_MAKER,
      id: `upload-${now.getTime()}-${Math.random().toString(36).slice(2)}`,
      requestType: resubmissionDraft?.requestType ?? '신규 등록',
      previousRequestId: resubmissionDraft?.id,
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
      createdAt: submittedAt,
      updatedAt: submittedAt,
      versionHistory: [{ version: form.version.trim(), updatedAt: submittedAt }],
      status: '검사 진행중',
      reviewStartedAt: now.toISOString(),
    };

    try {
      addReviewRequest(request);
      navigate('/user/aistore/register', {
        state: { openReviewId: request.id, activeTab: '검사 진행중', submittedReview: request },
      });
    } catch {
      setError('승인 요청을 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl pb-14 pt-6 text-slate-900">
      <Link
        to="/user/aistore/register"
        className="inline-flex h-9 items-center gap-2 rounded-lg pr-3 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
      >
        <ArrowLeft size={16} /> 등록 및 검사로 돌아가기
      </Link>

      <form onSubmit={submit} noValidate className="mt-2">
        <header className="py-8 sm:py-10">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl">
            {resubmissionDraft ? '도구 수정 후 다시 요청' : '새 도구 등록'}
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">
            {resubmissionDraft
              ? '반려 사유를 확인하고 필요한 정보를 수정한 후 다시 요청하세요.'
              : 'ZIP 파일과 도구 정보를 입력한 후 승인을 요청하세요.'}
          </p>
        </header>

        <input
          ref={zipInputRef}
          type="file"
          accept=".zip,application/zip,application/x-zip-compressed"
          className="sr-only"
          onChange={event => {
            selectZipFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
        <input
          ref={iconInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={event => {
            selectIconFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
        <input
          ref={screenshotInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="sr-only"
          onChange={event => {
            void selectScreenshots(event.target.files);
            event.target.value = '';
          }}
        />

        {error && (
          <p role="alert" className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <section className="border-t border-slate-200 py-9 sm:py-10">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            도구 파일 <span className="text-red-500">*</span>
          </h2>
          <button
            type="button"
            onClick={() => zipInputRef.current?.click()}
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
              selectZipFile(event.dataTransfer.files?.[0]);
            }}
            className={`mt-5 flex min-h-[250px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors sm:min-h-[330px] ${isDragging ? 'border-blue-500 bg-blue-50/70' : selectedFile ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'}`}
          >
            <img
              src={projectImage}
              alt=""
              className="h-32 w-40 object-contain"
              aria-hidden="true"
            />
            <strong className="mt-4 max-w-xl break-all text-base font-semibold text-slate-900">
              {selectedFile ? selectedFile.name : '도구의 ZIP 파일을 업로드하세요'}
            </strong>
            <span className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              {selectedFile
                ? `${formatSize(selectedFile.size)} · 클릭하여 파일 변경`
                : 'ZIP 파일을 드래그하거나 클릭하여 선택해 주세요.'}
            </span>
            {!selectedFile && (
              <span className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm">
                <CloudUpload size={17} /> 파일 선택
              </span>
            )}
          </button>
        </section>

        <ToolRegistrationFields
          form={form}
          setForm={setForm}
          updateForm={updateForm}
          updateEnvironment={updateEnvironment}
          iconInputRef={iconInputRef}
          screenshotInputRef={screenshotInputRef}
        />

        <div className="flex justify-end gap-2 border-t border-slate-200 py-7">
          {error && (
            <p role="alert" className="mr-auto self-center text-sm font-medium text-red-600">
              {error}
            </p>
          )}
          <AiStoreActionButton to="/user/aistore/register" variant="secondary">
            취소
          </AiStoreActionButton>
          <AiStoreActionButton type="submit">
            {resubmissionDraft ? '다시 승인 요청' : '승인 요청'}
          </AiStoreActionButton>
        </div>
      </form>
    </div>
  );
}
