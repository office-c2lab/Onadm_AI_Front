import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Download, MoreVertical } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SearchHeader from '../../../../components/search/SearchHeader.jsx';
import StoreToolIcon from '../../../user/aistore/components/StoreToolIcon.jsx';
import AiStoreConfirmModal from '../../../user/aistore/components/AiStoreConfirmModal.jsx';
import { getDeletedAppIds } from '../../../user/aistore/data/manageStore.js';
import { StatusText } from '../components.jsx';
import { catalogItems } from '../data.js';
import { getCatalogCategories, saveCatalogCategories } from './catalogStore.js';

export default function CategoryDetailPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(() =>
    getCatalogCategories().find(item => item.id === categoryId)
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: category?.name ?? '',
    description: category?.description ?? '',
  });
  const [editError, setEditError] = useState('');
  const menuRef = useRef(null);
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

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnOutside = event => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = event => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

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

  const closeEdit = () => {
    setEditOpen(false);
    setDraft({ name: category.name, description: category.description });
    setEditError('');
  };
  const saveEdit = () => {
    const name = draft.name.trim();
    const description = draft.description.trim();
    if (!name) {
      setEditError('카테고리 이름을 입력해 주세요.');
      return;
    }
    const updated = { ...category, name, description };
    saveCatalogCategories(
      getCatalogCategories().map(item => (item.id === category.id ? updated : item))
    );
    setCategory(updated);
    setEditOpen(false);
    setEditError('');
  };

  return (
    <div className="w-full pb-12 text-slate-900">
      <SearchHeader
        value={query}
        onSearchChange={setQuery}
        placeholder="카테고리 내 도구 검색"
        ariaLabel={`${category.name} 도구 검색`}
      />

      <header className="px-4 py-3 text-center sm:py-4">
        <div ref={menuRef} className="relative inline-block">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {category.name}
          </h1>
          <button
            type="button"
            onClick={() => setMenuOpen(current => !current)}
            aria-label={`${category.name} 관리 메뉴`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="absolute top-1/2 left-full ml-1 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <MoreVertical size={19} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute top-11 left-full z-30 ml-1 w-36 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setDraft({ name: category.name, description: category.description });
                  setEditOpen(true);
                }}
                className="flex h-9 w-full items-center rounded-lg px-2.5 text-sm text-slate-700 hover:bg-slate-100"
              >
                수정
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  setDeleteOpen(true);
                }}
                className="flex h-9 w-full items-center rounded-lg px-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                삭제
              </button>
            </div>
          )}
        </div>
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
                  <StatusText>{tool.publication === '게시 중' ? '게시 중' : '숨김'}</StatusText>
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

      <AiStoreConfirmModal
        open={editOpen}
        title="카테고리 수정"
        confirmLabel="저장"
        confirmVariant="primary"
        error={editError}
        onClose={closeEdit}
        onConfirm={saveEdit}
      >
        <div className="grid gap-4">
          <label className="text-sm font-medium text-slate-700">
            카테고리 이름
            <input
              value={draft.name}
              onChange={event => {
                setDraft(current => ({ ...current, name: event.target.value }));
                if (editError) setEditError('');
              }}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            설명
            <textarea
              value={draft.description}
              onChange={event =>
                setDraft(current => ({ ...current, description: event.target.value }))
              }
              className="mt-2 min-h-24 w-full resize-y rounded-lg border border-slate-200 px-3.5 py-3 text-sm leading-6 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>
      </AiStoreConfirmModal>

      <AiStoreConfirmModal
        open={deleteOpen}
        title="카테고리를 삭제하시겠습니까?"
        confirmLabel="삭제"
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          saveCatalogCategories(getCatalogCategories().filter(item => item.id !== category.id));
          navigate('/admin/manage/catalog', { state: { catalogTab: '카테고리' } });
        }}
      >
        <strong className="font-semibold text-slate-900">{category.name}</strong> 카테고리가 관리
        목록에서 제거됩니다. 도구 자체는 삭제되지 않습니다.
      </AiStoreConfirmModal>
    </div>
  );
}
