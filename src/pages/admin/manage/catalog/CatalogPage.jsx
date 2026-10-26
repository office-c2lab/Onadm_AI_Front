import { useMemo, useState } from 'react';
import { ChevronRight, GripVertical, LayoutGrid, Plus, Tags } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchHeader from '../../../../components/search/SearchHeader.jsx';
import AiStoreActionButton from '../../../user/aistore/components/AiStoreActionButton.jsx';
import AiStoreConfirmModal from '../../../user/aistore/components/AiStoreConfirmModal.jsx';
import { catalogItems } from '../data.js';
import {
  getCatalogCategories,
  getCatalogSections,
  saveCatalogCategories,
  saveCatalogSections,
} from './catalogStore.js';

const tabs = ['배너 관리', '홈 진열', '카테고리'];

export default function CatalogPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState(() => location.state?.catalogTab ?? '홈 진열');
  const [search, setSearch] = useState('');
  const [sections, setSections] = useState(getCatalogSections);
  const [draggedSectionId, setDraggedSectionId] = useState(null);
  const [categories, setCategories] = useState(getCatalogCategories);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState({ name: '', tags: '' });
  const [categoryError, setCategoryError] = useState('');
  const keyword = search.trim().toLowerCase();
  const visibleSections = sections.filter(section =>
    `${section.name} ${section.description}`.toLowerCase().includes(keyword)
  );
  const displayedSections =
    tab === '배너 관리'
      ? visibleSections.filter(section => section.id === 'promotions')
      : visibleSections.filter(section => section.id !== 'promotions');
  const visibleCategories = categories.filter(category =>
    `${category.name} ${category.tags}`.toLowerCase().includes(keyword)
  );
  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        categories.map(category => [
          category.id,
          catalogItems.filter(item => item.category === (category.sourceName || category.name))
            .length,
        ])
      ),
    [categories]
  );

  const move = (items, setItems, saveItems, from, to) => {
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    saveItems(next);
  };
  const moveSectionTo = targetId => {
    if (!draggedSectionId || draggedSectionId === targetId) return;
    const from = sections.findIndex(item => item.id === draggedSectionId);
    const to = sections.findIndex(item => item.id === targetId);
    if (from < 0 || to < 0) return;
    move(sections, setSections, saveCatalogSections, from, to);
    setDraggedSectionId(targetId);
  };
  const saveCategories = next => {
    setCategories(next);
    saveCatalogCategories(next);
  };
  const updateCategory = (id, changes) => {
    saveCategories(categories.map(item => (item.id === id ? { ...item, ...changes } : item)));
  };
  const closeCategoryModal = () => {
    setAddCategoryOpen(false);
    setCategoryDraft({ name: '', tags: '' });
    setCategoryError('');
  };
  const addCategory = () => {
    const name = categoryDraft.name.trim();
    const tags = categoryDraft.tags.trim();
    if (!name) {
      setCategoryError('카테고리 이름을 입력해 주세요.');
      return;
    }
    saveCategories([
      ...categories,
      { id: `category-${Date.now()}`, name, sourceName: name, tags, active: true },
    ]);
    closeCategoryModal();
  };

  return (
    <div className="space-y-5">
      <SearchHeader
        value={search}
        onSearchChange={setSearch}
        placeholder={
          tab === '배너 관리'
            ? '배너 이름 또는 설명 검색'
            : tab === '홈 진열'
              ? '진열 영역 이름 또는 설명 검색'
              : '카테고리 또는 태그 검색'
        }
        ariaLabel="스토어 진열 관리 검색"
      />

      <div className="flex flex-wrap items-center gap-3">
        <nav className="flex gap-1 overflow-x-auto" aria-label="스토어 진열 관리 영역">
          {tabs.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setTab(item);
                setSearch('');
                closeCategoryModal();
              }}
              aria-pressed={tab === item}
              className={`inline-flex h-8 shrink-0 items-center rounded-full px-4 text-sm transition-colors ${tab === item ? 'bg-[#ededed] font-medium text-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      {tab !== '카테고리' ? (
        <section>
          <div className="divide-y divide-slate-100 border-y border-slate-200">
            {displayedSections.map(section => (
              <article
                key={section.id}
                onDragOver={event => {
                  if (tab === '홈 진열' && !keyword) event.preventDefault();
                }}
                onDrop={event => {
                  if (tab !== '홈 진열') return;
                  event.preventDefault();
                  moveSectionTo(section.id);
                }}
                className={`group flex min-h-24 items-center gap-3 py-3 transition-opacity ${draggedSectionId === section.id ? 'opacity-50' : ''}`}
              >
                {tab === '홈 진열' && (
                  <span
                    draggable={!keyword}
                    onDragStart={event => {
                      setDraggedSectionId(section.id);
                      event.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => setDraggedSectionId(null)}
                    className={`hidden h-9 w-7 shrink-0 place-items-center rounded-lg text-slate-300 sm:grid ${keyword ? 'cursor-default opacity-40' : 'cursor-grab hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing'}`}
                    title={
                      keyword ? '검색 중에는 순서를 변경할 수 없습니다.' : '드래그하여 순서 변경'
                    }
                  >
                    <GripVertical size={18} />
                  </span>
                )}
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <LayoutGrid size={20} />
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/manage/catalog/${section.id}`)}
                  className="min-w-0 flex-1 text-left"
                >
                  <strong className="block text-[15px] font-semibold text-slate-900">
                    {section.name}
                  </strong>
                  <span className="mt-1 block truncate text-sm text-slate-500">
                    {section.description}
                  </span>
                  <span className="mt-1.5 block text-xs text-slate-400">
                    도구 {section.toolIds.length}개 · 최대 {section.limit}개
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/manage/catalog/${section.id}`)}
                  aria-label={`${section.name} 편집`}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                >
                  <ChevronRight size={18} />
                </button>
              </article>
            ))}
            {!displayedSections.length && (
              <p className="py-16 text-center text-sm text-slate-400">
                {tab === '배너 관리'
                  ? '검색 조건에 맞는 배너가 없습니다.'
                  : '검색 조건에 맞는 진열 영역이 없습니다.'}
              </p>
            )}
          </div>
        </section>
      ) : (
        <section>
          <div className="mb-3 flex justify-end">
            <AiStoreActionButton
              size="small"
              icon={Plus}
              onClick={() => {
                setAddCategoryOpen(true);
                setCategoryDraft({ name: '', tags: '' });
                setCategoryError('');
              }}
            >
              카테고리 추가
            </AiStoreActionButton>
          </div>
          <div className="divide-y divide-slate-100 border-y border-slate-200">
            {visibleCategories.map(category => (
              <article key={category.id} className="flex items-center gap-3 py-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                  <Tags size={18} />
                </span>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/admin/manage/catalog/category/${category.id}`, {
                      state: { catalogTab: '카테고리' },
                    })
                  }
                  className="grid min-w-0 flex-1 gap-1 text-left sm:grid-cols-[minmax(10rem,0.7fr)_minmax(16rem,1.3fr)] sm:items-center sm:gap-4"
                >
                  <strong className="truncate text-sm font-semibold text-slate-800">
                    {category.name}
                  </strong>
                  <span className="truncate text-sm text-slate-500">
                    {category.tags || '연결 태그 없음'}
                  </span>
                </button>
                <span className="hidden shrink-0 text-xs text-slate-500 md:block">
                  {categoryCounts[category.id]}개
                </span>
                <label className="flex shrink-0 cursor-pointer items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">
                    {category.active ? '노출' : '숨김'}
                  </span>
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={category.active}
                    onChange={event =>
                      updateCategory(category.id, { active: event.target.checked })
                    }
                    aria-label={`${category.name} 노출`}
                  />
                  <span className="relative h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-blue-600 after:absolute after:top-1 after:left-1 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
                </label>
                <ChevronRight size={18} className="shrink-0 text-slate-400" aria-hidden="true" />
              </article>
            ))}
            {!visibleCategories.length && (
              <p className="py-16 text-center text-sm text-slate-400">
                검색 조건에 맞는 카테고리나 태그가 없습니다.
              </p>
            )}
          </div>
        </section>
      )}

      <AiStoreConfirmModal
        open={addCategoryOpen}
        title="카테고리 추가"
        confirmLabel="추가"
        confirmVariant="primary"
        error={categoryError}
        onClose={closeCategoryModal}
        onConfirm={addCategory}
      >
        <div className="grid gap-4">
          <label className="text-sm font-medium text-slate-700">
            카테고리 이름
            <input
              value={categoryDraft.name}
              onChange={event => {
                setCategoryDraft(current => ({ ...current, name: event.target.value }));
                if (categoryError) setCategoryError('');
              }}
              placeholder="카테고리 이름을 입력하세요."
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            연결 태그
            <input
              value={categoryDraft.tags}
              onChange={event =>
                setCategoryDraft(current => ({ ...current, tags: event.target.value }))
              }
              placeholder="예: 문서 작성, 회의·요약, 번역"
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>
      </AiStoreConfirmModal>
    </div>
  );
}
