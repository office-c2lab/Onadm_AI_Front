import { useMemo, useState } from 'react';
import {
  BarChart3,
  Bot,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Database,
  FileText,
  Image as ImageIcon,
  Languages,
  MessageSquareText,
  MoreHorizontal,
  Search,
  Trash2,
  Workflow,
  X,
} from 'lucide-react';
import SearchHeader from '../../../../components/search/SearchHeader.jsx';
import { ToolDetailModal } from '../components/ManageToolCard/ManageToolCard.jsx';
import { useMyTools } from '../data/manageStore.js';

const PAGE_SIZE = 6;

function todayLocal() {
  const date = new Date();
  const twoDigits = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}.${twoDigits(date.getMonth() + 1)}.${twoDigits(date.getDate())}`;
}

const toolVisuals = {
  'mine-1': [FileText, 'bg-blue-50 text-blue-600'],
  'mine-2': [Database, 'bg-emerald-50 text-emerald-600'],
  'mine-3': [Workflow, 'bg-orange-50 text-orange-600'],
  'mine-4': [Search, 'bg-violet-50 text-violet-600'],
  'mine-5': [MessageSquareText, 'bg-violet-50 text-violet-600'],
  'mine-6': [Workflow, 'bg-orange-50 text-orange-600'],
  'mine-7': [BarChart3, 'bg-emerald-50 text-emerald-600'],
  'mine-8': [Code2, 'bg-indigo-50 text-indigo-600'],
  'mine-9': [ImageIcon, 'bg-amber-50 text-amber-600'],
  'mine-10': [MessageSquareText, 'bg-sky-50 text-sky-600'],
  'mine-11': [Languages, 'bg-cyan-50 text-cyan-600'],
  'mine-12': [CalendarDays, 'bg-purple-50 text-purple-600'],
};

function MyToolIcon({ tool }) {
  const [Icon, color] =
    toolVisuals[tool.id] ||
    (tool.type === 'AI Agent'
      ? [Bot, 'bg-violet-50 text-violet-600']
      : tool.type === '자동화 도구'
        ? [Workflow, 'bg-orange-50 text-orange-600']
        : [FileText, 'bg-blue-50 text-blue-600']);

  return (
    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${color}`}>
      <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
    </span>
  );
}

function StatusBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <CheckCircle2 size={14} aria-hidden="true" />
      승인 완료
    </span>
  );
}

function EditToolModal({ tool, onClose, onSave }) {
  const [name, setName] = useState(tool.name);
  const [summary, setSummary] = useState(tool.summary);
  const [version, setVersion] = useState(tool.version);

  const submit = event => {
    event.preventDefault();
    if (!name.trim() || !summary.trim()) return;
    onSave(tool.id, {
      name: name.trim(),
      summary: summary.trim(),
      version: version.trim() || tool.version,
      updatedAt: todayLocal(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${tool.name} 수정`}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">도구 정보 수정</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            도구 이름
            <input
              value={name}
              onChange={event => setName(event.target.value)}
              required
              maxLength={60}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            한 줄 설명
            <textarea
              value={summary}
              onChange={event => setSummary(event.target.value)}
              required
              maxLength={130}
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            버전
            <input
              value={version}
              onChange={event => setVersion(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function MyToolsPage() {
  const { myTools, updateMyTool, removeMyTools } = useMyTools();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [editingTool, setEditingTool] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [notice, setNotice] = useState('');
  const approvedTools = useMemo(
    () => myTools.filter(tool => tool.status === '승인 완료'),
    [myTools]
  );

  const summaries = [
    {
      key: 'all',
      label: '운영 중인 도구',
      count: approvedTools.length,
      Icon: Boxes,
      color: 'bg-blue-50 text-blue-600',
      card: 'bg-blue-50/60',
    },
    {
      key: 'AI App',
      label: 'AI App',
      count: approvedTools.filter(tool => tool.type === 'AI App').length,
      Icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600',
      card: 'bg-emerald-50/60',
    },
    {
      key: 'AI Agent',
      label: 'AI Agent',
      count: approvedTools.filter(tool => tool.type === 'AI Agent').length,
      Icon: Bot,
      color: 'bg-amber-50 text-amber-600',
      card: 'bg-amber-50/60',
    },
    {
      key: '자동화 도구',
      label: '자동화 도구',
      count: approvedTools.filter(tool => tool.type === '자동화 도구').length,
      Icon: Workflow,
      color: 'bg-rose-50 text-rose-600',
      card: 'bg-rose-50/60',
    },
  ];

  const filteredTools = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return approvedTools.filter(tool => {
      const matchesSearch = `${tool.name} ${tool.summary} ${tool.category} ${tool.type}`
        .toLowerCase()
        .includes(keyword);
      const matchesFilter = filter === 'all' || tool.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [approvedTools, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredTools.length / PAGE_SIZE));
  const activePage = Math.min(page, totalPages);
  const pageTools = filteredTools.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const allPageSelected =
    pageTools.length > 0 && pageTools.every(tool => selectedIds.includes(tool.id));

  const changeFilter = key => {
    setFilter(key);
    setPage(1);
    setSelectedIds([]);
  };

  const changePage = nextPage => {
    setPage(nextPage);
    setSelectedIds([]);
    setOpenMenuId(null);
  };

  const toggleSelected = id => {
    setSelectedIds(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    );
  };

  const removeSelected = ids => {
    if (!window.confirm(`${ids.length}개 도구를 내 도구 목록에서 삭제하시겠습니까?`)) return;
    removeMyTools(ids);
    setSelectedIds([]);
    setOpenMenuId(null);
    setNotice(`${ids.length}개 도구를 삭제했습니다.`);
  };

  return (
    <div className="w-full">
      <h1 className="sr-only">내 도구</h1>
      <SearchHeader
        value={search}
        onSearchChange={value => {
          setSearch(value);
          setPage(1);
          setSelectedIds([]);
        }}
        placeholder="내 도구 검색"
        ariaLabel="내 도구 검색"
      />

      {notice && (
        <p role="status" className="mt-3 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {notice}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="내 도구 현황">
        {summaries.map(item => (
          <button
            key={item.key}
            type="button"
            onClick={() => changeFilter(item.key)}
            aria-pressed={filter === item.key}
            className={`flex min-h-[88px] items-center gap-3 rounded-xl border p-4 text-left transition hover:border-slate-300 ${item.card} ${filter === item.key ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-100'}`}
          >
            <span
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${item.color}`}
            >
              <item.Icon size={21} strokeWidth={1.9} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm text-slate-600">{item.label}</span>
              <strong className="mt-1 block text-xl font-bold text-slate-900">
                {item.count}개
              </strong>
            </span>
          </button>
        ))}
      </div>

      <section className="mt-7" aria-label="승인된 도구 목록">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900">승인된 도구</h2>
            <p className="mt-1 text-sm text-slate-500">
              승인 완료되어 운영 중인 도구를 관리할 수 있습니다.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-1 text-sm text-slate-500">
            {pageTools.length > 0 && (
              <label className="inline-flex cursor-pointer items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={event =>
                    setSelectedIds(event.target.checked ? pageTools.map(tool => tool.id) : [])
                  }
                  className="h-4 w-4 accent-blue-600"
                />
                전체 선택
              </label>
            )}
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => removeSelected(selectedIds)}
                className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
              >
                <Trash2 size={15} aria-hidden="true" />
                선택 삭제
              </button>
            )}
            <span>
              {search.trim() || filter !== 'all'
                ? `검색 결과 ${filteredTools.length}개`
                : `총 ${approvedTools.length}개`}
            </span>
          </div>
        </div>

        {pageTools.length > 0 ? (
          <div className="grid gap-4">
            {pageTools.map(tool => (
              <article
                key={tool.id}
                className={`relative flex min-h-[108px] min-w-0 flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border bg-white p-4 transition hover:shadow-sm ${selectedIds.includes(tool.id) ? 'border-blue-300' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div className="flex min-w-[240px] flex-[1_1_300px] items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(tool.id)}
                    onChange={() => toggleSelected(tool.id)}
                    aria-label={`${tool.name} 선택`}
                    className="h-4 w-4 shrink-0 accent-blue-600"
                  />
                  <MyToolIcon tool={tool} />
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setSelectedTool(tool)}
                      className="block max-w-full cursor-pointer truncate text-left text-base font-semibold text-slate-900 hover:text-blue-600"
                    >
                      {tool.name}
                    </button>
                    <p className="mt-1 truncate text-sm text-slate-500" title={tool.summary}>
                      {tool.summary}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1 text-xs">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                        {tool.category}
                      </span>
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-blue-600">
                        {tool.type}
                      </span>
                    </div>
                  </div>
                </div>
                <StatusBadge />
                <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-slate-600">
                  <BarChart3 size={16} className="text-blue-600" aria-hidden="true" />
                  <strong className="font-semibold text-slate-800">
                    {(tool.usageCount ?? 0).toLocaleString('ko-KR')}
                  </strong>
                  <span className="text-xs text-slate-400">월 사용</span>
                </span>
                <span className="min-w-[150px] shrink-0 text-xs leading-5 text-slate-500">
                  <span className="block">v{tool.version}</span>
                  <span className="block">등록 {tool.createdAt || tool.updatedAt || '—'}</span>
                </span>
                <div className="ml-auto flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingTool(tool)}
                    className="cursor-pointer rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                  >
                    수정
                  </button>
                  <div
                    className="relative"
                    onBlur={event => {
                      if (!event.currentTarget.contains(event.relatedTarget)) setOpenMenuId(null);
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId(current => (current === tool.id ? null : tool.id))
                      }
                      aria-label={`${tool.name} 더보기`}
                      aria-expanded={openMenuId === tool.id}
                      className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                    >
                      <MoreHorizontal size={18} aria-hidden="true" />
                    </button>
                    {openMenuId === tool.id && (
                      <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            setSelectedTool(tool);
                          }}
                          className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                        >
                          상세 보기
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSelected([tool.id])}
                          className="w-full cursor-pointer rounded-md px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-slate-500">
            {search.trim() || filter !== 'all'
              ? '조건에 맞는 승인 도구가 없습니다.'
              : '승인된 도구가 없습니다.'}
          </p>
        )}

        <nav className="mt-4 flex items-center justify-end gap-1" aria-label="내 도구 페이지">
          <button
            type="button"
            onClick={() => changePage(activePage - 1)}
            disabled={activePage === 1}
            aria-label="이전 페이지"
            className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(number => (
            <button
              key={number}
              type="button"
              onClick={() => changePage(number)}
              aria-current={activePage === number ? 'page' : undefined}
              className={`grid h-8 w-8 place-items-center rounded-full text-xs ${activePage === number ? 'bg-blue-600 font-semibold text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {number}
            </button>
          ))}
          <button
            type="button"
            onClick={() => changePage(activePage + 1)}
            disabled={activePage === totalPages}
            aria-label="다음 페이지"
            className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </nav>
      </section>

      <ToolDetailModal tool={selectedTool} mine onClose={() => setSelectedTool(null)} />
      {editingTool && (
        <EditToolModal
          key={editingTool.id}
          tool={editingTool}
          onClose={() => setEditingTool(null)}
          onSave={(id, changes) => {
            updateMyTool(id, changes);
            setEditingTool(null);
            setNotice('도구 정보를 수정했습니다.');
          }}
        />
      )}
    </div>
  );
}
