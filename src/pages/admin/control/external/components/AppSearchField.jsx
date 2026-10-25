import { Search } from 'lucide-react';

export default function AppSearchField({ value, onChange, placeholder, className = '' }) {
  return (
    <label className={`relative flex-1 ${className}`.trim()}>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-[var(--app-control-lg)] w-full rounded-[var(--app-radius-lg)] border border-slate-200 bg-white px-[var(--app-pad-md)] pr-[calc(var(--app-pad-lg)*1.7)] text-[clamp(0.82rem,0.95vw,0.9rem)] font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#8BC6FF] focus:ring-[clamp(0.2rem,0.32vw,0.25rem)] focus:ring-[#DEEEFF]"
      />
      <Search
        className="pointer-events-none absolute right-[var(--app-pad-md)] top-1/2 h-[var(--app-icon-xs)] w-[var(--app-icon-xs)] -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
    </label>
  );
}
