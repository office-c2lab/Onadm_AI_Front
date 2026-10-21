import { ChartLine, ChartPie } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { DateRangePicker } from '../../components/monitoring/MonitoringListComponents.jsx';
import CustomDropdown from '../../../../components/dropdown/CustomDropdown.jsx';
import ServiceLogoBadge from '../../components/ServiceLogoBadge.jsx';
import { STATUS_COLORS } from '../../constants/statusColors.js';
import PageLayout from '../../layout/PageLayout.jsx';

const dashboardTabs = [
  { key: 'all', label: '전체', description: '각 항목 탐지 현황을 한눈에 확인합니다.' },
  { key: 'status', label: '처리상태', description: '처리상태 현황을 확인합니다.' },
  { key: 'policy', label: '정책', description: '정책항목 현황을 확인합니다.' },
  { key: 'service', label: '서비스', description: '서비스 현황을 확인합니다.' },
  {
    key: 'organization',
    label: '사용자',
    description: '부서, 직책, 사용자 기준으로 추이를 확인합니다.',
  },
];

const summaryCards = [
  { title: '탐지 횟수', value: '27.3k', change: '+3%', trend: 'up' },
  { title: '사용 서비스 수', value: '5', change: '+1', trend: 'up' },
  { title: '보호 대상', value: '621', change: '+10', trend: 'up' },
  { title: '정책 적용 횟수', value: '1.3k', change: '+6%', trend: 'up' },
  { title: '차단 횟수', value: '176', change: '-2%', trend: 'down' },
  { title: '마스킹 횟수', value: '652', change: '+9%', trend: 'up' },
];

const organizationViewOptions = [
  { value: 'department', label: '부서' },
  { value: 'position', label: '직책' },
  { value: 'user', label: '사용자' },
];

const POLICY_CHART_COLORS = {
  first: '#06318F',
  second: '#0648BB',
  third: '#168BFF',
  fourth: '#75BEFF',
  fifth: '#B8DEFF',
};

const ORGANIZATION_CHART_COLORS = {
first:  '#075DF6',
second: '#168BFF',
third:  '#75BEFF',
fourth: '#6FB0FF',
fifth:  '#A9D6FF',
};

const SERVICE_CHART_COLORS = {
  chatgpt: '#111827',
  gemini: '#4285F4',
  claude: '#D97706',
  genspark: '#6B7280',
  copilot: '#84CC16',
};

const donutSegments = [
  { label: '정상', value: 34, count: '426건', color: STATUS_COLORS.normal },
  { label: '차단', value: 14, count: '176건', color: STATUS_COLORS.block },
  { label: '마스킹', value: 52, count: '652건', color: STATUS_COLORS.masking },
];

const policyDonutSegments = [
  { label: '개인정보 보호', value: 34, count: '186건', color: POLICY_CHART_COLORS.first },
  { label: '기밀정보 차단', value: 26, count: '142건', color: POLICY_CHART_COLORS.second },
  { label: '프롬프트 허용', value: 18, count: '96건', color: POLICY_CHART_COLORS.third },
  { label: '파일 보호', value: 12, count: '72건', color: POLICY_CHART_COLORS.fourth },
  { label: '민감정보 탐지', value: 10, count: '58건', color: POLICY_CHART_COLORS.fifth },
];

const serviceDonutSegments = [
  { label: 'ChatGPT', value: 38, count: '214건', color: SERVICE_CHART_COLORS.chatgpt },
  { label: 'Gemini', value: 18, count: '103건', color: SERVICE_CHART_COLORS.gemini },
  { label: 'Claude', value: 23, count: '128건', color: SERVICE_CHART_COLORS.claude },
  { label: 'Genspark', value: 12, count: '64건', color: SERVICE_CHART_COLORS.genspark },
  { label: 'MS Copilot', value: 9, count: '48건', color: SERVICE_CHART_COLORS.copilot },
];

const departmentDonutSegments = [
  { label: '개발팀', value: 34, count: '158건', color: ORGANIZATION_CHART_COLORS.first },
  { label: '보안팀', value: 27, count: '124건', color: ORGANIZATION_CHART_COLORS.second },
  { label: '운영팀', value: 19, count: '86건', color: ORGANIZATION_CHART_COLORS.third },
  { label: '영업팀', value: 12, count: '57건', color: ORGANIZATION_CHART_COLORS.fourth },
  { label: '인사팀', value: 8, count: '38건', color: ORGANIZATION_CHART_COLORS.fifth },
];

const positionDonutSegments = [
  { label: '관리자', value: 31, count: '72건', color: ORGANIZATION_CHART_COLORS.first },
  { label: '팀장', value: 26, count: '61건', color: ORGANIZATION_CHART_COLORS.second },
  { label: '담당자', value: 19, count: '44건', color: ORGANIZATION_CHART_COLORS.third },
  { label: '매니저', value: 14, count: '33건', color: ORGANIZATION_CHART_COLORS.fourth },
  { label: '사원', value: 10, count: '24건', color: ORGANIZATION_CHART_COLORS.fifth },
];

const topUserDonutSegments = [
  { label: 'admin', value: 29, count: '98건', color: ORGANIZATION_CHART_COLORS.first },
  { label: 'user01', value: 23, count: '76건', color: ORGANIZATION_CHART_COLORS.second },
  { label: 'user02', value: 18, count: '61건', color: ORGANIZATION_CHART_COLORS.third },
  { label: 'user03', value: 13, count: '44건', color: ORGANIZATION_CHART_COLORS.fourth },
  { label: 'user04', value: 17, count: '57건', color: ORGANIZATION_CHART_COLORS.fifth },
];

const chartLabels = ['12/02', '12/03', '12/04', '12/05', '12/06', '12/07', '12/08'];

const statusChartSeries = [
  {
    key: 'normal',
    label: '정상',
    color: STATUS_COLORS.normal,
    values: [70, 79, 71, 89, 100, 95, 99],
  },
  { key: 'block', label: '차단', color: STATUS_COLORS.block, values: [8, 9, 17, 14, 16, 13, 20] },
  {
    key: 'masking',
    label: '마스킹',
    color: STATUS_COLORS.masking,
    values: [98, 112, 105, 139, 168, 152, 156],
  },
];

const policyChartSeries = [
  {
    key: 'privacy',
    label: '개인정보 보호',
    color: POLICY_CHART_COLORS.first,
    values: [24, 32, 29, 36, 42, 38, 44],
  },
  {
    key: 'secret',
    label: '기밀정보 차단',
    color: POLICY_CHART_COLORS.second,
    values: [18, 21, 26, 23, 31, 29, 34],
  },
  {
    key: 'review',
    label: '프롬프트 허용',
    color: POLICY_CHART_COLORS.third,
    values: [12, 18, 16, 22, 24, 21, 27],
  },
  {
    key: 'general',
    label: '파일 보호',
    color: POLICY_CHART_COLORS.fourth,
    values: [8, 11, 10, 14, 17, 16, 19],
  },
  {
    key: 'sensitive',
    label: '민감정보 탐지',
    color: POLICY_CHART_COLORS.fifth,
    values: [6, 8, 9, 11, 13, 12, 15],
  },
];

const serviceChartSeries = [
  {
    key: 'chatgpt',
    label: 'ChatGPT',
    color: SERVICE_CHART_COLORS.chatgpt,
    values: [36, 42, 40, 48, 55, 51, 58],
  },
  {
    key: 'gemini',
    label: 'Gemini',
    color: SERVICE_CHART_COLORS.gemini,
    values: [16, 19, 21, 23, 27, 25, 29],
  },
  {
    key: 'claude',
    label: 'Claude',
    color: SERVICE_CHART_COLORS.claude,
    values: [18, 24, 22, 29, 33, 31, 35],
  },
  {
    key: 'genspark',
    label: 'Genspark',
    color: SERVICE_CHART_COLORS.genspark,
    values: [8, 11, 9, 14, 16, 15, 17],
  },
  {
    key: 'copilot',
    label: 'MS Copilot',
    color: SERVICE_CHART_COLORS.copilot,
    values: [6, 8, 7, 10, 12, 11, 14],
  },
];

const departmentChartSeries = [
  {
    key: 'department-development',
    label: '개발팀',
    color: ORGANIZATION_CHART_COLORS.first,
    values: [28, 34, 31, 39, 46, 43, 49],
  },
  {
    key: 'department-security',
    label: '보안팀',
    color: ORGANIZATION_CHART_COLORS.second,
    values: [20, 24, 23, 29, 35, 32, 38],
  },
  {
    key: 'department-operations',
    label: '운영팀',
    color: ORGANIZATION_CHART_COLORS.third,
    values: [14, 17, 16, 21, 25, 24, 29],
  },
  {
    key: 'department-sales',
    label: '영업팀',
    color: ORGANIZATION_CHART_COLORS.fourth,
    values: [9, 11, 10, 13, 16, 15, 18],
  },
  {
    key: 'department-hr',
    label: '인사팀',
    color: ORGANIZATION_CHART_COLORS.fifth,
    values: [6, 8, 7, 9, 11, 10, 13],
  },
];

const positionChartSeries = [
  {
    key: 'position-admin',
    label: '관리자',
    color: ORGANIZATION_CHART_COLORS.first,
    values: [12, 15, 14, 18, 21, 20, 24],
  },
  {
    key: 'position-lead',
    label: '팀장',
    color: ORGANIZATION_CHART_COLORS.second,
    values: [10, 12, 13, 15, 18, 17, 20],
  },
  {
    key: 'position-staff',
    label: '담당자',
    color: ORGANIZATION_CHART_COLORS.third,
    values: [8, 10, 9, 12, 14, 13, 16],
  },
  {
    key: 'position-manager',
    label: '매니저',
    color: ORGANIZATION_CHART_COLORS.fourth,
    values: [6, 8, 7, 9, 11, 10, 13],
  },
  {
    key: 'position-member',
    label: '사원',
    color: ORGANIZATION_CHART_COLORS.fifth,
    values: [4, 6, 5, 7, 8, 8, 10],
  },
];

const topUserChartSeries = [
  {
    key: 'user-admin',
    label: 'admin',
    department: '보안팀',
    position: '관리자',
    color: ORGANIZATION_CHART_COLORS.first,
    values: [14, 18, 16, 21, 24, 22, 28],
  },
  {
    key: 'user-01',
    label: 'user01',
    department: '개발팀',
    position: '팀장',
    color: ORGANIZATION_CHART_COLORS.second,
    values: [10, 13, 15, 17, 19, 18, 21],
  },
  {
    key: 'user-02',
    label: 'user02',
    department: '개발팀',
    position: '담당자',
    color: ORGANIZATION_CHART_COLORS.third,
    values: [8, 10, 11, 13, 16, 15, 18],
  },
  {
    key: 'user-04',
    label: 'user04',
    department: '보안팀',
    position: '담당자',
    color: ORGANIZATION_CHART_COLORS.fourth,
    values: [7, 9, 10, 12, 15, 14, 17],
  },
  {
    key: 'user-03',
    label: 'user03',
    department: '운영팀',
    position: '담당자',
    color: ORGANIZATION_CHART_COLORS.fifth,
    values: [5, 7, 8, 10, 12, 11, 14],
  },
];

const detailTableData = {
  status: [
    { label: '정상', total: 603, ratio: 40, color: STATUS_COLORS.normal },
    { label: '차단', total: 97, ratio: 6, color: STATUS_COLORS.block },
    { label: '마스킹', total: 830, ratio: 54, color: STATUS_COLORS.masking },
  ],
  policy: [
    {
      label: '개인정보 보호',
      enabled: true,
      total: 155,
      statuses: { masking: 124, block: 31, normal: 0 },
    },
    {
      label: '기밀정보 차단',
      enabled: true,
      total: 119,
      statuses: { masking: 68, block: 51, normal: 0 },
    },
    {
      label: '프롬프트 허용',
      enabled: false,
      total: 64,
      statuses: { masking: 0, block: 0, normal: 64 },
    },
    {
      label: '파일 보호',
      enabled: true,
      total: 30,
      statuses: { masking: 22, block: 8, normal: 0 },
    },
    {
      label: '민감정보 탐지',
      enabled: true,
      total: 58,
      statuses: { masking: 41, block: 17, normal: 0 },
    },
  ],
  service: [
    {
      label: 'ChatGPT',
      enabled: true,
      total: 214,
      statuses: { masking: 98, block: 24, normal: 92 },
    },
    {
      label: 'Gemini',
      enabled: false,
      total: 103,
      statuses: { masking: 39, block: 13, normal: 51 },
    },
    {
      label: 'Claude',
      enabled: true,
      total: 128,
      statuses: { masking: 52, block: 18, normal: 58 },
    },
    {
      label: 'Genspark',
      enabled: true,
      total: 64,
      statuses: { masking: 20, block: 8, normal: 36 },
    },
    {
      label: 'MS Copilot',
      enabled: false,
      total: 48,
      statuses: { masking: 15, block: 7, normal: 26 },
    },
  ],
  department: [
    {
      label: '개발팀',
      members: 128,
      total: 158,
      statuses: { masking: 72, block: 18, normal: 68 },
    },
    {
      label: '보안팀',
      members: 42,
      total: 124,
      statuses: { masking: 55, block: 16, normal: 53 },
    },
    {
      label: '운영팀',
      members: 76,
      total: 86,
      statuses: { masking: 36, block: 11, normal: 39 },
    },
    {
      label: '영업팀',
      members: 64,
      total: 57,
      statuses: { masking: 21, block: 7, normal: 29 },
    },
    {
      label: '인사팀',
      members: 31,
      total: 38,
      statuses: { masking: 13, block: 5, normal: 20 },
    },
  ],
  position: [
    {
      label: '관리자',
      members: 18,
      total: 72,
      statuses: { masking: 32, block: 10, normal: 30 },
    },
    {
      label: '팀장',
      members: 37,
      total: 61,
      statuses: { masking: 26, block: 8, normal: 27 },
    },
    {
      label: '담당자',
      members: 214,
      total: 44,
      statuses: { masking: 17, block: 6, normal: 21 },
    },
    {
      label: '매니저',
      members: 29,
      total: 33,
      statuses: { masking: 12, block: 4, normal: 17 },
    },
    {
      label: '사원',
      members: 83,
      total: 24,
      statuses: { masking: 8, block: 3, normal: 13 },
    },
  ],
  user: [
    { label: 'admin', total: 98, statuses: { masking: 44, block: 12, normal: 42 } },
    { label: 'user01', total: 76, statuses: { masking: 32, block: 9, normal: 35 } },
    { label: 'user02', total: 61, statuses: { masking: 24, block: 8, normal: 29 } },
    { label: 'user04', total: 57, statuses: { masking: 21, block: 7, normal: 29 } },
    { label: 'user03', total: 44, statuses: { masking: 16, block: 6, normal: 22 } },
  ],
};

function createLineChartData(seriesList) {
  return chartLabels.map((date, index) => ({
    date,
    ...Object.fromEntries(seriesList.map(series => [series.key, series.values[index]])),
  }));
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createDefaultChartDateRange() {
  const endDate = new Date();
  const startDate = new Date(endDate);

  startDate.setDate(endDate.getDate() - 6);

  return {
    startDate: formatDateValue(startDate),
    endDate: formatDateValue(endDate),
  };
}

const defaultChartDateRange = createDefaultChartDateRange();

const chartDateRangeDefaults = {
  startDate: defaultChartDateRange.startDate,
  endDate: defaultChartDateRange.endDate,
};

function cn(...values) {
  return values.filter(Boolean).join(' ');
}

function ChartTooltipDot({ color }) {
  return <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />;
}

function getAllOrganizationChartData(view) {
  if (view === 'position') {
    return {
      seriesList: positionChartSeries,
      segments: positionDonutSegments,
    };
  }

  if (view === 'user') {
    return {
      seriesList: topUserChartSeries,
      segments: topUserDonutSegments,
    };
  }

  return {
    seriesList: departmentChartSeries,
    segments: departmentDonutSegments,
  };
}

function DashboardPanel({ title, actions, children, className = '' }) {
  const titleNode =
    typeof title === 'string' ? (
      <h2 className="text-[1.12rem] font-bold tracking-[-0.03em] text-[#11182E] xl:text-[1.18rem]">
        {title}
      </h2>
    ) : (
      title
    );

  return (
    <section
      className={cn(
        'min-w-0 rounded-[22px] border border-[#E2E8F4] bg-white px-5 py-5 shadow-[0_12px_34px_rgba(15,23,42,0.06)] xl:px-6',
        className
      )}
    >
      {title || actions ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {titleNode}
          {actions}
        </div>
      ) : null}
      <div className={title || actions ? 'mt-5' : ''}>{children}</div>
    </section>
  );
}

function DashboardChartViewSwitch({ view, onChange }) {
  const items = [
    { value: 'line', label: '현황 보기', icon: ChartLine },
    { value: 'donut', label: '분포 보기', icon: ChartPie },
  ];

  return (
    <div className="inline-flex h-8 shrink-0 items-center gap-1">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = view === item.value;

        return (
          <button
            key={item.value}
            type="button"
            aria-label={item.label}
            aria-pressed={isActive}
            title={item.label}
            onClick={() => onChange(item.value)}
            className={cn(
              'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[8px] transition',
              isActive
                ? 'bg-[#EFF6FF] text-[#075DF6]'
                : 'text-[#8A94A6] hover:bg-[#F4F9FF] hover:text-[#075DF6]'
            )}
          >
            <Icon className="h-4.5 w-4.5" strokeWidth={2.4} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

function OrganizationTitleDropdown({ value, onChange, suffix = '별' }) {
  return (
    <CustomDropdown
      value={value}
      onChange={onChange}
      options={organizationViewOptions.map(option => ({
        ...option,
        label: `${option.label}${suffix}`,
      }))}
      ariaLabel="전체 탭 사용자 그래프 기준"
      className="w-[9.5rem] [&>button]:min-h-9 [&>button]:rounded-lg [&>button]:text-[1rem] [&>button]:font-bold"
    />
  );
}

function DashboardTabs({ activeTab, onChange }) {
  const activeDescription = dashboardTabs.find(tab => tab.key === activeTab)?.description ?? '';

  return (
    <div className="border-b border-[#E2E8F0]">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div className="overflow-x-auto">
          <div className="flex h-12 min-w-max items-end gap-7">
            {dashboardTabs.map(tab => {
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onChange(tab.key)}
                  className={cn(
                    'relative flex h-12 min-w-[4rem] cursor-pointer items-center justify-center px-1 text-sm font-black transition',
                    isActive ? 'text-[#075DF6]' : 'text-slate-600 hover:text-[#075DF6]'
                  )}
                >
                  {tab.label}
                  {isActive ? (
                    <span className="absolute right-0 bottom-0 left-0 h-0.5 bg-[#075DF6]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <p className="pb-3 text-[0.86rem] font-semibold text-[#64748B]">{activeDescription}</p>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, change, trend }) {
  const isUp = trend === 'up';

  return (
    <article className="rounded-[18px] border border-[#E2E8F4] bg-white px-5 py-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] xl:px-3 xl:py-4 2xl:px-5 2xl:py-5">
      <div>
        <p className="truncate text-[0.96rem] font-semibold text-[#20273D] xl:text-[0.78rem] 2xl:text-[0.96rem]">
          {title}
        </p>
      </div>
      <div className="mt-5 flex min-w-0 items-end justify-between gap-2 whitespace-nowrap xl:mt-4 2xl:mt-5">
        <strong className="min-w-0 text-[2.25rem] leading-none font-black tracking-[-0.05em] text-[#0E1731] xl:text-[1.75rem] 2xl:text-[2.25rem]">
          {value}
        </strong>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 pb-0.5 text-[0.95rem] font-bold xl:text-[0.78rem] 2xl:text-[0.95rem]',
            isUp ? 'text-[#2BB658]' : 'text-[#FF4B57]'
          )}
        >
          {change}
          {isUp ? '⌃' : '⌄'}
        </span>
      </div>
    </article>
  );
}

function ChartFilterBar({
  dateRange,
  onDateRangeChange,
  filterLabel,
  filterItems,
  hiddenFilterLabels,
  onToggleFilter,
  userViewProps,
}) {
  const showFilter = Boolean(filterLabel && filterItems?.length && onToggleFilter);
  const showUserViewControls = Boolean(userViewProps);

  return (
    <section className="relative z-20 flex max-w-full flex-wrap items-end gap-[var(--app-gap-sm)]">
      <DateRangePicker
        label="조회 기간"
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onChange={onDateRangeChange}
        widthClass="w-full min-w-0 sm:w-[10.25rem]"
        labelClassName="sr-only"
      />
      {showFilter ? (
        <div className="flex min-w-0 flex-col">
          <DashboardChartFilter
            items={filterItems}
            hiddenLabels={hiddenFilterLabels}
            onToggle={onToggleFilter}
          />
        </div>
      ) : null}
      {showUserViewControls ? <DashboardUserViewControls {...userViewProps} /> : null}
    </section>
  );
}

function LegendToggle({ label, color, pressed, onClick, value, className = '' }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      title="표시 전환"
      onClick={onClick}
      className={cn(
        'inline-flex h-[var(--app-control-xs)] cursor-pointer items-center gap-[var(--app-gap-xs)] rounded-full border px-[var(--app-pad-sm)] text-left text-[clamp(0.76rem,0.9vw,0.82rem)] font-bold transition hover:border-[#C9D3E8] hover:bg-[#F8FBFF] active:scale-[0.98]',
        pressed
          ? 'border-[#D9E0F1] bg-white text-[#33415B]'
          : 'border-[#E7ECF5] bg-[#F8FAFD] text-[#A5AEC0] opacity-80',
        className
      )}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white transition"
        style={{ background: pressed ? color : '#AEB8CA' }}
      />
      <span className="min-w-0 truncate">{label}</span>
      {value ? (
        <span className={cn('shrink-0', pressed ? 'text-[#16213A]' : 'text-[#A5AEC0]')}>
          {value}
        </span>
      ) : null}
    </button>
  );
}

function DashboardChartFilter({ items, hiddenLabels, onToggle }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map(item => (
        <LegendToggle
          key={item.label}
          label={item.label}
          color={item.color}
          pressed={!hiddenLabels.includes(item.label)}
          onClick={() => onToggle(item.label)}
          className="h-[var(--app-control-lg)] rounded-[var(--app-radius-lg)] px-[var(--app-pad-md)] text-[clamp(0.82rem,0.95vw,0.9rem)]"
        />
      ))}
    </div>
  );
}

function DashboardUserViewControls({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {organizationViewOptions.map(option => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex h-[var(--app-control-lg)] min-w-[4.25rem] cursor-pointer items-center justify-center rounded-[var(--app-radius-lg)] border px-[var(--app-pad-md)] text-[clamp(0.82rem,0.95vw,0.9rem)] font-black whitespace-nowrap transition',
              isActive
                ? 'border-[#075DF6] bg-[#075DF6] text-white shadow-[0_8px_18px_rgba(7, 93, 246,0.2)]'
                : 'border-[#D9E0F1] bg-white text-[#647089] hover:border-[#B6D9FF] hover:bg-[#F8FBFF] hover:text-[#075DF6]'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const segment = payload[0].payload;

  return (
    <div className="rounded-xl border border-[#E5EAF3] bg-white px-3 py-2 text-[0.82rem] font-bold shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
      <div className="flex items-center gap-2 text-[#1F2942]">
        <ChartTooltipDot color={segment.color} />
        <span>{segment.label}</span>
      </div>
      <div className="mt-1 text-[#647089]">
        {segment.value}% · {segment.count}
      </div>
    </div>
  );
}

function DonutChart({
  segments = donutSegments,
  hiddenSegmentLabels = [],
  isAnimationActive = false,
}) {
  const [selectedSegmentLabel, setSelectedSegmentLabel] = useState(null);
  const visibleSegments = segments.filter(segment => !hiddenSegmentLabels.includes(segment.label));
  const totalCount = visibleSegments.reduce(
    (sum, segment) => sum + Number(segment.count.replace(/[^\d]/g, '')),
    0
  );
  const selectedSegment = visibleSegments.find(segment => segment.label === selectedSegmentLabel);

  const handleSelectSegment = segment => {
    setSelectedSegmentLabel(current => (current === segment.label ? null : segment.label));
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex h-[clamp(14.5rem,18.75vw,16.875rem)] w-[clamp(14.5rem,18.75vw,16.875rem)] items-center justify-center">
        <div className="relative h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<DonutTooltip />} wrapperStyle={{ zIndex: 20 }} />
              <Pie
                data={visibleSegments}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius="57%"
                outerRadius="88%"
                paddingAngle={2}
                cornerRadius={8}
                stroke="none"
                onClick={handleSelectSegment}
                isAnimationActive={isAnimationActive}
                animationBegin={80}
                animationDuration={chartAnimationDuration}
                animationEasing="ease-out"
              >
                {visibleSegments.map(segment => (
                  <Cell
                    key={segment.label}
                    fill={segment.color}
                    opacity={selectedSegment && selectedSegment.label !== segment.label ? 0.42 : 1}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center">
            <span className="text-[0.82rem] font-semibold text-[#55627E]">
              {selectedSegment ? selectedSegment.label : '전체 처리'}
            </span>
            <strong className="mt-1 text-[1.65rem] font-black tracking-[-0.05em] text-[#10182E]">
              {selectedSegment ? selectedSegment.count : `${totalCount.toLocaleString()}건`}
            </strong>
            {selectedSegment ? (
              <span className="mt-1 text-[0.82rem] font-bold text-[#647089]">
                {selectedSegment.value}%
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function LineChartTooltip({ active, label, payload, seriesList = [] }) {
  if (!active || !payload?.length) {
    return null;
  }

  const visiblePayload = payload.filter(
    (item, index, items) =>
      item.value != null && items.findIndex(entry => entry.dataKey === item.dataKey) === index
  );

  return (
    <div className="rounded-xl border border-[#E5EAF3] bg-white px-3 py-2 text-[0.82rem] font-bold shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
      <div className="mb-1.5 text-[#1F2942]">{label}</div>
      <div className="grid gap-1.5">
        {visiblePayload.map(item => (
          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-4 text-[#647089]"
          >
            <span className="flex items-center gap-2">
              <ChartTooltipDot
                color={(seriesList.find(series => series.key === item.dataKey) ?? item).color}
              />
              <span>{item.name}</span>
            </span>
            <span className="text-[#1F2942]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderLineSeries(series, isAnimationActive) {
  return (
    <Line
      key={series.key}
      type="monotone"
      dataKey={series.key}
      name={series.label}
      stroke={series.color}
      strokeWidth={2.8}
      dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF', stroke: series.color }}
      activeDot={{ r: 5, strokeWidth: 2, fill: '#FFFFFF', stroke: series.color }}
      isAnimationActive={isAnimationActive}
      animationBegin={80}
      animationDuration={chartAnimationDuration}
      animationEasing="ease-out"
    />
  );
}

function DashboardLineChart({ seriesList, hiddenLabels = [], isAnimationActive = false }) {
  const visibleSeries = seriesList.filter(series => !hiddenLabels.includes(series.label));
  const data = createLineChartData(seriesList);

  return (
    <div className="relative h-[clamp(15.5rem,19.9vw,17.875rem)]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 22, right: 18, bottom: 4, left: -8 }}>
          <CartesianGrid stroke="#E8EDF7" vertical={false} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#71809D', fontSize: 12, fontWeight: 700 }}
            dy={10}
          />
          <YAxis
            domain={[0, 'dataMax + 20']}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#71809D', fontSize: 12, fontWeight: 700 }}
            width={42}
          />
          <Tooltip
            cursor={{ stroke: '#D6E9FF', strokeWidth: 1 }}
            content={<LineChartTooltip seriesList={seriesList} />}
          />
          {visibleSeries.map(series => renderLineSeries(series, isAnimationActive))}
        </RechartsLineChart>
      </ResponsiveContainer>
      {!visibleSeries.length ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold text-[#9AA6BD]">
          표시할 범례를 선택하세요
        </div>
      ) : null}
    </div>
  );
}

function DashboardChartViewport({ children }) {
  return (
    <div className="flex h-[clamp(15.5rem,19.9vw,17.875rem)] items-center justify-center">
      <div className="w-full">{children}</div>
    </div>
  );
}

function ChartLegend({ seriesList }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      {seriesList.map(series => (
        <span
          key={series.key ?? series.label}
          className="inline-flex h-8 items-center gap-2 rounded-full bg-white px-3 text-[0.82rem] font-bold text-[#33415B]"
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white"
            style={{ backgroundColor: series.color }}
          />
          <span className="min-w-0 truncate">{series.label}</span>
        </span>
      ))}
    </div>
  );
}

const detailMetricHeaderClass = 'w-[8.5rem] min-w-[8.5rem] px-4 py-3 text-right';
const detailMetricCellClass =
  'w-[8.5rem] min-w-[8.5rem] border-b border-[#EEF2F7] px-4 py-3 text-right';
const detailRankHeaderClass = 'w-14 min-w-14 px-2 py-3 text-center';
const detailRankCellClass =
  'w-14 min-w-14 border-b border-[#EEF2F7] px-2 py-3 text-center text-[#8A94A6]';
const chartAnimationDuration = 520;

function StatusCountCell({ value, color }) {
  return (
    <td className={detailMetricCellClass}>
      <span style={{ color }}>{value.toLocaleString()}</span>
      <span className="text-[#33415B]">건</span>
    </td>
  );
}

function StatusColumnHeader({ label, color }) {
  return (
    <span className="inline-flex w-full items-center justify-end gap-2">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </span>
  );
}

function DashboardDetailTable({
  rows,
  subjectLabel,
  variant = 'default',
  subjectVariant = 'text',
}) {
  const showEnabledColumn = rows.some(row => typeof row.enabled === 'boolean');
  const showMembersColumn = rows.some(row => typeof row.members === 'number');

  if (variant === 'status') {
    return (
      <div className="overflow-x-auto rounded-[var(--app-radius-lg)] border border-[#ECEFF5] bg-white shadow-[0_0.5rem_1.5rem_rgba(15,23,42,0.06)]">
        <table className="w-full min-w-[34rem] border-separate border-spacing-0 text-left">
          <thead>
            <tr className="bg-[linear-gradient(180deg,#F8FAFF_0%,#F2F5FC_100%)] text-[0.82rem] font-black text-[#59627A]">
              <th className={detailRankHeaderClass}>순위</th>
              <th className="px-4 py-3">{subjectLabel}</th>
              <th className="px-4 py-3 text-right">전체 횟수</th>
              <th className="px-4 py-3 text-right">비율</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.label} className="text-[0.9rem] font-bold text-[#33415B]">
                <td className={detailRankCellClass}>{index + 1}</td>
                <td className="border-b border-[#EEF2F7] px-4 py-3 text-[#11182E]">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: row.color }}
                    />
                    {row.label}
                  </span>
                </td>
                <td className="border-b border-[#EEF2F7] px-4 py-3 text-right text-[#11182E]">
                  {row.total.toLocaleString()}건
                </td>
                <td className="border-b border-[#EEF2F7] px-4 py-3 text-right text-[#075DF6]">
                  {row.ratio}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--app-radius-lg)] border border-[#ECEFF5] bg-white shadow-[0_0.5rem_1.5rem_rgba(15,23,42,0.06)]">
      <table className="w-full min-w-[50rem] border-separate border-spacing-0 text-left">
        <thead>
          <tr className="bg-[linear-gradient(180deg,#F8FAFF_0%,#F2F5FC_100%)] text-[0.82rem] font-black text-[#59627A]">
            <th className={detailRankHeaderClass}>순위</th>
            <th className="px-4 py-3">{subjectLabel}</th>
            {showEnabledColumn ? <th className="px-4 py-3 text-center">사용 여부</th> : null}
            {showMembersColumn ? <th className="px-4 py-3 text-right">인원수</th> : null}
            <th className={detailMetricHeaderClass}>전체 횟수</th>
            <th className={detailMetricHeaderClass}>
              <StatusColumnHeader label="정상" color={STATUS_COLORS.normal} />
            </th>
            <th className={detailMetricHeaderClass}>
              <StatusColumnHeader label="차단" color={STATUS_COLORS.block} />
            </th>
            <th className={detailMetricHeaderClass}>
              <StatusColumnHeader label="마스킹" color={STATUS_COLORS.masking} />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.label} className="text-[0.9rem] font-bold text-[#33415B]">
              <td className={detailRankCellClass}>{index + 1}</td>
              <td className="border-b border-[#EEF2F7] px-4 py-3 text-[#11182E]">
                {subjectVariant === 'service' ? (
                  <span className="inline-flex min-w-0 items-center gap-2.5">
                    <ServiceLogoBadge name={row.label} variant="compact" />
                    <span className="min-w-0 truncate">{row.label}</span>
                  </span>
                ) : (
                  row.label
                )}
              </td>
              {showEnabledColumn ? (
                <td
                  className={cn(
                    'border-b border-[#EEF2F7] px-4 py-3 text-center font-black',
                    row.enabled ? 'text-[#075DF6]' : 'text-[#8A94A6]'
                  )}
                >
                  {row.enabled ? 'ON' : 'OFF'}
                </td>
              ) : null}
              {showMembersColumn ? (
                <td className="border-b border-[#EEF2F7] px-4 py-3 text-right text-[#11182E]">
                  {row.members.toLocaleString()}명
                </td>
              ) : null}
              <td className={cn(detailMetricCellClass, 'text-[#11182E]')}>
                {row.total.toLocaleString()}건
              </td>
              <StatusCountCell value={row.statuses.normal} color={STATUS_COLORS.normal} />
              <StatusCountCell value={row.statuses.block} color={STATUS_COLORS.block} />
              <StatusCountCell value={row.statuses.masking} color={STATUS_COLORS.masking} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardPage() {
  const [activeDashboardTab, setActiveDashboardTab] = useState('all');
  const [chartDateRange, setChartDateRange] = useState(chartDateRangeDefaults);
  const [allChartViews, setAllChartViews] = useState({
    status: 'line',
    policy: 'line',
    service: 'line',
    organization: 'line',
  });
  const [allOrganizationView, setAllOrganizationView] = useState('department');
  const [userChartView, setUserChartView] = useState('department');
  const [hiddenDonutSegmentLabels, setHiddenDonutSegmentLabels] = useState([]);
  const [hiddenPolicyLabels, setHiddenPolicyLabels] = useState([]);
  const [hiddenServiceLabels, setHiddenServiceLabels] = useState([]);
  const [chartEntryVersion, setChartEntryVersion] = useState(0);
  const [shouldAnimateCharts, setShouldAnimateCharts] = useState(true);
  const detailChartEntrySignature = `${activeDashboardTab}:${userChartView}`;

  useEffect(() => {
    setChartEntryVersion(current => current + 1);
    setShouldAnimateCharts(true);

    const timeoutId = window.setTimeout(() => {
      setShouldAnimateCharts(false);
    }, chartAnimationDuration + 160);

    return () => window.clearTimeout(timeoutId);
  }, [detailChartEntrySignature]);

  const isAllTab = activeDashboardTab === 'all';
  const isStatusTab = activeDashboardTab === 'status';
  const showSubTabCharts = ['status', 'policy', 'service', 'organization'].includes(
    activeDashboardTab
  );
  const { seriesList: allOrganizationSeriesList, segments: allOrganizationSegments } =
    getAllOrganizationChartData(allOrganizationView);
  const { seriesList: userTabSeriesList, segments: userTabSegments } =
    getAllOrganizationChartData(userChartView);
  const userTabLabel =
    organizationViewOptions.find(option => option.value === userChartView)?.label ?? '부서';
  const userTabTableRows = detailTableData[userChartView] ?? detailTableData.department;
  const filterConfigByTab = {
    status: {
      label: '처리상태',
      items: donutSegments,
      hiddenLabels: hiddenDonutSegmentLabels,
      onToggle: label => {
        setHiddenDonutSegmentLabels(current =>
          current.includes(label) ? current.filter(item => item !== label) : [...current, label]
        );
      },
    },
    policy: {
      label: '정책',
      items: policyChartSeries,
      hiddenLabels: hiddenPolicyLabels,
      onToggle: label => {
        setHiddenPolicyLabels(current =>
          current.includes(label) ? current.filter(item => item !== label) : [...current, label]
        );
      },
    },
    service: {
      label: '도메인',
      items: serviceChartSeries,
      hiddenLabels: hiddenServiceLabels,
      onToggle: label => {
        setHiddenServiceLabels(current =>
          current.includes(label) ? current.filter(item => item !== label) : [...current, label]
        );
      },
    },
  };
  const activeFilterConfig = filterConfigByTab[activeDashboardTab];
  const subTabChartConfig = {
    status: {
      title: '처리상태 추이',
      distributionTitle: '처리상태 분포',
      distributionSegments: donutSegments,
      seriesList: statusChartSeries,
      hiddenLabels: hiddenDonutSegmentLabels,
      tableTitle: '처리상태 상세 현황',
      tableSubjectLabel: '처리상태',
      tableRows: detailTableData.status,
      tableVariant: 'status',
    },
    policy: {
      title: '정책항목 추이',
      distributionTitle: '정책분포',
      distributionSegments: policyDonutSegments,
      seriesList: policyChartSeries,
      hiddenLabels: hiddenPolicyLabels,
      tableTitle: '정책처리 현황',
      tableSubjectLabel: '정책',
      tableRows: detailTableData.policy,
    },
    service: {
      title: '서비스 추이',
      distributionTitle: '서비스 분포',
      distributionSegments: serviceDonutSegments,
      seriesList: serviceChartSeries,
      hiddenLabels: hiddenServiceLabels,
      tableTitle: '서비스 처리 현황',
      tableSubjectLabel: '서비스',
      tableRows: detailTableData.service,
      tableSubjectVariant: 'service',
    },
    organization: {
      title: `${userTabLabel} 추이`,
      distributionTitle: `${userTabLabel} 분포`,
      distributionSegments: userTabSegments,
      seriesList: userTabSeriesList,
      hiddenLabels: [],
      tableTitle: `${userTabLabel} 상위 5`,
      tableSubjectLabel: userTabLabel,
      tableRows: userTabTableRows,
    },
  }[activeDashboardTab];

  const allTabChartConfigs = [
    {
      key: 'status',
      title: '처리상태 추이',
      distributionTitle: '처리상태 분포',
      seriesList: statusChartSeries,
      segments: donutSegments,
    },
    {
      key: 'policy',
      title: '정책항목 추이',
      distributionTitle: '정책항목 분포',
      seriesList: policyChartSeries,
      segments: policyDonutSegments,
    },
    {
      key: 'service',
      title: '서비스 추이',
      distributionTitle: '서비스 분포',
      seriesList: serviceChartSeries,
      segments: serviceDonutSegments,
    },
    {
      key: 'organization',
      title: allOrganizationView === 'user' ? '사용자 추이' : null,
      distributionTitle:
        allOrganizationView === 'user'
          ? '사용자 분포'
          : `${organizationViewOptions.find(option => option.value === allOrganizationView)?.label ?? '부서'} 분포`,
      titleNode: (
        <OrganizationTitleDropdown
          value={allOrganizationView}
          onChange={setAllOrganizationView}
          suffix={allChartViews.organization === 'donut' ? ' 분포' : ' 추이'}
        />
      ),
      seriesList: allOrganizationSeriesList,
      segments: allOrganizationSegments,
    },
  ];

  const handleSetAllChartView = (chartKey, view) => {
    setAllChartViews(current => ({
      ...current,
      [chartKey]: view,
    }));
  };

  return (
    <PageLayout>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {summaryCards.map(card => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </section>

      <DashboardTabs activeTab={activeDashboardTab} onChange={setActiveDashboardTab} />

      <ChartFilterBar
        dateRange={chartDateRange}
        onDateRangeChange={setChartDateRange}
        filterLabel={activeFilterConfig?.label}
        filterItems={activeFilterConfig?.items}
        hiddenFilterLabels={activeFilterConfig?.hiddenLabels ?? []}
        onToggleFilter={activeFilterConfig?.onToggle}
        userViewProps={
          activeDashboardTab === 'organization'
            ? {
                value: userChartView,
                onChange: setUserChartView,
              }
            : null
        }
      />

      {isAllTab ? (
        <section className="grid gap-5 xl:grid-cols-2">
          {allTabChartConfigs.map(config => {
            const isDonutView = allChartViews[config.key] === 'donut';
            const title =
              config.titleNode ?? (isDonutView ? config.distributionTitle : config.title);
            const chartKey =
              config.key === 'organization'
                ? `${config.key}-${allChartViews[config.key]}-${allOrganizationView}`
                : `${config.key}-${allChartViews[config.key]}`;

            return (
              <DashboardPanel
                key={config.key}
                title={title}
                actions={
                  <DashboardChartViewSwitch
                    view={allChartViews[config.key]}
                    onChange={view => handleSetAllChartView(config.key, view)}
                  />
                }
              >
                <ChartLegend seriesList={isDonutView ? config.segments : config.seriesList} />
                <DashboardChartViewport>
                  {isDonutView ? (
                    <DonutChart key={chartKey} segments={config.segments} isAnimationActive />
                  ) : (
                    <DashboardLineChart
                      key={chartKey}
                      seriesList={config.seriesList}
                      isAnimationActive
                    />
                  )}
                </DashboardChartViewport>
              </DashboardPanel>
            );
          })}
        </section>
      ) : null}

      {showSubTabCharts ? (
        <>
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
            <DashboardPanel title={subTabChartConfig.title}>
              <DashboardLineChart
                key={`line-${chartEntryVersion}`}
                seriesList={subTabChartConfig.seriesList}
                hiddenLabels={subTabChartConfig.hiddenLabels}
                isAnimationActive={shouldAnimateCharts}
              />
            </DashboardPanel>
            <DashboardPanel title={subTabChartConfig.distributionTitle}>
              <DonutChart
                key={`donut-${chartEntryVersion}`}
                segments={subTabChartConfig.distributionSegments}
                hiddenSegmentLabels={subTabChartConfig.hiddenLabels}
                isAnimationActive={shouldAnimateCharts}
              />
            </DashboardPanel>
          </section>
          <section className="grid gap-3">
            <h2 className="px-1 text-[1.12rem] font-bold tracking-[-0.03em] text-[#11182E] xl:text-[1.18rem]">
              {subTabChartConfig.tableTitle}
            </h2>
            <DashboardDetailTable
              rows={subTabChartConfig.tableRows}
              subjectLabel={subTabChartConfig.tableSubjectLabel}
              variant={subTabChartConfig.tableVariant}
              subjectVariant={subTabChartConfig.tableSubjectVariant}
            />
          </section>
        </>
      ) : null}
    </PageLayout>
  );
}

