import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Download,
  Globe2,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import PageLayout from '../control/components/PageLayout.jsx';
import { DateRangePicker } from '../control/external/components/monitoring/MonitoringListComponents.jsx';
import {
  STATUS_COLORS,
  STATUS_TEXT_CLASS_NAMES,
} from '../control/external/constants/statusColors.js';
import { useRegisteredClientsQuery } from '../control/external/queries/userManagementQueries.js';
import { usageDefaultDateRange } from '../control/internal/data.js';
import zipFileImage from '../../../assets/images/zipfile.png';
import { reviewRequests } from '../manage/data.js';
import '../control/external/garim.css';

const panelClass =
  'min-w-0 rounded-[22px] border border-[#E2E8F4] bg-white px-5 py-5 shadow-[0_12px_34px_rgba(15,23,42,0.06)] xl:px-6';

const internalTrend = [
  { date: '10.22', requests: 4210, success: 4098, failure: 112 },
  { date: '10.23', requests: 4380, success: 4264, failure: 116 },
  { date: '10.24', requests: 4100, success: 4008, failure: 92 },
  { date: '10.25', requests: 4720, success: 4604, failure: 116 },
  { date: '10.26', requests: 4950, success: 4832, failure: 118 },
  { date: '10.27', requests: 4860, success: 4751, failure: 109 },
  { date: '10.28', requests: 5180, success: 5058, failure: 122 },
];

const internalSeries = [
  { key: 'requests', label: '전체 요청', color: '#2678F5' },
  { key: 'success', label: '성공', color: '#2BB658' },
  { key: 'failure', label: '실패', color: '#FF4B57' },
];

const externalTrend = [
  { date: '10.22', normal: 70, masking: 98, blocked: 8 },
  { date: '10.23', normal: 79, masking: 112, blocked: 9 },
  { date: '10.24', normal: 71, masking: 105, blocked: 17 },
  { date: '10.25', normal: 89, masking: 139, blocked: 14 },
  { date: '10.26', normal: 100, masking: 168, blocked: 16 },
  { date: '10.27', normal: 95, masking: 152, blocked: 13 },
  { date: '10.28', normal: 99, masking: 156, blocked: 20 },
];

const externalSeries = [
  { key: 'normal', label: '정상', color: STATUS_COLORS.normal },
  { key: 'masking', label: '마스킹', color: STATUS_COLORS.masking },
  { key: 'blocked', label: '차단', color: STATUS_COLORS.block },
];

const discoverItems = [
  { domain: 'writerflow.ai', status: '신규 후보', time: '10.20 11:21' },
  { domain: 'newai.example', status: '검토 필요', time: '10.20 10:35' },
  { domain: 'claude.ai', status: '등록됨', time: '10.20 10:48' },
  { domain: 'perplexity.ai', status: '등록됨', time: '10.20 09:43' },
];

const engines = [
  { name: 'Discover', version: 'v1.2.0', icon: Search },
  { name: 'Control 내부', version: 'v1.4.2', icon: ShieldCheck },
  { name: 'Control 외부', version: 'v1.3.8', icon: Globe2 },
  { name: 'Manage', version: 'v1.3.0', icon: Boxes },
];

const defaultUserStatuses = {
  1: '승인 대기',
  2: '활성',
  3: '비활성',
  4: '거절됨',
  5: '승인 대기',
  6: '활성',
};

const userAvatarStyles = [
  'bg-[#E8F1FF] text-[#075DF6]',
  'bg-[#F3E8FF] text-[#7C3AED]',
  'bg-[#E4F7EE] text-[#15805D]',
  'bg-[#FFF0E7] text-[#C35A16]',
  'bg-[#FFF0F1] text-[#D92D45]',
  'bg-[#E8F7FA] text-[#08798A]',
];

function Panel({ title, description, action, children, className = '' }) {
  return (
    <section className={`${panelClass} ${className}`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[1.12rem] font-bold tracking-[-0.03em] text-[#11182E] xl:text-[1.18rem]">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-[0.82rem] font-medium text-[#71809D]">{description}</p>
          ) : null}
        </div>
        {action}
      </header>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function MetricCard({ title, value, status, helper, tone = 'text-[#2BB658]', onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group min-w-0 overflow-hidden rounded-[18px] border border-[#E2E8F4] bg-white px-5 py-5 text-left shadow-[0_10px_28px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-[#C9D3E8] hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]"
    >
      <p className="truncate text-[0.96rem] font-semibold text-[#20273D]">{title}</p>
      <strong className="mt-5 block min-w-0 overflow-hidden text-[clamp(1.75rem,2.2vw,2.25rem)] leading-none font-black tracking-[-0.05em] text-ellipsis text-[#0E1731] tabular-nums whitespace-nowrap">
        {value}
      </strong>
      <p className={`mt-2 min-h-5 truncate text-sm font-bold ${tone}`}>{status}</p>
      <p className="mt-2 truncate text-xs font-medium text-[#71809D]">{helper}</p>
    </button>
  );
}

function TextAction({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[0.78rem] font-bold text-[#075DF6] transition hover:bg-[#EFF6FF]"
    >
      {children}
      <ArrowRight size={14} strokeWidth={2.2} aria-hidden="true" />
    </button>
  );
}

function TrendTooltip({ active, label, payload }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-[#E5EAF3] bg-white px-3 py-2 text-xs font-bold shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
      <p className="mb-1.5 text-[#1F2942]">{label}</p>
      <div className="grid gap-1.5">
        {payload.map(item => (
          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-5 text-[#647089]"
          >
            <span className="flex items-center gap-2">
              <i className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="text-[#1F2942]">{item.value.toLocaleString('ko-KR')}건</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendLegend({ series }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {series.map(item => (
        <span
          key={item.key}
          className="inline-flex h-8 items-center gap-2 rounded-full px-2 text-[0.76rem] font-bold text-[#33415B]"
        >
          <i className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function TrendChart({ data, series, compact = false }) {
  return (
    <div className={compact ? 'h-[15rem] min-w-0' : 'h-[clamp(16rem,21vw,19rem)] min-w-0'}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 18, right: 16, bottom: 4, left: -2 }}>
          <CartesianGrid stroke="#E8EDF7" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#71809D', fontSize: 12, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            tickFormatter={value => (value >= 1000 ? `${value / 1000}K` : value)}
            tick={{ fill: '#71809D', fontSize: 12, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: '#D6E9FF' }} />
          {series.map(item => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={item.color}
              strokeWidth={2.8}
              dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF', stroke: item.color }}
              activeDot={{ r: 5, strokeWidth: 2, fill: '#FFFFFF', stroke: item.color }}
              animationDuration={520}
              animationEasing="ease-out"
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

function getReviewStatus(item) {
  if (item.approval === '승인') return '승인 완료';
  if (['반려', '보완 필요'].includes(item.approval)) return '반려';
  if (item.scan === '대기') return '심사 대기';
  if (item.scan !== '통과') return '심사 진행중';
  return '관리자 검토';
}

function getReviewTab(item) {
  const status = getReviewStatus(item);
  return ['심사 대기', '심사 진행중'].includes(status) ? '자동 심사' : status;
}

function ReviewStatus({ status }) {
  const color =
    status === '승인 완료'
      ? 'text-emerald-600'
      : status === '반려'
        ? 'text-red-600'
        : status === '관리자 검토' || status === '심사 진행중'
          ? 'text-blue-600'
          : 'text-slate-500';

  return (
    <span className={`text-[0.82rem] font-semibold whitespace-nowrap ${color}`}>{status}</span>
  );
}

function UserAvatar({ user }) {
  const styleIndex = [...user.id].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const initial = user.name.trim().slice(0, 1) || '?';

  return (
    <span
      className={`relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full text-sm font-bold ring-1 ring-black/5 ${userAvatarStyles[styleIndex % userAvatarStyles.length]}`}
      aria-hidden="true"
    >
      {initial}
      {user.profileImageUrl ? (
        <img
          src={user.profileImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={event => event.currentTarget.remove()}
        />
      ) : null}
    </span>
  );
}

function DiscoverStatus({ status }) {
  const tone =
    status === '등록됨'
      ? 'text-emerald-600'
      : status === '검토 필요'
        ? 'text-orange-600'
        : 'text-amber-600';
  return <span className={`text-[0.82rem] font-bold whitespace-nowrap ${tone}`}>{status}</span>;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState(usageDefaultDateRange);
  const { data: clientsData } = useRegisteredClientsQuery();

  const reviewCounts = useMemo(
    () =>
      Object.fromEntries(
        ['자동 심사', '관리자 검토', '승인 완료', '반려'].map(tab => [
          tab,
          reviewRequests.filter(item => getReviewTab(item) === tab).length,
        ])
      ),
    []
  );
  const actionableReviews = useMemo(
    () => reviewRequests.filter(item => getReviewStatus(item) !== '승인 완료').slice(0, 4),
    []
  );
  const pendingUsers = useMemo(
    () =>
      (clientsData?.clients ?? [])
        .map(user => ({
          id: String(user.id ?? user.client_id),
          name: user.user_name ?? '',
          email: user.email ?? '-',
          profileImageUrl:
            user.profile_image_url ??
            user.profileImageUrl ??
            user.avatar_url ??
            user.photo_url ??
            '',
          department: user.department ?? '',
          position: user.position ?? '',
          createdAt: user.time_kst ?? '-',
          status: user.account_status ?? user.status ?? defaultUserStatuses[user.id] ?? '승인 대기',
        }))
        .filter(user => user.status === '승인 대기'),
    [clientsData]
  );

  const summaryCards = [
    {
      title: 'AI 서비스 탐색',
      value: '2',
      status: '확인 필요',
      helper: '신규 후보 1 · 검토 필요 1',
      tone: 'text-[#FF9F1C]',
      to: '/admin/discover/url-analysis',
    },
    {
      title: 'AI 요청 현황',
      value: '152.8K',
      status: '성공률 97.7%',
      helper: '지난 30일 AI 요청',
      to: '/admin/control/internal/usage',
    },
    {
      title: '외부 AI 통제',
      value: '27.3K',
      status: '차단 176건',
      helper: '마스킹 652 · 보호 대상 621',
      tone: STATUS_TEXT_CLASS_NAMES.block,
      to: '/admin/control/external/dashboard',
    },
    {
      title: '앱 심사 관리',
      value: String(actionableReviews.length),
      status: `관리자 검토 ${reviewCounts['관리자 검토']}건`,
      helper: `자동 심사 ${reviewCounts['자동 심사']} · 반려 ${reviewCounts['반려']}`,
      tone: 'text-[#FF9F1C]',
      to: '/admin/manage/security',
    },
    {
      title: '사용자 승인',
      value: String(pendingUsers.length),
      status: pendingUsers.length ? '승인 대기' : '처리 완료',
      helper: '신규 사용자 계정',
      tone: pendingUsers.length ? 'text-[#FF9F1C]' : 'text-[#2BB658]',
      to: '/admin/users',
    },
    {
      title: '시스템 상태',
      value: '4/4',
      status: '모든 엔진 정상',
      helper: 'Discover · Control · Manage',
      to: '/admin/system/settings',
    },
  ];

  return (
    <div className="garim-external-root min-h-screen bg-white text-[#111827]">
      <PageLayout>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6" aria-label="주요 운영 영역">
          {summaryCards.map(card => (
            <MetricCard key={card.title} {...card} onClick={() => navigate(card.to)} />
          ))}
        </section>

        <section className="relative z-20 flex max-w-full flex-wrap items-end gap-[var(--app-gap-sm)]">
          <DateRangePicker
            label="조회 기간"
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={setDateRange}
            widthClass="w-full min-w-0 sm:w-[10.25rem]"
            labelClassName="mb-1.5 block text-xs font-bold text-slate-700"
          />
        </section>

        <Panel
          title="Discover"
          description="최근 AI 서비스 분석 결과"
          action={
            <TextAction onClick={() => navigate('/admin/discover/url-analysis')}>
              분석 결과 보기
            </TextAction>
          }
        >
          <div className="grid gap-1 md:grid-cols-2">
            {discoverItems.map(item => (
              <button
                key={item.domain}
                type="button"
                onClick={() => navigate('/admin/discover/url-analysis')}
                className="group flex min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-[#F5F7FB]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Search size={18} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-[0.9rem] font-bold text-[#1F2942]">
                    {item.domain}
                  </strong>
                  <span className="mt-1 block text-xs font-medium text-[#71809D]">{item.time}</span>
                </span>
                <DiscoverStatus status={item.status} />
                <ArrowRight
                  size={16}
                  className="shrink-0 text-[#A5AEC0] transition group-hover:translate-x-0.5 group-hover:text-[#075DF6]"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </Panel>

        <section className="grid gap-5 xl:grid-cols-2">
          <Panel
            title="Control 내부"
            description="내부 AI 요청과 처리 성능"
            action={
              <TextAction onClick={() => navigate('/admin/control/internal/usage')}>
                AI 사용 현황 보기
              </TextAction>
            }
          >
            <TrendLegend series={internalSeries} />
            <div className="mt-3">
              <TrendChart data={internalTrend} series={internalSeries} compact />
            </div>
          </Panel>

          <Panel
            title="Control 외부"
            description="외부 AI 탐지와 정책 처리 결과"
            action={
              <TextAction onClick={() => navigate('/admin/control/external/dashboard')}>
                통제 대시보드 보기
              </TextAction>
            }
          >
            <TrendLegend series={externalSeries} />
            <div className="mt-3">
              <TrendChart data={externalTrend} series={externalSeries} compact />
            </div>
          </Panel>
        </section>

        <Panel
          title="심사 관리"
          description="자동 심사와 관리자 검토가 필요한 등록 요청"
          action={
            <TextAction onClick={() => navigate('/admin/manage/security')}>
              심사 관리 보기
            </TextAction>
          }
        >
          <div className="grid gap-2">
            {actionableReviews.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  navigate(`/admin/manage/security?request=${encodeURIComponent(item.id)}`)
                }
                className="group flex min-h-[82px] min-w-0 items-center gap-4 rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-slate-100 hover:bg-[#F5F5F5] hover:shadow-sm"
              >
                {item.requestType === '업데이트' ? (
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <RefreshCw size={24} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                ) : (
                  <img
                    src={zipFileImage}
                    alt=""
                    className="h-12 w-12 shrink-0 object-contain"
                    aria-hidden="true"
                  />
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex min-w-0 items-center gap-2">
                    <strong className="min-w-0 truncate text-base font-semibold text-slate-900">
                      {item.name}
                    </strong>
                    <span
                      className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                        item.requestType === '업데이트'
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {item.requestType}
                    </span>
                  </span>
                  <span className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
                    <Download size={14} className="shrink-0 text-blue-600" aria-hidden="true" />
                    <span className="truncate text-blue-600">{item.fileName}</span>
                    <span className="shrink-0 text-slate-300">·</span>
                    <span className="shrink-0">{item.size}</span>
                    {item.requestType === '업데이트' && item.version ? (
                      <>
                        <span className="shrink-0 text-slate-300">·</span>
                        <span className="shrink-0 font-medium text-blue-600">
                          {item.previousVersion
                            ? `v${item.previousVersion} → v${item.version}`
                            : `v${item.version}`}
                        </span>
                      </>
                    ) : null}
                  </span>
                </span>
                <span className="hidden shrink-0 text-sm text-slate-500 lg:inline">
                  {item.submittedAt}
                </span>
                <ReviewStatus status={getReviewStatus(item)} />
                <ArrowRight
                  size={16}
                  className="shrink-0 text-[#A5AEC0] transition group-hover:translate-x-0.5 group-hover:text-[#075DF6]"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </Panel>

        <section className="grid gap-5 xl:grid-cols-2">
          <Panel
            title="사용자 승인"
            description="승인이 필요한 신규 사용자 계정"
            action={
              <TextAction onClick={() => navigate('/admin/users')}>사용자 관리 보기</TextAction>
            }
          >
            {pendingUsers.length ? (
              <div className="grid gap-2">
                {pendingUsers.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => navigate(`/admin/users?user=${encodeURIComponent(user.email)}`)}
                    className="group flex min-h-[82px] min-w-0 items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-slate-100 hover:bg-[#F5F5F5] hover:shadow-sm"
                  >
                    <UserAvatar user={user} />
                    <span className="min-w-0 flex-1 sm:max-w-[15rem]">
                      <strong className="block truncate text-[0.9rem] font-semibold text-[#27364F]">
                        {user.name || '-'}
                      </strong>
                      <span className="mt-1 block truncate text-xs text-slate-500">
                        {user.email}
                      </span>
                    </span>
                    <span className="hidden min-w-0 max-w-36 shrink truncate text-xs font-semibold text-[#55627E] sm:block">
                      {user.department || '-'} / {user.position || '-'}
                    </span>
                    <span className="hidden shrink-0 text-xs text-slate-500 2xl:inline">
                      {user.createdAt}
                    </span>
                    <ArrowRight
                      size={16}
                      className="shrink-0 text-[#A5AEC0] transition group-hover:translate-x-0.5 group-hover:text-[#075DF6]"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex min-h-36 flex-col items-center justify-center text-center">
                <CheckCircle2 size={28} className="text-emerald-500" aria-hidden="true" />
                <p className="mt-3 text-sm font-bold text-[#1F2942]">
                  승인 대기 사용자가 없습니다.
                </p>
              </div>
            )}
          </Panel>

          <Panel
            title="시스템 상태"
            description="관리 엔진 및 모듈의 현재 상태"
            action={
              <TextAction onClick={() => navigate('/admin/system/settings')}>
                시스템 상태 보기
              </TextAction>
            }
          >
            <div className="grid gap-3">
              {engines.map(engine => {
                const Icon = engine.icon;
                return (
                  <button
                    type="button"
                    key={engine.name}
                    onClick={() => navigate('/admin/system/settings')}
                    className="flex min-h-16 w-full min-w-0 items-center gap-x-4 rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-slate-100 hover:bg-[#F5F5F5] hover:shadow-sm"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <strong className="min-w-0 flex-1 truncate text-base font-semibold text-slate-900">
                      {engine.name}
                    </strong>
                    <span className="shrink-0 text-sm text-slate-500">
                      엔진 버전 ·{' '}
                      <strong className="font-semibold text-blue-600">{engine.version}</strong>
                    </span>
                    <span className="min-w-12 shrink-0 text-right text-[clamp(0.86rem,1vw,0.94rem)] font-semibold whitespace-nowrap text-emerald-600">
                      정상
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>
        </section>
      </PageLayout>
    </div>
  );
}
