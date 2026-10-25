export default function SectionCard({ children, className = '' }) {
  return (
    <section
      className={`rounded-[var(--app-radius-xl)] border border-slate-200 bg-white shadow-[0_0.625rem_1.875rem_rgba(15,23,42,0.06)] ${className}`.trim()}
    >
      {children}
    </section>
  );
}
