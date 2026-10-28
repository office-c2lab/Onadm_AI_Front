export default function TableListHeader({ title, count, action = null }) {
  const normalizedCount = Number.isFinite(Number(count)) ? Number(count) : 0;

  return (
    <div
      data-table-list-header
      className="flex items-center gap-3 border-b border-[#E7EBF4] px-5 py-4"
    >
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
        {normalizedCount.toLocaleString()}건
      </span>
      {action ? <div className="ml-auto">{action}</div> : null}
    </div>
  );
}
