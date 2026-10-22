export default function SectionCard({ children, className = '' }) {
  return (
    <section
      className={`rounded-[var(--app-radius-xl)] border border-slate-200 bg-white shadow-section ${className}`.trim()}
    >
      {children}
    </section>
  );
}
