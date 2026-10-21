import { useMemo, useState } from 'react';
import { Eye, EyeOff, Plus, X } from 'lucide-react';

import CustomDropdown from '../../../../components/dropdown/CustomDropdown.jsx';
import geminiIcon from '../../../../assets/icons/gemini-color.svg';
import openaiIcon from '../../../../assets/icons/openai.svg';
import AppButton from '../external/components/AppButton.jsx';
import AppSearchField from '../external/components/AppSearchField.jsx';
import {
  monitoringTableCellClass,
  monitoringTableClass,
  monitoringTableHeadClass,
  monitoringTableHeaderCellClass,
  monitoringTableHeaderRowClass,
  monitoringTableRowClass,
  monitoringTableSurfaceClass,
} from '../external/components/monitoring/monitoringTableStyles.js';
import '../external/garim.css';

const tabs = [
  { id: 'providers', label: '제공자 / API Key' },
  { id: 'models', label: '모델 · 단가' },
  { id: 'prompts', label: '시스템 프롬프트' },
];

const providers = [
  {
    id: 'openai',
    name: 'OpenAI',
    code: 'OPENAI',
    icon: openaiIcon,
    endpoint: 'https://api.openai.com/v1',
    key: 'sk-p...ZwMA',
    status: '활성',
    modifiedAt: '2026. 6. 4. 오후 8:23',
  },
  {
    id: 'google',
    name: 'Google Gemini',
    code: 'GOOGLE',
    icon: geminiIcon,
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    key: 'AQ.A...d-Qw',
    status: '활성',
    modifiedAt: '2026. 6. 14. 오후 11:15',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    code: 'DEEPSEEK',
    icon: null,
    endpoint: 'https://api.deepseek.com',
    key: 'sk-7...c31c',
    status: '활성',
    modifiedAt: '2026. 6. 30. 오후 2:32',
  },
];

const models = [
  [
    'gpt-5.5',
    'OpenAI',
    'openai',
    '입력 5 · 출력 20',
    '정상',
    '사용 안 함',
    '2026. 7. 5. 오후 6:25',
  ],
  ['gpt-5.4', 'OpenAI', 'openai', '입력 4 · 출력 21', '정상', '사용', '2026. 7. 5. 오후 6:23'],
  [
    'gemini-2.5-flash',
    'Google Gemini',
    'google',
    '입력 1 · 출력 4',
    '정상',
    '사용',
    '2026. 7. 5. 오후 6:23',
  ],
  [
    'gemini-2.5-pro',
    'Google Gemini',
    'google',
    '입력 2 · 출력 15',
    '정상',
    '사용',
    '2026. 7. 5. 오후 6:23',
  ],
  [
    'gemini-2.5-flash-lite',
    'Google Gemini',
    'google',
    '입력 1 · 출력 1',
    '정상',
    '사용',
    '2026. 7. 5. 오후 6:23',
  ],
  [
    'gemini-3.1-flash-lite',
    'Google Gemini',
    'google',
    '입력 1 · 출력 3',
    '정상',
    '사용',
    '2026. 7. 5. 오후 6:23',
  ],
  [
    'gemini-3.5-flash',
    'Google Gemini',
    'google',
    '입력 3 · 출력 13',
    '정상',
    '사용',
    '2026. 7. 5. 오후 6:23',
  ],
  [
    'deepseek-v4-flash',
    'DeepSeek',
    'deepseek',
    '입력 1 · 출력 1',
    '정상',
    '사용',
    '2026. 7. 7. 오전 12:18',
  ],
  [
    'deepseek-v4-pro',
    'DeepSeek',
    'deepseek',
    '입력 1 · 출력 2',
    '정상',
    '사용',
    '2026. 7. 5. 오후 6:23',
  ],
];

const prompts = [
  [
    '기본 테스트 프롬프트',
    '테스트 응답을 간결하고 정확하게 작성한다.',
    '활성',
    '2026. 6. 4. 오후 8:10',
  ],
  ['요약 테스트 프롬프트', '입력 내용을 핵심 bullet로 요약한다.', '활성', '2026. 6. 4. 오후 8:10'],
  ['보고서 프롬프트', '회사 보고서 양식에 맞게 초안을 작성한다.', '활성', '2026. 7. 6. 오후 10:42'],
  ['번역 프롬프트', 'AI 응답을 영어로 대답한다.', '비활성', '2026. 7. 6. 오후 10:42'],
  ['업무 프롬프트', '하루 단위 해야할 업무를 리스트화 한다.', '활성', '2026. 7. 6. 오후 10:43'],
  [
    '주간 보고 프롬프트',
    '진척률, 완료한 작업을 양식에 맞게 초안을 작성한다.',
    '활성',
    '2026. 7. 6. 오후 10:44',
  ],
  [
    '인수인계 프롬프트',
    '회사 문화에 맞는 인수 인계 목차 초안을 작성한다.',
    '활성',
    '2026. 7. 6. 오후 10:46',
  ],
];

const providerIcons = { openai: openaiIcon, google: geminiIcon, deepseek: null };

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

function ProviderIdentity({ icon, name, code }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-50">
        <ProviderIcon icon={icon} />
      </span>
      <div className="min-w-0">
        <p className="truncate font-bold text-slate-900">{name}</p>
        <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
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
    <span className="grid h-5 w-5 place-items-center rounded-md bg-[#596CFF] text-[10px] font-black text-white">
      D
    </span>
  );
}

function ManageButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
    >
      관리
    </button>
  );
}

function TableShell({ title, count, actionLabel, columns, widths, children, onRegister }) {
  return (
    <section className={`${monitoringTableSurfaceClass} min-h-[35rem]`}>
      <header className="flex min-h-[4.25rem] items-center justify-between gap-4 border-b border-[#E7EBF4] px-5 py-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <Badge tone="gray">{count}</Badge>
        </div>
        <AppButton onClick={onRegister} className="h-9 px-4">
          <Plus className="h-4 w-4 sm:hidden" />
          <span>{actionLabel}</span>
        </AppButton>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className={`${monitoringTableClass} min-w-[62rem]`}>
          <colgroup>
            {widths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <thead className={monitoringTableHeadClass}>
            <tr className={monitoringTableHeaderRowClass}>
              {columns.map(column => (
                <th key={column} className={monitoringTableHeaderCellClass}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[clamp(0.8rem,0.92vw,0.9rem)] text-slate-600">{children}</tbody>
        </table>
      </div>
    </section>
  );
}

function ProviderTable({ rows, onManage, onRegister }) {
  return (
    <TableShell
      title="제공자 목록"
      count={providers.length}
      actionLabel="제공자 등록"
      columns={['제공자', 'ENDPOINT', 'API KEY', '상태', '수정일', '관리']}
      widths={['22%', '37%', '15%', '8%', '13%', '7%']}
      onRegister={onRegister}
    >
      {rows.map((provider, rowIndex) => (
        <tr key={provider.id} className={monitoringTableRowClass({ striped: rowIndex % 2 === 1 })}>
          <td className={monitoringTableCellClass(rowIndex)}>
            <ProviderIdentity icon={provider.icon} name={provider.name} code={provider.code} />
          </td>
          <td className={monitoringTableCellClass(rowIndex)}>{provider.endpoint}</td>
          <td className={monitoringTableCellClass(rowIndex)}>
            <Badge>{provider.key}</Badge>
          </td>
          <td className={monitoringTableCellClass(rowIndex)}>
            <Badge>{provider.status}</Badge>
          </td>
          <td className={monitoringTableCellClass(rowIndex)}>{provider.modifiedAt}</td>
          <td className={monitoringTableCellClass(rowIndex)}>
            <ManageButton onClick={() => onManage(provider)} />
          </td>
        </tr>
      ))}
    </TableShell>
  );
}

function ModelTable({ rows, onManage, onRegister }) {
  return (
    <TableShell
      title="모델 목록"
      count={19}
      actionLabel="모델 등록"
      columns={['모델', '단가 (1K)', '점검 결과', '사용 설정', '수정일', '관리']}
      widths={['23%', '28%', '16%', '10%', '16%', '7%']}
      onRegister={onRegister}
    >
      {rows.map((model, rowIndex) => (
        <tr key={model[0]} className={monitoringTableRowClass({ striped: rowIndex % 2 === 1 })}>
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
          <td className={monitoringTableCellClass(rowIndex)}>
            <Badge tone={model[5] === '사용' ? 'green' : 'gray'}>{model[5]}</Badge>
          </td>
          <td className={monitoringTableCellClass(rowIndex)}>{model[6]}</td>
          <td className={monitoringTableCellClass(rowIndex)}>
            <ManageButton onClick={() => onManage(model)} />
          </td>
        </tr>
      ))}
    </TableShell>
  );
}

function PromptTable({ rows, onManage, onRegister }) {
  return (
    <TableShell
      title="프롬프트 목록"
      count={prompts.length}
      actionLabel="프롬프트 등록"
      columns={['이름', '본문 미리보기', '상태', '수정일', '관리']}
      widths={['22%', '46%', '9%', '16%', '7%']}
      onRegister={onRegister}
    >
      {rows.map((prompt, rowIndex) => (
        <tr key={prompt[0]} className={monitoringTableRowClass({ striped: rowIndex % 2 === 1 })}>
          <td className={monitoringTableCellClass(rowIndex, 'font-bold text-slate-900')}>
            {prompt[0]}
          </td>
          <td className={monitoringTableCellClass(rowIndex)}>{prompt[1]}</td>
          <td className={monitoringTableCellClass(rowIndex)}>
            <Badge tone={prompt[2] === '활성' ? 'green' : 'gray'}>{prompt[2]}</Badge>
          </td>
          <td className={monitoringTableCellClass(rowIndex)}>{prompt[3]}</td>
          <td className={monitoringTableCellClass(rowIndex)}>
            <ManageButton onClick={() => onManage(prompt)} />
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
      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#8BC6FF] focus:ring-4 focus:ring-[#DEEEFF]"
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
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-500"
          >
            취소
          </button>
          <AppButton onClick={onClose} className="h-10 px-5">
            저장
          </AppButton>
        </footer>
      </div>
    </div>
  );
}

export default function ModelsPage() {
  const [activeTab, setActiveTab] = useState('providers');
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
    <div className="garim-external-root min-h-full bg-[#f9f9f9] text-[#111827]">
      <div className="mx-auto flex min-h-full w-full max-w-[88rem] flex-col px-[var(--app-page-x)] pb-8 pt-[var(--app-page-top)]">
        <nav className="mb-5 flex gap-7 border-b border-slate-200" aria-label="모델 설정 유형">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => changeTab(tab.id)}
              className={`relative pb-3 text-sm font-bold transition ${activeTab === tab.id ? 'text-[#075DF6]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab.label}
              {activeTab === tab.id ? (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#075DF6]" />
              ) : null}
            </button>
          ))}
        </nav>
        <section
          className={`mb-5 grid items-end gap-2.5 md:grid-cols-2 ${activeTab === 'models' ? 'xl:grid-cols-[9rem_11rem_minmax(0,1fr)_5.25rem]' : 'xl:grid-cols-[9rem_minmax(0,1fr)_5.25rem]'}`}
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
        </section>
        {activeTab === 'providers' ? (
          <ProviderTable rows={filteredProviders} onManage={openManage} onRegister={openCreate} />
        ) : null}
        {activeTab === 'models' ? (
          <ModelTable rows={filteredModels} onManage={openManage} onRegister={openCreate} />
        ) : null}
        {activeTab === 'prompts' ? (
          <PromptTable rows={filteredPrompts} onManage={openManage} onRegister={openCreate} />
        ) : null}
      </div>
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
