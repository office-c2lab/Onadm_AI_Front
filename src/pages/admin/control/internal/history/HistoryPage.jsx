import { useMemo, useState } from 'react';
import { Download, X } from 'lucide-react';

import CustomDropdown from '../../../../../components/dropdown/CustomDropdown.jsx';
import AppButton from '../../external/components/AppButton.jsx';
import AppSearchField from '../../external/components/AppSearchField.jsx';
import FixedPaginationBar from '../../external/components/FixedPaginationBar.jsx';
import TableListHeader from '../../external/components/TableListHeader.jsx';
import PageLayout from '../../components/PageLayout.jsx';
import {
  DateRangePicker,
  MonitoringActionButton,
  MonitoringIconButtonTooltip,
  MonitoringResetButton,
} from '../../external/components/monitoring/MonitoringListComponents.jsx';
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
import { createDefaultDateRange, isDateValueInRange } from '../dateRangeUtils.js';
const PAGE_SIZE = 9;

const tabs = [
  { id: 'llm', label: 'LLM 요청 로그', count: historyTabCounts.llm },
  { id: 'agent', label: 'Agent 실행 로그', count: historyTabCounts.agent },
  { id: 'tool', label: '도구 사용 로그', count: historyTabCounts.tool },
];

const historyUserNames = {
  'tester2@school.edu': '박서연',
  '#2': '박서연',
  'bjh@aictl.kr': '강지호',
  '#10': '강지호',
};

const tableConfig = {
  llm: {
    title: '요청 목록',
    columns: ['No.', '사용자', '모델 / 제공자', '상태', '입/출력 토큰', '응답 시간', '요청 시각'],
    widths: ['7%', '16%', '23%', '9%', '13%', '9%', '19%'],
    rows: llmRows,
  },
  agent: {
    title: '실행 목록',
    columns: ['No.', '사용자', '프로젝트', '위치', '상태', '소요 시간', '생성 시각'],
    widths: ['7%', '16%', '16%', '16%', '9%', '10%', '22%'],
    rows: agentRows,
  },
  tool: {
    title: '기록 목록',
    columns: [
      'No.',
      '도구 / 제공자',
      '사용자',
      '위치',
      '이벤트',
      '상태',
      '쿼터 / 비용',
      '승인',
      '생성 시각',
    ],
    widths: ['6%', '14%', '11%', '9%', '12%', '7%', '10%', '8%', '19%'],
    rows: toolRows,
  },
};

function getHistoryUserName(tab, row) {
  const identifiers =
    tab === 'tool' ? [row[3], row[4]] : tab === 'llm' ? [row[1], row[2]] : [row[1]];

  return (
    identifiers.map(identifier => historyUserNames[identifier]).find(Boolean) ?? identifiers[0]
  );
}

function formatHistoryDateTime24(value) {
  const match = String(value ?? '').match(
    /^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(오전|오후)\s*(\d{1,2}):(\d{2})$/
  );
  if (!match) return value;

  const [, year, month, day, period, rawHour, minute] = match;
  const hour = (Number(rawHour) % 12) + (period === '오후' ? 12 : 0);
  const pad = number => String(number).padStart(2, '0');

  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${minute}`;
}

function getHistoryDisplayRow(tab, row) {
  if (tab === 'llm') {
    return [
      row[0],
      getHistoryUserName(tab, row),
      `${row[3]} / ${row[4]}`,
      row[5],
      row[6],
      row[7],
      formatHistoryDateTime24(row[8]),
    ];
  }

  if (tab === 'agent') {
    return [
      row[0],
      getHistoryUserName(tab, row),
      ...row.slice(2, 5),
      row[6],
      formatHistoryDateTime24(row[7]),
    ];
  }

  return [
    row[0],
    `${row[1]} / ${row[2]}`,
    getHistoryUserName(tab, row),
    row[5],
    row[6],
    row[7],
    `${row[8]} / ${row[9]}`,
    row[10],
    formatHistoryDateTime24(row[12]),
  ];
}

function getHistoryDetailEntries(tab, row) {
  if (tab === 'llm') {
    return [
      ['No.', row[0]],
      ['사용자', getHistoryUserName(tab, row)],
      ['모델 / 제공자', `${row[3]} / ${row[4]}`],
      ['상태', row[5]],
      ['입/출력 토큰', row[6]],
      ['응답 시간', row[7]],
      ['요청 시각', formatHistoryDateTime24(row[8])],
      ['오류', row[9]],
    ];
  }

  if (tab === 'agent') {
    return [
      ['No.', row[0]],
      ['사용자', getHistoryUserName(tab, row)],
      ['프로젝트', row[2]],
      ['위치', row[3]],
      ['상태', row[4]],
      ['오류', row[5]],
      ['소요 시간', row[6]],
      ['생성 시각', formatHistoryDateTime24(row[7])],
    ];
  }

  return [
    ['No.', row[0]],
    ['도구 / 제공자', `${row[1]} / ${row[2]}`],
    ['사용자', getHistoryUserName(tab, row)],
    ['위치', row[5]],
    ['이벤트', row[6]],
    ['상태', row[7]],
    ['쿼터 / 비용', `${row[8]} / ${row[9]}`],
    ['승인', row[10]],
    ['오류', row[11]],
    ['생성 시각', formatHistoryDateTime24(row[12])],
  ];
}

function filterHistoryRows(tab, query, status, dateRange) {
  const queryTerms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const dateIndex = { llm: 8, agent: 7, tool: 12 }[tab];

  return tableConfig[tab].rows.filter(row => {
    const searchableText = `${row.join(' ')} ${getHistoryUserName(tab, row)}`.toLowerCase();
    const matchesQuery = queryTerms.every(term => searchableText.includes(term));
    const matchesStatus = status === '전체 상태' || row.includes(status);
    const matchesDate = isDateValueInRange(row[dateIndex], dateRange.startDate, dateRange.endDate);
    return matchesQuery && matchesStatus && matchesDate;
  });
}

function getCsvContent(tab, rows) {
  const csvConfig = {
    llm: {
      columns: tableConfig.llm.columns,
      mapRow: row => getHistoryDisplayRow('llm', row),
    },
    agent: {
      columns: tableConfig.agent.columns.filter(column => column !== '상세'),
      mapRow: row => getHistoryDisplayRow('agent', row),
    },
    tool: {
      columns: tableConfig.tool.columns,
      mapRow: row => getHistoryDisplayRow('tool', row),
    },
  }[tab];
  const escapeValue = value => `"${String(value ?? '').replaceAll('"', '""')}"`;

  return [csvConfig.columns, ...rows.map(csvConfig.mapRow)]
    .map(row => row.map(escapeValue).join(','))
    .join('\r\n');
}

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

function renderCells(tab, row) {
  if (tab === 'llm') {
    const [id, , , model, provider, status, tokens, duration, createdAt] = row;
    return [
      id,
      <span key="user" className="font-semibold text-slate-900">
        {getHistoryUserName('llm', row)}
      </span>,
      <StackedValue key="model" primary={model} secondary={provider} />,
      <StatusBadge key="status" value={status} />,
      tokens,
      duration,
      formatHistoryDateTime24(createdAt),
    ];
  }

  if (tab === 'agent') {
    const [id, , project, location, status, , duration, createdAt] = row;
    return [
      id,
      <span key="user" className="font-semibold text-slate-900">
        {getHistoryUserName('agent', row)}
      </span>,
      project,
      <span key="location" className="leading-5 text-slate-400">
        {location}
      </span>,
      <StatusBadge key="status" value={status} />,
      duration,
      formatHistoryDateTime24(createdAt),
    ];
  }

  const [id, tool, provider, , , location, event, status, query, quota, approval, , createdAt] =
    row;
  return [
    id,
    <StackedValue key="tool" primary={tool} secondary={provider} />,
    <span key="user" className="font-semibold text-slate-900">
      {getHistoryUserName('tool', row)}
    </span>,
    <span key="location" className="text-slate-400">
      {location}
    </span>,
    <span key="event" className="font-semibold text-slate-900">
      {event}
    </span>,
    <StatusBadge key="status" value={status} />,
    <StackedValue key="quota" primary={query} secondary={quota} />,
    approval,
    formatHistoryDateTime24(createdAt),
  ];
}

function LogTable({
  tab,
  query,
  status,
  dateRange,
  selectedRowIds,
  onToggleRowSelection,
  onToggleAllRowsSelection,
  onDetail,
}) {
  const config = tableConfig[tab];
  const tabInfo = tabs.find(item => item.id === tab);
  const filteredRows = useMemo(
    () => filterHistoryRows(tab, query, status, dateRange),
    [dateRange, query, status, tab]
  );
  const allRowsSelected =
    filteredRows.length > 0 && filteredRows.every(row => selectedRowIds.includes(row[0]));
  return (
    <section className={monitoringTableSurfaceClass}>
      <TableListHeader title={config.title} count={tabInfo.count} />
      <div className="overflow-x-auto">
        <table className={`${monitoringTableClass} min-w-[68rem]`}>
          <colgroup>
            <col style={{ width: '4%' }} />
            {config.widths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <thead className={monitoringTableHeadClass}>
            <tr
              className={`${monitoringTableHeaderRowClass} !text-[clamp(0.74rem,0.84vw,0.84rem)]`}
            >
              <th className={`${monitoringTableHeaderCellClass} px-0 text-center align-middle`}>
                <input
                  type="checkbox"
                  checked={allRowsSelected}
                  onChange={() => onToggleAllRowsSelection(filteredRows.map(row => row[0]))}
                  aria-label="현재 목록 전체 선택"
                  className="mx-auto block h-[var(--app-icon-xs)] w-[var(--app-icon-xs)] cursor-pointer rounded border-slate-300 accent-[#075DF6]"
                />
              </th>
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
                  className={monitoringTableRowClass({
                    striped: rowIndex % 2 === 1,
                    interactive: true,
                  })}
                  onClick={() => onDetail(row)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onDetail(row);
                    }
                  }}
                  tabIndex={0}
                >
                  <td
                    className={monitoringTableCellClass(rowIndex, 'px-0 text-center align-middle')}
                    onClick={event => event.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRowIds.includes(row[0])}
                      onChange={() => onToggleRowSelection(row[0])}
                      aria-label={`${row[0]} 행 선택`}
                      className="mx-auto block h-[var(--app-icon-xs)] w-[var(--app-icon-xs)] cursor-pointer rounded border-slate-300 accent-[#075DF6]"
                    />
                  </td>
                  {renderCells(tab, row).map((cell, cellIndex) => (
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
                  colSpan={config.columns.length + 1}
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
  const entries = getHistoryDetailEntries(tab, row);

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
          {entries.map(([label, value], index) => (
            <div
              key={`${label}-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-xs font-semibold text-slate-400">{label}</p>
              <p className="mt-2 break-words text-sm font-semibold text-slate-700">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [defaultDateRange] = useState(() => createDefaultDateRange());
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [activeTab, setActiveTab] = useState('llm');
  const [status, setStatus] = useState('전체 상태');
  const [searchInput, setSearchInput] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailRow, setDetailRow] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const filteredRows = useMemo(
    () => filterHistoryRows(activeTab, submittedQuery, status, dateRange),
    [activeTab, dateRange, status, submittedQuery]
  );
  const downloadRows = useMemo(
    () => filteredRows.filter(row => selectedRowIds.includes(row[0])),
    [filteredRows, selectedRowIds]
  );

  const changeTab = tab => {
    setActiveTab(tab);
    setStatus('전체 상태');
    setSearchInput('');
    setSubmittedQuery('');
    setCurrentPage(1);
    setDetailRow(null);
    setSelectedRowIds([]);
  };
  const handleSearch = () => {
    setSubmittedQuery(searchInput.trim());
    setCurrentPage(1);
    setSelectedRowIds([]);
  };
  const handleReset = () => {
    setDateRange(defaultDateRange);
    setStatus('전체 상태');
    setSearchInput('');
    setSubmittedQuery('');
    setCurrentPage(1);
    setSelectedRowIds([]);
  };
  const handleToggleRowSelection = rowId => {
    setSelectedRowIds(current =>
      current.includes(rowId) ? current.filter(id => id !== rowId) : [...current, rowId]
    );
  };
  const handleToggleAllRowsSelection = rowIds => {
    setSelectedRowIds(current => {
      const allSelected = rowIds.length > 0 && rowIds.every(id => current.includes(id));
      if (allSelected) return current.filter(id => !rowIds.includes(id));

      return [...new Set([...current, ...rowIds])];
    });
  };
  const handleDownloadCsv = () => {
    if (!downloadRows.length) return;

    const csv = getCsvContent(activeTab, downloadRows);
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `ai-request-history-${activeTab}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
  };
  const filterGridClass = 'xl:grid-cols-[10.25rem_9rem_minmax(0,1fr)_5.25rem_3rem_3rem]';

  return (
    <div className="garim-external-root min-h-full bg-white text-[#111827]">
      <div className="bg-white/95">
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
          <DateRangePicker
            label="조회 기간"
            labelClassName="mb-1.5 block text-xs font-bold text-slate-700"
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={range => {
              setDateRange(range);
              setCurrentPage(1);
              setSelectedRowIds([]);
            }}
            widthClass="w-full min-w-0"
          />
          <label className="min-w-0">
            <span className="mb-1.5 block text-xs font-bold text-slate-700">상태</span>
            <CustomDropdown
              value={status}
              onChange={value => {
                setStatus(value);
                setCurrentPage(1);
                setSelectedRowIds([]);
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
          <label className="min-w-0">
            <span className="mb-1.5 block text-xs font-bold text-slate-700">통합 검색</span>
            <AppSearchField
              value={searchInput}
              onChange={event => setSearchInput(event.target.value)}
              placeholder="사용자, 모델, 프로젝트, 도구 또는 ID 검색..."
              className="w-full"
            />
          </label>
          <AppButton onClick={handleSearch} className="h-[var(--app-control-lg)] w-full">
            검색
          </AppButton>
          <MonitoringIconButtonTooltip label="초기화">
            <MonitoringResetButton
              onClick={handleReset}
              widthClass="w-[var(--app-control-lg)] min-w-[var(--app-control-lg)]"
              aria-label="초기화"
            />
          </MonitoringIconButtonTooltip>
          <MonitoringIconButtonTooltip
            label={downloadRows.length ? 'CSV 다운로드' : '항목을 선택하세요'}
          >
            <MonitoringActionButton
              variant="csvDownload"
              heightClass="h-[var(--app-control-lg)]"
              widthClass="w-[var(--app-control-lg)] min-w-[var(--app-control-lg)] px-0"
              onClick={handleDownloadCsv}
              disabled={!downloadRows.length}
              aria-label="CSV 다운로드"
            >
              <Download
                className="h-[var(--app-icon-xs)] w-[var(--app-icon-xs)] shrink-0"
                strokeWidth={2.8}
                aria-hidden="true"
              />
            </MonitoringActionButton>
          </MonitoringIconButtonTooltip>
        </section>
        <LogTable
          tab={activeTab}
          query={submittedQuery}
          status={status}
          dateRange={dateRange}
          selectedRowIds={selectedRowIds}
          onToggleRowSelection={handleToggleRowSelection}
          onToggleAllRowsSelection={handleToggleAllRowsSelection}
          onDetail={setDetailRow}
        />
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
