import { useMemo, useState } from 'react';
import { ArrowLeft, GripVertical, Plus, Search, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { catalogItems } from '../data.js';
import AiStoreActionButton from '../../../user/aistore/components/AiStoreActionButton.jsx';
import AiStoreConfirmModal from '../../../user/aistore/components/AiStoreConfirmModal.jsx';
import StoreToolIcon from '../../../user/aistore/components/StoreToolIcon.jsx';
import { getDeletedAppIds } from '../../../user/aistore/data/manageStore.js';
import { deleteCatalogSection, getCatalogSections, updateCatalogSection } from './catalogStore.js';

function ToolRow({ tool, automatic, dragging, onDragStart, onDragEnter, onDragEnd, onRemove }) {
  const iconTool = { ...tool, id: tool.storeId ?? tool.id };
  return (
    <article
      draggable={!automatic}
      onDragStart={event => {
        if (automatic) return;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', tool.id);
        onDragStart();
      }}
      onDragEnter={() => {
        if (!automatic) onDragEnter();
      }}
      onDragOver={event => {
        if (!automatic) event.preventDefault();
      }}
      onDrop={event => {
        if (!automatic) event.preventDefault();
      }}
      onDragEnd={onDragEnd}
      className={`group flex min-h-[76px] items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition hover:border-slate-100 hover:bg-[#f5f5f5] hover:shadow-sm ${
        automatic ? '' : 'cursor-grab active:cursor-grabbing'
      } ${dragging ? 'border-slate-200 bg-[#f5f5f5] opacity-60 shadow-sm' : ''}`}
    >
      {!automatic && (
        <span
          className="grid h-9 w-7 shrink-0 place-items-center rounded-lg text-slate-400 group-hover:text-blue-500"
          title="카드를 드래그하여 순서 변경"
        >
          <GripVertical size={18} />
        </span>
      )}
      <StoreToolIcon tool={iconTool} small />
      <div className="min-w-0 flex-1">
        <strong className="block truncate text-sm font-semibold text-slate-900">{tool.name}</strong>
        <span className="mt-1 block truncate text-xs text-slate-500">
          {tool.type} · {tool.storeCategory || tool.category} · v{tool.version}
        </span>
      </div>
      {!automatic && (
        <button
          type="button"
          onClick={() => onRemove(tool.id)}
          aria-label={`${tool.name} 제외`}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
        >
          <X size={16} />
        </button>
      )}
    </article>
  );
}

export default function CatalogDetailPage() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const isCreating = sectionId === 'new';
  const sourceSection = getCatalogSections().find(item => item.id === sectionId);
  const [section, setSection] = useState(() =>
    isCreating
      ? {
          id: `home-section-${Date.now()}`,
          name: '',
          description: '',
          limit: 6,
          toolIds: [],
        }
      : sourceSection
  );
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [draggedToolId, setDraggedToolId] = useState(null);
  const deletedIds = getDeletedAppIds();
  const availableTools = useMemo(
    () =>
      catalogItems.filter(
        item =>
          item.publication === '게시 중' &&
          !deletedIds.includes(item.id) &&
          !deletedIds.includes(item.storeId)
      ),
    [deletedIds]
  );

  if (!section) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-semibold text-slate-900">진열 영역을 찾을 수 없습니다.</h1>
        <Link
          to="/admin/manage/catalog"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          스토어 진열 관리로 돌아가기
        </Link>
      </div>
    );
  }

  const selectedTools = section.toolIds
    .map(id => availableTools.find(tool => tool.id === id))
    .filter(Boolean);
  const keyword = query.trim().toLowerCase();
  const candidates = availableTools.filter(
    tool =>
      !section.toolIds.includes(tool.id) &&
      (!keyword || `${tool.name} ${tool.type} ${tool.category}`.toLowerCase().includes(keyword))
  );
  const update = changes => {
    setSaved(false);
    setSaveError('');
    setSection(current => ({ ...current, ...changes }));
  };
  const moveToolTo = targetId => {
    if (!draggedToolId || draggedToolId === targetId) return;
    const from = section.toolIds.indexOf(draggedToolId);
    const to = section.toolIds.indexOf(targetId);
    if (from < 0 || to < 0) return;
    const next = [...section.toolIds];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    update({ toolIds: next });
  };
  const addTool = id => {
    if (section.toolIds.length >= section.limit) return;
    update({ toolIds: [...section.toolIds, id] });
  };

  return (
    <div className="mx-auto w-full max-w-4xl pb-14 pt-6 text-slate-900">
      <Link
        to="/admin/manage/catalog"
        className="inline-flex h-9 items-center gap-2 rounded-lg pr-3 text-sm font-medium text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} /> 스토어 진열 관리로 돌아가기
      </Link>

      <header className="py-8 sm:py-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {isCreating ? '홈 콘텐츠 추가' : section.name}
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            {isCreating
              ? '홈에 표시할 콘텐츠 정보와 도구를 설정합니다.'
              : '진열 영역의 정보와 포함할 도구의 순서를 설정합니다.'}
          </p>
        </div>
      </header>

      <section className="border-t border-slate-200 py-9">
        <h2 className="text-lg font-bold">영역 정보</h2>
        <div className="mt-5 grid gap-5">
          <label className="text-sm font-medium text-slate-700">
            영역 이름
            <input
              value={section.name}
              onChange={event => update({ name: event.target.value })}
              placeholder="홈 콘텐츠 이름을 입력하세요."
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            설명
            <textarea
              value={section.description}
              onChange={event => update({ description: event.target.value })}
              className="mt-2 min-h-24 w-full resize-y rounded-lg border border-slate-200 px-3.5 py-3 text-sm leading-6 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>
      </section>

      <section className="border-t border-slate-200 py-9">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">진열 도구</h2>
            <p className="mt-1 text-sm text-slate-500">
              {section.automatic
                ? '최근 승인된 도구를 기준으로 자동 구성됩니다.'
                : '표시할 도구와 노출 순서를 설정합니다.'}
            </p>
          </div>
          <span className="text-sm font-medium text-slate-500">
            {selectedTools.length}/{section.limit}
          </span>
        </div>
        {section.automatic && (
          <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-700">
            자동 구성 영역은 도구를 직접 추가하거나 제외할 수 없습니다.
          </p>
        )}
        <div className="mt-4 grid gap-2">
          {selectedTools.map(tool => (
            <ToolRow
              key={tool.id}
              tool={tool}
              automatic={section.automatic}
              dragging={draggedToolId === tool.id}
              onDragStart={() => setDraggedToolId(tool.id)}
              onDragEnter={() => moveToolTo(tool.id)}
              onDragEnd={() => setDraggedToolId(null)}
              onRemove={id => update({ toolIds: section.toolIds.filter(item => item !== id) })}
            />
          ))}
        </div>
      </section>

      {!section.automatic && (
        <section className="border-t border-slate-200 py-9">
          <h2 className="text-lg font-bold">도구 추가</h2>
          <label className="relative mt-5 block">
            <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="게시 중인 도구 검색"
              className="h-11 w-full rounded-lg bg-slate-100 pr-4 pl-11 text-sm outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <div className="mt-3 max-h-72 divide-y divide-slate-100 overflow-y-auto border-y border-slate-200">
            {candidates.map(tool => (
              <div key={tool.id} className="flex min-h-16 items-center gap-3 py-2.5">
                <StoreToolIcon tool={{ ...tool, id: tool.storeId ?? tool.id }} small />
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-semibold">{tool.name}</strong>
                  <span className="mt-1 block truncate text-xs text-slate-500">
                    {tool.type} · {tool.storeCategory || tool.category}
                  </span>
                </div>
                <AiStoreActionButton
                  size="compact"
                  variant="secondary"
                  icon={Plus}
                  disabled={section.toolIds.length >= section.limit}
                  onClick={() => addTool(tool.id)}
                >
                  추가
                </AiStoreActionButton>
              </div>
            ))}
            {!candidates.length && (
              <p className="py-10 text-center text-sm text-slate-400">
                추가할 수 있는 도구가 없습니다.
              </p>
            )}
          </div>
        </section>
      )}

      <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-slate-200 bg-white/95 py-4 backdrop-blur">
        {!isCreating && section.id !== 'promotions' && (
          <AiStoreActionButton variant="danger" size="large" onClick={() => setDeleteOpen(true)}>
            홈 콘텐츠 삭제
          </AiStoreActionButton>
        )}
        {saved && (
          <span role="status" className="text-sm font-medium text-emerald-600">
            저장되었습니다.
          </span>
        )}
        {saveError && (
          <span role="alert" className="text-sm font-medium text-red-600">
            {saveError}
          </span>
        )}
        <AiStoreActionButton
          size="large"
          className="ml-auto"
          onClick={() => {
            const name = section.name.trim();
            if (!name) {
              setSaveError('홈 콘텐츠 이름을 입력해 주세요.');
              return;
            }
            updateCatalogSection({
              ...section,
              name,
              description: section.description.trim(),
              limit: section.id === 'promotions' ? section.limit : 6,
            });
            if (isCreating) {
              navigate('/admin/manage/catalog');
              return;
            }
            setSaved(true);
          }}
        >
          {isCreating ? '홈 콘텐츠 추가' : '변경사항 저장'}
        </AiStoreActionButton>
      </div>

      <AiStoreConfirmModal
        open={deleteOpen}
        title="홈 콘텐츠를 삭제하시겠습니까?"
        confirmLabel="삭제"
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteCatalogSection(section.id);
          navigate('/admin/manage/catalog');
        }}
      >
        <strong className="font-semibold text-slate-900">{section.name}</strong> 홈 콘텐츠와 진열
        설정이 삭제됩니다.
      </AiStoreConfirmModal>
    </div>
  );
}
