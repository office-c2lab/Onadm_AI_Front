import { useState } from 'react';
import { Activity } from 'lucide-react';
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
import { DateRangePicker } from '../../external/components/monitoring/MonitoringListComponents.jsx';
import PageLayout from '../../components/PageLayout.jsx';
import '../../external/garim.css';

import {
  modelUsage,
  trendData,
  trendSeries,
  usageDefaultDateRange,
  usageMetrics,
  usageRequestSummary,
  usageRequestTypes,
  usageResponseTime,
  usageTokenSummary,
} from '../data.js';
const panelClass =
  'min-w-0 rounded-[22px] border border-[#E2E8F4] bg-white px-5 py-5 shadow-[0_12px_34px_rgba(15,23,42,0.06)] xl:px-6';

function Panel({ title, children, action, className = '' }) {
  return (
    <section className={`${panelClass} ${className}`}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[1.12rem] font-bold tracking-[-0.03em] text-[#11182E] xl:text-[1.18rem]">
          {title}
        </h2>
        {action}
      </header>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function MetricCard({ title, value, delta, trend = 'up' }) {
  const isPositive = trend === 'up';
  return (
    <article className="min-w-0 rounded-[18px] border border-[#E2E8F4] bg-white px-5 py-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
      <p className="truncate text-[0.96rem] font-semibold text-[#20273D]">{title}</p>
      <strong className="mt-5 block text-[clamp(1.75rem,2.2vw,2.25rem)] leading-none font-black tracking-[-0.05em] text-[#0E1731]">
        {value}
      </strong>
      <p className={`mt-2 text-sm font-bold ${isPositive ? 'text-[#2BB658]' : 'text-[#FF4B57]'}`}>
        {isPositive ? '↑' : '↓'} {delta}
      </p>
      <p className="mt-2 text-xs font-medium text-[#71809D]">지난 30일 대비</p>
    </article>
  );
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const segment = payload[0].payload;

  return (
    <div className="rounded-xl border border-[#E5EAF3] bg-white px-3 py-2 text-xs font-bold shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
      <div className="flex items-center gap-2 text-[#1F2942]">
        <i className="size-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
        {segment.name}
      </div>
      <div className="mt-1 text-[#647089]">
        {segment.value}% · {segment.count}
      </div>
    </div>
  );
}

function Donut({ data, centerTop, centerValue }) {
  const [selected, setSelected] = useState(null);
  const selectedSegment = data.find(segment => segment.name === selected);

  return (
    <div className="flex h-[clamp(14.5rem,18.75vw,16.875rem)] w-full items-center justify-center">
      <div className="relative h-full w-full max-w-[16.875rem]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<DonutTooltip />} wrapperStyle={{ zIndex: 20 }} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="57%"
              outerRadius="88%"
              paddingAngle={2}
              cornerRadius={8}
              stroke="none"
              onClick={segment =>
                setSelected(current => (current === segment.name ? null : segment.name))
              }
              isAnimationActive
              animationBegin={80}
              animationDuration={520}
              animationEasing="ease-out"
            >
              {data.map((segment, index) => (
                <Cell
                  key={segment.name}
                  fill={
                    segment.color ??
                    ['#2678f5', '#27bfd0', '#8b72f8', '#ffa940', '#5b9cff', '#aebbd0'][index % 6]
                  }
                  opacity={selectedSegment && selectedSegment.name !== segment.name ? 0.42 : 1}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="max-w-[76%] truncate text-[0.82rem] font-semibold text-[#55627E]">
            {selectedSegment?.name ?? centerTop}
          </span>
          <strong className="mt-1 max-w-[82%] truncate text-[1.45rem] font-black tracking-[-0.05em] text-[#10182E]">
            {selectedSegment?.count ?? centerValue}
          </strong>
          {selectedSegment ? (
            <span className="mt-1 text-xs font-bold text-[#647089]">{selectedSegment.value}%</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ChartLegend({ items, hiddenLabels = [], onToggle }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      {items.map(item =>
        onToggle ? (
          <button
            key={item.label}
            type="button"
            aria-pressed={!hiddenLabels.includes(item.label)}
            onClick={() => onToggle(item.label)}
            className={`inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[0.78rem] font-bold transition ${hiddenLabels.includes(item.label) ? 'border-[#E7ECF5] bg-[#F8FAFD] text-[#A5AEC0]' : 'border-[#D9E0F1] bg-white text-[#33415B] hover:border-[#C9D3E8]'}`}
          >
            <i className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="min-w-0 truncate">{item.label}</span>
          </button>
        ) : (
          <span
            key={item.label}
            className="inline-flex h-8 items-center gap-2 rounded-full bg-white px-3 text-[0.78rem] font-bold text-[#33415B]"
          >
            <i className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="min-w-0 truncate">{item.label}</span>
            {item.value ? <span className="text-[#71809D]">{item.value}</span> : null}
          </span>
        )
      )}
    </div>
  );
}

function TrendTooltip({ active, label, payload }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-[#E5EAF3] bg-white px-3 py-2 text-xs font-bold shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
      <div className="mb-1.5 text-[#1F2942]">{label}</div>
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
            <span className="text-[#1F2942]">{item.value.toFixed(1)}M</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UsagePage() {
  const [hiddenTrendSeries, setHiddenTrendSeries] = useState([]);
  const [dateRange, setDateRange] = useState(usageDefaultDateRange);
  const toggleSeries = label =>
    setHiddenTrendSeries(current =>
      current.includes(label) ? current.filter(item => item !== label) : [...current, label]
    );

  return (
    <PageLayout>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {usageMetrics.map(metric => (
          <MetricCard key={metric.title} {...metric} />
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

      <Panel title="사용량 추이">
        <ChartLegend
          items={trendSeries.map(([key, label, color]) => ({ key, label, color }))}
          hiddenLabels={hiddenTrendSeries}
          onToggle={toggleSeries}
        />
        <div className="relative h-[clamp(15.5rem,19.9vw,17.875rem)] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={trendData}
              margin={{ top: 22, right: 18, bottom: 4, left: -8 }}
            >
              <CartesianGrid stroke="#E8EDF7" vertical={false} />
              <XAxis
                dataKey="day"
                interval="preserveStartEnd"
                minTickGap={20}
                tick={{ fill: '#71809D', fontSize: 12, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                domain={[0, 3]}
                ticks={[0, 1, 2, 3]}
                tickFormatter={value => (value === 0 ? '0' : `${value}M`)}
                tick={{ fill: '#71809D', fontSize: 12, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                width={42}
              />
              <Tooltip cursor={{ stroke: '#D6E9FF', strokeWidth: 1 }} content={<TrendTooltip />} />
              {trendSeries
                .filter(([, label]) => !hiddenTrendSeries.includes(label))
                .map(([key, label, color]) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={label}
                    stroke={color}
                    strokeWidth={2.8}
                    dot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF', stroke: color }}
                    activeDot={{ r: 5, strokeWidth: 2, fill: '#FFFFFF', stroke: color }}
                    isAnimationActive
                    animationDuration={520}
                    animationEasing="ease-out"
                  />
                ))}
            </RechartsLineChart>
          </ResponsiveContainer>
          {hiddenTrendSeries.length === trendSeries.length ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold text-[#9AA6BD]">
              표시할 범례를 선택하세요
            </div>
          ) : null}
        </div>
      </Panel>

      <section className="grid gap-5 xl:grid-cols-2">
        <Panel title="모델별 사용량">
          <ChartLegend
            items={modelUsage.map(([label, , value, color]) => ({ label, value, color }))}
          />
          <Donut
            data={modelUsage.map(([name, count, percent, color]) => ({
              name,
              value: Number.parseFloat(percent),
              count,
              color,
            }))}
            centerTop="총 크레딧"
            centerValue={usageMetrics[0].value}
          />
        </Panel>
        <Panel title="요청 유형">
          <ChartLegend
            items={usageRequestTypes.map(({ name, value, color }) => ({
              label: name,
              value: `${value}%`,
              color,
            }))}
          />
          <Donut
            data={usageRequestTypes}
            centerTop="총 요청 수"
            centerValue={usageMetrics[1].value}
          />
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <Panel title="토큰 사용 현황">
          <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
            <i className="w-[70%] bg-[#075DF6]" />
            <i className="w-[26%] bg-[#75BEFF]" />
            <i className="w-[4%] bg-[#D6E9FF]" />
          </div>
          <div className="mt-4 grid gap-2 text-[0.82rem] leading-relaxed text-[#647089] sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <span>
              입력 토큰 {usageTokenSummary.input} ({usageTokenSummary.inputPercent}%)
            </span>
            <span>
              출력 토큰 {usageTokenSummary.output} ({usageTokenSummary.outputPercent}%)
            </span>
          </div>
        </Panel>
        <Panel title="요청 처리 현황">
          <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
            <i className="w-[97%] bg-emerald-500" />
            <i className="w-[2%] bg-rose-400" />
            <i className="w-[1%] bg-slate-300" />
          </div>
          <div className="mt-4 grid gap-2 text-[0.82rem] leading-relaxed text-[#647089] sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            <span>
              성공 {usageRequestSummary.success} ({usageRequestSummary.successPercent}%)
            </span>
            <span>실패 {usageRequestSummary.failure}</span>
            <span>타임아웃 {usageRequestSummary.timeout}</span>
          </div>
        </Panel>
        <Panel title="평균 응답 시간">
          <div className="flex items-center justify-between gap-3">
            <div>
              <strong className="text-[2rem] leading-none font-black tracking-[-0.05em] text-[#0E1731]">
                {usageResponseTime.value}
              </strong>
              <p className="mt-2 text-sm font-bold text-[#2BB658]">
                ↓ {usageResponseTime.delta}
                <span className="ml-2 text-xs font-medium text-[#71809D]">지난 30일 대비</span>
              </p>
            </div>
            <Activity className="shrink-0 text-[#075DF6]" size={40} strokeWidth={1.6} />
          </div>
        </Panel>
      </section>
    </PageLayout>
  );
}
