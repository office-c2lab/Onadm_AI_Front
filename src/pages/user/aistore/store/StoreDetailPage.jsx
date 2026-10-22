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
  ShieldCheck,
} from 'lucide-react';
import StoreToolIcon from '../../../../components/tools/StoreToolIcon.jsx';
import { StoreToolPreviewScreen } from '../../../../components/tools/StoreToolPreviewScreen.jsx';
import { storePreviewTabs } from '../../../../components/tools/storePreviewConfig.js';
import { publishedTools, useDownloads, useFavorites } from '../data/manageStore.js';
import { detailContent, supportedEnvironment } from '../data/storeDetailContent.js';

function DetailSection({ title, children }) {
  return (
    <section className="border-t border-slate-200 px-5 py-7 sm:px-8">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
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
  const features = [tool.summary, ...(tool.storeTags ?? []).map(tag => `${tag} 업무에 활용`)].slice(
    0,
    5
  );
  const content = detailContent[tool.id] ?? {
    description: [tool.description || tool.summary],
    usage:
      '처리하려는 업무의 목적과 필요한 내용을 구체적으로 입력해 주세요. 결과가 나오면 원본 자료와 비교해 누락되거나 잘못 해석된 부분이 없는지 확인하고, 필요한 수정을 거쳐 업무에 활용할 수 있습니다.',
  };
  const specifications = [
    ['도구 유형', tool.type],
    ['카테고리', tool.category],
    ['제작자', tool.maker],
    ['제공 위치', 'ONDAM AI App Store'],
  ];

  return (
    <div className="pb-10 pt-6 text-slate-900">
      <Link
        to="/user/aistore/store"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} /> 스토어로 돌아가기
      </Link>

      <article className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <header className="flex flex-col gap-5 px-5 py-7 sm:flex-row sm:items-start sm:justify-between sm:px-8">
          <div className="flex min-w-0 items-start gap-4">
            <StoreToolIcon tool={tool} featured />
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {tool.name}
              </h1>
              <p className="mt-1 text-xs font-medium text-blue-600">
                {tool.type} · {tool.storeCategory || tool.category}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{tool.summary}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <FileText size={14} /> v{tool.version}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} /> 사내 등록 도구
                </span>
                <span>{tool.maker}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => toggleFavorite(tool.id)}
              aria-label={`${tool.name} 즐겨찾기 ${isFavorite ? '해제' : '추가'}`}
              aria-pressed={isFavorite}
              className={`grid h-10 w-10 place-items-center rounded-lg border transition-colors ${isFavorite ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <Bookmark size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              type="button"
              onClick={() => addDownload(tool.id)}
              disabled={isAdded}
              aria-label={`${tool.name} ${isAdded ? '다운로드 됨' : '다운로드'}`}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-50 disabled:text-blue-700"
            >
              {isAdded ? <Check size={17} /> : <Download size={17} />}
              {isAdded ? '다운로드 됨' : '다운로드'}
            </button>
          </div>
        </header>

        <DetailSection title="스크린샷">
          <div className="relative rounded-2xl bg-gradient-to-br from-sky-50 via-white to-indigo-100 px-5 py-7 sm:px-12 sm:py-10">
            <StoreToolPreviewScreen tool={tool} activeIndex={activePreview} />
            <button
              type="button"
              onClick={() =>
                setActivePreview(
                  current => (current + storePreviewTabs.length - 1) % storePreviewTabs.length
                )
              }
              aria-label="이전 미리보기"
              className="absolute left-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white text-blue-600 shadow-md hover:bg-blue-50 sm:left-5"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setActivePreview(current => (current + 1) % storePreviewTabs.length)}
              aria-label="다음 미리보기"
              className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white text-blue-600 shadow-md hover:bg-blue-50 sm:right-5"
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
          <p className="mt-2 text-center text-xs text-slate-400">화면 구성 예시</p>
        </DetailSection>

        <DetailSection title="설명">
          <div className="max-w-3xl space-y-3 text-sm leading-7 text-slate-600">
            {content.description.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </DetailSection>

        <DetailSection title="주요 기능">
          <ul className="space-y-2 text-sm text-slate-600">
            {features.map(feature => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                {feature}
              </li>
            ))}
          </ul>
        </DetailSection>

        <DetailSection title="사용 방법">
          <p className="max-w-3xl text-sm leading-7 text-slate-600">{content.usage}</p>
        </DetailSection>

        <DetailSection title="지원 환경">
          <dl className="max-w-3xl divide-y divide-slate-100 text-sm">
            {supportedEnvironment.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-center gap-4 py-3 sm:grid-cols-[14rem_1fr]"
              >
                <dt className="flex items-center gap-3 text-slate-600">
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
          <dl className="max-w-3xl divide-y divide-slate-100 text-sm">
            {specifications.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[8rem_1fr] gap-4 py-2.5">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </DetailSection>

        <DetailSection title="버전 정보">
          <div className="flex max-w-3xl items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 text-sm">
            <span className="font-semibold text-blue-600">v{tool.version}</span>
            <span className="text-slate-500">현재 제공 버전</span>
          </div>
        </DetailSection>

        <div className="border-t border-slate-200 px-5 py-5 sm:px-8">
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
