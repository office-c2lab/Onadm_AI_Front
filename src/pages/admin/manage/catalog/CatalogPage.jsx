import { useEffect, useRef, useState } from 'react';
import { ChevronRight, GripVertical, LayoutGrid, MoreVertical, Plus, Tags } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchHeader from '../../../../components/search/SearchHeader.jsx';
import AiStoreActionButton from '../../../user/aistore/components/AiStoreActionButton.jsx';
import AiStoreConfirmModal from '../../../user/aistore/components/AiStoreConfirmModal.jsx';
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
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openCategoryMenuId, setOpenCategoryMenuId] = useState(null);
  const categoryMenuRef = useRef(null);
  const [categoryDraft, setCategoryDraft] = useState({ name: '', description: '' });
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
    `${category.name} ${category.description}`.toLowerCase().includes(keyword)
  );

  useEffect(() => {
    if (!openCategoryMenuId) return undefined;
    const closeOnOutside = event => {
      if (!categoryMenuRef.current?.contains(event.target)) setOpenCategoryMenuId(null);
    };
    const closeOnEscape = event => {
      if (event.key === 'Escape') setOpenCategoryMenuId(null);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [openCategoryMenuId]);
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
  const closeCategoryModal = () => {
    setAddCategoryOpen(false);
    setEditingCategoryId(null);
    setCategoryDraft({ name: '', description: '' });
    setCategoryError('');
  };
  const saveCategory = () => {
    const name = categoryDraft.name.trim();
    const description = categoryDraft.description.trim();
    if (!name) {
      setCategoryError('카테고리 이름을 입력해 주세요.');
      return;
    }
    if (editingCategoryId) {
      saveCategories(
        categories.map(item =>
          item.id === editingCategoryId ? { ...item, name, description } : item
        )
      );
    } else {
      saveCategories([
        ...categories,
        { id: `category-${Date.now()}`, name, sourceName: name, description, active: true },
      ]);
    }
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
              : '카테고리 이름 또는 설명 검색'
        }
        ariaLabel="스토어 진열 관리 검색"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
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
        {tab === '카테고리' && (
          <AiStoreActionButton
            icon={Plus}
            onClick={() => {
              setAddCategoryOpen(true);
              setEditingCategoryId(null);
              setCategoryDraft({ name: '', description: '' });
              setCategoryError('');
            }}
          >
            카테고리 추가
          </AiStoreActionButton>
        )}
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
          <div className="grid gap-2 md:grid-cols-2">
            {visibleCategories.map(category => (
              <article
                key={category.id}
                className={`group relative flex min-h-[82px] min-w-0 items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition hover:border-slate-100 hover:bg-[#f5f5f5] hover:shadow-sm ${openCategoryMenuId === category.id ? 'z-40' : 'hover:z-10 focus-within:z-20'}`}
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/admin/manage/catalog/category/${category.id}`, {
                      state: { catalogTab: '카테고리' },
                    })
                  }
                  aria-label={`${category.name} 상세 보기`}
                  className="absolute inset-0 z-0 cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                />
                <span className="pointer-events-none relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                  <Tags size={19} />
                </span>
                <span className="pointer-events-none relative z-10 min-w-0 flex-1">
                  <strong className="block truncate text-base font-semibold text-slate-900">
                    {category.name}
                  </strong>
                  <span className="mt-1 block truncate text-sm text-slate-500">
                    {category.description || '설명 없음'}
                  </span>
                </span>
                <div
                  ref={openCategoryMenuId === category.id ? categoryMenuRef : undefined}
                  className="relative z-20 shrink-0"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenCategoryMenuId(current =>
                        current === category.id ? null : category.id
                      )
                    }
                    aria-label={`${category.name} 관리 메뉴`}
                    aria-haspopup="menu"
                    aria-expanded={openCategoryMenuId === category.id}
                    className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {openCategoryMenuId === category.id && (
                    <div
                      role="menu"
                      className="absolute right-0 top-10 z-50 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() =>
                          navigate(`/admin/manage/catalog/category/${category.id}`, {
                            state: { catalogTab: '카테고리' },
                          })
                        }
                        className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        상세 보기
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenCategoryMenuId(null);
                          setEditingCategoryId(category.id);
                          setCategoryDraft({
                            name: category.name,
                            description: category.description,
                          });
                          setCategoryError('');
                        }}
                        className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenCategoryMenuId(null);
                          setDeleteTarget(category);
                        }}
                        className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
            {!visibleCategories.length && (
              <p className="py-16 text-center text-sm text-slate-400 md:col-span-2">
                검색 조건에 맞는 카테고리나 태그가 없습니다.
              </p>
            )}
          </div>
        </section>
      )}

      <AiStoreConfirmModal
        open={addCategoryOpen || Boolean(editingCategoryId)}
        title={editingCategoryId ? '카테고리 수정' : '카테고리 추가'}
        confirmLabel={editingCategoryId ? '저장' : '추가'}
        confirmVariant="primary"
        error={categoryError}
        onClose={closeCategoryModal}
        onConfirm={saveCategory}
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
            설명
            <textarea
              value={categoryDraft.description}
              onChange={event =>
                setCategoryDraft(current => ({ ...current, description: event.target.value }))
              }
              placeholder="카테고리 설명을 입력하세요."
              className="mt-2 min-h-24 w-full resize-y rounded-lg border border-slate-200 px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>
      </AiStoreConfirmModal>

      <AiStoreConfirmModal
        open={Boolean(deleteTarget)}
        title="카테고리를 삭제하시겠습니까?"
        confirmLabel="삭제"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          saveCategories(categories.filter(item => item.id !== deleteTarget.id));
          setDeleteTarget(null);
        }}
      >
        <strong className="font-semibold text-slate-900">{deleteTarget?.name}</strong> 카테고리가
        관리 목록에서 제거됩니다.
      </AiStoreConfirmModal>
    </div>
  );
}
