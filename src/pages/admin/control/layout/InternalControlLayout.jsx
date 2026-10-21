import { Outlet, useLocation } from 'react-router-dom';
import ControlTabNav from '../components/ControlTabNav.jsx';

const standalonePaths = [
  '/admin/control/internal/classification',
  '/admin/control/internal/policies',
];

export default function InternalControlLayout() {
  const location = useLocation();
  const isStandalonePage = standalonePaths.includes(location.pathname);

  return (
    <div className="min-h-full w-full">
      {!isStandalonePage ? (
        <div className="mx-auto w-full max-w-[88rem] px-[clamp(0.875rem,2vw,1.5rem)]">
          <ControlTabNav type="internal" />
        </div>
      ) : null}
      <Outlet />
    </div>
  );
}
