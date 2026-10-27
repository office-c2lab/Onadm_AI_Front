export default function DetailSection({
  title,
  description,
  action,
  children,
  className = '',
  contentClassName = 'mt-5',
}) {
  return (
    <section className={`border-t border-slate-200 py-9 sm:py-10 ${className}`.trim()}>
      <header className="flex items-start justify-between gap-5">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
          ) : null}
        </div>
        {action}
      </header>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
