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
import PageLayout from '../../../../../components/layout/PageLayout.jsx';

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
  'min-w-0 rounded-card border border-border-card bg-white px-5 py-5 shadow-card xl:px-6';

function Panel({ title, children, action, className = '' }) {
  return (
    <section className={`${panelClass} ${className}`}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-size-1-12rem font-bold tracking-heading text-heading xl:text-size-1-18rem">
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
    <article className="min-w-0 rounded-metric border border-border-card bg-white px-5 py-5 shadow-detail-06">
      <p className="truncate text-size-0-96rem font-semibold text-palette-blue-113">{title}</p>
      <strong className="mt-5 block text-fluid-56 leading-none font-black tracking-display text-palette-blue-116">
        {value}
      </strong>
      <p
        className={`mt-2 text-sm font-bold ${isPositive ? 'text-palette-green-03' : 'text-palette-red-06'}`}
      >
        {isPositive ? '↑' : '↓'} {delta}
      </p>
      <p className="mt-2 text-xs font-medium text-palette-blue-80">지난 30일 대비</p>
    </article>
  );
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const segment = payload[0].payload;

  return (
    <div className="rounded-xl border border-palette-blue-29 bg-white px-3 py-2 text-xs font-bold shadow-tooltip">
      <div className="flex items-center gap-2 text-palette-blue-112">
        <i className="size-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
        {segment.name}
      </div>
      <div className="mt-1 text-palette-blue-87">
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
                    [
                      'var(--color-chart-blue)',
                      'var(--color-chart-cyan)',
                      'var(--color-chart-violet)',
                      'var(--color-chart-orange)',
                      'var(--color-palette-blue-59)',
                      'var(--color-palette-blue-52)',
                    ][index % 6]
                  }
                  opacity={selectedSegment && selectedSegment.name !== segment.name ? 0.42 : 1}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="max-w-[76%] truncate text-size-0-82rem font-semibold text-palette-blue-94">
            {selectedSegment?.name ?? centerTop}
          </span>
          <strong className="mt-1 max-w-[82%] truncate text-size-1-45rem font-black tracking-display text-palette-blue-117">
            {selectedSegment?.count ?? centerValue}
          </strong>
          {selectedSegment ? (
            <span className="mt-1 text-xs font-bold text-palette-blue-87">
              {selectedSegment.value}%
            </span>
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
            className={`inline-flex h-8 items-center gap-2 rounded-full border px-3 text-size-0-78rem font-bold transition ${hiddenLabels.includes(item.label) ? 'border-palette-blue-24 bg-palette-blue-06 text-palette-blue-58' : 'border-palette-blue-38 bg-white text-palette-blue-101 hover:border-palette-blue-46'}`}
          >
            <i className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="min-w-0 truncate">{item.label}</span>
          </button>
        ) : (
          <span
            key={item.label}
            className="inline-flex h-8 items-center gap-2 rounded-full bg-white px-3 text-size-0-78rem font-bold text-palette-blue-101"
          >
            <i className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="min-w-0 truncate">{item.label}</span>
            {item.value ? <span className="text-palette-blue-80">{item.value}</span> : null}
          </span>
        )
      )}
    </div>
  );
}

function TrendTooltip({ active, label, payload }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-palette-blue-29 bg-white px-3 py-2 text-xs font-bold shadow-tooltip">
      <div className="mb-1.5 text-palette-blue-112">{label}</div>
      <div className="grid gap-1.5">
        {payload.map(item => (
          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-5 text-palette-blue-87"
          >
            <span className="flex items-center gap-2">
              <i className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="text-palette-blue-112">{item.value.toFixed(1)}M</span>
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
          labelClassName="sr-only"
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
              <CartesianGrid stroke="var(--color-palette-blue-23)" vertical={false} />
              <XAxis
                dataKey="day"
                interval="preserveStartEnd"
                minTickGap={20}
                tick={{
                  fill: 'var(--color-palette-blue-80)',
                  fontSize: 'var(--text-caption)',
                  fontWeight: 'var(--font-weight-bold)',
                }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                domain={[0, 3]}
                ticks={[0, 1, 2, 3]}
                tickFormatter={value => (value === 0 ? '0' : `${value}M`)}
                tick={{
                  fill: 'var(--color-palette-blue-80)',
                  fontSize: 'var(--text-caption)',
                  fontWeight: 'var(--font-weight-bold)',
                }}
                axisLine={false}
                tickLine={false}
                width={42}
              />
              <Tooltip
                cursor={{ stroke: 'var(--color-track)', strokeWidth: 1 }}
                content={<TrendTooltip />}
              />
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
                    dot={{ r: 4, strokeWidth: 2, fill: 'var(--color-white)', stroke: color }}
                    activeDot={{ r: 5, strokeWidth: 2, fill: 'var(--color-white)', stroke: color }}
                    isAnimationActive
                    animationDuration={520}
                    animationEasing="ease-out"
                  />
                ))}
            </RechartsLineChart>
          </ResponsiveContainer>
          {hiddenTrendSeries.length === trendSeries.length ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-bold text-palette-blue-62">
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
            <i className="w-[70%] bg-brand" />
            <i className="w-[26%] bg-palette-blue-55" />
            <i className="w-[4%] bg-track" />
          </div>
          <div className="mt-4 grid gap-2 text-size-0-82rem leading-relaxed text-palette-blue-87 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
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
          <div className="mt-4 grid gap-2 text-size-0-82rem leading-relaxed text-palette-blue-87 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
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
              <strong className="text-size-2rem leading-none font-black tracking-display text-palette-blue-116">
                {usageResponseTime.value}
              </strong>
              <p className="mt-2 text-sm font-bold text-palette-green-03">
                ↓ {usageResponseTime.delta}
                <span className="ml-2 text-xs font-medium text-palette-blue-80">
                  지난 30일 대비
                </span>
              </p>
            </div>
            <Activity className="shrink-0 text-brand" size={40} strokeWidth={1.6} />
          </div>
        </Panel>
      </section>
    </PageLayout>
  );
}
