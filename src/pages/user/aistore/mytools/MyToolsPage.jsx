import { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import SearchHeader from '../../../../components/search/SearchHeader.jsx';
import StoreToolIcon from '../components/StoreToolIcon.jsx';
import ToolInfoModalShell from '../components/ToolInfoModalShell.jsx';
import ToolRegistrationFields from '../components/ToolRegistrationFields.jsx';
import {
  EMPTY_SUPPORT_ENVIRONMENT,
  MAX_SCREENSHOTS,
} from '../components/toolRegistrationConfig.js';
import { useMyTools } from '../data/manageStore.js';
import { addReviewRequest, formatReviewDate } from '../data/reviewRequests.js';

function EditToolModal({ tool, onClose, onSave }) {
  const iconInputRef = useRef(null);
  const screenshotInputRef = useRef(null);
  const [form, setForm] = useState(() => ({
    name: tool.name || '',
    summary: tool.summary || '',
    type: tool.type || 'AI App',
    category: tool.category || '기타',
    description: tool.description || tool.summary || '',
    features: tool.features || '',
    instructions: tool.instructions || '',
    version: tool.version || '1.0.0',
    iconData: tool.iconData || '',
    iconName: tool.iconName || '',
    screenshots: tool.screenshots || [],
    supportEnvironment: {
      ...EMPTY_SUPPORT_ENVIRONMENT,
      ...tool.supportEnvironment,
    },
  }));
  const [error, setError] = useState('');

  const updateForm = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const updateEnvironment = (field, value) => {
    setForm(current => ({
      ...current,
      supportEnvironment: { ...current.supportEnvironment, [field]: value },
    }));
  };

  const selectIcon = file => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('도구 아이콘은 PNG, JPG 또는 WEBP 이미지만 사용할 수 있습니다.');
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

  const selectScreenshots = async fileList => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    if (files.length + form.screenshots.length > MAX_SCREENSHOTS) {
      setError(`화면 이미지는 최대 ${MAX_SCREENSHOTS}장까지 등록할 수 있습니다.`);
      return;
    }
    if (files.some(file => !['image/png', 'image/jpeg', 'image/webp'].includes(file.type))) {
      setError('화면 이미지는 PNG, JPG 또는 WEBP 형식만 사용할 수 있습니다.');
      return;
    }
    try {
      const screenshots = await Promise.all(
        files.map(
          file =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () =>
                resolve({
                  name: file.name,
                  data: typeof reader.result === 'string' ? reader.result : '',
                });
              reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'));
              reader.readAsDataURL(file);
            })
        )
      );
      setForm(current => ({
        ...current,
        screenshots: [...current.screenshots, ...screenshots].slice(0, MAX_SCREENSHOTS),
      }));
      setError('');
    } catch {
      setError('화면 이미지를 불러오지 못했습니다. 다시 선택해 주세요.');
    }
  };

  const submit = event => {
    event.preventDefault();
    if (
      !form.name.trim() ||
      !form.summary.trim() ||
      !form.description.trim() ||
      !form.features.trim() ||
      !form.instructions.trim() ||
      !form.version.trim()
    ) {
      setError('도구 이름, 설명, 주요 기능, 사용 방법, 버전을 입력해 주세요.');
      return;
    }
    if (
      !form.supportEnvironment.audience.trim() ||
      !form.supportEnvironment.operatingSystem.trim() ||
      !form.supportEnvironment.browser.trim()
    ) {
      setError('지원 환경의 사용 가능 대상, 운영체제, 브라우저를 입력해 주세요.');
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
      <input
        ref={screenshotInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={event => {
          void selectScreenshots(event.target.files);
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
            <StoreToolIcon tool={tool} small />
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{tool.name}</p>
            {tool.fileName && (
              <p className="mt-1 truncate text-xs text-slate-500">{tool.fileName}</p>
            )}
          </div>
        </div>
        <div className="mt-6">
          <ToolRegistrationFields
            form={form}
            setForm={setForm}
            updateForm={updateForm}
            updateEnvironment={updateEnvironment}
            iconInputRef={iconInputRef}
            screenshotInputRef={screenshotInputRef}
          />
        </div>
      </div>
    </ToolInfoModalShell>
  );
}

export default function MyToolsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { myTools } = useMyTools();
  const [search, setSearch] = useState('');
  const [editingTool, setEditingTool] = useState(() =>
    myTools.find(tool => tool.id === location.state?.editToolId)
  );
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
        {filteredTools.length > 0 ? (
          <div className="grid gap-2">
            {filteredTools.map(tool => (
              <article
                key={tool.id}
                className="group relative flex min-h-[82px] min-w-0 items-center gap-4 rounded-xl border border-transparent px-3 py-3 transition hover:z-20 hover:border-slate-100 hover:bg-white hover:shadow-sm focus-within:z-20 focus-within:border-slate-100 focus-within:bg-white"
              >
                <button
                  type="button"
                  onClick={() => navigate(`/user/aistore/mytools/${tool.id}`)}
                  aria-label={`${tool.name} 상세 정보 보기`}
                  className="absolute inset-0 z-0 cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                />
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <StoreToolIcon tool={tool} small />
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-left text-base font-semibold text-slate-900">
                      {tool.name}
                    </strong>
                    <span className="mt-1 block truncate text-sm text-slate-500">
                      {tool.category}
                    </span>
                  </div>
                </div>
                <span className="hidden shrink-0 items-center gap-1.5 text-xs text-slate-600 md:inline-flex">
                  <Download size={16} className="text-blue-600" aria-hidden="true" />
                  <span className="text-slate-500">
                    다운로드{' '}
                    <strong className="font-semibold text-slate-800">
                      {(tool.downloadCount ?? tool.usageCount ?? 0).toLocaleString('ko-KR')}회
                    </strong>
                  </span>
                </span>
                <span className="hidden shrink-0 text-xs text-slate-500 xl:inline">
                  등록 {tool.createdAt || tool.updatedAt || '—'} ·{' '}
                  <strong className="font-semibold text-blue-600">v{tool.version}</strong>
                </span>
              </article>
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-slate-500">
            {search.trim() ? '조건에 맞는 승인 도구가 없습니다.' : '승인된 도구가 없습니다.'}
          </p>
        )}
      </section>

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
