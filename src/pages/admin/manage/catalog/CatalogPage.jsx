import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  GripVertical,
  LayoutGrid,
  Pencil,
  Plus,
  Tags,
  Trash2,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchHeader from '../../../../components/search/SearchHeader.jsx';
import AiStoreActionButton from '../../../user/aistore/components/AiStoreActionButton.jsx';
import AiStoreConfirmModal from '../../../user/aistore/components/AiStoreConfirmModal.jsx';
import { catalogItems } from '../data.js';
import { StatusBadge } from '../components.jsx';
import {
  getCatalogCategories,
  getCatalogSections,
  saveCatalogCategories,
  saveCatalogSections,
} from './catalogStore.js';

const tabs = ['홈 진열', '카테고리'];

function OrderButtons({ index, length, onMove }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      {[
        { label: '위로 이동', Icon: ArrowUp, disabled: index === 0, to: index - 1 },
        { label: '아래로 이동', Icon: ArrowDown, disabled: index === length - 1, to: index + 1 },
      ].map(({ label, Icon, disabled, to }) => (
        <button
          key={label}
          type="button"
          disabled={disabled}
          onClick={() => onMove(index, to)}
          aria-label={label}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-25"
        >
          <Icon size={16} />
        </button>
      ))}
    </span>
  );
}

export default function CatalogPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('홈 진열');
  const [search, setSearch] = useState('');
  const [sections, setSections] = useState(getCatalogSections);
  const [categories, setCategories] = useState(getCatalogCategories);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryDraft, setCategoryDraft] = useState({ name: '', tags: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const keyword = search.trim().toLowerCase();
  const visibleSections = sections.filter(section =>
    `${section.name} ${section.description} ${section.label}`.toLowerCase().includes(keyword)
  );
  const visibleCategories = categories.filter(category =>
    `${category.name} ${category.tags}`.toLowerCase().includes(keyword)
  );
  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        categories.map(category => [
          category.id,
          catalogItems.filter(item => item.category === category.name).length,
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
  const saveCategories = next => {
    setCategories(next);
    saveCatalogCategories(next);
  };
  const updateCategory = (id, changes) => {
    saveCategories(categories.map(item => (item.id === id ? { ...item, ...changes } : item)));
  };
  const startCategoryEdit = category => {
    setEditingCategoryId(category.id);
    setCategoryDraft({ name: category.name, tags: category.tags });
  };
  const cancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setCategoryDraft({ name: '', tags: '' });
  };
  const saveCategoryEdit = () => {
    const name = categoryDraft.name.trim();
    const tags = categoryDraft.tags.trim();
    if (!name) return;

    if (editingCategoryId === 'new') {
      saveCategories([...categories, { id: `category-${Date.now()}`, name, tags, active: true }]);
    } else {
      saveCategories(
        categories.map(item => (item.id === editingCategoryId ? { ...item, name, tags } : item))
      );
    }
    cancelCategoryEdit();
  };

  return (
    <div className="space-y-5">
      <SearchHeader
        value={search}
        onSearchChange={setSearch}
        placeholder={
          tab === '홈 진열' ? '진열 영역 이름 또는 설명 검색' : '카테고리 또는 태그 검색'
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
                cancelCategoryEdit();
              }}
              aria-pressed={tab === item}
              className={`inline-flex h-8 shrink-0 items-center rounded-full px-4 text-sm transition-colors ${tab === item ? 'bg-[#ededed] font-medium text-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      {tab === '홈 진열' ? (
        <section>
          <div className="divide-y divide-slate-100 border-y border-slate-200">
            {visibleSections.map((section, index) => (
              <article key={section.id} className="group flex min-h-24 items-center gap-3 py-3">
                <GripVertical size={18} className="hidden shrink-0 text-slate-300 sm:block" />
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <LayoutGrid size={20} />
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/manage/catalog/${section.id}`)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <strong className="text-[15px] font-semibold text-slate-900">
                      {section.name}
                    </strong>
                    <span className="text-xs font-medium text-blue-600">{section.label}</span>
                  </span>
                  <span className="mt-1 block truncate text-sm text-slate-500">
                    {section.description}
                  </span>
                  <span className="mt-1.5 block text-xs text-slate-400">
                    도구 {section.toolIds.length}개 · 최대 {section.limit}개
                  </span>
                </button>
                <StatusBadge>{section.active ? '게시 중' : '숨김'}</StatusBadge>
                {!keyword && (
                  <OrderButtons
                    index={index}
                    length={sections.length}
                    onMove={(from, to) =>
                      move(sections, setSections, saveCatalogSections, from, to)
                    }
                  />
                )}
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
            {!visibleSections.length && (
              <p className="py-16 text-center text-sm text-slate-400">
                검색 조건에 맞는 진열 영역이 없습니다.
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
                setEditingCategoryId('new');
                setCategoryDraft({ name: '', tags: '' });
              }}
            >
              카테고리 추가
            </AiStoreActionButton>
          </div>
          <div className="divide-y divide-slate-100 border-y border-slate-200">
            {editingCategoryId === 'new' && (
              <article className="flex items-center gap-3 py-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                  <Tags size={18} />
                </span>
                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(10rem,0.7fr)_minmax(16rem,1.3fr)]">
                  <input
                    value={categoryDraft.name}
                    onChange={event =>
                      setCategoryDraft(current => ({ ...current, name: event.target.value }))
                    }
                    placeholder="카테고리 이름"
                    aria-label="새 카테고리 이름"
                    autoFocus
                    className="h-10 min-w-0 rounded-lg border border-blue-300 px-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <input
                    value={categoryDraft.tags}
                    onChange={event =>
                      setCategoryDraft(current => ({ ...current, tags: event.target.value }))
                    }
                    placeholder="연결 태그를 쉼표로 구분해 입력"
                    aria-label="새 카테고리 연결 태그"
                    className="h-10 min-w-0 rounded-lg border border-slate-200 px-3 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <AiStoreActionButton
                  variant="secondary"
                  size="compact"
                  icon={X}
                  onClick={cancelCategoryEdit}
                >
                  취소
                </AiStoreActionButton>
                <AiStoreActionButton
                  size="compact"
                  icon={Check}
                  disabled={!categoryDraft.name.trim()}
                  onClick={saveCategoryEdit}
                >
                  추가
                </AiStoreActionButton>
              </article>
            )}
            {visibleCategories.map(category => (
              <article key={category.id} className="flex items-center gap-3 py-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                  <Tags size={18} />
                </span>
                {editingCategoryId === category.id ? (
                  <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(10rem,0.7fr)_minmax(16rem,1.3fr)]">
                    <input
                      value={categoryDraft.name}
                      onChange={event =>
                        setCategoryDraft(current => ({ ...current, name: event.target.value }))
                      }
                      aria-label="카테고리 이름 수정"
                      autoFocus
                      className="h-10 min-w-0 rounded-lg border border-blue-300 px-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <input
                      value={categoryDraft.tags}
                      onChange={event =>
                        setCategoryDraft(current => ({ ...current, tags: event.target.value }))
                      }
                      aria-label="연결 태그 수정"
                      className="h-10 min-w-0 rounded-lg border border-slate-200 px-3 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                ) : (
                  <div className="grid min-w-0 flex-1 gap-1 sm:grid-cols-[minmax(10rem,0.7fr)_minmax(16rem,1.3fr)] sm:items-center sm:gap-4">
                    <strong className="truncate text-sm font-semibold text-slate-800">
                      {category.name}
                    </strong>
                    <span className="truncate text-sm text-slate-500">
                      {category.tags || '연결 태그 없음'}
                    </span>
                  </div>
                )}
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
                {editingCategoryId === category.id ? (
                  <>
                    <AiStoreActionButton
                      variant="secondary"
                      size="compact"
                      icon={X}
                      onClick={cancelCategoryEdit}
                    >
                      취소
                    </AiStoreActionButton>
                    <AiStoreActionButton
                      size="compact"
                      icon={Check}
                      disabled={!categoryDraft.name.trim()}
                      onClick={saveCategoryEdit}
                    >
                      저장
                    </AiStoreActionButton>
                  </>
                ) : (
                  <>
                    <AiStoreActionButton
                      variant="secondary"
                      size="compact"
                      icon={Pencil}
                      onClick={() => startCategoryEdit(category)}
                    >
                      수정
                    </AiStoreActionButton>
                    <AiStoreActionButton
                      variant="secondary"
                      size="compact"
                      icon={Trash2}
                      onClick={() => setDeleteTarget(category)}
                    >
                      삭제
                    </AiStoreActionButton>
                  </>
                )}
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
        open={Boolean(deleteTarget)}
        title="카테고리를 삭제하시겠습니까?"
        confirmLabel="삭제"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          saveCategories(categories.filter(item => item.id !== deleteTarget.id));
          if (editingCategoryId === deleteTarget.id) cancelCategoryEdit();
          setDeleteTarget(null);
        }}
      >
        <strong className="font-semibold text-slate-900">{deleteTarget?.name}</strong> 카테고리와
        연결 태그가 관리 목록에서 제거됩니다.
      </AiStoreConfirmModal>
    </div>
  );
}
