import { inputClass } from '../../../../../styles/fields.js';
import Badge from '../../../../../components/ui/Badge.jsx';
import DataTable from '../../../../../components/ui/DataTable.jsx';
import DialogLayer from '../../../../../components/ui/DialogLayer.jsx';
import { useMemo, useState } from 'react';
import { Eye, EyeOff, Plus, X } from 'lucide-react';

import CustomDropdown from '../../../../../components/dropdown/CustomDropdown.jsx';
import geminiIcon from '../../../../../assets/icons/gemini-color.svg';
import openaiIcon from '../../../../../assets/icons/openai.svg';
import AppButton from '../../../../../components/ui/Button.jsx';
import AppSearchField from '../../../../../components/ui/SearchField.jsx';
import PageLayout from '../../../../../components/layout/PageLayout.jsx';
import { tableCellClass, tableRowClass, tableSurfaceClass } from '../../../../../styles/table.js';

import { providers, models, prompts } from '../data.js';
const tabs = [
  { id: 'providers', label: '제공자 / API Key' },
  { id: 'models', label: '모델 · 단가' },
];

const providerIcons = { openai: openaiIcon, google: geminiIcon, deepseek: null };

function ProviderIdentity({ icon, name, code }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-50">
        <ProviderIcon icon={icon} />
      </span>
      <div className="min-w-0">
        <p className="truncate font-bold text-slate-900">{name}</p>
        <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-size-0-72rem font-bold text-slate-600">
          {code}
        </span>
      </div>
    </div>
  );
}

function ProviderIcon({ icon }) {
  return icon ? (
    <img src={icon} alt="" className="h-5 w-5" />
  ) : (
    <span className="grid h-5 w-5 place-items-center rounded-md bg-palette-blue-61 text-size-0-72rem font-black text-white">
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

function TableShell({ title, columns, widths, children }) {
  return (
    <section className={tableSurfaceClass}>
      <DataTable label={title} columns={columns} widths={widths} className="min-w-[62rem]">
        {children}
      </DataTable>
    </section>
  );
}

function ProviderTable({ rows, onManage }) {
  return (
    <TableShell
      title="제공자 목록"
      columns={['제공자', 'ENDPOINT', 'API KEY', '상태', '수정일']}
      widths={['24%', '38%', '16%', '9%', '13%']}
    >
      {rows.map((provider, rowIndex) => (
        <tr
          key={provider.id}
          tabIndex={0}
          aria-label={`${provider.name} 제공자 관리 열기`}
          onClick={() => onManage(provider)}
          onKeyDown={event => activateOnRowKeyDown(event, () => onManage(provider))}
          className={tableRowClass({ striped: rowIndex % 2 === 1, interactive: true })}
        >
          <td className={tableCellClass(rowIndex)}>
            <ProviderIdentity icon={provider.icon} name={provider.name} code={provider.code} />
          </td>
          <td className={tableCellClass(rowIndex)}>{provider.endpoint}</td>
          <td className={tableCellClass(rowIndex)}>
            <Badge>{provider.key}</Badge>
          </td>
          <td className={tableCellClass(rowIndex)}>
            <Badge>{provider.status}</Badge>
          </td>
          <td className={tableCellClass(rowIndex)}>{provider.modifiedAt}</td>
        </tr>
      ))}
    </TableShell>
  );
}

function ModelTable({ rows, onManage }) {
  return (
    <TableShell
      title="모델 목록"
      columns={['모델', '단가 (1K)', '점검 결과', '사용 설정', '수정일']}
      widths={['27%', '30%', '17%', '11%', '15%']}
    >
      {rows.map((model, rowIndex) => (
        <tr
          key={model[0]}
          tabIndex={0}
          aria-label={`${model[0]} 모델 관리 열기`}
          onClick={() => onManage(model)}
          onKeyDown={event => activateOnRowKeyDown(event, () => onManage(model))}
          className={tableRowClass({ striped: rowIndex % 2 === 1, interactive: true })}
        >
          <td className={tableCellClass(rowIndex)}>
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
          <td className={tableCellClass(rowIndex)}>{model[3]}</td>
          <td className={tableCellClass(rowIndex)}>
            <Badge>{model[4]}</Badge>
          </td>
          <td className={tableCellClass(rowIndex)}>
            <Badge tone={model[5] === '사용' ? 'green' : 'gray'}>{model[5]}</Badge>
          </td>
          <td className={tableCellClass(rowIndex)}>{model[6]}</td>
        </tr>
      ))}
    </TableShell>
  );
}

function PromptTable({ rows, onManage }) {
  return (
    <TableShell
      title="프롬프트 목록"
      columns={['이름', '본문 미리보기', '상태', '수정일']}
      widths={['25%', '50%', '10%', '15%']}
    >
      {rows.map((prompt, rowIndex) => (
        <tr
          key={prompt[0]}
          tabIndex={0}
          aria-label={`${prompt[0]} 프롬프트 관리 열기`}
          onClick={() => onManage(prompt)}
          onKeyDown={event => activateOnRowKeyDown(event, () => onManage(prompt))}
          className={tableRowClass({ striped: rowIndex % 2 === 1, interactive: true })}
        >
          <td className={tableCellClass(rowIndex, 'font-bold text-slate-900')}>{prompt[0]}</td>
          <td className={tableCellClass(rowIndex)}>{prompt[1]}</td>
          <td className={tableCellClass(rowIndex)}>
            <Badge tone={prompt[2] === '활성' ? 'green' : 'gray'}>{prompt[2]}</Badge>
          </td>
          <td className={tableCellClass(rowIndex)}>{prompt[3]}</td>
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
      className={inputClass}
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
    <DialogLayer onClose={onClose} className="app-modal-stage z-[100]">
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
                  className="min-h-40 w-full resize-y rounded-xl border border-slate-200 p-3.5 text-sm text-slate-700 outline-none focus:border-focus-border focus:ring-4 focus:ring-focus-ring"
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
    </DialogLayer>
  );
}

export default function ModelsPage({ initialTab = 'providers' }) {
  const isPromptPage = initialTab === 'prompts';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [status, setStatus] = useState('전체 상태');
  const [providerFilter, setProviderFilter] = useState('전체 제공자');
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null);

  const filteredProviders = useMemo(
    () =>
      providers.filter(
        provider =>
          (status === '전체 상태' || provider.status === status) &&
          (!query ||
            `${provider.name} ${provider.code} ${provider.endpoint}`
              .toLowerCase()
              .includes(query.toLowerCase()))
      ),
    [query, status]
  );
  const filteredModels = useMemo(
    () =>
      models.filter(
        model =>
          (status === '전체 설정' || model[5] === status) &&
          (providerFilter === '전체 제공자' || model[1] === providerFilter) &&
          (!query || `${model[0]} ${model[1]}`.toLowerCase().includes(query.toLowerCase()))
      ),
    [providerFilter, query, status]
  );
  const filteredPrompts = useMemo(
    () =>
      prompts.filter(
        prompt =>
          (status === '전체 상태' || prompt[2] === status) &&
          (!query || `${prompt[0]} ${prompt[1]}`.toLowerCase().includes(query.toLowerCase()))
      ),
    [query, status]
  );

  const changeTab = tab => {
    setActiveTab(tab);
    setStatus(tab === 'models' ? '전체 설정' : '전체 상태');
    setProviderFilter('전체 제공자');
    setQueryInput('');
    setQuery('');
  };
  const openCreate = () => setModal({ mode: 'create', item: null });
  const openManage = item => setModal({ mode: 'manage', item });

  return (
    <div className="app-control-scope min-h-full bg-canvas text-text-primary">
      <div className="bg-canvas/95">
        {!isPromptPage ? (
          <nav
            className="mx-auto flex w-full max-w-[88rem] items-center justify-center gap-4 overflow-x-auto border-b border-slate-200 px-[var(--app-page-x)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="모델 설정 유형"
          >
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => changeTab(tab.id)}
                className={`relative flex h-12 shrink-0 items-center justify-center border-b-2 px-3 text-sm font-black transition-colors ${
                  activeTab === tab.id
                    ? 'border-brand text-brand'
                    : 'border-transparent text-slate-600 hover:text-brand'
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
          className={`grid items-end gap-[var(--app-gap-sm)] md:grid-cols-2 ${activeTab === 'models' ? 'xl:grid-cols-[9rem_11rem_minmax(0,1fr)_5.25rem_9rem]' : 'xl:grid-cols-[9rem_minmax(0,1fr)_5.25rem_9rem]'}`}
        >
          <label>
            <span className="mb-1.5 block text-xs font-bold text-slate-700">
              {activeTab === 'models' ? '사용 설정' : '상태'}
            </span>
            <CustomDropdown
              value={status}
              onChange={setStatus}
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
                onChange={setProviderFilter}
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
            onClick={() => setQuery(queryInput.trim())}
            className="h-[var(--app-control-lg)]"
          >
            조회
          </AppButton>
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
          <ProviderTable rows={filteredProviders} onManage={openManage} />
        ) : null}
        {activeTab === 'models' ? <ModelTable rows={filteredModels} onManage={openManage} /> : null}
        {activeTab === 'prompts' ? (
          <PromptTable rows={filteredPrompts} onManage={openManage} />
        ) : null}
      </PageLayout>
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
