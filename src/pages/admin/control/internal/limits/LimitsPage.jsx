import { useMemo, useState } from 'react';
import { Check, Plus, Save, X } from 'lucide-react';
import CustomDropdown from '../../../../../components/dropdown/CustomDropdown.jsx';
import { AdminDetailSection } from '../../../../../layouts/admin/AdminDetailLayout.jsx';
import AppButton from '../../external/components/AppButton.jsx';
import AppSearchField from '../../external/components/AppSearchField.jsx';
import FixedPaginationBar from '../../external/components/FixedPaginationBar.jsx';
import TableListHeader from '../../external/components/TableListHeader.jsx';
import PageLayout from '../../components/PageLayout.jsx';
import { useRegisteredClientsQuery } from '../../external/queries/userManagementQueries.js';
import {
  DateRangePicker,
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

import { initialPolicies, initialTiers, initialTransactions, users } from '../data.js';
import { createDefaultDateRange, isDateValueInRange } from '../dateRangeUtils.js';
const inputClass =
  'h-[var(--app-control-lg)] w-full rounded-[var(--app-radius-lg)] border border-slate-200 bg-white px-[var(--app-pad-md)] text-[clamp(0.82rem,0.95vw,0.9rem)] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#8BC6FF] focus:ring-[clamp(0.2rem,0.32vw,0.25rem)] focus:ring-[#DEEEFF]';
const fieldLabelClass = 'mb-1.5 block text-[0.8rem] font-semibold text-[#5C6784]';

function getTransactionUser(row, userMetadataByEmail) {
  return (
    userMetadataByEmail[row.user] ?? {
      name: row.userName ?? row.user,
      department: '-',
      position: '-',
    }
  );
}

function CurrencyInput({ label, value, suffix, onChange }) {
  return (
    <label className="block min-w-0">
      <span className={fieldLabelClass}>{label}</span>
      <span className="relative block">
        <input
          value={value}
          onChange={onChange}
          className={`${inputClass} pr-14`}
          inputMode="decimal"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
          {suffix}
        </span>
      </span>
    </label>
  );
}

function StatusPill({ children, tone = 'green' }) {
  const tones = {
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-rose-50 text-rose-600',
    gray: 'bg-slate-100 text-slate-500',
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[0.78rem] font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function TierModal({ tier, onClose, onSave }) {
  const [name, setName] = useState(tier?.name ?? '');
  const [credits, setCredits] = useState(tier?.credits ?? '');

  return (
    <div className="app-modal-stage z-[100]">
      <button type="button" className="app-modal-backdrop" onClick={onClose} aria-label="닫기" />
      <section role="dialog" aria-modal="true" className="app-modal-panel app-modal-panel--sm">
        <header className="app-modal-header flex items-center justify-between border-b border-slate-200">
          <h2 className="text-[1.12rem] font-bold tracking-[-0.02em] text-[#11182E]">
            {tier ? '지급 기준 관리' : '지급 기준 등록'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </header>
        <form
          onSubmit={event => {
            event.preventDefault();
            onSave({ name, credits });
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="app-modal-body space-y-4">
            <label className="block">
              <span className={fieldLabelClass}>직급 / 그룹</span>
              <input
                required
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder="예: 교직원"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={fieldLabelClass}>월 지급 크레딧</span>
              <input
                required
                value={credits}
                onChange={event => setCredits(event.target.value)}
                placeholder="크레딧 입력"
                className={inputClass}
              />
            </label>
          </div>
          <footer className="app-modal-footer flex justify-end gap-2 border-t border-slate-200">
            <AppButton type="button" variant="secondary" onClick={onClose} className="h-10 px-5">
              취소
            </AppButton>
            <AppButton type="submit" className="h-10 px-5">
              저장
            </AppButton>
          </footer>
        </form>
      </section>
    </div>
  );
}

function TransactionTable({ rows, userMetadataByEmail, typeFilter, query, dateRange }) {
  const normalizedQuery = query.toLowerCase();
  const filteredRows = useMemo(
    () =>
      rows.filter(row => {
        const user = getTransactionUser(row, userMetadataByEmail);
        const searchableText = [
          row.id,
          user.name,
          row.user,
          user.department,
          user.position,
          row.type,
          row.delta,
          row.balance,
          row.createdAt,
        ]
          .join(' ')
          .toLowerCase();

        return (
          (typeFilter === '전체' || row.type === typeFilter) &&
          isDateValueInRange(row.createdAt, dateRange.startDate, dateRange.endDate) &&
          searchableText.includes(normalizedQuery)
        );
      }),
    [dateRange, normalizedQuery, rows, typeFilter, userMetadataByEmail]
  );

  return (
    <section className={monitoringTableSurfaceClass}>
      <TableListHeader title="변동 내역" count={filteredRows.length} />
      <div className="w-full overflow-hidden">
        <table aria-label="크레딧 변동 내역" className={monitoringTableClass}>
          <colgroup>
            {['7%', '12%', '11%', '9%', '14%', '25%', '22%'].map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <thead className={monitoringTableHeadClass}>
            <tr className={monitoringTableHeaderRowClass}>
              {['No.', '대상 사용자', '부서', '직책', '변동 크레딧', '잔액 변화', '처리 시각'].map(
                column => (
                  <th key={column} scope="col" className={monitoringTableHeaderCellClass}>
                    {column}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="text-[clamp(0.82rem,0.95vw,0.94rem)] leading-[1.45] text-[#344054]">
            {filteredRows.map((row, index) => {
              const user = getTransactionUser(row, userMetadataByEmail);

              return (
                <tr key={row.id} className={monitoringTableRowClass({ striped: index % 2 === 1 })}>
                  <td className={monitoringTableCellClass(index, 'truncate text-slate-500')}>
                    {row.id}
                  </td>
                  <td
                    className={monitoringTableCellClass(
                      index,
                      'truncate font-medium text-slate-700'
                    )}
                    title={`${user.name} (${row.user})`}
                  >
                    {user.name}
                  </td>
                  <td
                    className={monitoringTableCellClass(index, 'truncate text-slate-500')}
                    title={user.department}
                  >
                    {user.department}
                  </td>
                  <td
                    className={monitoringTableCellClass(index, 'truncate text-slate-500')}
                    title={user.position}
                  >
                    {user.position}
                  </td>
                  <td
                    className={monitoringTableCellClass(
                      index,
                      `truncate font-bold ${row.type === '지급' ? 'text-emerald-600' : 'text-rose-500'}`
                    )}
                    title={row.delta}
                  >
                    {row.delta}
                  </td>
                  <td
                    className={monitoringTableCellClass(index, 'truncate text-slate-500')}
                    title={row.balance}
                  >
                    {row.balance}
                  </td>
                  <td
                    className={monitoringTableCellClass(
                      index,
                      'truncate font-medium text-slate-500'
                    )}
                    title={row.createdAt}
                  >
                    {row.createdAt}
                  </td>
                </tr>
              );
            })}
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="h-56 text-center text-slate-400">
                  조건에 맞는 변동 내역이 없습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function LimitsPage() {
  const [policies, setPolicies] = useState(initialPolicies);
  const [policySaved, setPolicySaved] = useState(false);
  const [tiers, setTiers] = useState(initialTiers);
  const [tierFilter, setTierFilter] = useState('전체 직급');
  const [tierModal, setTierModal] = useState(null);
  const [operation, setOperation] = useState('지급');
  const [selectedUser, setSelectedUser] = useState(users[0]);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [targetMonth, setTargetMonth] = useState('2026-10');
  const [transactions, setTransactions] = useState(initialTransactions);
  const [notice, setNotice] = useState('');
  const visibleTiers = useMemo(
    () => tiers.filter(tier => tierFilter === '전체 직급' || tier.name === tierFilter),
    [tierFilter, tiers]
  );

  const updatePolicy = (key, value) => {
    setPolicies(current => ({ ...current, [key]: value }));
    setPolicySaved(false);
  };

  const submitCredit = event => {
    event.preventDefault();
    const numericAmount = Number(amount.replaceAll(',', ''));
    if (!numericAmount || !reason.trim()) {
      setNotice('크레딧 수량과 처리 사유를 입력해 주세요.');
      return;
    }
    const isGrant = operation === '지급';
    const nextId = (transactions[0]?.id ?? 3084) + 1;
    setTransactions(current => [
      {
        id: nextId,
        user: selectedUser.match(/\((.*?)\)/)?.[1] ?? selectedUser,
        role: '#2',
        type: isGrant ? '지급' : '차감',
        delta: `${isGrant ? '+' : '-'}${numericAmount.toLocaleString()}`,
        balance: isGrant
          ? `994,100 → ${(994100 + numericAmount).toLocaleString()}`
          : `994,100 → ${(994100 - numericAmount).toLocaleString()}`,
        requestId: '-',
        actor: 'ADMIN #2',
      },
      ...current,
    ]);
    setAmount('');
    setReason('');
    setNotice(
      `${selectedUser}에게 ${numericAmount.toLocaleString()} 크레딧 ${isGrant ? '지급' : '회수'}을 완료했습니다.`
    );
  };

  const saveTier = value => {
    const now = new Date();
    const updatedAt = `${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}.`;
    if (tierModal?.tier) {
      setTiers(current =>
        current.map(tier =>
          tier.id === tierModal.tier.id ? { ...tier, ...value, updatedAt } : tier
        )
      );
    } else {
      setTiers(current => [...current, { id: Date.now(), ...value, updatedAt }]);
    }
    setTierModal(null);
    setNotice('지급 기준을 저장했습니다.');
  };

  const policyFields = [
    ['exchangeRate', 'USD 환율', '원'],
    ['creditPrice', '크레딧 단가', '원'],
    ['minimumCharge', '요청 최소 차감', '크레딧'],
    ['totalLimit', '전체 발급 한도', '크레딧'],
  ];

  return (
    <PageLayout gapClassName="gap-0" topPaddingClassName="pt-6">
      <div className="mx-auto w-full max-w-4xl pb-10 text-slate-900">
        {notice ? (
          <div
            role="status"
            className="mb-1 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700"
          >
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice('')}
              aria-label="알림 닫기"
              className="rounded-md p-1 hover:bg-blue-100"
            >
              <X size={16} />
            </button>
          </div>
        ) : null}

        <AdminDetailSection
          title="크레딧 현황"
          description="전체 발급 한도와 현재 사용자 보유량을 기준으로 가용 크레딧을 확인합니다."
        >
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-sm font-medium text-slate-500">가용 크레딧</p>
              <div className="mt-1 flex items-baseline gap-2">
                <strong className="text-4xl font-bold tracking-tight text-slate-950">53%</strong>
                <span className="text-sm font-semibold text-blue-600">남음</span>
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-600">52,788,890 크레딧</span>
          </div>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-[53%] rounded-full bg-blue-600" />
          </div>
          <dl className="mt-7 grid border-y border-slate-200 text-sm sm:grid-cols-3 sm:divide-x sm:divide-slate-200">
            {[
              ['전체 발급 한도', '100,000,000'],
              ['지급 가능', '52,788,890'],
              ['사용자 보유', '47,211,110'],
            ].map(([label, value]) => (
              <div key={label} className="py-4 sm:px-5 sm:first:pl-0 sm:last:pr-0">
                <dt className="text-slate-500">{label}</dt>
                <dd className="mt-1.5 text-base font-semibold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </AdminDetailSection>

        <AdminDetailSection
          title="운영 정책"
          description="환율과 크레딧 단가, 요청 차감 기준 및 전체 발급 한도를 설정합니다."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {policyFields.map(([key, label, suffix]) => (
              <CurrencyInput
                key={key}
                label={label}
                value={policies[key]}
                suffix={suffix}
                onChange={event => updatePolicy(key, event.target.value)}
              />
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <AppButton
              type="button"
              variant="secondary"
              onClick={() => {
                setPolicySaved(true);
                setNotice('운영 정책을 저장했습니다.');
              }}
              className="h-11 gap-2 px-4"
            >
              {policySaved ? <Check size={15} /> : <Save size={15} />}
              {policySaved ? '저장됨' : '변경 저장'}
            </AppButton>
          </div>
        </AdminDetailSection>

        <AdminDetailSection
          title="월별 지급"
          description="선택한 월의 직급별 지급 기준에 따라 사용자 크레딧을 일괄 지급합니다."
        >
          <form
            id="monthly-payout"
            onSubmit={event => {
              event.preventDefault();
              setNotice(`${targetMonth} 월별 크레딧 지급을 실행했습니다.`);
            }}
            className="flex max-full flex-col gap-3 sm:flex-row sm:items-end"
          >
            <label className="min-w-0 flex-1">
              <span className={fieldLabelClass}>대상 월</span>
              <input
                type="month"
                value={targetMonth}
                onChange={event => setTargetMonth(event.target.value)}
                className={inputClass}
              />
            </label>
            <AppButton type="submit" className="h-[var(--app-control-lg)] shrink-0 px-4">
              월별 지급 실행
            </AppButton>
          </form>
        </AdminDetailSection>

        <AdminDetailSection
          title="직급별 지급 기준"
          description="직급 또는 그룹별 월 지급 크레딧을 설정합니다. 행을 선택하면 기준을 수정할 수 있습니다."
          action={
            <AppButton
              onClick={() => setTierModal({ tier: null })}
              className="h-10 shrink-0 gap-2 px-3.5"
            >
              <Plus className="h-4 w-4" /> 지급 기준 등록
            </AppButton>
          }
        >
          <div className="mb-4 flex items-end justify-between gap-4">
            <label className="w-44">
              <span className={fieldLabelClass}>직급</span>
              <CustomDropdown
                value={tierFilter}
                onChange={setTierFilter}
                options={['전체 직급', ...tiers.map(tier => tier.name)]}
                ariaLabel="직급 필터"
                className="[&>button]:h-[var(--app-control-lg)] [&>button]:min-h-0 [&>button]:rounded-[var(--app-radius-lg)] [&>button]:text-[clamp(0.82rem,0.95vw,0.9rem)]"
              />
            </label>
            <span className="pb-3 text-xs font-medium text-slate-500">
              {visibleTiers.length.toLocaleString('ko-KR')}개 기준
            </span>
          </div>
          <div className="border-y border-slate-200">
            <table className={monitoringTableClass}>
              <thead className={monitoringTableHeadClass}>
                <tr className={monitoringTableHeaderRowClass}>
                  {[
                    ['직급', '34%'],
                    ['월 지급 크레딧', '27%'],
                    ['지급 상태', '16%'],
                    ['최근 변경', '23%'],
                  ].map(([title, width]) => (
                    <th key={title} style={{ width }} className={monitoringTableHeaderCellClass}>
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm leading-[1.45] text-[#344054]">
                {visibleTiers.map((tier, index) => (
                  <tr
                    key={tier.id}
                    tabIndex={0}
                    aria-label={`${tier.name} 지급 기준 관리 열기`}
                    onClick={() => setTierModal({ tier })}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setTierModal({ tier });
                      }
                    }}
                    className={monitoringTableRowClass({
                      striped: index % 2 === 1,
                      interactive: true,
                    })}
                  >
                    <td className={monitoringTableCellClass(index, 'font-semibold text-slate-800')}>
                      {tier.name}
                    </td>
                    <td className={monitoringTableCellClass(index, 'font-semibold text-slate-700')}>
                      {tier.credits}
                    </td>
                    <td className={monitoringTableCellClass(index)}>
                      <StatusPill>활성</StatusPill>
                    </td>
                    <td className={monitoringTableCellClass(index, 'text-slate-500')}>
                      {tier.updatedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminDetailSection>

        <AdminDetailSection
          title="수동 지급·회수"
          description="특정 사용자의 크레딧을 즉시 지급하거나 회수합니다. 처리 결과는 변동 내역에 기록됩니다."
        >
          <form onSubmit={submitCredit} className="max-w-full space-y-5">
            <div className="flex items-end justify-between gap-4">
              <fieldset>
                <legend className={fieldLabelClass}>처리 유형</legend>
                <div className="flex h-[var(--app-control-lg)] items-center gap-5 text-sm text-slate-700">
                  {['지급', '회수'].map(value => (
                    <label key={value} className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="operation"
                        checked={operation === value}
                        onChange={() => setOperation(value)}
                        className="accent-blue-600"
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </fieldset>
              <span className="pb-3 text-xs text-slate-500">
                지급 가능 <strong className="ml-1 font-semibold text-slate-800">52,788,890</strong>
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className={fieldLabelClass}>사용자</span>
                <CustomDropdown
                  value={selectedUser}
                  onChange={setSelectedUser}
                  options={users}
                  ariaLabel="대상 사용자"
                  className="[&>button]:h-[var(--app-control-lg)] [&>button]:min-h-0 [&>button]:rounded-[var(--app-radius-lg)] [&>button]:text-[clamp(0.82rem,0.95vw,0.9rem)]"
                />
              </label>
              <label>
                <span className={fieldLabelClass}>크레딧 수량</span>
                <span className="relative block">
                  <input
                    value={amount}
                    onChange={event => setAmount(event.target.value)}
                    inputMode="numeric"
                    placeholder="수량 입력"
                    className={`${inputClass} pr-16`}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
                    크레딧
                  </span>
                </span>
              </label>
            </div>
            <label className="block">
              <span className={fieldLabelClass}>처리 사유</span>
              <textarea
                value={reason}
                onChange={event => setReason(event.target.value)}
                placeholder="처리 사유를 입력해 주세요."
                className="min-h-24 w-full resize-y rounded-[var(--app-radius-lg)] border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-[#8BC6FF] focus:ring-4 focus:ring-[#DEEEFF]"
              />
            </label>
            <div className="flex justify-end">
              <AppButton type="submit" className="h-11 px-5">
                {operation} 실행
              </AppButton>
            </div>
          </form>
        </AdminDetailSection>
      </div>

      {tierModal ? (
        <TierModal tier={tierModal.tier} onClose={() => setTierModal(null)} onSave={saveTier} />
      ) : null}
    </PageLayout>
  );
}

export function CreditHistoryPage() {
  const { data: clientsData } = useRegisteredClientsQuery();
  const [defaultDateRange] = useState(() => createDefaultDateRange());
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [typeFilter, setTypeFilter] = useState('전체');
  const [searchInput, setSearchInput] = useState('');
  const [submittedFilters, setSubmittedFilters] = useState({
    typeFilter: '전체',
    query: '',
  });
  const [page, setPage] = useState(1);
  const userMetadataByEmail = useMemo(
    () =>
      Object.fromEntries(
        (clientsData?.clients ?? [])
          .filter(client => client.email && client.user_name)
          .map(client => [
            client.email,
            {
              name: client.user_name,
              department: client.department || '-',
              position: client.position || '-',
            },
          ])
      ),
    [clientsData?.clients]
  );
  const handleSearch = () => {
    setSubmittedFilters({ typeFilter, query: searchInput.trim() });
    setPage(1);
  };
  const handleReset = () => {
    setDateRange(defaultDateRange);
    setTypeFilter('전체');
    setSearchInput('');
    setSubmittedFilters({ typeFilter: '전체', query: '' });
    setPage(1);
  };

  return (
    <PageLayout gapClassName="gap-4" bottomPaddingClassName="pb-0">
      <section className="grid items-end gap-[var(--app-gap-sm)] md:grid-cols-2 xl:grid-cols-[10.25rem_9rem_minmax(0,1fr)_5.25rem_3rem]">
        <DateRangePicker
          label="조회 기간"
          labelClassName="mb-1.5 block text-xs font-bold text-slate-700"
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={range => {
            setDateRange(range);
            setPage(1);
          }}
          widthClass="w-full min-w-0"
        />
        <label className="min-w-0">
          <span className="mb-1.5 block text-xs font-bold text-slate-700">유형</span>
          <CustomDropdown
            value={typeFilter}
            onChange={setTypeFilter}
            options={['전체', '지급', '차감']}
            ariaLabel="변동 유형"
            className="[&>button]:h-[var(--app-control-lg)] [&>button]:min-h-0 [&>button]:rounded-[var(--app-radius-lg)] [&>button]:text-[clamp(0.82rem,0.95vw,0.9rem)] [&>button]:font-semibold"
          />
        </label>
        <label className="min-w-0">
          <span className="mb-1.5 block text-xs font-bold text-slate-700">통합 검색</span>
          <AppSearchField
            value={searchInput}
            onChange={event => setSearchInput(event.target.value)}
            placeholder="사용자, 변동 ID, 잔액 또는 처리 시각 검색..."
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
      </section>
      <TransactionTable
        rows={initialTransactions}
        userMetadataByEmail={userMetadataByEmail}
        dateRange={dateRange}
        {...submittedFilters}
      />
      <FixedPaginationBar currentPage={page} totalPages={154} onPageChange={setPage} />
    </PageLayout>
  );
}
