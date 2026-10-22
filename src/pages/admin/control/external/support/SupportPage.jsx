import DialogLayer from '../../../../../components/ui/DialogLayer.jsx';
import { ChevronUp, Copy, ExternalLink, Info, RefreshCw, Tag, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import AppButton, { primaryButtonClassName } from '../../../../../components/ui/Button.jsx';
import SectionCard from '../../../../../components/ui/SectionCard.jsx';
import PageLayout from '../../../../../components/layout/PageLayout.jsx';
import {
  useDownloadSettingsQuery,
  usePatchDownloadSettingsMutation,
  usePatchTemplateSettingsMutation,
  useTemplateSettingsQuery,
} from '../queries/companySettingsQueries.js';
import {
  createTemplateSettingsPayload,
  normalizeTemplateSettings,
} from '../utils/companyTemplate.js';
import {
  normalizeDownloadPath,
  normalizeDownloadSettings,
  reservedDownloadPaths,
} from '../utils/downloadSettings.js';

const urlExamples = ['/download', '/guide', '/support/download'];
const modalCancelButtonClass =
  'inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-500 transition hover:bg-slate-50';
const modalPrimaryButtonClass = `${primaryButtonClassName} h-11 px-6`;
const DOWNLOAD_PREVIEW_WIDTH = 1280;
const allowedLogoMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];
const allowedLogoExtensions = ['png', 'jpg', 'jpeg', 'webp'];
const logoAcceptTypes = '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp';

function DownloadPreviewFrame({ previewKey, src }) {
  const frameContainerRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    const frameContainer = frameContainerRef.current;
    if (!frameContainer) return undefined;

    const updatePreviewScale = () => {
      setPreviewScale(Math.min(frameContainer.clientWidth / DOWNLOAD_PREVIEW_WIDTH, 1));
    };

    updatePreviewScale();

    const resizeObserver = new ResizeObserver(updatePreviewScale);
    resizeObserver.observe(frameContainer);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      ref={frameContainerRef}
      className="relative h-[28rem] w-full overflow-hidden rounded-control border border-slate-200 bg-white lg:h-[34rem]"
    >
      <iframe
        key={previewKey}
        src={src}
        title="다운로드 페이지 미리보기"
        className="absolute top-0 left-0 border-0 bg-white"
        style={{
          width: `${DOWNLOAD_PREVIEW_WIDTH}px`,
          height: `${100 / previewScale}%`,
          transform: `scale(${previewScale})`,
          transformOrigin: 'top left',
        }}
      />
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="grid min-h-[4rem] grid-cols-[10rem_1fr] items-center border-t border-slate-200 px-6 text-sm sm:grid-cols-[12rem_1fr]">
      <dt className="font-bold text-slate-500">{label}</dt>
      <dd className="font-semibold text-palette-blue-84">{children}</dd>
    </div>
  );
}

function OutlineButton({ children, onClick }) {
  return (
    <AppButton onClick={onClick} className="h-12">
      {children}
    </AppButton>
  );
}

function CardHeader({ title, action, onAction }) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle bg-[linear-gradient(180deg,var(--color-table-header-start)_0%,var(--color-table-header-end)_100%)] px-6 py-5">
      <h2 className="text-lg font-bold text-palette-blue-109">{title}</h2>
      <OutlineButton onClick={onAction}>{action}</OutlineButton>
    </div>
  );
}

function TemplateEditModal({ template, onClose, onSave, isSaving }) {
  const [draft, setDraft] = useState(template);
  const [logoError, setLogoError] = useState('');
  const logoInputRef = useRef(null);

  const updateDraft = (key, value) => {
    setDraft(current => ({ ...current, [key]: value }));
  };

  const handleSubmit = event => {
    event.preventDefault();
    onSave(draft);
  };

  const handleLogoChange = event => {
    const [file] = event.target.files ?? [];
    event.target.value = '';

    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const hasAllowedType = allowedLogoMimeTypes.includes(file.type);
    const hasAllowedExtension = allowedLogoExtensions.includes(extension);

    if (!hasAllowedType && !hasAllowedExtension) {
      setLogoError('PNG, JPG, JPEG, WEBP 이미지만 선택할 수 있습니다.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const logoDataUrl = String(reader.result);
      setDraft(current => ({
        ...current,
        logoSrc: logoDataUrl,
        logoFile: file,
      }));
      setLogoError('');
    };
    reader.onerror = () => setLogoError('이미지를 불러오지 못했습니다.');
    reader.readAsDataURL(file);
  };

  return (
    <DialogLayer onClose={onClose} className="app-modal-stage z-[80]">
      <button
        type="button"
        className="app-modal-backdrop cursor-default"
        aria-label="템플릿 정보 수정 닫기"
        onClick={onClose}
      />

      <form onSubmit={handleSubmit} className="app-modal-panel app-modal-panel--lg">
        <div className="app-modal-header flex items-start justify-between border-b border-border-row">
          <div>
            <h2 className="text-lg font-bold text-text-primary">템플릿 정보 수정</h2>
            <p className="mt-3 text-sm font-semibold text-text-label">
              다운로드 페이지에 표시할 회사 정보와 연락처를 설정합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-primary transition hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="app-modal-body space-y-[var(--app-gap-lg)]">
          <div className="grid grid-cols-[6.5rem_1fr] gap-5">
            <label className="pt-3 text-sm font-bold text-text-label">로고</label>
            <div>
              <div className="flex items-start gap-4">
                <img
                  src={draft.logoSrc}
                  alt="ONDAM AI"
                  className="h-12 w-28 rounded-xl border border-slate-200 object-contain"
                />
                <div className="min-w-0">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept={logoAcceptTypes}
                    onChange={handleLogoChange}
                    className="sr-only"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isSaving}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-palette-blue-44 bg-white px-4 text-sm font-bold text-text-secondary transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    변경
                  </button>
                  <p className="mt-2 text-xs font-semibold text-text-muted">
                    권장 사이즈: 512x512px / PNG, JPG, JPEG, WEBP
                  </p>
                  {logoError ? (
                    <p className="mt-2 text-xs font-semibold text-palette-red-08">{logoError}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <label className="grid grid-cols-[6.5rem_1fr] gap-5">
            <span className="pt-3 text-sm font-bold text-text-label">회사 정보</span>
            <div className="relative">
              <input
                value={draft.companyName}
                onChange={event => updateDraft('companyName', event.target.value.slice(0, 100))}
                className="h-11 w-full rounded-lg border border-palette-blue-37 bg-white px-4 pr-16 text-sm font-semibold text-text-label outline-none transition focus:border-palette-blue-79 focus:ring-4 focus:ring-palette-blue-19"
              />
              <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs font-semibold text-text-disabled">
                {draft.companyName.length} / 100
              </span>
            </div>
          </label>

          <label className="grid grid-cols-[6.5rem_1fr] gap-5">
            <span className="pt-3 text-sm font-bold text-text-label">회사 설명</span>
            <div className="relative">
              <textarea
                value={draft.companyDescription}
                onChange={event =>
                  updateDraft('companyDescription', event.target.value.slice(0, 200))
                }
                className="h-[5.75rem] w-full resize-none rounded-lg border border-palette-blue-37 bg-white px-4 py-3 pr-16 text-sm font-semibold leading-6 text-text-label outline-none transition focus:border-palette-blue-79 focus:ring-4 focus:ring-palette-blue-19"
              />
              <span className="absolute right-4 bottom-3 text-xs font-semibold text-text-disabled">
                {draft.companyDescription.length} / 200
              </span>
            </div>
          </label>

          <label className="grid grid-cols-[6.5rem_1fr] gap-5">
            <span className="pt-3 text-sm font-bold text-text-label">이메일</span>
            <div className="relative">
              <input
                type="email"
                value={draft.adminEmail}
                onChange={event => updateDraft('adminEmail', event.target.value.slice(0, 100))}
                className="h-11 w-full rounded-lg border border-palette-blue-37 bg-white px-4 pr-16 text-sm font-semibold text-text-label outline-none transition focus:border-palette-blue-79 focus:ring-4 focus:ring-palette-blue-19"
              />
              <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs font-semibold text-text-disabled">
                {draft.adminEmail.length} / 100
              </span>
            </div>
          </label>

          <label className="grid grid-cols-[6.5rem_1fr] gap-5">
            <span className="pt-3 text-sm font-bold text-text-label">전화번호</span>
            <div className="relative">
              <input
                value={draft.adminPhone}
                onChange={event => updateDraft('adminPhone', event.target.value.slice(0, 50))}
                className="h-11 w-full rounded-lg border border-palette-blue-37 bg-white px-4 pr-14 text-sm font-semibold text-text-label outline-none transition focus:border-palette-blue-79 focus:ring-4 focus:ring-palette-blue-19"
              />
              <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs font-semibold text-text-disabled">
                {draft.adminPhone.length} / 50
              </span>
            </div>
          </label>
        </div>

        <div className="app-modal-footer flex justify-end gap-[var(--app-gap-sm)] border-t border-border-row">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={modalCancelButtonClass}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={`${modalPrimaryButtonClass} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {isSaving ? '저장 중' : '저장'}
          </button>
        </div>
      </form>
    </DialogLayer>
  );
}

function DownloadUrlModal({ currentPath, onClose, onApply, isSaving }) {
  const [draftPath, setDraftPath] = useState(currentPath);
  const normalizedDraftPath = normalizeDownloadPath(draftPath);
  const isValid =
    draftPath.startsWith('/') &&
    !draftPath.includes(' ') &&
    draftPath.trim().length > 1 &&
    !reservedDownloadPaths.includes(normalizedDraftPath);

  const handleSubmit = event => {
    event.preventDefault();
    if (!isValid) return;
    onApply(normalizedDraftPath);
  };

  return (
    <DialogLayer onClose={onClose} className="app-modal-stage z-[80]">
      <button
        type="button"
        className="app-modal-backdrop cursor-default"
        aria-label="다운로드 URL 변경 닫기"
        onClick={onClose}
      />

      <form onSubmit={handleSubmit} className="app-modal-panel app-modal-panel--lg">
        <div className="app-modal-header flex items-start justify-between pb-0">
          <div>
            <h2 className="text-lg font-bold leading-tight text-text-primary">다운로드 URL 변경</h2>
            <p className="mt-3 text-sm font-semibold text-text-label">
              사용자가 다운로드 페이지에 접속할 URL 경로를 설정합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-primary transition hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="app-modal-body space-y-[var(--app-gap-md)]">
          <div className="flex min-h-[3.25rem] items-center gap-5 rounded-lg border border-palette-blue-37 bg-white px-4">
            <span className="text-sm font-bold text-text-primary">현재 URL</span>
            <span className="inline-flex h-8 items-center rounded-lg border border-border-row bg-slate-50 px-4 text-sm font-semibold text-text-label">
              {currentPath}
            </span>
          </div>

          <div className="border-t border-palette-blue-37" />

          <label className="grid gap-3 md:grid-cols-[7rem_1fr] md:items-start">
            <span className="pt-3 text-sm font-bold text-text-primary">
              새 URL <span className="text-red-500">*</span>
            </span>
            <div>
              <div className="relative">
                <input
                  value={draftPath}
                  onChange={event => setDraftPath(event.target.value.slice(0, 100))}
                  autoFocus
                  className="h-11 w-full rounded-lg border border-palette-blue-37 bg-white px-4 pr-16 text-sm font-semibold text-text-label outline-none transition focus:border-palette-blue-79 focus:ring-4 focus:ring-palette-blue-19"
                />
                <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs font-semibold text-text-muted">
                  {draftPath.length} / 100
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-text-muted">
                슬래시(/)로 시작하는 경로만 입력 가능합니다.
              </p>
            </div>
          </label>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-palette-blue-30 bg-selection px-4 py-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-palette-blue-19 text-brand">
              <Tag className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold text-brand">사용 가능 예시</span>
            <div className="flex flex-wrap gap-2">
              {urlExamples.map(example => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setDraftPath(example)}
                  className="inline-flex h-8 items-center rounded-lg bg-white/70 px-3 text-sm font-semibold text-text-muted transition hover:bg-white hover:text-brand"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-palette-blue-37 bg-slate-50 px-4 py-3 text-text-label">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Info className="h-4 w-4" />
              유의사항
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm font-semibold leading-6">
              <li>URL은 /로 시작해야 합니다.</li>
              <li>공백은 사용할 수 없습니다.</li>
              <li>앱 내부 페이지 경로는 사용할 수 없습니다.</li>
            </ul>
          </div>
        </div>

        <div className="app-modal-footer flex justify-end gap-[var(--app-gap-sm)] border-t border-border-row">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={modalCancelButtonClass}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!isValid || isSaving}
            className={`${modalPrimaryButtonClass} disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 disabled:shadow-none`}
          >
            {isSaving ? '적용 중' : '적용'}
          </button>
        </div>
      </form>
    </DialogLayer>
  );
}

export default function SupportPage() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isDownloadUrlModalOpen, setIsDownloadUrlModalOpen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const {
    data: templateSettings,
    isError: isTemplateError,
    isLoading: isTemplateLoading,
  } = useTemplateSettingsQuery();
  const { mutate: patchTemplateSettings, isPending: isTemplateSaving } =
    usePatchTemplateSettingsMutation();
  const {
    data: downloadSettings,
    isError: isDownloadSettingsError,
    isLoading: isDownloadSettingsLoading,
  } = useDownloadSettingsQuery();
  const { mutate: patchDownloadSettings, isPending: isDownloadSettingsSaving } =
    usePatchDownloadSettingsMutation();
  const template = useMemo(() => normalizeTemplateSettings(templateSettings), [templateSettings]);
  const { downloadPath } = normalizeDownloadSettings(downloadSettings);
  const fullDownloadUrl = useMemo(() => {
    if (typeof window === 'undefined') return downloadPath;
    return `${window.location.origin}${downloadPath}`;
  }, [downloadPath]);

  const handleCopyUrl = async () => {
    await navigator.clipboard?.writeText(fullDownloadUrl);
  };

  const handleSaveTemplate = nextTemplate => {
    patchTemplateSettings(createTemplateSettingsPayload(nextTemplate), {
      onSuccess: () => {
        setPreviewKey(current => current + 1);
        setIsTemplateModalOpen(false);
      },
    });
  };

  const handleApplyDownloadPath = nextPath => {
    patchDownloadSettings(
      { download_path: nextPath },
      {
        onSuccess: () => {
          setPreviewKey(current => current + 1);
          setIsDownloadUrlModalOpen(false);
        },
      }
    );
  };

  return (
    <PageLayout>
      <div className="flex flex-col gap-6 pb-3">
        <SectionCard className="overflow-hidden">
          <CardHeader
            title="템플릿 관리"
            action="수정하기"
            onAction={() => setIsTemplateModalOpen(true)}
          />

          <dl>
            <InfoRow label="로고">
              <div className="flex items-center gap-3">
                <img
                  src={template.logoSrc}
                  alt="ONDAM AI"
                  className="h-10 w-24 rounded-lg border border-slate-200 object-contain"
                />
              </div>
            </InfoRow>
            <InfoRow label="회사 정보">{template.companyName}</InfoRow>
            <InfoRow label="회사 설명">{template.companyDescription}</InfoRow>
            <InfoRow label="이메일">{template.adminEmail}</InfoRow>
            <InfoRow label="전화번호">{template.adminPhone}</InfoRow>
          </dl>
          {isTemplateLoading || isTemplateError ? (
            <div className="border-t border-dashed border-palette-blue-34 px-6 py-4 text-center text-sm text-slate-400">
              {isTemplateError
                ? '템플릿 정보를 불러오지 못했습니다.'
                : '템플릿 정보를 불러오는 중입니다.'}
            </div>
          ) : null}
        </SectionCard>

        <SectionCard className="overflow-hidden">
          <CardHeader
            title="다운로드 URL 관리"
            action="변경하기"
            onAction={() => setIsDownloadUrlModalOpen(true)}
          />

          <div className="px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 flex-wrap items-center gap-x-8 gap-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-500">현재 URL</span>
                  <span className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-5 text-sm font-bold text-palette-blue-84">
                    {downloadPath}
                  </span>
                </div>

                <div className="flex min-w-0 items-center gap-4">
                  <span className="shrink-0 text-sm font-bold text-slate-500">전체 주소</span>
                  <a
                    href={downloadPath}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-w-0 max-w-full items-center gap-2 text-sm font-bold text-brand hover:text-brand-hover"
                  >
                    <span className="truncate">{fullDownloadUrl}</span>
                    <ExternalLink className="h-4 w-4 shrink-0" />
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <AppButton onClick={() => setIsPreviewOpen(current => !current)} className="h-12">
                  {isPreviewOpen ? '미리보기 접기' : '미리보기 열기'}
                  <ChevronUp
                    className={`h-4 w-4 transition ${isPreviewOpen ? '' : 'rotate-180'}`.trim()}
                  />
                </AppButton>
                <a
                  href={downloadPath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-text-secondary shadow-detail-08 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  새 탭에서 열기
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-text-secondary shadow-detail-08 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  URL 복사
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {isPreviewOpen ? (
            <div className="border-t border-border-subtle bg-white">
              <div className="px-6 py-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-text-label">미리보기</span>
                  <button
                    type="button"
                    onClick={() => setPreviewKey(current => current + 1)}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold text-brand transition hover:bg-selection"
                  >
                    <RefreshCw className="h-4 w-4" />
                    새로고침
                  </button>
                </div>
                <DownloadPreviewFrame previewKey={previewKey} src={downloadPath} />
              </div>
            </div>
          ) : null}
          {isDownloadSettingsLoading || isDownloadSettingsError ? (
            <div className="border-t border-dashed border-palette-blue-34 px-6 py-4 text-center text-sm text-slate-400">
              {isDownloadSettingsError
                ? '다운로드 URL 정보를 불러오지 못했습니다.'
                : '다운로드 URL 정보를 불러오는 중입니다.'}
            </div>
          ) : null}
        </SectionCard>
      </div>

      {isTemplateModalOpen ? (
        <TemplateEditModal
          template={template}
          onClose={() => setIsTemplateModalOpen(false)}
          onSave={handleSaveTemplate}
          isSaving={isTemplateSaving}
        />
      ) : null}

      {isDownloadUrlModalOpen ? (
        <DownloadUrlModal
          currentPath={downloadPath}
          onClose={() => setIsDownloadUrlModalOpen(false)}
          onApply={handleApplyDownloadPath}
          isSaving={isDownloadSettingsSaving}
        />
      ) : null}
    </PageLayout>
  );
}
