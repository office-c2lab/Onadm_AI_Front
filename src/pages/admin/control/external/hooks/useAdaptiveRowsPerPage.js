import { useEffect, useRef, useState } from 'react';

export default function useAdaptiveRowsPerPage({
  maxRows = 10,
  minRows = 4,
  rowHeight = 56,
  bottomReserve = 112,
} = {}) {
  const containerRef = useRef(null);
  const [rowsPerPage, setRowsPerPage] = useState(maxRows);

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const containerTop = container?.getBoundingClientRect().top ?? 0;
      const tableHeadHeight =
        container?.querySelector('thead')?.getBoundingClientRect().height ?? rowHeight;
      const measuredRowHeight =
        container?.querySelector('tbody tr')?.getBoundingClientRect().height ?? rowHeight;
      const effectiveRowHeight = Math.max(1, measuredRowHeight || rowHeight);
      const availableHeight = viewportHeight - containerTop - tableHeadHeight - bottomReserve;
      const measuredRows = Math.floor(availableHeight / effectiveRowHeight);
      const nextRows = Math.max(minRows, Math.min(maxRows, measuredRows));

      setRowsPerPage(Number.isFinite(nextRows) ? nextRows : maxRows);
    };

    measure();

    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);

    if (containerRef.current) {
      resizeObserver?.observe(containerRef.current);
    }

    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize', measure);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('resize', measure);
    };
  }, [bottomReserve, maxRows, minRows, rowHeight]);

  return { containerRef, rowsPerPage };
}
