export default function AppToggle({
  checked,
  onChange,
  ariaLabel,
  disabled = false,
  size = 'responsive',
  ...props
}) {
  return (
    <button
      {...props}
      type="button"
      role="switch"
      data-size={size}
      aria-checked={checked}
      aria-label={ariaLabel || props['aria-label']}
      disabled={disabled}
      onClick={onChange}
      className={`ui-toggle relative inline-flex shrink-0 cursor-pointer items-center rounded-full border transition duration-200 hover:brightness-[1.04] disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? 'border-brand bg-brand shadow-toggle' : 'border-toggle-border bg-toggle-off'
      }`.trim()}
    >
      <span className="ui-toggle-thumb rounded-full bg-white shadow-toggle-thumb transition duration-200" />
    </button>
  );
}
