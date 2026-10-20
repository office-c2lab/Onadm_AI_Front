import { useId } from 'react';
import { X } from 'lucide-react';

export default function ToolInfoModalShell({
  title,
  description,
  onClose,
  onSubmit,
  children,
  footer,
}) {
  const titleId = useId();
  const Panel = onSubmit ? 'form' : 'section';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-[2px] sm:p-6"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <Panel
        onSubmit={onSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 sm:max-h-[calc(100vh-3rem)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="모달 닫기"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>
        {children}
        {footer && (
          <div className="flex justify-end border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">
            {footer}
          </div>
        )}
      </Panel>
    </div>
  );
}
