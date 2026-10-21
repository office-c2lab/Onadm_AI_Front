import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Check, Plus, Save, X } from 'lucide-react';
import CustomDropdown from '../../../../components/dropdown/CustomDropdown.jsx';

const initialPolicies = {
  exchangeRate: '1,332',
  creditPrice: '10',
  minimumCharge: '1,000',
  totalLimit: '100,000,000',
};

const initialTiers = [
  { id: 1, name: '테스트직책', credits: '1,000,000', updatedAt: '2026. 6. 12. 오후 12:59' },
  { id: 2, name: '교수', credits: '100,000', updatedAt: '2026. 7. 6. 오후 10:56' },
  { id: 3, name: '직원', credits: '100,000,000', updatedAt: '2026. 6. 12. 오후 1:02' },
  { id: 4, name: '학생', credits: '10,000', updatedAt: '2026. 6. 4. 오후 8:10' },
  { id: 5, name: '세종시', credits: '456', updatedAt: '2026. 6. 4. 오후 9:46' },
  { id: 6, name: '관리자', credits: '499', updatedAt: '2026. 6. 8. 오후 5:34' },
];

const initialTransactions = [
  {
    id: 3084,
    user: 'tester2@school.edu',
    role: '#2',
    type: '지급',
    delta: '+100',
    balance: '994,000 → 994,100',
    requestId: '-',
    actor: 'ADMIN #2',
  },
  {
    id: 3083,
    user: 'tester2@school.edu',
    role: '#2',
    type: '차감',
    delta: '-1,000',
    balance: '995,000 → 994,000',
    requestId: '3276',
    actor: 'LLM_REQUEST #3276',
  },
  {
    id: 3082,
    user: 'tester2@school.edu',
    role: '#2',
    type: '차감',
    delta: '-1,000',
    balance: '996,000 → 995,000',
    requestId: '3275',
    actor: 'LLM_REQUEST #3275',
  },
  {
    id: 3081,
    user: 'tester2@school.edu',
    role: '#2',
    type: '차감',
    delta: '-1,000',
    balance: '997,000 → 996,000',
    requestId: '3274',
    actor: 'LLM_REQUEST #3274',
  },
  {
    id: 3080,
    user: 'tester2@school.edu',
    role: '#2',
    type: '차감',
    delta: '-1,000',
    balance: '998,000 → 997,000',
    requestId: '3273',
    actor: 'LLM_REQUEST #3273',
  },
];

const users = ['테스트사용자 #1 (tester1@school.edu)', 'tester2@school.edu', 'bjh@aictl.kr'];

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100';
const fieldLabelClass = 'mb-1.5 block text-xs font-semibold text-slate-600';
const panelClass =
  'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.025]';

function PanelHeading({ title, action }) {
  return (
    <header className="flex min-h-10 items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5">
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
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
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function TierModal({ tier, onClose, onSave }) {
  const [name, setName] = useState(tier?.name ?? '');
  const [credits, setCredits] = useState(tier?.credits ?? '');

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="닫기" />
      <section
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-900">{tier ? '지급 기준 관리' : '지급 기준 등록'}</h2>
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
          className="space-y-4 p-5"
        >
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
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600"
            >
              취소
            </button>
            <button className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
              저장
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function TransactionTable({
  rows,
  typeFilter,
  setTypeFilter,
  userQuery,
  setUserQuery,
  requestQuery,
  setRequestQuery,
  page,
  setPage,
}) {
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
    <section className={panelClass}>
      <PanelHeading
        title="변동 내역"
        action={
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
            3,073
          </span>
        }
      />
      <div className="flex flex-wrap items-end gap-2 border-b border-slate-100 px-4 py-3">
        <label className="w-28">
          <span className={fieldLabelClass}>유형</span>
          <CustomDropdown
            value={typeFilter}
            onChange={setTypeFilter}
            options={['전체', '지급', '차감']}
            ariaLabel="변동 유형"
            className="[&>button]:h-9 [&>button]:min-h-0 [&>button]:rounded-lg [&>button]:text-xs"
          />
        </label>
        <label className="w-40">
          <span className={fieldLabelClass}>사용자 ID</span>
          <input
            value={userQuery}
            onChange={event => setUserQuery(event.target.value)}
            placeholder="사용자 ID 입력..."
            className={`${inputClass} h-9 text-xs`}
          />
        </label>
        <label className="w-36">
          <span className={fieldLabelClass}>요청 ID</span>
          <input
            value={requestQuery}
            onChange={event => setRequestQuery(event.target.value)}
            placeholder="요청 ID 입력..."
            className={`${inputClass} h-9 text-xs`}
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] table-fixed text-left text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {[
                ['로그 ID', '8%'],
                ['사용자', '18%'],
                ['직급', '8%'],
                ['유형', '10%'],
                ['변동', '10%'],
                ['잔액 변화', '17%'],
                ['요청 ID', '11%'],
                ['처리 주체', '18%'],
              ].map(([title, width]) => (
                <th
                  key={title}
                  style={{ width }}
                  className="border-b border-slate-100 px-3 py-2.5 font-semibold"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, index) => (
              <tr key={row.id} className="hover:bg-slate-50/70">
                <td className="border-b border-slate-100 px-3 py-2.5 text-slate-500">{row.id}</td>
                <td className="border-b border-slate-100 px-3 py-2.5 font-medium text-slate-700">
                  {row.user}
                </td>
                <td className="border-b border-slate-100 px-3 py-2.5 text-slate-500">{row.role}</td>
                <td className="border-b border-slate-100 px-3 py-2.5">
                  <StatusPill tone={row.type === '지급' ? 'green' : 'red'}>{row.type}</StatusPill>
                </td>
                <td
                  className={`border-b border-slate-100 px-3 py-2.5 font-bold ${row.type === '지급' ? 'text-emerald-600' : 'text-rose-500'}`}
                >
                  {row.delta}
                </td>
                <td className="border-b border-slate-100 px-3 py-2.5 text-slate-500">
                  {row.balance}
                </td>
                <td className="border-b border-slate-100 px-3 py-2.5 text-slate-500">
                  {row.requestId}
                </td>
                <td className="border-b border-slate-100 px-3 py-2.5 text-slate-400">
                  {row.actor}
                </td>
              </tr>
            ))}
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400">
                  조건에 맞는 변동 내역이 없습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <footer className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-slate-500">
        <span>3,073건</span>
        <nav className="flex items-center gap-1" aria-label="변동 내역 페이지">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="rounded px-2 py-1 disabled:text-slate-300"
          >
            ‹ 이전
          </button>
          {[1, 2, 3, 4, 5].map(number => (
            <button
              key={number}
              type="button"
              onClick={() => setPage(number)}
              className={`h-8 min-w-8 rounded-lg px-2 ${page === number ? 'bg-blue-600 font-bold text-white' : 'hover:bg-slate-100'}`}
            >
              {number}
            </button>
          ))}
          <span className="px-1">…</span>
          <button
            type="button"
            onClick={() => setPage(154)}
            className={`h-8 rounded-lg px-2 ${page === 154 ? 'bg-blue-600 text-white' : ''}`}
          >
            154
          </button>
          <button type="button" onClick={() => setPage(page + 1)} className="rounded px-2 py-1">
            다음 ›
          </button>
        </nav>
      </footer>
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
    <main className="mx-auto w-full max-w-[88rem] space-y-3 px-[clamp(0.875rem,2vw,1.5rem)] pb-8 pt-4 text-slate-900">
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

      <div className="grid gap-3 xl:grid-cols-2">
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
                className={`${inputClass} h-9`}
              />
            </label>
            <button className="h-9 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700">
              월별 지급 실행
            </button>
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
            <button
              type="button"
              onClick={() => {
                setPolicySaved(true);
                setNotice('운영 정책을 저장했습니다.');
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-100 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
            >
              {policySaved ? <Check size={14} /> : <Save size={14} />}
              {policySaved ? '저장됨' : '변경 저장'}
            </button>
          </div>
        </div>
      </section>

      <section className={panelClass}>
        <PanelHeading
          title="직급별 지급 기준"
          action={
            <button
              type="button"
              onClick={() => setTierModal({ tier: null })}
              className="inline-flex h-8 items-center gap-1 rounded-lg bg-blue-50 px-3 text-xs font-semibold text-blue-600 hover:bg-blue-100"
            >
              <Plus size={14} />
              지급 기준 등록
            </button>
          }
        />
        <div className="flex items-center gap-2 px-4 py-2">
          <span className="text-xs text-slate-500">직급</span>
          <CustomDropdown
            value={tierFilter}
            onChange={setTierFilter}
            options={['전체 직급', ...tiers.map(tier => tier.name)]}
            ariaLabel="직급 필터"
            className="w-32 [&>button]:h-8 [&>button]:min-h-0 [&>button]:rounded-lg [&>button]:text-xs"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] table-fixed text-left text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {[
                  ['직급', '35%'],
                  ['월 지급 크레딧', '25%'],
                  ['지급 상태', '15%'],
                  ['최근 변경', '17%'],
                  ['관리', '8%'],
                ].map(([title, width]) => (
                  <th
                    key={title}
                    style={{ width }}
                    className="border-y border-slate-100 px-4 py-2 font-semibold"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleTiers.map(tier => (
                <tr key={tier.id} className="hover:bg-slate-50/60">
                  <td className="border-b border-slate-100 px-4 py-2">
                    <span className="block font-semibold text-slate-800">{tier.name}</span>
                    <span className="mt-0.5 block text-[10px] text-slate-400">#{tier.id}</span>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-2 font-semibold text-slate-700">
                    {tier.credits}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-2">
                    <StatusPill>활성</StatusPill>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-400">
                    {tier.updatedAt}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-2">
                    <button
                      type="button"
                      onClick={() => setTierModal({ tier })}
                      className="rounded-md bg-slate-100 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-200"
                    >
                      관리
                    </button>
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
                    className="[&>button]:h-9 [&>button]:min-h-0 [&>button]:rounded-lg [&>button]:text-xs"
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
                      className={`${inputClass} h-9 pr-14 text-xs`}
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
                  <button className="h-9 shrink-0 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700">
                    지급 실행
                  </button>
                </div>
              </label>
            </div>
          </form>
        </div>
      </section>

      {tierModal ? (
        <TierModal tier={tierModal.tier} onClose={() => setTierModal(null)} onSave={saveTier} />
      ) : null}
    </main>
  );
}

export function CreditHistoryPage() {
  const [typeFilter, setTypeFilter] = useState('전체');
  const [userQuery, setUserQuery] = useState('');
  const [requestQuery, setRequestQuery] = useState('');
  const [page, setPage] = useState(1);

  return (
    <main className="mx-auto w-full max-w-[88rem] space-y-3 px-[clamp(0.875rem,2vw,1.5rem)] pb-8 pt-4 text-slate-900">
      <TransactionTable
        rows={initialTransactions}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        userQuery={userQuery}
        setUserQuery={setUserQuery}
        requestQuery={requestQuery}
        setRequestQuery={setRequestQuery}
        page={page}
        setPage={setPage}
      />
    </main>
  );
}
