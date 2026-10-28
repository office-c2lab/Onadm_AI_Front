import { Bot, Boxes, ChevronRight, FileText, Search, Workflow, X } from 'lucide-react';

export const cardClass = 'rounded-xl border border-slate-200 bg-white';

export function MetricCard({ label, value, helper, icon: Icon, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <article
      className={`${cardClass} group flex min-h-28 items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5`}
    >
      <span
        className={`grid size-12 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105 ${tones[tone]}`}
      >
        <Icon size={22} strokeWidth={1.7} />
      </span>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-[22px] font-bold tracking-[-0.04em] text-slate-900">{value}</p>
        {helper ? <p className="mt-1 text-[11px] text-slate-400">{helper}</p> : null}
      </div>
    </article>
  );
}

export function StatusText({ children }) {
  const tone = {
    정상: 'text-emerald-600',
    승인: 'text-emerald-600',
    통과: 'text-emerald-600',
    완료: 'text-emerald-600',
    '게시 중': 'text-blue-600',
    '게시 대기': 'text-violet-600',
    '시행 중': 'text-blue-600',
    '심사 중': 'text-blue-600',
    '검토 중': 'text-blue-600',
    '진행 중': 'text-blue-600',
    대기: 'text-amber-600',
    '대기 중': 'text-amber-600',
    경고: 'text-amber-600',
    '시행 예정': 'text-violet-600',
    '보완 필요': 'text-orange-600',
    '확인 필요': 'text-orange-600',
    실패: 'text-red-600',
    반려: 'text-red-600',
    숨김: 'text-slate-500',
    미게시: 'text-slate-500',
    높음: 'text-red-600',
    중간: 'text-amber-600',
    낮음: 'text-emerald-600',
  }[children];

  return (
    <span
      className={`inline-flex items-center text-[clamp(0.86rem,1vw,0.94rem)] font-semibold whitespace-nowrap ${tone || 'text-slate-500'}`}
    >
      {children}
    </span>
  );
}

export function SearchField({ value, onChange, placeholder = '검색' }) {
  return (
    <label className="relative block min-w-0 flex-1 sm:max-w-xl">
      <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-500" size={18} />
      <input
        type="search"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-transparent bg-[#edf2f7] pr-4 pl-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
      />
    </label>
  );
}

export function SelectField({ value, onChange, options, label }) {
  return (
    <label className="flex items-center gap-2">
      {label ? <span className="sr-only">{label}</span> : null}
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="h-9 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none transition hover:bg-slate-50 focus:border-blue-400"
      >
        {options.map(option => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export function EmptyState({ message }) {
  return <div className="px-6 py-16 text-center text-sm text-slate-400">{message}</div>;
}

export function Drawer({ title, subtitle, onClose, children, footer }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-[2px] sm:p-6"
      role="dialog"
      aria-modal="true"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 sm:max-h-[calc(100vh-3rem)]">
        <header className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">{children}</div>
        {footer ? (
          <footer className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}

export function Section({ title, action, children, className = '' }) {
  return (
    <section className={`${cardClass} ${className}`}>
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <h2 className="flex items-center gap-0.5 text-[16px] font-bold text-slate-900">
          {title}
          <ChevronRight size={17} aria-hidden="true" />
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}

export function ToolAvatar({ type, size = 'md' }) {
  const visuals = {
    'AI App': [FileText, 'bg-blue-600 text-white'],
    'AI Agent': [Bot, 'bg-violet-100 text-violet-600'],
    '자동화 도구': [Workflow, 'bg-orange-100 text-orange-600'],
    '일반 업무 도구': [Boxes, 'bg-slate-100 text-slate-600'],
  };
  const [Icon, color] = visuals[type] || visuals['AI App'];
  const sizeClass = size === 'lg' ? 'size-14' : 'size-12';

  return (
    <span className={`grid ${sizeClass} shrink-0 place-items-center rounded-xl ${color}`}>
      <Icon size={size === 'lg' ? 27 : 23} strokeWidth={1.7} aria-hidden="true" />
    </span>
  );
}

export function TextLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
    >
      {children}
      <ChevronRight size={14} />
    </button>
  );
}
