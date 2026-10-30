import { useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  HardDrive,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AdminDetailSection } from '../../../../layouts/admin/AdminDetailLayout.jsx';
import { appRecords } from '../data.js';
import AiStoreActionButton from '../../../user/aistore/components/AiStoreActionButton.jsx';
import AiStoreConfirmModal from '../../../user/aistore/components/AiStoreConfirmModal.jsx';
import StoreToolIcon from '../../../user/aistore/components/StoreToolIcon.jsx';
import {
  StoreToolPreviewScreen,
  storePreviewTabs,
} from '../../../user/aistore/components/StoreToolPreviewScreen.jsx';
import {
  ADMIN_DELETED_APPS_KEY,
  getDeletedAppIds,
} from '../../../user/aistore/data/manageStore.js';
import {
  detailContent,
  getToolDownloadSize,
  supportedEnvironment,
} from '../../../user/aistore/data/storeDetailContent.js';
import { getAppDownloadCount, getAppDownloadHistory } from './downloadHistory.js';

export default function AppsDetailPage() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const deletedAppIds = getDeletedAppIds();
  const sourceApp = appRecords.find(
    item =>
      item.id === appId && !deletedAppIds.includes(item.id) && !deletedAppIds.includes(item.storeId)
  );
  const [activePreview, setActivePreview] = useState(0);
  const [publication, setPublication] = useState(sourceApp?.publication ?? '숨김');
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!sourceApp) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-semibold text-slate-900">앱·에이전트를 찾을 수 없습니다.</h1>
        <Link
          to="/admin/manage/apps"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          앱·에이전트 관리로 돌아가기
        </Link>
      </div>
    );
  }

  const tool = { ...sourceApp, id: sourceApp.storeId ?? sourceApp.id };
  const content = detailContent[sourceApp.storeId] ?? {
    description: [sourceApp.description || sourceApp.summary],
    features: sourceApp.summary,
    usage:
      '업무 목적과 필요한 내용을 입력한 뒤 결과를 원자료와 대조해 확인해 주세요. 필요한 내용을 수정하고 담당자의 검토를 거쳐 활용할 수 있습니다.',
  };
  const makerLabel = [
    sourceApp.maker || sourceApp.department,
    sourceApp.makerPosition,
    sourceApp.makerName || sourceApp.owner,
  ]
    .filter(Boolean)
    .join(' · ');
  const specifications = [
    ['도구 유형', sourceApp.type],
    ['카테고리', sourceApp.category],
    ['다운로드 용량', getToolDownloadSize(tool)],
    ['제작자', makerLabel],
    ['제공 위치', 'ONDAM AI App Store'],
  ];
  const versionHistory = sourceApp.versionHistory ?? [
    { version: sourceApp.version, updatedAt: sourceApp.updatedAt },
  ];
  const downloadCount = getAppDownloadCount(sourceApp);
  const recentDownloads = getAppDownloadHistory(sourceApp);

  return (
    <>
      <Link
        to="/admin/manage/apps"
        className="inline-flex h-9 items-center gap-2 rounded-lg pr-3 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
      >
        <ArrowLeft size={16} /> 앱·에이전트 관리로 돌아가기
      </Link>

      <article className="mt-2">
        <header className="flex flex-col gap-6 py-8 sm:flex-row sm:items-start sm:justify-between sm:py-10">
          <div className="flex min-w-0 items-start gap-5">
            <StoreToolIcon tool={tool} featured />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl">
                {sourceApp.name}
              </h1>
              <p className="mt-1.5 text-sm font-semibold text-blue-600">
                {sourceApp.type} · {sourceApp.storeCategory || sourceApp.category}
              </p>
              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">
                {sourceApp.summary}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm font-semibold text-slate-700">
                <span className="inline-flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" /> v{sourceApp.version}
                </span>
                <span className="inline-flex items-center gap-2">
                  <HardDrive size={16} className="text-blue-600" /> {getToolDownloadSize(tool)}
                </span>
                <Link
                  to={`/admin/manage/apps/${sourceApp.id}/downloads`}
                  aria-label={`다운로드 ${downloadCount.toLocaleString('ko-KR')}회 이력 보기`}
                  className="inline-flex items-center gap-2 rounded-sm transition-colors hover:text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Download size={16} className="text-blue-600" /> 다운로드{' '}
                  {downloadCount.toLocaleString('ko-KR')}회
                </Link>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck size={16} className="text-blue-600" /> 사내 등록 도구
                </span>
                <span className="inline-flex items-center gap-2">
                  <UserRound size={16} className="text-blue-600" /> {makerLabel}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <AiStoreActionButton
              size="large"
              icon={Download}
              aria-label={`${sourceApp.name} 현재 버전 다운로드`}
              href={`/api/admin/apps/${sourceApp.id}/download`}
              download={`${sourceApp.name}_v${sourceApp.version}.zip`}
            >
              다운로드
            </AiStoreActionButton>
          </div>
        </header>

        <AdminDetailSection title="스크린샷">
          <div className="relative rounded-2xl border border-blue-100/80 bg-gradient-to-br from-sky-50 via-white to-indigo-100 px-5 py-7 sm:px-12 sm:py-10">
            <StoreToolPreviewScreen tool={tool} activeIndex={activePreview} />
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
        </AdminDetailSection>

        <AdminDetailSection title="설명">
          <div className="max-w-[52rem] space-y-4 text-[15px] leading-7 text-slate-600">
            {content.description.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </AdminDetailSection>

        <AdminDetailSection title="주요 기능">
          <p className="max-w-[52rem] text-[15px] leading-7 text-slate-600">
            {content.features ?? sourceApp.summary}
          </p>
        </AdminDetailSection>

        <AdminDetailSection title="사용 방법">
          <p className="max-w-[52rem] text-[15px] leading-7 text-slate-600">{content.usage}</p>
        </AdminDetailSection>

        {sourceApp.releaseNotes?.length > 0 && (
          <AdminDetailSection title="업데이트 내용">
            <div className="max-w-[52rem]">
              <h3 className="text-sm font-semibold text-slate-800">변경 사항</h3>
              <ul className="mt-3 space-y-2 text-[15px] leading-7 text-slate-600">
                {sourceApp.releaseNotes.map(note => (
                  <li key={note} className="flex items-start gap-2.5">
                    <span className="mt-3 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AdminDetailSection>
        )}

        <AdminDetailSection title="지원 환경">
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
        </AdminDetailSection>

        <AdminDetailSection title="도구 정보">
          <dl className="max-w-4xl divide-y divide-slate-200/80 border-y border-slate-200/80 text-sm">
            {specifications.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:gap-4">
                <dt className="font-medium text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </AdminDetailSection>

        <AdminDetailSection title="버전 정보">
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
                    <span className="text-xs font-medium text-blue-600">현재 버전</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </AdminDetailSection>

        <AdminDetailSection title="다운로드 이력">
          <div className="flex max-w-4xl flex-col gap-4 border-y border-slate-200/80 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">
                누적 다운로드{' '}
                <span className="font-semibold text-blue-600">
                  {downloadCount.toLocaleString('ko-KR')}회
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {recentDownloads.length
                  ? `최근 ${recentDownloads[0].name}님 외 다운로드 사용자 이력을 확인할 수 있습니다.`
                  : '아직 이 도구를 다운로드한 사용자가 없습니다.'}
              </p>
            </div>
            <Link
              to={`/admin/manage/apps/${sourceApp.id}/downloads`}
              className="inline-flex h-9 items-center gap-2 rounded-lg pl-3 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
            >
              이력 보기
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </AdminDetailSection>

        <AdminDetailSection title="스토어 노출">
          <div className="flex max-w-4xl items-center justify-between gap-4 border-y border-slate-200/80 py-4">
            <div>
              <p className="text-sm font-medium text-slate-800">
                {publication === '게시 중'
                  ? '스토어에 게시 중입니다.'
                  : '스토어에서 숨김 상태입니다.'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                사용자의 스토어 탐색 화면에 이 도구를 노출할지 설정합니다.
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-3">
              <span className="text-xs font-medium text-slate-500">{publication}</span>
              <input
                className="peer sr-only"
                type="checkbox"
                checked={publication === '게시 중'}
                onChange={event => setPublication(event.target.checked ? '게시 중' : '숨김')}
                aria-label={`${sourceApp.name} 스토어 노출`}
              />
              <span className="relative h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-blue-600 after:absolute after:top-1 after:left-1 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
            </label>
          </div>
        </AdminDetailSection>

        <div className="border-t border-slate-200 py-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">도구 삭제</h2>
              <p className="mt-1 text-sm text-slate-500">
                삭제하면 관리자 목록과 스토어에서 더 이상 이 도구를 확인할 수 없습니다.
              </p>
            </div>
            <AiStoreActionButton
              variant="danger"
              size="large"
              icon={Trash2}
              onClick={() => setDeleteOpen(true)}
            >
              삭제
            </AiStoreActionButton>
          </div>
        </div>
      </article>

      <AiStoreConfirmModal
        open={deleteOpen}
        title="도구를 삭제하시겠습니까?"
        confirmLabel="삭제"
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          try {
            const next = [sourceApp.id, sourceApp.storeId].filter(Boolean);
            window.localStorage.setItem(
              ADMIN_DELETED_APPS_KEY,
              JSON.stringify([...new Set([...getDeletedAppIds(), ...next])])
            );
            navigate('/admin/manage/apps');
          } catch {
            setDeleteOpen(false);
          }
        }}
      >
        <strong className="font-semibold text-slate-900">{sourceApp.name}</strong>이 관리자 목록과
        스토어에서 제거됩니다. 이 작업은 일반 화면에서 되돌릴 수 없습니다.
      </AiStoreConfirmModal>
    </>
  );
}
