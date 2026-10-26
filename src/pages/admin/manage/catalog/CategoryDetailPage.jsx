import { useMemo, useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import SearchHeader from '../../../../components/search/SearchHeader.jsx';
import StoreToolIcon from '../../../user/aistore/components/StoreToolIcon.jsx';
import { getDeletedAppIds } from '../../../user/aistore/data/manageStore.js';
import { StatusBadge } from '../components.jsx';
import { catalogItems } from '../data.js';
import { getCatalogCategories } from './catalogStore.js';

export default function CategoryDetailPage() {
  const { categoryId } = useParams();
  const [query, setQuery] = useState('');
  const category = getCatalogCategories().find(item => item.id === categoryId);
  const deletedIds = getDeletedAppIds();
  const tools = useMemo(() => {
    if (!category) return [];
    const keyword = query.trim().toLowerCase();
    return catalogItems.filter(tool => {
      const belongsToCategory = tool.category === (category.sourceName || category.name);
      const isAvailable = !deletedIds.includes(tool.id) && !deletedIds.includes(tool.storeId);
      const matchesKeyword =
        !keyword ||
        `${tool.name} ${tool.type} ${tool.storeCategory || tool.category} ${tool.version}`
          .toLowerCase()
          .includes(keyword);
      return belongsToCategory && isAvailable && matchesKeyword;
    });
  }, [category, deletedIds, query]);

  if (!category) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-semibold text-slate-900">카테고리를 찾을 수 없습니다.</h1>
        <Link
          to="/admin/manage/catalog"
          state={{ catalogTab: '카테고리' }}
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          스토어 진열 관리로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full pb-12 text-slate-900">
      <SearchHeader
        value={query}
        onSearchChange={setQuery}
        placeholder="카테고리 내 도구 검색"
        ariaLabel={`${category.name} 도구 검색`}
      />

      <header className="px-4 py-3 text-center sm:py-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {category.name}
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-base leading-7 text-slate-600">
          {category.description || '설명 없음'}
        </p>
      </header>

      <div className="flex min-h-10 items-center">
        <Link
          to="/admin/manage/catalog"
          state={{ catalogTab: '카테고리' }}
          className="inline-flex h-9 items-center gap-2 rounded-lg pr-3 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={16} /> 카테고리 목록으로 돌아가기
        </Link>
      </div>

      <section aria-label={`${category.name} 도구 목록`}>
        {tools.length ? (
          <div className="grid gap-2 md:grid-cols-2">
            {tools.map(tool => (
              <article
                key={tool.id}
                className="flex min-h-[82px] min-w-0 flex-wrap items-center gap-4 rounded-xl border border-transparent px-3 py-3"
              >
                <div className="flex min-w-[180px] flex-1 items-center gap-4">
                  <StoreToolIcon tool={{ ...tool, id: tool.storeId ?? tool.id }} small />
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-base font-semibold text-slate-900">
                      {tool.name}
                    </strong>
                    <span className="mt-1 block truncate text-sm text-slate-500">
                      {tool.type} · {tool.storeCategory || tool.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                    <Download size={14} className="text-blue-600" />
                    {(tool.downloadCount ?? tool.users ?? 0).toLocaleString('ko-KR')}회
                  </span>
                  <StatusBadge>{tool.publication === '게시 중' ? '게시 중' : '숨김'}</StatusBadge>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-slate-400">
            {query.trim()
              ? '검색 조건에 맞는 도구가 없습니다.'
              : '이 카테고리에 등록된 도구가 없습니다.'}
          </div>
        )}
      </section>
    </div>
  );
}
