import { ChevronRight } from 'lucide-react';

export default function TextLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
    >
      {children}
      <ChevronRight size={14} />
    </button>
  );
}
