export default function SelectField({ value, onChange, options, label }) {
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
