export const tableSurfaceClass =
  'flex min-h-0 w-full flex-col overflow-hidden rounded-[var(--app-radius-lg)] border border-border-panel bg-white shadow-table';

export const tableScrollClass = 'min-h-0 w-full overflow-x-auto xl:overflow-x-hidden';

export const tableClass = 'w-full table-fixed border-separate border-spacing-0';

export const tableHeadClass =
  'bg-[linear-gradient(180deg,var(--color-table-header-start)_0%,var(--color-table-header-end)_100%)]';

export const tableHeaderRowClass =
  'text-table font-semibold leading-table-heading text-palette-blue-96';

export const tableHeaderCellClass =
  'border-b border-border-subtle px-[var(--app-pad-md)] py-[var(--app-pad-sm)] text-left font-semibold';

export const tableBodyClass = 'text-table leading-table text-text-secondary';

export function tableRowClass({ selected = false, striped = false, interactive = false } = {}) {
  const baseRowClass = striped ? 'bg-palette-blue-01' : 'bg-white';
  const stateClass = selected
    ? 'bg-selection text-brand-hover'
    : `${baseRowClass} text-text-secondary hover:bg-slate-50`;

  return `${interactive ? 'cursor-pointer ' : ''}transition ${stateClass}`.trim();
}

export function tableCellClass(index, className = '') {
  const borderClass = index === 0 ? '' : 'border-t border-border-row';

  return `${borderClass} px-[var(--app-pad-md)] py-[var(--app-pad-sm)] ${className}`.trim();
}
