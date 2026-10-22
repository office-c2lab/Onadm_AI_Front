import { useId } from 'react';
import { X } from 'lucide-react';
import DialogLayer from './DialogLayer.jsx';

export default function Modal({
  title,
  description,
  onClose,
  onSubmit,
  children,
  footer,
  bodyClassName = '',
  footerClassName = '',
}) {
  const titleId = useId();
  const descriptionId = useId();
  const Panel = onSubmit ? 'form' : 'section';
  return (
    <DialogLayer onClose={onClose} className="ui-modal-stage">
      <Panel
        onSubmit={onSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="ui-modal-panel"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="모달 닫기"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </header>
        {bodyClassName ? <div className={bodyClassName}>{children}</div> : children}
        {footer && (
          <footer
            className={`border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6 ${footerClassName}`}
          >
            {footer}
          </footer>
        )}
      </Panel>
    </DialogLayer>
  );
}
