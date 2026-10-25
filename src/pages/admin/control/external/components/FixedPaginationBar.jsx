import {
  APP_PAGE_HORIZONTAL_PADDING_CLASS,
  APP_PAGE_INNER_WIDTH_CLASS,
  APP_PAGE_OUTER_WIDTH_CLASS,
} from '../constants/contentLayout.js';
import GlassPagination from './GlassPagination.jsx';

export default function FixedPaginationBar({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 0) {
    return null;
  }

  return (
    <>
      {/* fixed pagination에 본문이 가려지지 않도록 여백 확보 */}
      <div className="h-20" aria-hidden="true" />

      <div
        className="
          pointer-events-none
          fixed
          right-0
          bottom-0
          left-[var(--ondam-admin-sidebar-width,0px)]
          z-20
          border-t
          border-[#E5E8ED]
          bg-[#f9f9f9]
          py-3
        "
      >
        <div
          className={`
            mx-auto
            w-full
            ${APP_PAGE_HORIZONTAL_PADDING_CLASS}
            ${APP_PAGE_OUTER_WIDTH_CLASS}
          `.trim()}
        >
          <div
            className={`
              mx-auto
              w-full
              ${APP_PAGE_INNER_WIDTH_CLASS}
            `.trim()}
          >
            <div className="pointer-events-auto">
              <GlassPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
