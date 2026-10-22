import { useState } from 'react';
import { Activity, Database, FileText, UserRound } from 'lucide-react';
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
const tabs = ['크레딧', '토큰', '요청 수', '사용자 수'];

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

function MiniTabs({ value, onChange, items = tabs }) {
  return (
    <div className="inline-flex rounded-lg bg-[#F4F7FC] p-1">
      {items.map(item => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`rounded-md px-3 py-1.5 text-[0.78rem] font-semibold transition ${value === item ? 'bg-[#075DF6] text-white shadow-sm' : 'text-[#647089] hover:text-[#075DF6]'}`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function MetricCard({ icon: Icon, title, value, delta, color, bars }) {
  return (
    <section className={`${panelClass} flex min-h-[112px] items-center gap-4`}>
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#EFF6FF] text-[#075DF6]">
        <Icon size={21} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.96rem] font-semibold text-[#20273D]">{title}</p>
        <p className="mt-3 text-[2rem] leading-none font-black tracking-[-0.05em] text-[#0E1731]">
          {value}
        </p>
        <p className="mt-2 text-[0.86rem] font-bold text-[#2BB658]">
          ↓ {delta} <span className="ml-2 font-medium text-[#71809D]">지난 30일 대비</span>
        </p>
      </div>
      <div className="hidden h-9 items-end gap-0.5 sm:flex" aria-hidden="true">
        {bars.map((height, index) => (
          <span
            key={index}
            className="w-1 rounded-t-sm opacity-80"
            style={{ height: `${height}px`, backgroundColor: color }}
          />
        ))}
      </div>
    </section>
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
    <div className="relative h-[clamp(15rem,18vw,18rem)] w-[clamp(15rem,18vw,18rem)] shrink-0">
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
        <span className="text-[0.82rem] font-semibold text-[#55627E]">
          {selectedSegment?.name ?? centerTop}
        </span>
        <strong className="mt-1 text-[1.3rem] font-black tracking-[-0.05em] text-[#10182E]">
          {selectedSegment?.count ?? centerValue}
        </strong>
        {selectedSegment ? (
          <span className="mt-1 text-xs font-bold text-[#647089]">{selectedSegment.value}%</span>
        ) : null}
      </div>
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
  const [trendTab, setTrendTab] = useState('크레딧');
  const [hiddenTrendSeries, setHiddenTrendSeries] = useState([]);
  const [modelTab, setModelTab] = useState('크레딧');
  const [requestTab, setRequestTab] = useState('크레딧');
  const [dateRange, setDateRange] = useState(usageDefaultDateRange);

  return (
    <PageLayout>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[Database, FileText, Activity, UserRound].map((icon, index) => (
          <MetricCard key={usageMetrics[index].title} icon={icon} {...usageMetrics[index]} />
        ))}
      </div>

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

      <Panel
        title="사용량 추이"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <MiniTabs value={trendTab} onChange={setTrendTab} />
            <select className="h-9 rounded-lg border border-[#D9E0F1] bg-white px-3 text-[0.82rem] font-bold text-[#647089]">
              <option>일별</option>
              <option>주별</option>
              <option>월별</option>
            </select>
            <select className="h-9 rounded-lg border border-[#D9E0F1] bg-white px-3 text-[0.82rem] font-bold text-[#647089]">
              <option>모델별 (누적)</option>
              <option>모델별</option>
            </select>
          </div>
        }
      >
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8rem] font-semibold text-[#5C6784]">
          {trendSeries.map(([key, label, color]) => {
            const isVisible = !hiddenTrendSeries.includes(label);

            return (
              <button
                key={key}
                type="button"
                aria-pressed={isVisible}
                onClick={() =>
                  setHiddenTrendSeries(current =>
                    isVisible ? [...current, label] : current.filter(item => item !== label)
                  )
                }
                className={`inline-flex items-center gap-1.5 transition ${isVisible ? 'text-[#5C6784]' : 'text-slate-300'}`}
              >
                <i
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: isVisible ? color : '#AEB8CA' }}
                />
                {label}
              </button>
            );
          })}
        </div>
        <div className="h-[clamp(15rem,18vw,18rem)] px-2 pb-1 pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={trendData}
              margin={{ top: 12, right: 18, left: -8, bottom: 2 }}
            >
              <CartesianGrid stroke="#E8EDF7" vertical={false} />
              <XAxis
                dataKey="day"
                interval={1}
                tick={{ fontSize: 10, fill: '#71809D', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                domain={[0, 3]}
                ticks={[0, 1, 2, 3]}
                tickFormatter={value => (value === 0 ? '0' : `${value}M`)}
                tick={{ fontSize: 10, fill: '#71809D', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={42}
              />
              <Tooltip cursor={{ stroke: '#D6E9FF', strokeWidth: 1 }} content={<TrendTooltip />} />
              {trendSeries
                .filter(([, name]) => !hiddenTrendSeries.includes(name))
                .map(([key, name, color]) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={name}
                    stroke={color}
                    strokeWidth={2.8}
                    dot={{ r: 3.5, strokeWidth: 2, fill: '#FFFFFF', stroke: color }}
                    activeDot={{ r: 5, strokeWidth: 2, fill: '#FFFFFF', stroke: color }}
                    isAnimationActive
                    animationDuration={520}
                    animationEasing="ease-out"
                  />
                ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="모델별 사용량"
          action={
            <MiniTabs
              value={modelTab}
              onChange={setModelTab}
              items={['크레딧', '토큰', '요청 수']}
            />
          }
        >
          <div className="flex items-center gap-2 p-3">
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
            <div className="min-w-0 flex-1 space-y-2">
              {modelUsage.map(([name, value, percent, color]) => (
                <div
                  key={name}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-[0.78rem]"
                >
                  <span className="flex items-center gap-1.5 truncate text-slate-600">
                    <i className="size-2 rounded-full" style={{ backgroundColor: color }} />
                    {name}
                  </span>
                  <span className="text-slate-600">{value}</span>
                  <span className="w-10 text-right text-slate-400">{percent}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
        <Panel
          title="요청 유형"
          action={
            <MiniTabs value={requestTab} onChange={setRequestTab} items={['크레딧', '요청 수']} />
          }
        >
          <div className="flex items-center gap-1 p-3">
            <Donut
              data={usageRequestTypes}
              centerTop="총 요청 수"
              centerValue={usageMetrics[1].value}
            />
            <div className="space-y-2.5 text-[0.78rem] text-slate-500">
              {usageRequestTypes
                .filter(({ name }) => name !== '이미지 생성')
                .map(({ name, value, color }) => (
                  <div key={name} className="flex w-24 items-center justify-between gap-2">
                    <span className="flex items-center gap-1">
                      <i className="size-2 rounded-full" style={{ backgroundColor: color }} />
                      {name}
                    </span>
                    <span>{value}</span>
                  </div>
                ))}
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="토큰 사용 현황">
          <div className="p-4">
            <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
              <i className="w-[70%] bg-blue-500" />
              <i className="w-[26%] bg-blue-300" />
              <i className="w-[4%] bg-blue-100" />
            </div>
            <div className="mt-3 flex justify-between gap-3 text-[0.8rem] text-slate-500">
              <span>
                입력 토큰 {usageTokenSummary.input} ({usageTokenSummary.inputPercent}%)
              </span>
              <span>
                출력 토큰 {usageTokenSummary.output} ({usageTokenSummary.outputPercent}%)
              </span>
            </div>
          </div>
        </Panel>
        <Panel title="요청 처리 현황">
          <div className="p-4">
            <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
              <i className="w-[97%] bg-emerald-500" />
              <i className="w-[2%] bg-rose-400" />
              <i className="w-[1%] bg-slate-300" />
            </div>
            <div className="mt-3 flex justify-between gap-3 text-[0.8rem] text-slate-500">
              <span>
                성공 {usageRequestSummary.success} ({usageRequestSummary.successPercent}%)
              </span>
              <span>실패 {usageRequestSummary.failure}</span>
              <span>타임아웃 {usageRequestSummary.timeout}</span>
            </div>
          </div>
        </Panel>
        <Panel title="평균 응답 시간">
          <div className="flex items-center justify-between px-4 py-2">
            <div>
              <strong className="text-2xl">{usageResponseTime.value}</strong>
              <p className="text-[0.8rem] text-emerald-600">
                ↓ {usageResponseTime.delta}% <span className="text-slate-400">지난 30일 대비</span>
              </p>
            </div>
            <Activity className="text-blue-500" size={48} strokeWidth={1.4} />
          </div>
        </Panel>
      </div>
    </PageLayout>
  );
}
