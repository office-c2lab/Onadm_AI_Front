import { Outlet } from 'react-router-dom';
import ControlTabNav from './ControlTabNav.jsx';

export default function ControlShell({ type }) {
  return (
    <div className="app-control-scope flex h-dvh min-h-0 flex-col overflow-hidden text-text-primary">
      <div className="z-30 shrink-0 bg-canvas/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[var(--app-page-outer-width)] px-[var(--app-page-x)]">
          <ControlTabNav type={type} />
        </div>
      </div>
      <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <Outlet />
      </section>
    </div>
  );
}
