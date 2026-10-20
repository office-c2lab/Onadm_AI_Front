import { Outlet } from 'react-router-dom';
import './garim.css';

export default function GarimExternalLayout() {
  return (
    <div className="garim-external-root flex h-dvh min-h-0 flex-col overflow-hidden text-[#111827]">
      <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <Outlet />
      </section>
    </div>
  );
}
