import { Outlet } from 'react-router-dom';
import ControlTabNav from './ControlTabNav.jsx';
import '../external/garim.css';

export default function ControlShell({ type }) {
  return (
    <div className="garim-external-root flex h-dvh min-h-0 flex-col overflow-hidden text-[#111827]">
      <div className="z-30 shrink-0 bg-white/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[var(--app-page-outer-width)] px-[var(--app-page-x)]">
          <ControlTabNav type={type} />
        </div>
      </div>
      <section
        data-route-scroll-container
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <Outlet />
      </section>
    </div>
  );
}
