const tones = {
  green: 'bg-emerald-50 text-emerald-600',
  red: 'bg-rose-50 text-rose-600',
  gray: 'bg-slate-100 text-slate-500',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  failure: 'bg-rose-50 text-rose-500',
};

export default function Badge({ children, tone = 'gray', className = '', size = 'default' }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 font-bold ${size === 'compact' ? 'text-size-0-78rem' : 'text-xs'} ${tones[tone] || tones.gray} ${className}`}
    >
      {children}
    </span>
  );
}
