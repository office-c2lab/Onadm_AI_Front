import React, { useMemo, useState } from 'react';
import { Bookmark, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  publishedTools,
  useFavorites,
} from '../data/manageStore.js';

import {
  ToolCard,
  ToolDetailModal,
} from '../components/ManageToolCard/ManageToolCard.jsx';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();

  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState(null);

  // 저장된 도구 필터링
  const savedTools = useMemo(() => {
    return publishedTools.filter((tool) => {
      const isFavorite = favorites.includes(tool.id);

      const matchesSearch =
        `${tool.name} ${tool.summary} ${tool.maker}`
          .toLowerCase()
          .includes(keyword.trim().toLowerCase());

      return isFavorite && matchesSearch;
    });
  }, [favorites, keyword]);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8">
      {/* 페이지 헤더 */}
      <p className="text-xs font-semibold tracking-wider text-blue-600">
        MANAGE
      </p>

      <h1 className="mt-2 text-2xl font-bold text-slate-900">
        즐겨찾기
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        자주 사용하는 도구를 모아서 빠르게 찾아보세요.
      </p>

      {/* 즐겨찾기 요약 */}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50 px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-blue-600">
            <Bookmark size={21} />
          </span>

          <div>
            <p className="font-semibold text-slate-900">
              나만의 도구 모음
            </p>

            <p className="mt-1 text-xs text-slate-500">
              스토어에서 저장한 도구가 이곳에 표시됩니다.
            </p>
          </div>
        </div>

        <span className="rounded-md bg-white px-3 py-2 text-xs font-medium text-blue-600">
          {favorites.length}개 저장됨
        </span>
      </div>

      {/* 목록 헤더 */}
      <div className="mt-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            저장한 도구{' '}
            <span className="text-blue-600">
              {savedTools.length}
            </span>
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            즐겨찾기한 도구 목록입니다.
          </p>
        </div>

        {/* 검색 */}
        <label className="flex h-10 min-w-52 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-400">
          <Search size={17} />

          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="저장한 도구 검색"
            aria-label="즐겨찾기 검색"
            className="w-full text-sm text-slate-900 outline-none"
          />
        </label>
      </div>

      {/* 즐겨찾기 카드 */}
      {savedTools.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {savedTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              favorite
              onToggleFavorite={toggleFavorite}
              onDetail={setSelected}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-16 text-center">
          <Bookmark
            className="mx-auto text-slate-300"
            size={30}
          />

          <p className="mt-4 font-medium text-slate-900">
            {favorites.length
              ? '검색 결과가 없습니다.'
              : '저장한 도구가 없습니다.'}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            스토어에서 마음에 드는 도구를 저장해 보세요.
          </p>

          <button
            type="button"
            onClick={() => navigate('/user/aistore/store')}
            className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            도구 둘러보기
          </button>
        </div>
      )}

      {/* 상세 모달 */}
      <ToolDetailModal
        tool={selected}
        onClose={() => setSelected(null)}
      />
    </main>
  );
}