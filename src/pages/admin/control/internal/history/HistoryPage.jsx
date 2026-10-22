import { useMemo, useState } from 'react';
import { X } from 'lucide-react';

import CustomDropdown from '../../../../../components/dropdown/CustomDropdown.jsx';
import AppButton from '../../external/components/AppButton.jsx';
import AppSearchField from '../../external/components/AppSearchField.jsx';
import FixedPaginationBar from '../../external/components/FixedPaginationBar.jsx';
import PageLayout from '../../components/PageLayout.jsx';
import {
  monitoringTableCellClass,
  monitoringTableClass,
  monitoringTableHeadClass,
  monitoringTableHeaderCellClass,
  monitoringTableHeaderRowClass,
  monitoringTableRowClass,
  monitoringTableSurfaceClass,
} from '../../external/components/monitoring/monitoringTableStyles.js';
import '../../external/garim.css';

import { agentRows, historyTabCounts, llmRows, toolRows } from '../data.js';
const PAGE_SIZE = 9;

const tabs = [
  { id: 'llm', label: 'LLM 요청 로그', count: historyTabCounts.llm },
  { id: 'agent', label: 'Agent 실행 로그', count: historyTabCounts.agent },
  { id: 'tool', label: '도구 사용 로그', count: historyTabCounts.tool },
];

const tableConfig = {
  llm: {
    title: '요청 목록',
    columns: [
      '요청 ID',
      '사용자',
      '모델 / 제공자',
      '상태',
      '입/출력 토큰',
      '응답 시간',
      '요청 시각',
      '오류',
    ],
    widths: ['7%', '17%', '23%', '10%', '13%', '9%', '20%', '9%'],
    rows: llmRows,
  },
  agent: {
    title: '실행 목록',
    columns: [
      '실행 ID',
      '사용자',
      '프로젝트',
      '위치',
      '상태',
      '오류',
      '소요 시간',
      '생성 시각',
      '상세',
    ],
    widths: ['7%', '16%', '16%', '14%', '8%', '14%', '8%', '17%', '7%'],
    rows: agentRows,
  },
  tool: {
    title: '기록 목록',
    columns: [
      '기록 ID',
      '도구 / 제공자',
      '사용자',
      '위치',
      '이벤트',
      '상태',
      '쿼터 / 비용',
      '승인 / 오류',
      '생성 시각',
    ],
    widths: ['7%', '17%', '15%', '10%', '15%', '8%', '12%', '10%', '16%'],
    rows: toolRows,
  },
};

const filterConfig = {
  llm: [
    { key: 'user', label: '사용자 ID', placeholder: '사용자 ID 입력...' },
    { key: 'model', label: '모델 ID', placeholder: '모델 ID 입력...' },
  ],
  agent: [
    { key: 'user', label: '사용자 ID', placeholder: '사용자 ID 입력...' },
    { key: 'project', label: '프로젝트 ID', placeholder: '프로젝트 ID 입력...' },
    { key: 'conversation', label: '대화 ID', placeholder: '대화 ID 입력...' },
    { key: 'request', label: 'LLM 요청 ID', placeholder: 'LLM 요청 ID 입력...' },
  ],
  tool: [
    { key: 'user', label: '사용자 ID', placeholder: '사용자 ID 입력...' },
    { key: 'tool', label: '도구명', placeholder: '도구명 입력...' },
    { key: 'event', label: '이벤트 유형', placeholder: '이벤트 유형 입력...' },
    { key: 'provider', label: '제공자', placeholder: '제공자 입력...' },
  ],
};

function StatusBadge({ value }) {
  const tone = ['성공', '승인'].includes(value)
    ? 'bg-emerald-50 text-emerald-600'
    : ['실패', '거절'].includes(value)
      ? 'bg-rose-50 text-rose-500'
      : 'bg-amber-50 text-amber-600';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>
      {value}
    </span>
  );
}

function StackedValue({ primary, secondary }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-semibold text-slate-900">{primary}</p>
      <p className="mt-1 truncate text-xs text-slate-400">{secondary}</p>
    </div>
  );
}

function renderCells(tab, row, onDetail) {
  if (tab === 'llm') {
    const [id, user, userId, model, provider, status, tokens, duration, createdAt, error] = row;
    return [
      id,
      <StackedValue key="user" primary={user} secondary={userId} />,
      <StackedValue key="model" primary={model} secondary={provider} />,
      <StatusBadge key="status" value={status} />,
      tokens,
      duration,
      createdAt,
      error === '-' ? (
        '-'
      ) : (
        <button
          key="error"
          type="button"
          onClick={() => onDetail(row)}
          className="rounded-lg bg-slate-50 px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100"
        >
          오류 확인
        </button>
      ),
    ];
  }

  if (tab === 'agent') {
    const [id, user, project, location, status, error, duration, createdAt] = row;
    return [
      id,
      <span key="user" className="font-semibold text-slate-900">
        {user}
      </span>,
      project,
      <span key="location" className="leading-5 text-slate-400">
        {location}
      </span>,
      <StatusBadge key="status" value={status} />,
      <span key="error" className="text-slate-400">
        {error}
      </span>,
      duration,
      createdAt,
      <button
        key="detail"
        type="button"
        onClick={() => onDetail(row)}
        className="rounded-lg bg-slate-50 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100"
      >
        상세
      </button>,
    ];
  }

  const [
    id,
    tool,
    provider,
    user,
    userId,
    location,
    event,
    status,
    query,
    quota,
    approval,
    error,
    createdAt,
  ] = row;
  return [
    id,
    <StackedValue key="tool" primary={tool} secondary={provider} />,
    <StackedValue key="user" primary={user} secondary={userId} />,
    <span key="location" className="text-slate-400">
      {location}
    </span>,
    <span key="event" className="font-semibold text-slate-900">
      {event}
    </span>,
    <StatusBadge key="status" value={status} />,
    <StackedValue key="quota" primary={query} secondary={quota} />,
    <StackedValue key="approval" primary={approval} secondary={error} />,
    createdAt,
  ];
}

function LogTable({ tab, query, status, onDetail }) {
  const config = tableConfig[tab];
  const tabInfo = tabs.find(item => item.id === tab);
  const filteredRows = useMemo(() => {
    const queryTerms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return config.rows.filter(row => {
      const searchableText = row.join(' ').toLowerCase();
      const matchesQuery = queryTerms.every(term => searchableText.includes(term));
      const matchesStatus = status === '전체 상태' || row.includes(status);
      return matchesQuery && matchesStatus;
    });
  }, [config.rows, query, status]);
  return (
    <section className={monitoringTableSurfaceClass}>
      <div className="flex items-center gap-3 border-b border-[#E7EBF4] px-5 py-4">
        <h2 className="text-sm font-bold text-slate-900">{config.title}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
          {tabInfo.count.toLocaleString()}건
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className={`${monitoringTableClass} min-w-[68rem]`}>
          <colgroup>
            {config.widths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <thead className={monitoringTableHeadClass}>
            <tr
              className={`${monitoringTableHeaderRowClass} !text-[clamp(0.74rem,0.84vw,0.84rem)]`}
            >
              {config.columns.map(column => (
                <th key={column} className={monitoringTableHeaderCellClass}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[clamp(0.74rem,0.84vw,0.84rem)] leading-[1.4] text-[#344054]">
            {filteredRows.length ? (
              filteredRows.map((row, rowIndex) => (
                <tr
                  key={`${tab}-${row[0]}`}
                  className={monitoringTableRowClass({ striped: rowIndex % 2 === 1 })}
                >
                  {renderCells(tab, row, onDetail).map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={monitoringTableCellClass(rowIndex, 'align-middle')}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={config.columns.length}
                  className="h-56 text-center text-sm text-slate-400"
                >
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DetailModal({ tab, row, onClose }) {
  if (!row) return null;
  const labels = tableConfig[tab].columns.filter(label => label !== '상세');

  return (
    <div className="app-modal-stage z-[100]">
      <button
        type="button"
        aria-label="상세 닫기"
        className="app-modal-backdrop"
        onClick={onClose}
      />
      <div role="dialog" aria-modal="true" className="app-modal-panel app-modal-panel--lg">
        <div className="app-modal-header flex items-center justify-between border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">로그 상세</h3>
            <p className="mt-1 text-sm text-slate-400">선택한 기록의 처리 정보를 확인합니다.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="app-modal-body grid gap-3 sm:grid-cols-2">
          {row.slice(0, labels.length).map((value, index) => (
            <div
              key={`${labels[index]}-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-xs font-semibold text-slate-400">{labels[index]}</p>
              <p className="mt-2 break-words text-sm font-semibold text-slate-700">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState('llm');
  const [status, setStatus] = useState('전체 상태');
  const [filters, setFilters] = useState({});
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailRow, setDetailRow] = useState(null);

  const changeTab = tab => {
    setActiveTab(tab);
    setStatus('전체 상태');
    setFilters({});
    setSubmittedQuery('');
    setCurrentPage(1);
    setDetailRow(null);
  };
  const handleSearch = () => {
    setSubmittedQuery(Object.values(filters).filter(Boolean).join(' '));
    setCurrentPage(1);
  };
  const filterGridClass =
    activeTab === 'llm'
      ? 'xl:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)_5.25rem]'
      : 'xl:grid-cols-[9rem_repeat(4,minmax(0,1fr))_5.25rem]';

  return (
    <div className="garim-external-root min-h-full bg-[#f9f9f9] text-[#111827]">
      <div className="bg-[#f9f9f9]/95">
        <nav
          className="mx-auto flex w-full max-w-[88rem] items-center justify-center gap-4 overflow-x-auto border-b border-[#E2E8F0] px-[var(--app-page-x)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="AI 요청 이력 유형"
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
      </div>
      <PageLayout gapClassName="gap-[var(--app-gap-md)]" bottomPaddingClassName="pb-0">
        <section
          className={`grid items-end gap-[var(--app-gap-sm)] md:grid-cols-2 ${filterGridClass}`}
        >
          <label className="min-w-0">
            <span className="mb-1.5 block text-xs font-bold text-slate-700">상태</span>
            <CustomDropdown
              value={status}
              onChange={value => {
                setStatus(value);
                setCurrentPage(1);
              }}
              options={
                activeTab === 'tool'
                  ? ['전체 상태', '성공', '승인', '거절', '건너뜀', 'ALLOWED']
                  : ['전체 상태', '성공', '실패']
              }
              ariaLabel="상태 선택"
              className="[&>button]:h-[var(--app-control-lg)] [&>button]:min-h-0 [&>button]:rounded-[var(--app-radius-lg)] [&>button]:text-[clamp(0.82rem,0.95vw,0.9rem)] [&>button]:font-semibold"
            />
          </label>
          {filterConfig[activeTab].map(filter => (
            <label key={filter.key} className="min-w-0">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">{filter.label}</span>
              <AppSearchField
                value={filters[filter.key] ?? ''}
                onChange={event =>
                  setFilters(current => ({ ...current, [filter.key]: event.target.value }))
                }
                placeholder={filter.placeholder}
                className="w-full"
              />
            </label>
          ))}
          <AppButton onClick={handleSearch} className="h-[var(--app-control-lg)] w-full">
            조회
          </AppButton>
        </section>
        <LogTable tab={activeTab} query={submittedQuery} status={status} onDetail={setDetailRow} />
      </PageLayout>
      <FixedPaginationBar
        currentPage={currentPage}
        totalPages={Math.max(
          1,
          Math.ceil(tabs.find(tab => tab.id === activeTab).count / PAGE_SIZE)
        )}
        onPageChange={setCurrentPage}
      />
      <DetailModal tab={activeTab} row={detailRow} onClose={() => setDetailRow(null)} />
    </div>
  );
}
