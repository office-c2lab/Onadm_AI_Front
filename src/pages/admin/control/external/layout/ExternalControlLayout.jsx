import { Outlet } from 'react-router-dom';
import ControlTabNav from '../../components/ControlTabNav.jsx';
import '../garim.css';

export default function ExternalControlLayout() {
  return (
    <div className="garim-external-root flex h-dvh min-h-0 flex-col overflow-hidden text-[#111827]">
      <div className="z-30 shrink-0 border-b border-slate-200 bg-[#f9f9f9]/95 backdrop-blur">
        <div className="mx-auto w-full max-w-[var(--app-page-outer-width)] px-[var(--app-page-x)]">
          <ControlTabNav type="external" />
        </div>
      </div>
      <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <Outlet />
      </section>
    </div>
  );
}
