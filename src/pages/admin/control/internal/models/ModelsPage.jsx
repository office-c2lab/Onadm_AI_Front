import { useMemo, useState } from 'react';
import { Eye, EyeOff, Plus, X } from 'lucide-react';

import CustomDropdown from '../../../../../components/dropdown/CustomDropdown.jsx';
import geminiIcon from '../../../../../assets/icons/gemini-color.svg';
import openaiIcon from '../../../../../assets/icons/openai.svg';
import AppButton from '../../external/components/AppButton.jsx';
import AppSearchField from '../../external/components/AppSearchField.jsx';
import AppToggle from '../../external/components/AppToggle.jsx';
import FixedPaginationBar from '../../external/components/FixedPaginationBar.jsx';
import TableListHeader from '../../external/components/TableListHeader.jsx';
import PageLayout from '../../components/PageLayout.jsx';
import {
  MonitoringIconButtonTooltip,
  MonitoringResetButton,
} from '../../external/components/monitoring/MonitoringListComponents.jsx';
import {
  monitoringTableCellClass,
  monitoringTableClass,
  monitoringTableBodyClass,
  monitoringTableHeadClass,
  monitoringTableHeaderCellClass,
  monitoringTableHeaderRowClass,
  monitoringTableRowClass,
  monitoringTableSurfaceClass,
} from '../../external/components/monitoring/monitoringTableStyles.js';
import '../../external/garim.css';

import { providers, models, prompts } from '../data.js';
const PAGE_SIZE = 5;
const tabs = [
  { id: 'providers', label: '제공자 / API Key' },
  { id: 'models', label: '모델 · 단가' },
];

const providerIcons = { openai: openaiIcon, google: geminiIcon, deepseek: null };

function formatDateTime24(value) {
  const match = String(value ?? '').match(
    /^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(오전|오후)\s*(\d{1,2}):(\d{2})$/
  );
  if (!match) return value;

  const [, year, month, day, period, rawHour, minute] = match;
  const hour = (Number(rawHour) % 12) + (period === '오후' ? 12 : 0);
  const pad = number => String(number).padStart(2, '0');

  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${minute}`;
}

function Badge({ children, tone = 'green' }) {
  const tones = {
    green: 'bg-emerald-50 text-emerald-600',
    gray: 'bg-slate-100 text-slate-500',
    blue: 'bg-blue-50 text-blue-600',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function ProviderIdentity({ icon, name }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-50">
        <ProviderIcon icon={icon} />
      </span>
      <p className="min-w-0 truncate font-bold text-slate-900">{name}</p>
    </div>
  );
}

function ProviderIcon({ icon }) {
  return icon ? (
    <img src={icon} alt="" className="h-5 w-5" />
  ) : (
    <span className="grid h-5 w-5 place-items-center rounded-md bg-[#596CFF] text-[0.72rem] font-black text-white">
      D
    </span>
  );
}

function activateOnRowKeyDown(event, onActivate) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onActivate();
  }
}

function TableShell({ title, count, columns, widths, children }) {
  return (
    <section className={monitoringTableSurfaceClass}>
      <TableListHeader title={title} count={count} />
      <div className="overflow-x-auto">
        <table aria-label={title} className={`${monitoringTableClass} min-w-[62rem]`}>
          <colgroup>
            {widths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <thead className={monitoringTableHeadClass}>
            <tr className={monitoringTableHeaderRowClass}>
              {columns.map(column => (
                <th
                  key={column}
                  scope="col"
                  className={`${monitoringTableHeaderCellClass} whitespace-nowrap ${
                    ['상태', '사용 설정'].includes(column) ? '!text-center' : ''
                  }`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={monitoringTableBodyClass}>{children}</tbody>
        </table>
      </div>
    </section>
  );
}

function ProviderTable({ rows, totalCount, onManage, onToggleStatus }) {
  return (
    <TableShell
      title="제공자 목록"
      count={totalCount}
      columns={['제공자', 'ENDPOINT', 'API KEY', '최초 등록일', '상태']}
      widths={['25%', '35%', '15%', '16%', '9%']}
    >
      {rows.map((provider, rowIndex) => (
        <tr
          key={provider.id}
          tabIndex={0}
          aria-label={`${provider.name} 제공자 관리 열기`}
          onClick={() => onManage(provider)}
          onKeyDown={event => activateOnRowKeyDown(event, () => onManage(provider))}
          className={monitoringTableRowClass({ striped: rowIndex % 2 === 1, interactive: true })}
        >
          <td className={monitoringTableCellClass(rowIndex)}>
            <ProviderIdentity icon={provider.icon} name={provider.name} />
          </td>
          <td className={monitoringTableCellClass(rowIndex, 'min-w-0')}>
            <div className="truncate" title={provider.endpoint}>
              {provider.endpoint}
            </div>
          </td>
          <td className={monitoringTableCellClass(rowIndex)}>
            <Badge>{provider.key}</Badge>
          </td>
          <td className={monitoringTableCellClass(rowIndex)}>
            <span className="whitespace-nowrap">{formatDateTime24(provider.modifiedAt)}</span>
          </td>
          <td className={monitoringTableCellClass(rowIndex, 'text-center')}>
            <span
              className="inline-flex"
              onClick={event => event.stopPropagation()}
              onKeyDown={event => event.stopPropagation()}
            >
              <AppToggle
                checked={provider.status === '활성'}
                onChange={() => onToggleStatus(provider.id)}
                ariaLabel={`${provider.name} 상태`}
              />
            </span>
          </td>
        </tr>
      ))}
    </TableShell>
  );
}

function ModelTable({ rows, totalCount, onManage, onToggleStatus }) {
  return (
    <TableShell
      title="모델 목록"
      count={totalCount}
      columns={['모델', '단가 (1K)', '점검 결과', '수정일', '사용 설정']}
      widths={['27%', '30%', '17%', '15%', '11%']}
    >
      {rows.map((model, rowIndex) => (
        <tr
          key={model[0]}
          tabIndex={0}
          aria-label={`${model[0]} 모델 관리 열기`}
          onClick={() => onManage(model)}
          onKeyDown={event => activateOnRowKeyDown(event, () => onManage(model))}
          className={monitoringTableRowClass({ striped: rowIndex % 2 === 1, interactive: true })}
        >
          <td className={monitoringTableCellClass(rowIndex)}>
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-50">
                <ProviderIcon icon={providerIcons[model[2]]} />
              </span>
              <div>
                <p className="font-bold text-slate-900">{model[0]}</p>
                <p className="mt-1 text-xs text-slate-500">{model[1]}</p>
              </div>
            </div>
          </td>
          <td className={monitoringTableCellClass(rowIndex)}>{model[3]}</td>
          <td className={monitoringTableCellClass(rowIndex)}>
            <Badge>{model[4]}</Badge>
          </td>
          <td className={monitoringTableCellClass(rowIndex, 'whitespace-nowrap')}>
            {formatDateTime24(model[6])}
          </td>
          <td className={monitoringTableCellClass(rowIndex, 'text-center')}>
            <span
              className="inline-flex"
              onClick={event => event.stopPropagation()}
              onKeyDown={event => event.stopPropagation()}
            >
              <AppToggle
                checked={model[5] === '사용'}
                onChange={() => onToggleStatus(model[0])}
                ariaLabel={`${model[0]} 사용 설정`}
              />
            </span>
          </td>
        </tr>
      ))}
    </TableShell>
  );
}

function PromptTable({ rows, totalCount, onManage, onToggleStatus }) {
  return (
    <TableShell
      title="프롬프트 목록"
      count={totalCount}
      columns={['이름', '본문 미리보기', '수정일', '상태']}
      widths={['25%', '50%', '15%', '10%']}
    >
      {rows.map((prompt, rowIndex) => (
        <tr
          key={prompt[0]}
          tabIndex={0}
          aria-label={`${prompt[0]} 프롬프트 관리 열기`}
          onClick={() => onManage(prompt)}
          onKeyDown={event => activateOnRowKeyDown(event, () => onManage(prompt))}
          className={monitoringTableRowClass({ striped: rowIndex % 2 === 1, interactive: true })}
        >
          <td className={monitoringTableCellClass(rowIndex, 'font-bold text-slate-900')}>
            {prompt[0]}
          </td>
          <td className={monitoringTableCellClass(rowIndex)}>{prompt[1]}</td>
          <td className={monitoringTableCellClass(rowIndex, 'whitespace-nowrap')}>
            {formatDateTime24(prompt[3])}
          </td>
          <td className={monitoringTableCellClass(rowIndex, 'text-center')}>
            <span
              className="inline-flex"
              onClick={event => event.stopPropagation()}
              onKeyDown={event => event.stopPropagation()}
            >
              <AppToggle
                checked={prompt[2] === '활성'}
                onChange={() => onToggleStatus(prompt[0])}
                ariaLabel={`${prompt[0]} 상태`}
              />
            </span>
          </td>
        </tr>
      ))}
    </TableShell>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function TextField({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="h-[var(--app-control-lg)] w-full rounded-[var(--app-radius-lg)] border border-slate-200 bg-white px-[var(--app-pad-md)] text-[clamp(0.82rem,0.95vw,0.9rem)] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#8BC6FF] focus:ring-[clamp(0.2rem,0.32vw,0.25rem)] focus:ring-[#DEEEFF]"
    />
  );
}

function ManagementModal({ tab, item, mode, onClose }) {
  const [showKey, setShowKey] = useState(false);
  const isCreate = mode === 'create';
  const [draft, setDraft] = useState(() => ({
    name: tab === 'providers' ? (item?.name ?? '') : Array.isArray(item) ? item[0] : '',
    endpoint: tab === 'providers' ? (item?.endpoint ?? '') : '',
    apiKey: tab === 'providers' && !isCreate ? (item?.key ?? '') : '',
    inputPrice: '',
    outputPrice: '',
    body: tab === 'prompts' && Array.isArray(item) ? item[1] : '',
  }));
  const updateDraft = (field, value) => setDraft(current => ({ ...current, [field]: value }));
  const title =
    tab === 'providers'
      ? `제공자 ${isCreate ? '등록' : '관리'}`
      : tab === 'models'
        ? `모델 ${isCreate ? '등록' : '관리'}`
        : `시스템 프롬프트 ${isCreate ? '등록' : '관리'}`;

  return (
    <div className="app-modal-stage z-[100]">
      <button type="button" className="app-modal-backdrop" aria-label="닫기" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="app-modal-panel app-modal-panel--lg">
        <header className="app-modal-header flex items-start justify-between border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-400">연결 및 운영에 필요한 정보를 설정합니다.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="app-modal-body space-y-4">
          {tab === 'providers' ? (
            <>
              <Field label="제공자 이름">
                <TextField
                  value={draft.name}
                  onChange={event => updateDraft('name', event.target.value)}
                  placeholder="제공자 이름"
                />
              </Field>
              <Field label="Endpoint">
                <TextField
                  value={draft.endpoint}
                  onChange={event => updateDraft('endpoint', event.target.value)}
                  placeholder="https://api.example.com/v1"
                />
              </Field>
              <Field label="API Key">
                <div className="relative">
                  <TextField
                    type={showKey ? 'text' : 'password'}
                    value={draft.apiKey}
                    onChange={event => updateDraft('apiKey', event.target.value)}
                    placeholder="API Key 입력"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(value => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
            </>
          ) : null}
          {tab === 'models' ? (
            <>
              <Field label="모델 ID">
                <TextField
                  value={draft.name}
                  onChange={event => updateDraft('name', event.target.value)}
                  placeholder="모델 ID 입력"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="입력 단가 (1K)">
                  <TextField
                    value={draft.inputPrice}
                    onChange={event => updateDraft('inputPrice', event.target.value)}
                    placeholder="0"
                  />
                </Field>
                <Field label="출력 단가 (1K)">
                  <TextField
                    value={draft.outputPrice}
                    onChange={event => updateDraft('outputPrice', event.target.value)}
                    placeholder="0"
                  />
                </Field>
              </div>
            </>
          ) : null}
          {tab === 'prompts' ? (
            <>
              <Field label="프롬프트 이름">
                <TextField
                  value={draft.name}
                  onChange={event => updateDraft('name', event.target.value)}
                  placeholder="이름 입력"
                />
              </Field>
              <Field label="프롬프트 본문">
                <textarea
                  value={draft.body}
                  onChange={event => updateDraft('body', event.target.value)}
                  placeholder="시스템 프롬프트 입력"
                  className="min-h-40 w-full resize-y rounded-xl border border-slate-200 p-3.5 text-sm text-slate-700 outline-none focus:border-[#8BC6FF] focus:ring-4 focus:ring-[#DEEEFF]"
                />
              </Field>
            </>
          ) : null}
        </div>
        <footer className="app-modal-footer flex justify-end gap-2 border-t border-slate-200">
          <AppButton type="button" variant="secondary" onClick={onClose} className="h-10 px-5">
            취소
          </AppButton>
          <AppButton onClick={onClose} className="h-10 px-5">
            저장
          </AppButton>
        </footer>
      </div>
    </div>
  );
}

export default function ModelsPage({ initialTab = 'providers' }) {
  const isPromptPage = initialTab === 'prompts';
  const [providerRows, setProviderRows] = useState(() =>
    providers.map(provider => ({ ...provider }))
  );
  const [modelRows, setModelRows] = useState(() => models.map(model => [...model]));
  const [promptRows, setPromptRows] = useState(() => prompts.map(prompt => [...prompt]));
  const [activeTab, setActiveTab] = useState(initialTab);
  const [status, setStatus] = useState('전체 상태');
  const [providerFilter, setProviderFilter] = useState('전체 제공자');
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProviders = useMemo(
    () =>
      providerRows.filter(
        provider =>
          (status === '전체 상태' || provider.status === status) &&
          (!query ||
            `${provider.name} ${provider.code} ${provider.endpoint}`
              .toLowerCase()
              .includes(query.toLowerCase()))
      ),
    [providerRows, query, status]
  );
  const filteredModels = useMemo(
    () =>
      modelRows.filter(
        model =>
          (status === '전체 설정' || model[5] === status) &&
          (providerFilter === '전체 제공자' || model[1] === providerFilter) &&
          (!query || `${model[0]} ${model[1]}`.toLowerCase().includes(query.toLowerCase()))
      ),
    [modelRows, providerFilter, query, status]
  );
  const filteredPrompts = useMemo(
    () =>
      promptRows.filter(
        prompt =>
          (status === '전체 상태' || prompt[2] === status) &&
          (!query || `${prompt[0]} ${prompt[1]}`.toLowerCase().includes(query.toLowerCase()))
      ),
    [promptRows, query, status]
  );
  const activeRows =
    activeTab === 'providers'
      ? filteredProviders
      : activeTab === 'models'
        ? filteredModels
        : filteredPrompts;
  const totalPages = Math.max(1, Math.ceil(activeRows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const visibleRows = activeRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const changeTab = tab => {
    setActiveTab(tab);
    setStatus(tab === 'models' ? '전체 설정' : '전체 상태');
    setProviderFilter('전체 제공자');
    setQueryInput('');
    setQuery('');
    setCurrentPage(1);
  };
  const handleReset = () => {
    setStatus(activeTab === 'models' ? '전체 설정' : '전체 상태');
    setProviderFilter('전체 제공자');
    setQueryInput('');
    setQuery('');
    setCurrentPage(1);
  };
  const openCreate = () => setModal({ mode: 'create', item: null });
  const openManage = item => setModal({ mode: 'manage', item });
  const handleToggleProviderStatus = providerId => {
    setProviderRows(current =>
      current.map(provider =>
        provider.id === providerId
          ? { ...provider, status: provider.status === '활성' ? '비활성' : '활성' }
          : provider
      )
    );
  };
  const handleToggleModelStatus = modelId => {
    setModelRows(current =>
      current.map(model => {
        if (model[0] !== modelId) return model;

        const nextModel = [...model];
        nextModel[5] = model[5] === '사용' ? '사용 안 함' : '사용';
        return nextModel;
      })
    );
  };
  const handleTogglePromptStatus = promptId => {
    setPromptRows(current =>
      current.map(prompt => {
        if (prompt[0] !== promptId) return prompt;

        const nextPrompt = [...prompt];
        nextPrompt[2] = prompt[2] === '활성' ? '비활성' : '활성';
        return nextPrompt;
      })
    );
  };

  return (
    <div className="garim-external-root min-h-full bg-white text-[#111827]">
      <div className="bg-white/95">
        {!isPromptPage ? (
          <nav
            className="mx-auto flex w-full max-w-[88rem] items-center justify-center gap-4 overflow-x-auto border-b border-[#E2E8F0] px-[var(--app-page-x)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="모델 설정 유형"
          >
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => changeTab(tab.id)}
                className={`relative flex h-12 shrink-0 items-center justify-center border-b-2 px-3 text-sm font-black transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#075DF6] text-[#075DF6]'
                    : 'border-transparent text-slate-600 hover:text-[#075DF6]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        ) : null}
      </div>
      <PageLayout gapClassName="gap-[var(--app-gap-md)]">
        <section
          className={`grid items-end gap-[var(--app-gap-sm)] md:grid-cols-2 ${activeTab === 'models' ? 'xl:grid-cols-[9rem_11rem_minmax(0,1fr)_5.25rem_3rem_9rem]' : 'xl:grid-cols-[9rem_minmax(0,1fr)_5.25rem_3rem_9rem]'}`}
        >
          <label>
            <span className="mb-1.5 block text-xs font-bold text-slate-700">
              {activeTab === 'models' ? '사용 설정' : '상태'}
            </span>
            <CustomDropdown
              value={status}
              onChange={value => {
                setStatus(value);
                setCurrentPage(1);
              }}
              options={
                activeTab === 'models'
                  ? ['전체 설정', '사용', '사용 안 함']
                  : ['전체 상태', '활성', '비활성']
              }
              ariaLabel="상태 선택"
              className="[&>button]:h-[var(--app-control-lg)] [&>button]:min-h-0 [&>button]:rounded-[var(--app-radius-lg)] [&>button]:text-sm [&>button]:font-semibold"
            />
          </label>
          {activeTab === 'models' ? (
            <label>
              <span className="mb-1.5 block text-xs font-bold text-slate-700">제공자</span>
              <CustomDropdown
                value={providerFilter}
                onChange={value => {
                  setProviderFilter(value);
                  setCurrentPage(1);
                }}
                options={['전체 제공자', 'OpenAI', 'Google Gemini', 'DeepSeek']}
                ariaLabel="제공자 선택"
                className="[&>button]:h-[var(--app-control-lg)] [&>button]:min-h-0 [&>button]:rounded-[var(--app-radius-lg)] [&>button]:text-sm [&>button]:font-semibold"
              />
            </label>
          ) : null}
          <label className="min-w-0">
            <span className="mb-1.5 block text-xs font-bold text-slate-700">
              {activeTab === 'providers'
                ? '제공자 검색'
                : activeTab === 'models'
                  ? '모델 검색'
                  : '프롬프트 검색'}
            </span>
            <AppSearchField
              value={queryInput}
              onChange={event => setQueryInput(event.target.value)}
              placeholder={
                activeTab === 'prompts'
                  ? '이름 또는 본문 검색...'
                  : activeTab === 'models'
                    ? '모델명 검색...'
                    : '이름 또는 유형 검색...'
              }
            />
          </label>
          <AppButton
            onClick={() => {
              setQuery(queryInput.trim());
              setCurrentPage(1);
            }}
            className="h-[var(--app-control-lg)]"
          >
            검색
          </AppButton>
          <MonitoringIconButtonTooltip label="초기화">
            <MonitoringResetButton
              onClick={handleReset}
              widthClass="w-[var(--app-control-lg)] min-w-[var(--app-control-lg)]"
              aria-label="초기화"
            />
          </MonitoringIconButtonTooltip>
          <AppButton onClick={openCreate} className="h-[var(--app-control-lg)] px-3">
            <Plus className="h-4 w-4" />
            <span>
              {activeTab === 'providers'
                ? '제공자 등록'
                : activeTab === 'models'
                  ? '모델 등록'
                  : '프롬프트 등록'}
            </span>
          </AppButton>
        </section>
        {activeTab === 'providers' ? (
          <ProviderTable
            rows={visibleRows}
            totalCount={filteredProviders.length}
            onManage={openManage}
            onToggleStatus={handleToggleProviderStatus}
          />
        ) : null}
        {activeTab === 'models' ? (
          <ModelTable
            rows={visibleRows}
            totalCount={filteredModels.length}
            onManage={openManage}
            onToggleStatus={handleToggleModelStatus}
          />
        ) : null}
        {activeTab === 'prompts' ? (
          <PromptTable
            rows={visibleRows}
            totalCount={filteredPrompts.length}
            onManage={openManage}
            onToggleStatus={handleTogglePromptStatus}
          />
        ) : null}
      </PageLayout>
      <FixedPaginationBar
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      {modal ? (
        <ManagementModal
          tab={activeTab}
          item={modal.item}
          mode={modal.mode}
          onClose={() => setModal(null)}
        />
      ) : null}
    </div>
  );
}
