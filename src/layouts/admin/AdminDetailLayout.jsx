import { Outlet } from 'react-router-dom';
import DetailSection from '../shared/DetailSection.jsx';

export default function AdminDetailLayout() {
  return (
    <div className="mx-auto w-full max-w-4xl pb-14 pt-6 text-slate-900">
      <Outlet />
    </div>
  );
}

export const AdminDetailSection = DetailSection;

export function AdminInlineDetailSection({ title, children, className = '' }) {
  return (
    <section className={`border-[#E3E8F2] px-5 py-5 ${className}`.trim()}>
      <h3 className="mb-4 text-sm font-bold text-[#23304A]">{title}</h3>
      <div className="space-y-3.5">{children}</div>
    </section>
  );
}
