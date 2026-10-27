import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Check, Plus, Save, X } from 'lucide-react';
import CustomDropdown from '../../../../../components/dropdown/CustomDropdown.jsx';
import AppButton from '../../external/components/AppButton.jsx';
import AppSearchField from '../../external/components/AppSearchField.jsx';
import FixedPaginationBar from '../../external/components/FixedPaginationBar.jsx';
import TableListHeader from '../../external/components/TableListHeader.jsx';
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

import { initialPolicies, initialTiers, initialTransactions, users } from '../data.js';
const inputClass =
  'h-[var(--app-control-lg)] w-full rounded-[var(--app-radius-lg)] border border-slate-200 bg-white px-[var(--app-pad-md)] text-[clamp(0.82rem,0.95vw,0.9rem)] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#8BC6FF] focus:ring-[clamp(0.2rem,0.32vw,0.25rem)] focus:ring-[#DEEEFF]';
const fieldLabelClass = 'mb-1.5 block text-[0.8rem] font-semibold text-[#5C6784]';
const panelClass =
  'overflow-hidden rounded-[22px] border border-[#E2E8F4] bg-white shadow-[0_12px_34px_rgba(15,23,42,0.06)]';

function PanelHeading({ title, action }) {
  return (
    <header className="flex min-h-14 items-center justify-between gap-3 border-b border-[#E7EBF4] px-5 py-3">
      <h2 className="text-[1.12rem] font-bold tracking-[-0.03em] text-[#11182E] xl:text-[1.18rem]">
        {title}
      </h2>
      {action}
    </header>
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

function TransactionTable({ rows, typeFilter, userQuery, requestQuery }) {
  const filteredRows = useMemo(
    () =>
      rows.filter(
        row =>
          (typeFilter === '전체' || row.type === typeFilter) &&
          row.user.toLowerCase().includes(userQuery.toLowerCase()) &&
          row.requestId.toLowerCase().includes(requestQuery.toLowerCase())
      ),
    [rows, typeFilter, userQuery, requestQuery]
  );

  return (
    <section className={monitoringTableSurfaceClass}>
      <TableListHeader title="변동 내역" count={filteredRows.length} />
      <div className="overflow-x-auto">
        <table aria-label="크레딧 변동 내역" className={`${monitoringTableClass} min-w-[68rem]`}>
          <colgroup>
            {['8%', '18%', '8%', '10%', '10%', '17%', '11%', '18%'].map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
          <thead className={monitoringTableHeadClass}>
            <tr className={monitoringTableHeaderRowClass}>
              {[
                '로그 ID',
                '사용자',
                '직급',
                '유형',
                '변동',
                '잔액 변화',
                '요청 ID',
                '처리 주체',
              ].map(column => (
                <th key={column} scope="col" className={monitoringTableHeaderCellClass}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[clamp(0.82rem,0.95vw,0.94rem)] leading-[1.45] text-[#344054]">
            {filteredRows.map((row, index) => (
              <tr key={row.id} className={monitoringTableRowClass({ striped: index % 2 === 1 })}>
                <td className={monitoringTableCellClass(index, 'text-slate-500')}>{row.id}</td>
                <td className={monitoringTableCellClass(index, 'font-medium text-slate-700')}>
                  {row.user}
                </td>
                <td className={monitoringTableCellClass(index, 'text-slate-500')}>{row.role}</td>
                <td className={monitoringTableCellClass(index)}>
                  <StatusPill tone={row.type === '지급' ? 'green' : 'red'}>{row.type}</StatusPill>
                </td>
                <td
                  className={monitoringTableCellClass(
                    index,
                    `font-bold ${row.type === '지급' ? 'text-emerald-600' : 'text-rose-500'}`
                  )}
                >
                  {row.delta}
                </td>
                <td className={monitoringTableCellClass(index, 'text-slate-500')}>{row.balance}</td>
                <td className={monitoringTableCellClass(index, 'text-slate-500')}>
                  {row.requestId}
                </td>
                <td className={monitoringTableCellClass(index, 'text-slate-400')}>{row.actor}</td>
              </tr>
            ))}
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="h-56 text-center text-slate-400">
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
  const navigate = useNavigate();
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
    <PageLayout gapClassName="gap-4">
      {notice ? (
        <div
          role="status"
          className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2.5 text-sm text-blue-700"
        >
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} aria-label="알림 닫기">
            <X size={16} />
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <section className={panelClass}>
          <PanelHeading
            title="크레딧 현황"
            action={
              <button
                type="button"
                onClick={() => navigate('/admin/control/internal/credit-history')}
                aria-label="변동 내역 보기"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
              >
                <ArrowUpRight size={17} />
              </button>
            }
          />
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-slate-500">전체 크레딧 한도 사용</p>
            <div className="mt-1 flex items-baseline gap-2">
              <strong className="text-3xl font-bold tracking-tight">53%</strong>
              <span className="text-sm font-bold text-blue-600">남음</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div className="h-full w-[53%] rounded-full bg-blue-600" />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
              <span>
                총 크레딧 <strong className="ml-1 text-slate-700">100,000,000</strong>
              </span>
              <span>
                지급 가능 <strong className="ml-1 text-slate-700">52,788,890</strong>
              </span>
              <span>
                사용자 보유 <strong className="ml-1 text-slate-700">47,211,110</strong>
              </span>
            </div>
          </div>
        </section>

        <section id="monthly-payout" className={panelClass}>
          <PanelHeading title="월별 지급" />
          <form
            onSubmit={event => {
              event.preventDefault();
              setNotice(`${targetMonth} 월별 크레딧 지급을 실행했습니다.`);
            }}
            className="flex flex-wrap items-end gap-3 px-4 py-4"
          >
            <label className="min-w-48 flex-1">
              <span className={fieldLabelClass}>대상 월</span>
              <input
                type="month"
                value={targetMonth}
                onChange={event => setTargetMonth(event.target.value)}
                className={inputClass}
              />
            </label>
            <AppButton type="submit" className="h-[var(--app-control-lg)] px-4">
              월별 지급 실행
            </AppButton>
          </form>
        </section>
      </div>

      <section className={panelClass}>
        <PanelHeading title="운영 정책" />
        <div className="grid gap-x-4 gap-y-3 px-4 py-3 sm:grid-cols-4">
          {policyFields.map(([key, label, suffix]) => (
            <CurrencyInput
              key={key}
              label={label}
              value={policies[key]}
              suffix={suffix}
              onChange={event => updatePolicy(key, event.target.value)}
            />
          ))}
          <div className="flex justify-end sm:col-span-4">
            <AppButton
              type="button"
              variant="secondary"
              onClick={() => {
                setPolicySaved(true);
                setNotice('운영 정책을 저장했습니다.');
              }}
              className="h-[var(--app-control-lg)] gap-2 px-4"
            >
              {policySaved ? <Check size={14} /> : <Save size={14} />}
              {policySaved ? '저장됨' : '변경 저장'}
            </AppButton>
          </div>
        </div>
      </section>

      <section className={panelClass}>
        <PanelHeading title="직급별 지급 기준" />
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#E7EBF4] px-4 py-3">
          <label className="w-40">
            <span className={fieldLabelClass}>직급</span>
            <CustomDropdown
              value={tierFilter}
              onChange={setTierFilter}
              options={['전체 직급', ...tiers.map(tier => tier.name)]}
              ariaLabel="직급 필터"
              className="[&>button]:h-[var(--app-control-lg)] [&>button]:min-h-0 [&>button]:rounded-[var(--app-radius-lg)] [&>button]:text-[clamp(0.82rem,0.95vw,0.9rem)]"
            />
          </label>
          <AppButton
            onClick={() => setTierModal({ tier: null })}
            className="h-[var(--app-control-lg)]"
          >
            <Plus className="h-4 w-4" /> 지급 기준 등록
          </AppButton>
        </div>
        <TableListHeader title="지급 기준 목록" count={visibleTiers.length} />
        <div className="overflow-x-auto">
          <table className={`${monitoringTableClass} min-w-[58rem]`}>
            <thead className={monitoringTableHeadClass}>
              <tr className={monitoringTableHeaderRowClass}>
                {[
                  ['직급', '38%'],
                  ['월 지급 크레딧', '27%'],
                  ['지급 상태', '16%'],
                  ['최근 변경', '19%'],
                ].map(([title, width]) => (
                  <th key={title} style={{ width }} className={monitoringTableHeaderCellClass}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[clamp(0.82rem,0.95vw,0.94rem)] leading-[1.45] text-[#344054]">
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
                  <td className={monitoringTableCellClass(index)}>
                    <span className="block font-semibold text-slate-800">{tier.name}</span>
                    <span className="mt-0.5 block text-[0.76rem] text-slate-400">#{tier.id}</span>
                  </td>
                  <td className={monitoringTableCellClass(index, 'font-semibold text-slate-700')}>
                    {tier.credits}
                  </td>
                  <td className={monitoringTableCellClass(index)}>
                    <StatusPill>활성</StatusPill>
                  </td>
                  <td className={monitoringTableCellClass(index, 'text-slate-400')}>
                    {tier.updatedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={panelClass}>
        <PanelHeading title="크레딧 지급·회수" />
        <div className="p-3">
          <form onSubmit={submitCredit} className="rounded-lg border border-slate-200">
            <PanelHeading
              title="수동 지급·회수"
              action={
                <span className="text-[11px] text-slate-500">
                  지급 가능 <strong className="ml-1 text-slate-700">52,788,890</strong>
                </span>
              }
            />
            <div className="space-y-2.5 p-3">
              <fieldset>
                <legend className={fieldLabelClass}>처리 유형</legend>
                <div className="flex gap-4 text-xs text-slate-700">
                  {['지급', '회수'].map(value => (
                    <label key={value} className="inline-flex items-center gap-1.5">
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
              <div className="grid gap-3 sm:grid-cols-2">
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
                  <div className="relative">
                    <input
                      value={amount}
                      onChange={event => setAmount(event.target.value)}
                      inputMode="numeric"
                      placeholder="수량 입력"
                      className={`${inputClass} pr-14`}
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-[11px] text-slate-400">
                      크레딧
                    </span>
                  </div>
                </label>
              </div>
              <label className="block">
                <span className={fieldLabelClass}>처리 사유</span>
                <div className="flex items-end gap-2">
                  <textarea
                    value={reason}
                    onChange={event => setReason(event.target.value)}
                    placeholder="처리 사유 입력..."
                    className="min-h-12 flex-1 resize-y rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  <AppButton type="submit" className="h-[var(--app-control-lg)] shrink-0 px-4">
                    지급 실행
                  </AppButton>
                </div>
              </label>
            </div>
          </form>
        </div>
      </section>

      {tierModal ? (
        <TierModal tier={tierModal.tier} onClose={() => setTierModal(null)} onSave={saveTier} />
      ) : null}
    </PageLayout>
  );
}

export function CreditHistoryPage() {
  const [typeFilter, setTypeFilter] = useState('전체');
  const [userQuery, setUserQuery] = useState('');
  const [requestQuery, setRequestQuery] = useState('');
  const [submittedFilters, setSubmittedFilters] = useState({
    typeFilter: '전체',
    userQuery: '',
    requestQuery: '',
  });
  const [page, setPage] = useState(1);
  const handleSearch = () => {
    setSubmittedFilters({ typeFilter, userQuery, requestQuery });
    setPage(1);
  };

  return (
    <PageLayout gapClassName="gap-4" bottomPaddingClassName="pb-0">
      <section className="grid items-end gap-[var(--app-gap-sm)] md:grid-cols-2 xl:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)_5.25rem]">
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
          <span className="mb-1.5 block text-xs font-bold text-slate-700">사용자 ID</span>
          <AppSearchField
            value={userQuery}
            onChange={event => setUserQuery(event.target.value)}
            placeholder="사용자 ID 입력..."
          />
        </label>
        <label className="min-w-0">
          <span className="mb-1.5 block text-xs font-bold text-slate-700">요청 ID</span>
          <AppSearchField
            value={requestQuery}
            onChange={event => setRequestQuery(event.target.value)}
            placeholder="요청 ID 입력..."
          />
        </label>
        <AppButton onClick={handleSearch} className="h-[var(--app-control-lg)] w-full">
          조회
        </AppButton>
      </section>
      <TransactionTable rows={initialTransactions} {...submittedFilters} />
      <FixedPaginationBar currentPage={page} totalPages={154} onPageChange={setPage} />
    </PageLayout>
  );
}
