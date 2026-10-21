import { Outlet, useLocation } from 'react-router-dom';
import ControlTabNav from '../components/ControlTabNav.jsx';

const standalonePaths = [
  '/admin/control/internal/classification',
  '/admin/control/internal/policies',
];
const wideContentPaths = ['/admin/control/internal/models', '/admin/control/internal/history'];

export default function InternalControlLayout() {
  const location = useLocation();
  const isStandalonePage = standalonePaths.includes(location.pathname);
  const usesWideContent = wideContentPaths.includes(location.pathname);

  return (
    <div className="min-h-full w-full">
      {!isStandalonePage ? (
        <div className="mx-auto w-full max-w-[88rem] px-[clamp(0.875rem,2vw,1.5rem)]">
          <ControlTabNav type="internal" />
        </div>
      ) : null}
      {isStandalonePage || usesWideContent ? (
        <Outlet />
      ) : (
        <div className="mx-auto flex min-h-full w-full max-w-[88rem] px-[clamp(0.875rem,2vw,1.5rem)] pb-[clamp(2rem,4vw,3rem)]">
          <div className="mx-auto w-full max-w-[74rem] pt-[clamp(1.1rem,2vw,1.8rem)]">
            <Outlet />
          </div>
        </div>
      )}
    </div>
  );
}
