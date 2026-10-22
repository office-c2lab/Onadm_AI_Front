import { cardClass } from '../../styles/surfaces.js';

export default function MetricCard({ label, value, helper, icon: Icon, tone = 'blue' }) {
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
        <p className="mt-1 text-metric font-bold tracking-metric text-slate-900">{value}</p>
        {helper ? <p className="mt-1 text-micro text-slate-400">{helper}</p> : null}
      </div>
    </article>
  );
}
