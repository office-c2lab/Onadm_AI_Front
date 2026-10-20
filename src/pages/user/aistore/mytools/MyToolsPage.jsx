import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bot,
  CalendarDays,
  Code2,
  Database,
  FileText,
  Image as ImageIcon,
  Languages,
  MessageSquareText,
  Plus,
  Search,
  Workflow,
} from 'lucide-react';
import CustomDropdown from '../../../../components/dropdown/CustomDropdown.jsx';
import SearchHeader from '../../../../components/search/SearchHeader.jsx';
import { ToolDetailModal } from '../components/ManageToolCard/ManageToolCard.jsx';
import ToolInfoModalShell from '../components/ToolInfoModalShell.jsx';
import { categories, toolTypes, useMyTools } from '../data/manageStore.js';
import { addReviewRequest, formatReviewDate } from '../data/reviewRequests.js';

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
  if (tool.iconData) {
    return (
      <img
        src={tool.iconData}
        alt=""
        className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 bg-white object-cover"
        aria-hidden="true"
      />
    );
  }

  const [Icon, color] =
    toolVisuals[tool.id] ||
    (tool.type === 'AI Agent'
      ? [Bot, 'bg-violet-50 text-violet-600']
      : tool.type === '자동화 도구'
        ? [Workflow, 'bg-orange-50 text-orange-600']
        : [FileText, 'bg-blue-50 text-blue-600']);

  return (
    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${color}`}>
      <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
    </span>
  );
}

function EditToolModal({ tool, onClose, onSave }) {
  const iconInputRef = useRef(null);
  const [form, setForm] = useState(() => ({
    name: tool.name || '',
    summary: tool.summary || '',
    type: tool.type || 'AI App',
    category: tool.category || '기타',
    description: tool.description || tool.summary || '',
    instructions: tool.instructions || '',
    version: tool.version || '1.0.0',
    iconData: tool.iconData || '',
    iconName: tool.iconName || '',
  }));
  const [error, setError] = useState('');
  const typeOptions = [...new Set([form.type, ...toolTypes.filter(type => type !== '전체 유형')])];
  const categoryOptions = [
    ...new Set([form.category, ...categories.filter(category => category !== '전체'), '기타']),
  ];

  const updateForm = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const selectIcon = file => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('도구 아이콘은 PNG, JPG 또는 WEBP 이미지만 사용할 수 있습니다.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('도구 아이콘은 2MB 이하의 이미지를 선택해 주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm(current => ({
        ...current,
        iconName: file.name,
        iconData: typeof reader.result === 'string' ? reader.result : '',
      }));
      setError('');
    };
    reader.onerror = () => setError('아이콘 이미지를 불러오지 못했습니다. 다시 선택해 주세요.');
    reader.readAsDataURL(file);
  };

  const submit = event => {
    event.preventDefault();
    if (
      !form.name.trim() ||
      !form.summary.trim() ||
      !form.description.trim() ||
      !form.version.trim()
    ) {
      setError('도구 이름, 한 줄 설명, 상세 설명, 버전을 입력해 주세요.');
      return;
    }
    try {
      onSave(tool.id, {
        ...form,
        name: form.name.trim(),
        summary: form.summary.trim(),
        description: form.description.trim(),
        version: form.version.trim(),
      });
    } catch {
      setError('업데이트 요청을 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.');
    }
  };

  return (
    <ToolInfoModalShell
      title="도구 등록 정보"
      description="등록된 도구의 정보를 확인하고 업데이트할 수 있습니다."
      onClose={onClose}
      onSubmit={submit}
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            업데이트 저장
          </button>
        </div>
      }
    >
      <input
        ref={iconInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={event => {
          selectIcon(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      {error && (
        <p
          role="alert"
          className="mx-5 mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 sm:mx-6"
        >
          {error}
        </p>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          {form.iconData ? (
            <img
              src={form.iconData}
              alt=""
              className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 bg-white object-cover"
            />
          ) : (
            <MyToolIcon tool={tool} />
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{tool.name}</p>
            {tool.fileName && (
              <p className="mt-1 truncate text-xs text-slate-500">{tool.fileName}</p>
            )}
          </div>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            도구 이름 <span className="text-red-500">*</span>
            <input
              value={form.name}
              onChange={event => updateForm('name', event.target.value)}
              required
              maxLength={60}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            한 줄 설명 <span className="text-red-500">*</span>
            <input
              value={form.summary}
              onChange={event => updateForm('summary', event.target.value)}
              required
              maxLength={130}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <div className="text-sm font-medium text-slate-700">
            <span>
              도구 유형 <span className="text-red-500">*</span>
            </span>
            <CustomDropdown
              value={form.type}
              options={typeOptions}
              onChange={value => updateForm('type', value)}
              ariaLabel="도구 유형 선택"
              className="mt-2"
            />
          </div>
          <div className="text-sm font-medium text-slate-700">
            <span>
              카테고리 <span className="text-red-500">*</span>
            </span>
            <CustomDropdown
              value={form.category}
              options={categoryOptions}
              onChange={value => updateForm('category', value)}
              ariaLabel="카테고리 선택"
              className="mt-2"
            />
          </div>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            상세 설명 <span className="text-red-500">*</span>
            <textarea
              value={form.description}
              onChange={event => updateForm('description', event.target.value)}
              rows={4}
              required
              className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            사용 방법
            <textarea
              value={form.instructions}
              onChange={event => updateForm('instructions', event.target.value)}
              rows={3}
              className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            버전 <span className="text-red-500">*</span>
            <input
              value={form.version}
              onChange={event => updateForm('version', event.target.value)}
              required
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <div className="text-sm font-medium text-slate-700 sm:col-span-2">
            도구 아이콘 <span className="text-xs font-normal text-slate-400">(선택)</span>
            <button
              type="button"
              onClick={() => iconInputRef.current?.click()}
              className="mt-2 flex w-full items-center gap-3 rounded-lg border border-dashed border-slate-200 px-4 py-3 text-left text-sm font-normal text-slate-500 hover:border-blue-300 hover:bg-blue-50/30"
            >
              {form.iconData ? (
                <img
                  src={form.iconData}
                  alt="업로드한 도구 아이콘 미리보기"
                  className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 bg-white object-cover"
                />
              ) : (
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                  <Plus size={18} aria-hidden="true" />
                </span>
              )}
              <span className="min-w-0 truncate">
                {form.iconName || 'PNG, JPG 또는 WEBP 이미지 (최대 2MB)'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </ToolInfoModalShell>
  );
}

export default function MyToolsPage() {
  const navigate = useNavigate();
  const { myTools } = useMyTools();
  const [search, setSearch] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);
  const [editingTool, setEditingTool] = useState(null);
  const approvedTools = useMemo(
    () => myTools.filter(tool => tool.status === '승인 완료'),
    [myTools]
  );

  const filteredTools = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return approvedTools.filter(tool => {
      return `${tool.name} ${tool.summary} ${tool.category} ${tool.type}`
        .toLowerCase()
        .includes(keyword);
    });
  }, [approvedTools, search]);

  return (
    <div className="w-full">
      <h1 className="sr-only">내 도구</h1>
      <SearchHeader
        value={search}
        onSearchChange={setSearch}
        placeholder="내 도구 검색"
        ariaLabel="내 도구 검색"
      />

      <section className="mt-4" aria-label="승인된 도구 목록">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-bold text-slate-900">승인된 도구</h2>
            <p className="mt-1 text-sm text-slate-500">
              승인 완료되어 운영 중인 도구를 관리할 수 있습니다.
            </p>
          </div>
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid gap-2">
            {filteredTools.map(tool => (
              <article
                key={tool.id}
                className="group relative flex min-h-[82px] min-w-0 items-center gap-4 rounded-xl border border-transparent px-3 py-3 transition hover:z-20 hover:border-slate-100 hover:bg-white hover:shadow-sm focus-within:z-20 focus-within:border-slate-100 focus-within:bg-white"
              >
                <button
                  type="button"
                  onClick={() => setSelectedTool(tool)}
                  aria-label={`${tool.name} 상세 정보 보기`}
                  className="absolute inset-0 z-0 cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                />
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <MyToolIcon tool={tool} />
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <strong className="min-w-0 max-w-full shrink-0 truncate text-left text-base font-semibold text-slate-900 lg:max-w-[55%]">
                      {tool.name}
                    </strong>
                    <p
                      className="hidden min-w-0 truncate text-xs text-slate-500 lg:block"
                      title={tool.summary}
                    >
                      {tool.summary}
                    </p>
                  </div>
                </div>
                <span className="hidden shrink-0 items-center gap-1.5 text-xs text-slate-600 md:inline-flex">
                  <BarChart3 size={16} className="text-blue-600" aria-hidden="true" />
                  <strong className="font-semibold text-slate-800">
                    {(tool.usageCount ?? 0).toLocaleString('ko-KR')}
                  </strong>
                  <span className="text-slate-400">월 사용</span>
                </span>
                <span className="hidden shrink-0 text-xs text-slate-500 xl:inline">
                  v{tool.version} · 등록 {tool.createdAt || tool.updatedAt || '—'}
                </span>
                <div className="relative z-10 flex shrink-0 items-center">
                  <button
                    type="button"
                    onClick={() => setEditingTool(tool)}
                    className="inline-flex h-8 cursor-pointer items-center rounded-lg bg-blue-50 px-2.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
                  >
                    업데이트
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-slate-500">
            {search.trim() ? '조건에 맞는 승인 도구가 없습니다.' : '승인된 도구가 없습니다.'}
          </p>
        )}
      </section>

      <ToolDetailModal tool={selectedTool} mine onClose={() => setSelectedTool(null)} />
      {editingTool && (
        <EditToolModal
          key={editingTool.id}
          tool={editingTool}
          onClose={() => setEditingTool(null)}
          onSave={(id, changes) => {
            const now = new Date();
            const request = {
              ...changes,
              id: `update-${id}-${now.getTime()}-${Math.random().toString(36).slice(2)}`,
              toolId: id,
              requestType: '업데이트',
              fileName: editingTool.fileName || '',
              size: editingTool.size || '—',
              createdAt: formatReviewDate(now),
              status: '승인 대기',
            };
            addReviewRequest(request);
            setEditingTool(null);
            navigate('/user/aistore/register', { state: { openReviewId: request.id } });
          }}
        />
      )}
    </div>
  );
}
