import {
  APP_PAGE_HORIZONTAL_PADDING_CLASS,
  APP_PAGE_INNER_WIDTH_CLASS,
  APP_PAGE_OUTER_WIDTH_CLASS,
} from '../../styles/layout.js';

export default function PageLayout({
  children,
  gapClassName = 'gap-[clamp(1rem,1.6vw,1.5rem)]',
  topPaddingClassName = 'pt-[var(--app-page-top)]',
  bottomPaddingClassName = 'pb-[var(--app-page-bottom)]',
}) {
  return (
    <div
      className={`mx-auto flex min-h-full w-full flex-1 ${APP_PAGE_HORIZONTAL_PADDING_CLASS} ${bottomPaddingClassName} ${APP_PAGE_OUTER_WIDTH_CLASS}`.trim()}
    >
      <div
        className={`mx-auto flex min-h-full w-full flex-1 flex-col ${gapClassName} ${topPaddingClassName} ${APP_PAGE_INNER_WIDTH_CLASS}`.trim()}
      >
        {children}
      </div>
    </div>
  );
}
