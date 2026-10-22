import {
  tableClass,
  tableHeadClass,
  tableHeaderRowClass,
  tableHeaderCellClass,
  tableBodyClass,
} from '../../styles/table.js';

// Rows remain owned by the feature so selection, custom cells and sorting keep their semantics.
export default function DataTable({
  label,
  columns,
  widths,
  children,
  className = '',
  headerRowClassName = tableHeaderRowClass,
  bodyClassName = tableBodyClass,
}) {
  return (
    <div className="overflow-x-auto">
      <table aria-label={label} className={`${tableClass} ${className}`}>
        {widths && (
          <colgroup>
            {widths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
        )}
        <thead className={tableHeadClass}>
          <tr className={headerRowClassName}>
            {columns.map(column => (
              <th
                key={typeof column === 'string' ? column : column.key}
                scope="col"
                className={tableHeaderCellClass}
              >
                {typeof column === 'string' ? column : column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={bodyClassName}>{children}</tbody>
      </table>
    </div>
  );
}
