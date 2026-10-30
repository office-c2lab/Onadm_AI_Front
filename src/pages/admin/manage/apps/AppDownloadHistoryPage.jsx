import { useMemo, useState } from 'react';
import { ArrowLeft, Download, Search } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import StoreToolIcon from '../../../user/aistore/components/StoreToolIcon.jsx';
import { getDeletedAppIds } from '../../../user/aistore/data/manageStore.js';
import FixedPaginationBar from '../../control/external/components/FixedPaginationBar.jsx';
import {
  MonitoringActionButton,
  MonitoringIconButtonTooltip,
} from '../../control/external/components/monitoring/MonitoringListComponents.jsx';
import '../../control/external/garim.css';
import { appRecords } from '../data.js';
import { getAppDownloadHistory } from './downloadHistory.js';

const PAGE_SIZE = 20;

const avatarStyles = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];

function UserAvatar({ user }) {
  const styleIndex = [...user.userId].reduce((sum, character) => sum + character.charCodeAt(0), 0);

  return (
    <span
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ring-1 ring-black/5 ${avatarStyles[styleIndex % avatarStyles.length]}`}
      aria-hidden="true"
    >
      {user.name.trim().slice(0, 1) || '?'}
    </span>
  );
}

function escapeCsvValue(value) {
  const text = String(value ?? '');
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

function exportDownloadHistory(app, rows) {
  const headers = ['이름', '부서', '직급', '이메일', '다운로드 버전', '다운로드 일시'];
  const csvRows = rows.map(item => [
    item.name,
    item.department,
    item.position,
    item.email,
    `v${item.version}`,
    item.downloadedAt,
  ]);
  const csv = [headers, ...csvRows].map(row => row.map(escapeCsvValue).join(',')).join('\n');
  const downloadUrl = URL.createObjectURL(
    new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  );
  const link = document.createElement('a');
  const safeAppName = app.name.replaceAll(/[^0-9A-Za-z가-힣_-]+/g, '-');
  link.href = downloadUrl;
  link.download = `${safeAppName}-다운로드-이력.csv`;
  link.click();
  URL.revokeObjectURL(downloadUrl);
}

export default function AppDownloadHistoryPage() {
  const { appId } = useParams();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const deletedAppIds = getDeletedAppIds();
  const app = appRecords.find(
    item =>
      item.id === appId && !deletedAppIds.includes(item.id) && !deletedAppIds.includes(item.storeId)
  );
  const history = useMemo(() => getAppDownloadHistory(app), [app]);
  const keyword = search.trim().toLowerCase();
  const filteredHistory = useMemo(
    () =>
      history.filter(item =>
        `${item.name} ${item.department} ${item.position} ${item.email} ${item.version}`
          .toLowerCase()
          .includes(keyword)
      ),
    [history, keyword]
  );
  const totalPages = Math.ceil(filteredHistory.length / PAGE_SIZE);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const selectedRows = history.filter(item => selectedIds.has(item.id));
  const allPageSelected =
    paginatedHistory.length > 0 && paginatedHistory.every(item => selectedIds.has(item.id));

  const toggleSelected = id => {
    setSelectedIds(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCurrentPage = () => {
    setSelectedIds(current => {
      const next = new Set(current);
      paginatedHistory.forEach(item => {
        if (allPageSelected) next.delete(item.id);
        else next.add(item.id);
      });
      return next;
    });
  };

  if (!app) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-semibold text-slate-900">앱·에이전트를 찾을 수 없습니다.</h1>
        <Link
          to="/admin/manage/apps"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          앱·에이전트 관리로 돌아가기
        </Link>
      </div>
    );
  }

  const tool = { ...app, id: app.storeId ?? app.id };

  return (
    <>
      <Link
        to="/admin/manage/apps"
        className="inline-flex h-9 items-center gap-2 rounded-lg pr-3 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
      >
        <ArrowLeft size={16} /> 앱·에이전트 관리로 돌아가기
      </Link>

      <header className="flex flex-col gap-5 py-8 sm:flex-row sm:items-start sm:justify-between sm:py-10">
        <div className="flex min-w-0 items-start gap-5">
          <StoreToolIcon tool={tool} featured />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-blue-600">다운로드 이력</p>
            <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl">
              {app.name}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              이 도구를 다운로드한 사용자와 다운로드 버전 및 일시를 확인합니다.
            </p>
          </div>
        </div>
      </header>

      <section className="border-t border-slate-200 pt-6" aria-label="다운로드 이력">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <label className="flex h-10 w-full items-center gap-2 rounded-lg bg-[#edf2f7] px-3 text-slate-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 sm:min-w-72">
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={event => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="이름, 부서 또는 이메일 검색"
                aria-label="다운로드 사용자 검색"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
              />
            </label>
            <div className="garim-external-root inline-flex !bg-transparent">
              <MonitoringIconButtonTooltip
                label={
                  selectedRows.length
                    ? `선택한 ${selectedRows.length}건 CSV 다운로드`
                    : '항목을 선택하세요'
                }
              >
                <MonitoringActionButton
                  variant="csvDownload"
                  heightClass="h-10"
                  widthClass="w-10 min-w-10 px-0"
                  onClick={() => exportDownloadHistory(app, selectedRows)}
                  disabled={!selectedRows.length}
                  aria-label="선택한 다운로드 이력 CSV 다운로드"
                >
                  <Download
                    className="h-[var(--app-icon-xs)] w-[var(--app-icon-xs)] shrink-0"
                    strokeWidth={2.8}
                    aria-hidden="true"
                  />
                </MonitoringActionButton>
              </MonitoringIconButtonTooltip>
            </div>
          </div>
        </div>

        {filteredHistory.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] border-y border-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleCurrentPage}
                      disabled={!paginatedHistory.length}
                      aria-label="현재 페이지 다운로드 사용자 전체 선택"
                      className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                    />
                  </th>
                  <th className="px-4 py-3">사용자</th>
                  <th className="px-4 py-3">소속</th>
                  <th className="px-4 py-3">이메일</th>
                  <th className="px-4 py-3">버전</th>
                  <th className="px-4 py-3 text-right">다운로드 일시</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedHistory.map(item => (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelected(item.id)}
                        aria-label={`${item.name} 다운로드 이력 선택`}
                        className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={item} />
                        <div className="min-w-0">
                          <strong className="block font-semibold text-slate-900">
                            {item.name}
                          </strong>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      {item.department} · {item.position}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{item.email}</td>
                    <td className="px-4 py-3.5 font-semibold text-blue-600">v{item.version}</td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap text-slate-600">
                      {item.downloadedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5 border-y border-slate-200 px-6 py-16 text-center text-sm text-slate-500">
            {history.length
              ? '검색 조건에 맞는 다운로드 이력이 없습니다.'
              : '다운로드 이력이 없습니다.'}
          </div>
        )}
      </section>

      <FixedPaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
