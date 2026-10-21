export const monitoringTableSurfaceClass =
  'flex min-h-0 w-full flex-col overflow-hidden rounded-[var(--app-radius-lg)] border border-[#ECEFF5] bg-white shadow-[0_0.5rem_1.5rem_rgba(15,23,42,0.06)]';

export const monitoringTableScrollClass = 'min-h-0 w-full overflow-x-auto xl:overflow-x-hidden';

export const monitoringTableClass = 'w-full table-fixed border-separate border-spacing-0';

export const monitoringTableHeadClass = 'bg-[linear-gradient(180deg,#F8FAFF_0%,#F2F5FC_100%)]';

export const monitoringTableHeaderRowClass =
  'text-[clamp(0.82rem,0.95vw,0.94rem)] font-semibold leading-[1.4] text-[#4A5578]';

export const monitoringTableHeaderCellClass =
  'border-b border-[#E7EBF4] px-[var(--app-pad-md)] py-[var(--app-pad-sm)] text-left font-semibold';

export const monitoringTableBodyClass =
  'text-[clamp(0.82rem,0.95vw,0.94rem)] leading-[1.45] text-[#344054]';

export function monitoringTableRowClass({
  selected = false,
  striped = false,
  interactive = false,
} = {}) {
  const baseRowClass = striped ? 'bg-[#FEFEFF]' : 'bg-white';
  const stateClass = selected
    ? 'bg-[#EFF6FF] text-[#063CC8]'
    : `${baseRowClass} text-[#344054] hover:bg-slate-50`;

  return `${interactive ? 'cursor-pointer ' : ''}transition ${stateClass}`.trim();
}

export function monitoringTableCellClass(index, className = '') {
  const borderClass = index === 0 ? '' : 'border-t border-[#EEF2F7]';

  return `${borderClass} px-[var(--app-pad-md)] py-[var(--app-pad-sm)] ${className}`.trim();
}

