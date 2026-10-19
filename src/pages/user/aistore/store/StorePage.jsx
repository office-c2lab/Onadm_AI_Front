import React, { useMemo, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import CustomDropdown from '../../../../components/dropdown/CustomDropdown.jsx';

import { categories, publishedTools, toolTypes, useFavorites } from '../data/manageStore.js';

import { ToolCard, ToolDetailModal } from '../components/ManageToolCard/ManageToolCard.jsx';

export default function StorePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('전체');
  const [type, setType] = useState('전체 유형');
  const [sort, setSort] = useState('추천순');
  const [selectedTool, setSelectedTool] = useState(null);

  const { favorites, toggleFavorite } = useFavorites();

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const result = publishedTools.filter(tool => {
      const matchesSearch =
        !keyword || `${tool.name} ${tool.summary} ${tool.maker}`.toLowerCase().includes(keyword);

      const matchesCategory = category === '전체' || tool.category === category;

      const matchesType = type === '전체 유형' || tool.type === type;

      return matchesSearch && matchesCategory && matchesType;
    });

    if (sort === '이름순') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    }

    if (sort === '추천순') {
      result.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    }

    return result;
  }, [search, category, type, sort]);

  const defaultView = !search.trim() && category === '전체' && type === '전체 유형';

  const recommended = publishedTools.filter(tool => tool.featured);

  const renderCards = items => (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(tool => (
        <ToolCard
          key={tool.id}
          tool={tool}
          favorite={favorites.includes(tool.id)}
          onToggleFavorite={toggleFavorite}
          onDetail={setSelectedTool}
        />
      ))}
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8">
      {/* 페이지 제목 */}
      <header>
        <p className="text-xs font-semibold tracking-wider text-blue-600">MANAGE</p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">AI App Store</h1>

        <p className="mt-2 text-sm text-slate-500">
          업무에 필요한 도구를 발견하고, 안전하게 활용해 보세요.
        </p>
      </header>

      {/* 상단 소개 배너 */}
      <section className="mt-7 overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-r from-[#EFF6FF] to-[#E5F1FF] px-7 py-9">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-blue-600">
          <Sparkles size={15} />
          DISCOVER YOUR TOOLS
        </div>

        <h2 className="mt-3 text-xl font-bold leading-snug text-slate-900">
          일을 더 쉽고, 빠르게.
          <br />
          필요한 도구를 한곳에서
        </h2>

        <p className="mt-3 text-sm text-slate-600">
          AI 앱부터 업무 자동화까지, 사내에서 사용할 수 있는 도구를 만나보세요.
        </p>
      </section>

      {/* 검색 및 유형 필터 */}
      <div className="mt-7 flex flex-col gap-3 md:flex-row">
        <label className="flex min-h-11 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-slate-400 focus-within:border-blue-400">
          <Search size={18} />

          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="도구 이름, 기능, 제작자 검색"
            aria-label="도구 검색"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>

        <CustomDropdown
          value={type}
          onChange={setType}
          options={toolTypes}
          ariaLabel="도구 유형"
          className="w-full md:w-40"
        />
      </div>

      {/* 카테고리 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map(item => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
              category === item
                ? 'bg-blue-600 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* 추천 도구 */}
      {defaultView && (
        <section className="mt-10">
          <h2 className="mb-1 text-lg font-semibold text-slate-900">추천 도구</h2>

          <p className="mb-5 text-sm text-slate-500">업무에 바로 활용해 볼 만한 도구를 소개해요.</p>

          {renderCards(recommended)}
        </section>
      )}

      {/* 전체 도구 */}
      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              전체 도구 <span className="text-blue-600">{filtered.length}</span>
            </h2>

            <p className="mt-1 text-sm text-slate-500">현재 조건에 맞는 도구 목록입니다.</p>
          </div>

          <CustomDropdown
            value={sort}
            onChange={setSort}
            options={['추천순', '이름순']}
            ariaLabel="정렬 방식"
            className="w-32"
          />
        </div>

        {filtered.length > 0 ? (
          renderCards(filtered)
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-16 text-center text-sm text-slate-500">
            검색 조건에 맞는 도구가 없습니다.
          </div>
        )}
      </section>

      <ToolDetailModal tool={selectedTool} onClose={() => setSelectedTool(null)} />
    </main>
  );
}
