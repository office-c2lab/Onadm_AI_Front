import { Search } from 'lucide-react';

const variants = {
  outline: {
    wrapper: 'relative flex-1',
    input:
      'h-[var(--app-control-lg)] w-full rounded-[var(--app-radius-lg)] border border-slate-200 bg-white px-[var(--app-pad-md)] pr-[calc(var(--app-pad-lg)*1.7)] text-control font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-focus-border focus:ring-[clamp(0.2rem,0.32vw,0.25rem)] focus:ring-focus-ring',
    icon: 'right-[var(--app-pad-md)] h-[var(--app-icon-xs)] w-[var(--app-icon-xs)] text-slate-400',
  },
  filled: {
    wrapper: 'relative block min-w-0 flex-1 sm:max-w-xl',
    input:
      'h-11 w-full rounded-lg border border-transparent bg-search-surface pr-4 pl-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20',
    icon: 'left-4 text-slate-500',
  },
};

// onChange consistently receives the native React change event.
export default function SearchField({
  value,
  onChange,
  placeholder = '검색',
  ariaLabel,
  variant = 'outline',
  className = '',
  ...props
}) {
  const styles = variants[variant] || variants.outline;
  return (
    <label className={`${styles.wrapper} ${className}`.trim()}>
      <input
        {...props}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel || props['aria-label'] || placeholder}
        className={styles.input}
      />
      <Search
        size={18}
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${styles.icon}`}
        aria-hidden="true"
      />
    </label>
  );
}
