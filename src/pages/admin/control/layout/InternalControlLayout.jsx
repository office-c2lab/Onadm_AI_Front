import { Outlet, useLocation } from 'react-router-dom';
import ControlTabNav from '../components/ControlTabNav.jsx';
import '../external/garim.css';

const standalonePaths = [
  '/admin/control/internal/classification',
  '/admin/control/internal/policies',
];
const wideContentPaths = [
  '/admin/control/internal/usage',
  '/admin/control/internal/models',
  '/admin/control/internal/prompts',
  '/admin/control/internal/limits',
  '/admin/control/internal/credit-history',
  '/admin/control/internal/history',
];

export default function InternalControlLayout() {
  const location = useLocation();
  const isStandalonePage = standalonePaths.includes(location.pathname);
  const usesWideContent = wideContentPaths.includes(location.pathname);

  return (
    <div className="garim-external-root flex h-dvh min-h-0 w-full flex-col overflow-hidden text-[#111827]">
      {!isStandalonePage ? (
        <div className="z-30 shrink-0 bg-[#f9f9f9]/95 backdrop-blur">
          <div className="mx-auto w-full max-w-[var(--app-page-outer-width)] px-[var(--app-page-x)]">
            <ControlTabNav type="internal" />
          </div>
        </div>
      ) : null}
      <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {isStandalonePage || usesWideContent ? (
          <Outlet />
        ) : (
          <div className="mx-auto flex min-h-full w-full max-w-[var(--app-page-outer-width)] px-[var(--app-page-x)] pb-[var(--app-page-bottom)]">
            <div className="mx-auto w-full max-w-[var(--app-page-inner-width)] pt-[var(--app-page-top)]">
              <Outlet />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
