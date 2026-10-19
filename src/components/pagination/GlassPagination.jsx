import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import './GlassPagination.css';

const MAX_VISIBLE_PAGES = 5;

function buildPageRange(currentPage, totalPages) {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const halfWindow = Math.floor(MAX_VISIBLE_PAGES / 2);
  let startPage = Math.max(1, currentPage - halfWindow);
  let endPage = startPage + MAX_VISIBLE_PAGES - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = endPage - MAX_VISIBLE_PAGES + 1;
  }

  return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
}

function PaginationArrowIcon({ direction }) {
  return (
    <svg
      width="14"
      height="6"
      viewBox="0 0 14 6"
      xmlns="http://www.w3.org/2000/svg"
      className={`da-pagination__arrow-icon da-pagination__arrow-icon--${direction}`}
      aria-hidden="true"
    >
      <polyline
        points="1 1 7 5 13 1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GooFilter() {
  return (
    <svg className="da-pagination__defs" aria-hidden="true" focusable="false">
      <defs>
        <filter id="pagination-goo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 14 -6"
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    </svg>
  );
}

export default function GlassPagination({
  currentPage,
  totalPages,
  onPageChange,
  themeMode = 'light',
}) {
  const listRef = useRef(null);
  const pageRefs = useRef(new Map());
  const animationFrameRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    transform: 'translate3d(0px, 0px, 0)',
    width: 0,
    height: 0,
    opacity: 0,
  });

  const visiblePages = useMemo(
    () => buildPageRange(currentPage, totalPages),
    [currentPage, totalPages]
  );

  useLayoutEffect(() => {
    if (totalPages <= 0) return undefined;

    const syncIndicator = () => {
      const listNode = listRef.current;
      const currentNode = pageRefs.current.get(currentPage);

      if (!listNode || !currentNode) {
        setIndicatorStyle(previous => ({ ...previous, opacity: 0 }));
        return;
      }

      const listRect = listNode.getBoundingClientRect();
      const itemRect = currentNode.getBoundingClientRect();

      setIndicatorStyle({
        transform: `translate3d(${itemRect.left - listRect.left}px, ${itemRect.top - listRect.top}px, 0)`,
        width: itemRect.width,
        height: itemRect.height,
        opacity: 1,
      });
    };

    const requestSync = () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

      animationFrameRef.current = requestAnimationFrame(() => {
        syncIndicator();
        animationFrameRef.current = null;
      });
    };

    requestSync();

    const resizeObserver = new ResizeObserver(requestSync);
    if (listRef.current) resizeObserver.observe(listRef.current);

    const currentNode = pageRefs.current.get(currentPage);
    if (currentNode) resizeObserver.observe(currentNode);

    window.addEventListener('resize', requestSync);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', requestSync);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [currentPage, totalPages, visiblePages]);

  if (totalPages <= 0) return null;

  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <nav className={`da-pagination is-${themeMode}`} aria-label="페이지 이동">
      <ul ref={listRef} className="da-pagination__list">
        <li className="da-pagination__active-shell" aria-hidden="true">
          <span className="da-pagination__active" style={indicatorStyle} />
        </li>

        <li className="da-pagination__item da-pagination__item--arrow">
          <button
            type="button"
            className="da-pagination__button da-pagination__button--arrow"
            onClick={handlePrevious}
            disabled={currentPage === 1}
            aria-label="이전 페이지"
          >
            <PaginationArrowIcon direction="left" />
          </button>
        </li>

        {visiblePages.map(page => {
          const isCurrent = page === currentPage;

          return (
            <li
              key={page}
              ref={node => {
                if (node) pageRefs.current.set(page, node);
                else pageRefs.current.delete(page);
              }}
              className={`da-pagination__item ${isCurrent ? 'is-current' : ''}`.trim()}
            >
              <button
                type="button"
                className="da-pagination__button"
                onClick={() => onPageChange(page)}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`${page}페이지`}
              >
                {page}
              </button>
            </li>
          );
        })}

        <li className="da-pagination__item da-pagination__item--arrow">
          <button
            type="button"
            className="da-pagination__button da-pagination__button--arrow"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            aria-label="다음 페이지"
          >
            <PaginationArrowIcon direction="right" />
          </button>
        </li>
      </ul>

      <GooFilter />
    </nav>
  );
}
