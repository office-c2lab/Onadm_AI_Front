import { Search } from 'lucide-react';

export default function SearchHeader({
  title,
  description,
  value,
  onSearchChange,
  placeholder,
  ariaLabel,
}) {
  return (
    <>
      

      <div className="sticky top-0 z-30 -mx-5 bg-[#f9f9f9]/95 px-5 py-3 backdrop-blur md:-mx-8 md:px-8">
        <label className="mx-auto flex h-11 w-full max-w-xl items-center gap-3 rounded-lg bg-[#edf2f7] px-4 text-slate-500 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20">
          <Search size={19} strokeWidth={2} aria-hidden="true" />
          <input
            type="search"
            value={value}
            onChange={event => onSearchChange(event.target.value)}
            placeholder={placeholder}
            aria-label={ariaLabel}
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-600"
          />
        </label>
      </div>
    </>
  );
}
