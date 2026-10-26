import { useMemo, useState } from 'react';
import { ArrowLeft, Download, Pencil, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import StoreToolIcon from '../../../user/aistore/components/StoreToolIcon.jsx';
import AiStoreActionButton from '../../../user/aistore/components/AiStoreActionButton.jsx';
import AiStoreConfirmModal from '../../../user/aistore/components/AiStoreConfirmModal.jsx';
import { getDeletedAppIds } from '../../../user/aistore/data/manageStore.js';
import { SearchField, StatusBadge } from '../components.jsx';
import { catalogItems } from '../data.js';
import { getCatalogCategories, saveCatalogCategories } from './catalogStore.js';

export default function CategoryDetailPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(() =>
    getCatalogCategories().find(item => item.id === categoryId)
  );
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [draft, setDraft] = useState({ name: category?.name ?? '', tags: category?.tags ?? '' });
  const [editError, setEditError] = useState('');
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

  const closeEdit = () => {
    setEditOpen(false);
    setDraft({ name: category?.name ?? '', tags: category?.tags ?? '' });
    setEditError('');
  };
  const saveEdit = () => {
    const name = draft.name.trim();
    const tags = draft.tags.trim();
    if (!name) {
      setEditError('카테고리 이름을 입력해 주세요.');
      return;
    }
    const updated = { ...category, name, tags };
    saveCatalogCategories(
      getCatalogCategories().map(item => (item.id === category.id ? updated : item))
    );
    setCategory(updated);
    setEditOpen(false);
    setEditError('');
  };

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
    <div className="mx-auto w-full max-w-4xl pb-14 pt-6 text-slate-900">
      <Link
        to="/admin/manage/catalog"
        state={{ catalogTab: '카테고리' }}
        className="inline-flex h-9 items-center gap-2 rounded-lg pr-3 text-sm font-medium text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} /> 카테고리 목록으로 돌아가기
      </Link>

      <header className="py-8 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {category.name}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{category.tags || '연결 태그 없음'}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-sm font-semibold text-blue-600">도구 {tools.length}개</span>
            <AiStoreActionButton
              variant="secondary"
              size="small"
              icon={Pencil}
              onClick={() => {
                setDraft({ name: category.name, tags: category.tags });
                setEditOpen(true);
              }}
            >
              수정
            </AiStoreActionButton>
            <AiStoreActionButton
              variant="danger"
              size="small"
              icon={Trash2}
              onClick={() => setDeleteOpen(true)}
            >
              삭제
            </AiStoreActionButton>
          </div>
        </div>
      </header>

      <div className="mx-auto mb-5 flex max-w-xl">
        <SearchField value={query} onChange={setQuery} placeholder="카테고리 내 도구 검색" />
      </div>

      <section aria-label={`${category.name} 도구 목록`}>
        {tools.length ? (
          <div className="grid gap-2 md:grid-cols-2">
            {tools.map(tool => (
              <article
                key={tool.id}
                className="group relative flex min-h-[82px] min-w-0 flex-wrap items-center gap-4 rounded-xl border border-transparent px-3 py-3 transition hover:border-slate-100 hover:bg-[#f5f5f5] hover:shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => navigate(`/admin/manage/apps/${tool.id}`)}
                  aria-label={`${tool.name} 상세 관리`}
                  className="absolute inset-0 cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                />
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
                <div className="relative z-10 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
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
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            연결 태그
            <input
              value={draft.tags}
              onChange={event => setDraft(current => ({ ...current, tags: event.target.value }))}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
        <strong className="font-semibold text-slate-900">{category.name}</strong> 카테고리와 연결
        태그가 관리 목록에서 제거됩니다. 도구 자체는 삭제되지 않습니다.
      </AiStoreConfirmModal>
    </div>
  );
}
