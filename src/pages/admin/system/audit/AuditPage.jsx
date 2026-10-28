import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';

import AppButton from '../../control/external/components/AppButton.jsx';
import AppSearchField from '../../control/external/components/AppSearchField.jsx';
import FixedPaginationBar from '../../control/external/components/FixedPaginationBar.jsx';
import TableListHeader from '../../control/external/components/TableListHeader.jsx';
import {
  MonitoringActionButton,
  MonitoringIconButtonTooltip,
  MonitoringResetButton,
} from '../../control/external/components/monitoring/MonitoringListComponents.jsx';
import {
  monitoringTableBodyClass,
  monitoringTableCellClass,
  monitoringTableClass,
  monitoringTableHeadClass,
  monitoringTableHeaderCellClass,
  monitoringTableHeaderRowClass,
  monitoringTableRowClass,
  monitoringTableSurfaceClass,
} from '../../control/external/components/monitoring/monitoringTableStyles.js';
import PageLayout from '../../control/components/PageLayout.jsx';
import '../../control/external/garim.css';

const AUDIT_TABS = [
  '전체',
  'Discover',
  'Control 내부',
  'Control 외부',
  'Manage',
  '사용자 및 권한',
  '시스템 운영',
];
const PAGE_SIZE = 8;

const AUDIT_LOGS = [
  [
    1844,
    '최유진',
    'yujin.choi@example.com',
    'Discover',
    'AI Service Analysis',
    '분석 결과를 새로 고침',
    'https://example-ai.com',
    '10.20.13.77',
    '2026-10-28 18:12',
  ],
  [
    1843,
    '정하은',
    'haeun.jung@example.com',
    'Discover',
    'Intelligence DB',
    '위험 URL 항목을 수정',
    'INT-2026-1048',
    '10.20.17.45',
    '2026-10-28 17:58',
  ],
  [
    1842,
    '김민준',
    'minjun.kim@example.com',
    '사용자 및 권한',
    '사용자 관리',
    '계정 상태를 활성으로 변경',
    '이서연',
    '10.20.14.32',
    '2026-10-28 17:42',
  ],
  [
    1841,
    '박지훈',
    'jihoon.park@example.com',
    'Control 내부',
    'LLM 모델 관리',
    '모델 사용 설정을 변경',
    'gpt-5.5',
    '10.20.11.18',
    '2026-10-28 17:31',
  ],
  [
    1840,
    '최유진',
    'yujin.choi@example.com',
    'Control 외부',
    '외부 AI 정책 관리',
    '차단 정책의 탐지 항목을 수정',
    '기밀정보 외부 전송 차단',
    '10.20.13.77',
    '2026-10-28 17:08',
  ],
  [
    1839,
    '정하은',
    'haeun.jung@example.com',
    'Manage',
    '심사 관리',
    '도구 등록 요청을 승인',
    '계약서 요약 Agent',
    '10.20.17.45',
    '2026-10-28 16:54',
  ],
  [
    1838,
    '김민준',
    'minjun.kim@example.com',
    'Control 내부',
    '사용량 및 한도 관리',
    '사용자 크레딧을 수동 지급',
    '김도윤 · 10,000 크레딧',
    '10.20.14.32',
    '2026-10-28 16:40',
  ],
  [
    1837,
    '박지훈',
    'jihoon.park@example.com',
    '시스템 운영',
    '모듈 관리',
    '서비스 모듈을 재시작',
    'prompt-guard-worker',
    '10.20.11.18',
    '2026-10-28 16:22',
  ],
  [
    1836,
    '정하은',
    'haeun.jung@example.com',
    'Manage',
    '스토어 진열 관리',
    '메인 배너의 연결 도구를 변경',
    '업무 자동화 추천 배너',
    '10.20.17.45',
    '2026-10-28 15:58',
  ],
  [
    1835,
    '최유진',
    'yujin.choi@example.com',
    'Control 외부',
    '프롬프트 모니터링',
    '선택한 모니터링 로그를 CSV로 다운로드',
    '12건',
    '10.20.13.77',
    '2026-10-28 15:36',
  ],
  [
    1834,
    '김민준',
    'minjun.kim@example.com',
    '사용자 및 권한',
    '부서 관리',
    '부서 관리자를 변경',
    'AI 플랫폼팀',
    '10.20.14.32',
    '2026-10-28 15:11',
  ],
  [
    1833,
    '박지훈',
    'jihoon.park@example.com',
    '시스템 운영',
    '엔진 및 모듈 상태',
    '이상 탐지 알림 기준을 변경',
    'API 오류율 5%',
    '10.20.11.18',
    '2026-10-28 14:47',
  ],
].map(([id, actor, email, area, menu, action, target, ip, createdAt]) => ({
  id,
  actor,
  email,
  area,
  menu,
  action,
  target,
  ip,
  createdAt,
}));

function LocationCell({ area, menu }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-semibold text-slate-800">{menu}</p>
      <p className="mt-0.5 truncate text-xs text-slate-400">{area}</p>
    </div>
  );
}

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState('전체');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLogs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('ko');

    return AUDIT_LOGS.filter(log => {
      const matchesTab = activeTab === '전체' || log.area === activeTab;
      const matchesSearch =
        !normalizedQuery ||
        [log.area, log.menu, log.action, log.target, log.ip, log.createdAt].some(value =>
          String(value).toLocaleLowerCase('ko').includes(normalizedQuery)
        );

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const visibleLogs = filteredLogs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleReset = () => {
    setActiveTab('전체');
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleDownloadCsv = () => {
    if (!filteredLogs.length) return;

    const escapeCsvValue = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const headers = ['No.', '영역', '메뉴', '작업 내용', '대상', '접속 IP', '일시'];
    const csv = [
      headers,
      ...filteredLogs.map(log => [
        log.id,
        log.area,
        log.menu,
        log.action,
        log.target,
        log.ip,
        log.createdAt,
      ]),
    ]
      .map(row => row.map(escapeCsvValue).join(','))
      .join('\r\n');
    const downloadUrl = URL.createObjectURL(
      new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' })
    );
    const link = document.createElement('a');
    const now = new Date();
    const fileDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;

    link.href = downloadUrl;
    link.download = `audit-logs-${fileDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="garim-external-root flex h-dvh min-h-0 flex-col overflow-hidden bg-white text-[#111827]">
      <div className="z-30 shrink-0 bg-white/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[var(--app-page-outer-width)] px-[var(--app-page-x)]">
          <nav
            className="flex items-center justify-center gap-1 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="감사 로그 위치"
          >
            <div className="flex min-w-max items-center justify-center gap-1">
              {AUDIT_TABS.map(tab => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab);
                      setCurrentPage(1);
                    }}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1 text-sm transition-colors ${
                      isActive
                        ? 'bg-[#ededed] font-medium text-[#333]'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <PageLayout>
          <section className="flex items-end gap-[var(--app-gap-sm)]">
            <label className="min-w-0 flex-1">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">통합 검색</span>
              <AppSearchField
                value={searchInput}
                onChange={event => setSearchInput(event.target.value)}
                placeholder="메뉴, 작업 내용, 대상 또는 IP 검색..."
              />
            </label>
            <AppButton
              onClick={() => {
                setSearchQuery(searchInput.trim());
                setCurrentPage(1);
              }}
              className="h-[var(--app-control-lg)] min-w-[5.25rem]"
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
            <MonitoringIconButtonTooltip
              label={filteredLogs.length ? 'CSV 다운로드' : '다운로드할 로그가 없습니다'}
            >
              <MonitoringActionButton
                variant="csvDownload"
                heightClass="h-[var(--app-control-lg)]"
                widthClass="w-[var(--app-control-lg)] min-w-[var(--app-control-lg)] px-0"
                onClick={handleDownloadCsv}
                disabled={!filteredLogs.length}
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

          <section className={monitoringTableSurfaceClass}>
            <TableListHeader title="감사 로그 목록" count={filteredLogs.length} />
            <div className="overflow-x-auto">
              <table
                aria-label="감사 로그 목록"
                className={`${monitoringTableClass} min-w-[58rem] table-fixed`}
              >
                <colgroup>
                  {['7%', '22%', '27%', '17%', '11%', '16%'].map((width, index) => (
                    <col key={`${width}-${index}`} style={{ width }} />
                  ))}
                </colgroup>
                <thead className={monitoringTableHeadClass}>
                  <tr className={monitoringTableHeaderRowClass}>
                    {['No.', '위치', '작업 내용', '대상', '접속 IP', '일시'].map(column => (
                      <th key={column} scope="col" className={monitoringTableHeaderCellClass}>
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={monitoringTableBodyClass}>
                  {visibleLogs.map((log, index) => (
                    <tr
                      key={log.id}
                      className={monitoringTableRowClass({ striped: index % 2 === 1 })}
                    >
                      <td className={monitoringTableCellClass(index, 'text-slate-500')}>
                        {log.id}
                      </td>
                      <td className={monitoringTableCellClass(index, 'min-w-0')}>
                        <LocationCell area={log.area} menu={log.menu} />
                      </td>
                      <td className={monitoringTableCellClass(index, 'min-w-0')}>
                        <p className="truncate font-medium text-slate-700" title={log.action}>
                          {log.action}
                        </p>
                      </td>
                      <td className={monitoringTableCellClass(index, 'min-w-0')}>
                        <p className="truncate text-slate-600" title={log.target}>
                          {log.target}
                        </p>
                      </td>
                      <td
                        className={monitoringTableCellClass(
                          index,
                          'whitespace-nowrap text-slate-500'
                        )}
                      >
                        {log.ip}
                      </td>
                      <td
                        className={monitoringTableCellClass(
                          index,
                          'whitespace-nowrap text-slate-500'
                        )}
                      >
                        {log.createdAt}
                      </td>
                    </tr>
                  ))}
                  {!filteredLogs.length ? (
                    <tr>
                      <td colSpan={6} className="h-36 text-center text-sm text-slate-400">
                        조건에 맞는 감사 로그가 없습니다.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </PageLayout>
        <FixedPaginationBar
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </section>
    </div>
  );
}
