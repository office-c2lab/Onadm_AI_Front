import { useRef, useState } from 'react';
import { ArrowLeft, CloudUpload } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import projectImage from '../../../../assets/images/project.png';
import AiStoreActionButton from '../components/AiStoreActionButton.jsx';
import ToolRegistrationFields from '../components/ToolRegistrationFields.jsx';
import {
  EMPTY_SUPPORT_ENVIRONMENT,
  MAX_SCREENSHOTS,
} from '../components/toolRegistrationConfig.js';
import { useMyTools } from '../data/manageStore.js';
import {
  addReviewRequest,
  CURRENT_TOOL_MAKER,
  formatReviewDate,
  getActiveToolUpdateReview,
  isReviewRunning,
} from '../data/reviewRequests.js';

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createInitialForm(tool) {
  return {
    name: tool?.name ?? '',
    summary: tool?.summary ?? '',
    type: tool?.type ?? 'AI App',
    category: tool?.category ?? '문서·생산성',
    description: tool?.description ?? tool?.summary ?? '',
    features: tool?.features ?? tool?.summary ?? '',
    instructions:
      tool?.instructions ??
      '도구를 실행한 뒤 처리할 내용을 입력하고 결과를 확인해 업무에 활용합니다.',
    version: tool?.version ?? '1.0.0',
    iconName: tool?.iconName ?? '',
    iconData: tool?.iconData ?? '',
    screenshots: tool?.screenshots ?? [],
    supportEnvironment: {
      ...EMPTY_SUPPORT_ENVIRONMENT,
      audience: '사내 임직원',
      operatingSystem: 'Windows 10 이상, macOS 12 이상',
      browser: 'Chrome, Edge 최신 버전',
      ...(tool?.supportEnvironment ?? {}),
    },
  };
}

export default function MyToolUpdatePage() {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const { myTools } = useMyTools();
  const tool = myTools.find(item => item.id === toolId && item.status === '승인 완료');
  const zipInputRef = useRef(null);
  const iconInputRef = useRef(null);
  const screenshotInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [form, setForm] = useState(() => createInitialForm(tool));
  const [updateNotes, setUpdateNotes] = useState('');
  const [error, setError] = useState('');

  if (!tool) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-semibold text-slate-900">도구를 찾을 수 없습니다.</h1>
        <Link
          to="/user/aistore/mytools"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          내 도구로 돌아가기
        </Link>
      </div>
    );
  }

  const activeUpdate = getActiveToolUpdateReview(tool);

  if (activeUpdate) {
    return (
      <div className="mx-auto w-full max-w-4xl py-20 text-center">
        <span
          className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${isReviewRunning(activeUpdate.status) ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}
        >
          업데이트 {activeUpdate.status}
        </span>
        <h1 className="mt-4 text-xl font-semibold text-slate-900">
          이미 업데이트 심사가 진행 중입니다.
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          현재 요청의 심사가 끝난 후 새 업데이트를 요청할 수 있습니다.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <AiStoreActionButton to={`/user/aistore/mytools/${tool.id}`} variant="secondary">
            도구 상세로 돌아가기
          </AiStoreActionButton>
          <AiStoreActionButton
            to="/user/aistore/register"
            state={{ openReviewId: activeUpdate.id, activeTab: '심사 중' }}
          >
            심사 진행 내역 보기
          </AiStoreActionButton>
        </div>
      </div>
    );
  }

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
      setError('새 버전의 ZIP 파일을 첨부해 주세요.');
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
    if (form.version.trim() === tool.version) {
      setError(`현재 버전(v${tool.version})과 다른 새 버전을 입력해 주세요.`);
      return;
    }
    if (!updateNotes.trim()) {
      setError('업데이트 내용을 입력해 주세요.');
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
      maker: tool.maker || CURRENT_TOOL_MAKER.maker,
      makerPosition: tool.makerPosition || CURRENT_TOOL_MAKER.makerPosition,
      makerName: tool.makerName || CURRENT_TOOL_MAKER.makerName,
      id: `update-${tool.id}-${now.getTime()}-${Math.random().toString(36).slice(2)}`,
      toolId: tool.id,
      requestType: '업데이트',
      previousVersion: tool.version,
      version: form.version.trim(),
      updateNotes: updateNotes.trim(),
      versionHistory: [
        {
          version: form.version.trim(),
          updatedAt: submittedAt,
          notes: [updateNotes.trim()],
        },
        ...(tool.versionHistory ?? [
          {
            version: tool.version,
            updatedAt: tool.updatedAt || tool.createdAt || '날짜 정보 없음',
          },
        ]),
      ],
      fileName: selectedFile.name,
      size: formatSize(selectedFile.size),
      name: form.name.trim(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      features: form.features.trim(),
      instructions: form.instructions.trim(),
      supportEnvironment: Object.fromEntries(
        Object.entries(form.supportEnvironment).map(([key, value]) => [key, value.trim()])
      ),
      createdAt: submittedAt,
      updatedAt: submittedAt,
      status: '심사 진행중',
      reviewStartedAt: now.toISOString(),
    };

    try {
      addReviewRequest(request);
      navigate('/user/aistore/register', {
        state: {
          openReviewId: request.id,
          activeTab: '심사 중',
          submittedReview: request,
        },
      });
    } catch {
      setError('업데이트 요청을 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.');
    }
  };

  return (
    <>
      <Link
        to={`/user/aistore/mytools/${tool.id}`}
        className="inline-flex h-9 items-center gap-2 rounded-lg pr-3 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
      >
        <ArrowLeft size={16} /> 도구 상세로 돌아가기
      </Link>

      <form onSubmit={submit} noValidate className="mt-2">
        <header className="py-8 sm:py-10">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl">
            도구 업데이트
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">
            현재 운영 중인 도구 정보를 수정하고 새 버전의 승인을 요청하세요. 승인 전까지 기존 버전은
            그대로 유지됩니다.
          </p>
          <p className="mt-3 text-sm font-medium text-blue-600">
            현재 버전 v{tool.version} → 새 버전을 입력해 주세요.
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
            업데이트 파일 <span className="text-red-500">*</span>
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
              {selectedFile ? selectedFile.name : '새 버전의 ZIP 파일을 업로드하세요'}
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

        <section className="border-t border-slate-200 py-9 sm:py-10">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">업데이트 내용</h2>
          <label className="mt-5 block text-sm font-medium text-slate-700">
            변경 사항 <span className="text-red-500">*</span>
            <textarea
              value={updateNotes}
              onChange={event => setUpdateNotes(event.target.value)}
              placeholder="추가되거나 개선된 기능과 사용자에게 필요한 안내를 작성해 주세요."
              rows={6}
              required
              className="mt-2 w-full resize-y rounded-lg border border-slate-200 bg-transparent px-3 py-2.5 text-sm leading-7 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </section>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 py-7">
          {error && <p className="mr-auto text-sm font-medium text-red-600">{error}</p>}
          <AiStoreActionButton to={`/user/aistore/mytools/${tool.id}`} variant="secondary">
            취소
          </AiStoreActionButton>
          <AiStoreActionButton type="submit">업데이트 승인 요청</AiStoreActionButton>
        </div>
      </form>
    </>
  );
}
