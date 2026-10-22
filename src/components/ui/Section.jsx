import { ChevronRight } from 'lucide-react';
import { cardClass } from '../../styles/surfaces.js';

export default function Section({ title, action, children, className = '' }) {
  return (
    <section className={`${cardClass} ${className}`}>
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <h2 className="flex items-center gap-0.5 text-body-md font-bold text-slate-900">
          {title}
          <ChevronRight size={17} aria-hidden="true" />
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}
