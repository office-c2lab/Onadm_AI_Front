import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bot,
  Bookmark,
  Braces,
  ChevronRight,
  FileText,
  Languages,
  MessageSquareText,
  Search,
  Sparkles,
  Workflow,
} from 'lucide-react';

import banner1 from '../../../../assets/images/banner1.png';
import banner2 from '../../../../assets/images/banner2.png';
import { ToolDetailModal } from '../components/ManageToolCard/ManageToolCard.jsx';
import { publishedTools, useFavorites } from '../data/manageStore.js';

const toolVisuals = {
  report: [FileText, 'bg-blue-600 text-white'],
  meeting: [MessageSquareText, 'bg-violet-100 text-violet-600'],
  workflow: [Workflow, 'bg-orange-500 text-white'],
  analysis: [BarChart3, 'bg-emerald-500 text-white'],
  review: [Braces, 'bg-slate-900 text-white'],
  expense: [Sparkles, 'bg-amber-100 text-amber-600'],
  translate: [Languages, 'bg-sky-100 text-sky-600'],
  support: [Bot, 'bg-indigo-100 text-indigo-600'],
};

const featuredBackgrounds = {
  report: 'from-rose-50 to-rose-100',
  meeting: 'from-orange-50 to-orange-100',
  workflow: 'from-fuchsia-50 to-blue-50',
  analysis: 'from-emerald-50 to-green-100',
  review: 'from-slate-100 to-slate-200',
  expense: 'from-sky-50 to-blue-100',
  translate: 'from-cyan-50 to-sky-100',
  support: 'from-indigo-50 to-violet-100',
};

function ToolIcon({ tool, small = false, featured = false, promo = false }) {
  const [Icon, color] = toolVisuals[tool.id] || toolVisuals.report;

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl ${color} ${
        featured
          ? 'h-[72px] w-[72px] rounded-2xl shadow-sm'
          : promo
            ? 'h-14 w-14 shadow-sm'
            : small
              ? 'h-12 w-12'
              : 'h-10 w-10'
      }`}
    >
      <Icon
        size={featured ? 36 : promo ? 28 : small ? 24 : 20}
        strokeWidth={1.8}
        aria-hidden="true"
      />
    </span>
  );
}

function SectionTitle({ children, viewAll = false }) {
  return (
    <div className="mb-2 flex items-end justify-between gap-4">
      <div>
        <h2 className="flex items-center gap-0.5 text-[17px] font-bold text-slate-900">
          {children} <ChevronRight size={18} aria-hidden="true" />
        </h2>
      </div>
      {viewAll && (
        <button type="button" className="text-sm text-slate-500 hover:text-slate-900">
          전체 보기
        </button>
      )}
    </div>
  );
}

function FeaturedCard({ tool, favorite, onFavorite, onDetail }) {
  return (
    <article className="group relative h-[224px] min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-900/5">
      <div
        className={`flex h-[128px] items-center justify-center bg-gradient-to-br ${
          featuredBackgrounds[tool.id] || featuredBackgrounds.report
        }`}
      >
        <ToolIcon tool={tool} featured />
        <button
          type="button"
          onClick={() => onFavorite(tool.id)}
          className={`absolute right-2 top-2 rounded-lg bg-white/80 p-1.5 opacity-0 shadow-sm backdrop-blur-sm transition hover:bg-white group-hover:opacity-100 ${favorite ? 'text-blue-600 opacity-100' : 'text-slate-500'}`}
          aria-label={`${tool.name} 즐겨찾기 ${favorite ? '해제' : '추가'}`}
        >
          <Bookmark size={17} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onDetail(tool)}
        className="flex h-[96px] w-full flex-col items-start px-4 py-3 text-left"
      >
        <h3 className="truncate text-[15px] font-semibold leading-5 text-slate-900">{tool.name}</h3>
        <span className="mt-1 block truncate text-xs text-slate-500">
          {tool.storeCategory || tool.category}
        </span>
        <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
          <ChevronRight size={19} strokeWidth={2} aria-hidden="true" />
        </span>
      </button>
    </article>
  );
}

function CompactTool({ tool, onDetail }) {
  return (
    <button
      type="button"
      onClick={() => onDetail(tool)}
      className="group flex h-[82px] min-w-0 items-center gap-4 rounded-xl border border-transparent px-3 text-left transition hover:border-slate-100 hover:bg-white hover:shadow-sm"
    >
      <ToolIcon tool={tool} small />
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-base text-slate-900">{tool.name}</strong>
        <span className="mt-1 block truncate text-sm text-slate-500">
          {tool.storeCategory || tool.category}
        </span>
      </span>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
        <ChevronRight size={19} strokeWidth={2} aria-hidden="true" />
      </span>
    </button>
  );
}

export default function StorePage() {
  const [search, setSearch] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);
  const { favorites, toggleFavorite } = useFavorites();

  const visibleTools = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return publishedTools;
    return publishedTools.filter(tool =>
      `${tool.name} ${tool.summary} ${tool.maker} ${tool.category}`.toLowerCase().includes(keyword)
    );
  }, [search]);

  return (
    <main className="mx-auto w-full max-w-7xl px-5  md:px-8">
      <header className="pb-3 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI App Store</h1>
        <p className="mt-2 text-sm text-slate-500">
          업무에 필요한 도구를 발견하고, 안전하게 활용해 보세요.
        </p>
      </header>

      <div className="sticky top-0 z-30 -mx-5 bg-[#f9f9f9]/95 px-5 py-3 backdrop-blur md:-mx-8 md:px-8">
        <label className="mx-auto flex h-11 w-full max-w-xl items-center gap-3 rounded-lg bg-[#edf2f7] px-4 text-slate-500 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20">
          <Search size={19} strokeWidth={2} />
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="확장 프로그램 및 테마 검색"
            aria-label="도구 검색"
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-600"
          />
        </label>
      </div>

      {!search.trim() && (
        <section
          className="mt-3 grid gap-2 lg:aspect-[4.8/1] lg:grid-cols-[1.35fr_1fr]"
          aria-label="추천 프로모션"
        >
          <button
            type="button"
            onClick={() => setSelectedTool(publishedTools[0])}
            className="group relative min-h-[220px] overflow-hidden rounded-lg text-left shadow-sm lg:min-h-0"
          >
            <img
              src={banner1}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.015]"
            />
            <span className="absolute inset-0 bg-gradient-to-r from-[#102e65]/40 via-transparent to-transparent" />
            <span className="relative flex h-full flex-col items-start justify-center px-7 text-white md:px-8">
              <span className="rounded-full bg-blue-500 px-2 py-1 text-[11px] font-semibold text-white">
                AI Report Agent
              </span>
              <strong className="mt-2.5 text-xl font-bold tracking-tight md:text-2xl">
                보고서 작성 도우미
              </strong>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-800">
                자세히 보기 <ArrowRight size={14} />
              </span>
            </span>
          </button>

          <div className="grid h-full gap-2 sm:grid-cols-2 lg:grid-rows-[1.35fr_1fr]">
            <button
              type="button"
              onClick={() => setSelectedTool(publishedTools[2])}
              className="group relative min-h-[130px] overflow-hidden rounded-lg text-left sm:col-span-2 lg:min-h-0"
            >
              <img
                src={banner2}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              />
              <span className="relative flex h-full flex-col items-start justify-center px-6">
                <span className="rounded-full bg-blue-500 px-2 py-1 text-[11px] font-semibold text-white">
                  AI Agent
                </span>
                <strong className="mt-2 text-lg font-bold text-slate-800">
                  업무 자동화 에이전트
                </strong>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTool(publishedTools[3])}
              className="flex min-h-[100px] items-center justify-between gap-2 rounded-lg bg-gradient-to-br from-emerald-50 to-cyan-100 p-4 text-left hover:brightness-[0.98] lg:min-h-0"
            >
              <span className="min-w-0 flex-1">
                <span className="rounded-full bg-emerald-500 px-2 py-1 text-[11px] font-semibold text-white">
                  데이터 분석
                </span>
                <strong className="mt-2 line-clamp-2 text-base leading-5 text-slate-800">
                  데이터 인사이트 도구
                </strong>
              </span>
              <ToolIcon tool={publishedTools[3]} promo />
            </button>

            <button
              type="button"
              onClick={() => setSelectedTool(publishedTools[1])}
              className="flex min-h-[100px] items-center justify-between gap-2 rounded-lg bg-gradient-to-br from-indigo-50 to-violet-100 p-4 text-left hover:brightness-[0.98] lg:min-h-0"
            >
              <span className="min-w-0 flex-1">
                <span className="rounded-full bg-indigo-500 px-2 py-1 text-[11px] font-semibold text-white">
                  생산성
                </span>
                <strong className="mt-2 line-clamp-2 text-base leading-5 text-slate-800">
                  회의록 정리 도우미
                </strong>
              </span>
              <ToolIcon tool={publishedTools[1]} promo />
            </button>
          </div>
        </section>
      )}

      <section className="py-6">
        <SectionTitle>요즘 주목받는 AI 도구</SectionTitle>
        {visibleTools.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {visibleTools.slice(0, 6).map(tool => (
              <FeaturedCard
                key={tool.id}
                tool={tool}
                favorite={favorites.includes(tool.id)}
                onFavorite={toggleFavorite}
                onDetail={setSelectedTool}
              />
            ))}
          </div>
        ) : (
          <div className="p-14 text-center text-sm text-slate-500">
            검색 조건에 맞는 도구가 없습니다.
          </div>
        )}
      </section>

      {!search.trim() && (
        <>
          <section className="py-6">
            <SectionTitle viewAll>지금 써봐야 할 AI 도구</SectionTitle>
            <div className="grid gap-x-5 md:grid-cols-2 lg:grid-cols-3">
              {publishedTools.slice(0, 6).map(tool => (
                <CompactTool key={tool.id} tool={tool} onDetail={setSelectedTool} />
              ))}
            </div>
          </section>
          <section className="py-6">
            <SectionTitle viewAll>업무 효율을 높이는 도구</SectionTitle>
            <div className="grid gap-x-5 md:grid-cols-2 lg:grid-cols-3">
              {[...publishedTools]
                .reverse()
                .slice(0, 6)
                .map(tool => (
                  <CompactTool key={tool.id} tool={tool} onDetail={setSelectedTool} />
                ))}
            </div>
          </section>
        </>
      )}

      <ToolDetailModal tool={selectedTool} onClose={() => setSelectedTool(null)} />
    </main>
  );
}
