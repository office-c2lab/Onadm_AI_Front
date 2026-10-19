import { useMemo, useState } from 'react';
import { ArrowRight, Bookmark, ChevronRight } from 'lucide-react';

import banner1 from '../../../../assets/images/banner1.png';
import banner2 from '../../../../assets/images/banner2.png';
import SearchHeader from '../../../../components/search/SearchHeader.jsx';
import StoreToolIcon from '../components/StoreToolIcon.jsx';
import { ToolDetailModal } from '../components/ManageToolCard/ManageToolCard.jsx';
import { publishedTools, storeCategories, useFavorites } from '../data/manageStore.js';

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
        <StoreToolIcon tool={tool} featured />
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
      <StoreToolIcon tool={tool} small />
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
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedTool, setSelectedTool] = useState(null);
  const { favorites, toggleFavorite } = useFavorites();
  const isDefaultView = !search.trim() && selectedCategory === '전체';

  const visibleTools = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return publishedTools.filter(tool => {
      const matchesCategory =
        selectedCategory === '전체' || tool.storeTags.includes(selectedCategory);
      const matchesSearch =
        !keyword ||
        `${tool.name} ${tool.summary} ${tool.maker} ${tool.category} ${tool.storeTags.join(' ')}`
          .toLowerCase()
          .includes(keyword);
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 md:px-8">
      <SearchHeader
        title="AI App Store"
        description="업무에 필요한 도구를 발견하고, 안전하게 활용해 보세요."
        value={search}
        onSearchChange={setSearch}
        placeholder="확장 프로그램 및 테마 검색"
        ariaLabel="도구 검색"
      />

      <nav
        aria-label="도구 카테고리"
        className="mt-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max min-w-full justify-center gap-1">
          {storeCategories.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              aria-pressed={selectedCategory === category}
              className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-1 text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-[#ededed] font-medium text-[#333]'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </nav>

      {isDefaultView && (
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
              <StoreToolIcon tool={publishedTools[3]} promo />
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
              <StoreToolIcon tool={publishedTools[1]} promo />
            </button>
          </div>
        </section>
      )}

      <section className="py-6">
        <SectionTitle>
          {selectedCategory !== '전체'
            ? `${selectedCategory} 도구`
            : search.trim()
              ? '검색 결과'
              : '요즘 주목받는 AI 도구'}
        </SectionTitle>
        {visibleTools.length === 0 ? (
          <div className="p-14 text-center text-sm text-slate-500">
            {search.trim()
              ? '검색 조건에 맞는 도구가 없습니다.'
              : '선택한 카테고리에 도구가 없습니다.'}
          </div>
        ) : isDefaultView ? (
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
          <div className="mt-4 grid gap-x-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleTools.map(tool => (
              <CompactTool key={tool.id} tool={tool} onDetail={setSelectedTool} />
            ))}
          </div>
        )}
      </section>

      {isDefaultView && (
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
