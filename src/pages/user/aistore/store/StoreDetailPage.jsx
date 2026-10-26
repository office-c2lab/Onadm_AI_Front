import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  HardDrive,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import StoreToolIcon from '../components/StoreToolIcon.jsx';
import { StoreToolPreviewScreen, storePreviewTabs } from '../components/StoreToolPreviewScreen.jsx';
import AiStoreActionButton from '../components/AiStoreActionButton.jsx';
import { publishedTools, useDownloads, useFavorites } from '../data/manageStore.js';
import {
  detailContent,
  getToolDownloadSize,
  supportedEnvironment,
} from '../data/storeDetailContent.js';
import { getLatestVersionNotes } from '../data/versionNotes.js';

function DetailSection({ title, children }) {
  return (
    <section className="border-t border-slate-200 py-9 sm:py-10">
      <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function StoreDetailPage() {
  const { toolId } = useParams();
  const [activePreview, setActivePreview] = useState(0);
  const { favorites, toggleFavorite } = useFavorites();
  const { downloads, addDownload } = useDownloads();
  const tool = publishedTools.find(item => item.id === toolId);

  if (!tool) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-semibold text-slate-900">도구를 찾을 수 없습니다.</h1>
        <Link
          to="/user/aistore/store"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          스토어로 돌아가기
        </Link>
      </div>
    );
  }

  const isFavorite = favorites.includes(tool.id);
  const isAdded = downloads.includes(tool.id);
  const content = detailContent[tool.id] ?? {
    description: [tool.description || tool.summary],
    features: tool.summary,
    usage:
      '처리하려는 업무의 목적과 필요한 내용을 구체적으로 입력해 주세요. 결과가 나오면 원본 자료와 비교해 누락되거나 잘못 해석된 부분이 없는지 확인하고, 필요한 수정을 거쳐 업무에 활용할 수 있습니다.',
  };
  const makerLabel = [tool.maker, tool.makerPosition, tool.makerName].filter(Boolean).join(' · ');
  const specifications = [
    ['도구 유형', tool.type],
    ['카테고리', tool.category],
    ['다운로드 용량', getToolDownloadSize(tool)],
    ['제작자', makerLabel],
    ['제공 위치', 'ONDAM AI App Store'],
  ];
  const latestVersionNotes = getLatestVersionNotes(tool);
  const versionHistory = tool.versionHistory ?? [
    { version: tool.version, updatedAt: '날짜 정보 없음' },
  ];

  return (
    <div className="pb-14 pt-6 text-slate-900">
      <Link
        to="/user/aistore/store"
        className="inline-flex h-9 items-center gap-2 rounded-lg pr-3 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
      >
        <ArrowLeft size={16} /> 스토어로 돌아가기
      </Link>

      <article className="mt-2">
        <header className="flex flex-col gap-6 py-8 sm:flex-row sm:items-start sm:justify-between sm:py-10">
          <div className="flex min-w-0 items-start gap-5">
            <StoreToolIcon tool={tool} featured />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl">
                {tool.name}
              </h1>
              <p className="mt-1.5 text-sm font-semibold text-blue-600">
                {tool.type} · {tool.storeCategory || tool.category}
              </p>
              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">{tool.summary}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm font-semibold text-slate-700">
                <span className="inline-flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" /> v{tool.version}
                </span>
                <span className="inline-flex items-center gap-2">
                  <HardDrive size={16} className="text-blue-600" /> {getToolDownloadSize(tool)}
                </span>
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
            <button
              type="button"
              onClick={() => toggleFavorite(tool.id)}
              aria-label={`${tool.name} 즐겨찾기 ${isFavorite ? '해제' : '추가'}`}
              aria-pressed={isFavorite}
              className={`grid h-11 w-11 place-items-center rounded-lg bg-white shadow-sm transition-colors hover:bg-slate-50 ${isFavorite ? 'text-blue-600' : 'text-slate-500'}`}
            >
              <Bookmark size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <AiStoreActionButton
              onClick={() => addDownload(tool.id)}
              disabled={isAdded}
              aria-label={`${tool.name} ${isAdded ? '다운로드 됨' : '다운로드'}`}
              size="large"
              icon={isAdded ? Check : Download}
            >
              {isAdded ? '다운로드 됨' : '다운로드'}
            </AiStoreActionButton>
          </div>
        </header>

        <DetailSection title="스크린샷">
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
            {content.features ?? tool.summary}
          </p>
        </DetailSection>

        <DetailSection title="사용 방법">
          <p className="max-w-[52rem] text-[15px] leading-7 text-slate-600">{content.usage}</p>
        </DetailSection>

        {latestVersionNotes.length > 0 && (
          <DetailSection title="업데이트 내용">
            <div className="max-w-[52rem]">
              <h3 className="text-sm font-semibold text-slate-800">변경 사항</h3>
              <ul className="mt-3 space-y-2 text-[15px] leading-7 text-slate-600">
                {latestVersionNotes.map(note => (
                  <li key={note} className="flex items-start gap-2.5">
                    <span className="mt-3 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                    <span>{note}</span>
                  </li>
                ))}
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
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                    className="shrink-0 text-slate-500"
                    aria-hidden="true"
                  />
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
                    <span className="text-xs font-medium text-blue-600">현재 버전</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </DetailSection>

        <div className="border-t border-slate-200 py-7">
          <Link
            to="/user/aistore/store"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
          >
            다른 도구 둘러보기 <ArrowRight size={15} />
          </Link>
        </div>
      </article>
    </div>
  );
}
