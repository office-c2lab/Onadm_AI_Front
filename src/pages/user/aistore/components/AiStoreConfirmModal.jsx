import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import AiStoreActionButton from './AiStoreActionButton.jsx';

export default function AiStoreConfirmModal({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = '돌아가기',
  confirmVariant = 'danger',
  footerStart,
  allowOverflow = false,
  rootClassName = '',
  error,
  onClose,
  onConfirm,
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const closeOnEscape = event => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose, open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`${rootClassName} fixed inset-0 z-[200] flex items-center justify-center !bg-slate-950/40 p-4`.trim()}
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`w-full max-w-md rounded-xl bg-white shadow-2xl ${allowOverflow ? 'overflow-visible' : 'overflow-hidden'}`}
      >
        <div className="px-6 py-6 sm:px-7">
          <h2 id={titleId} className="text-lg font-bold text-slate-900">
            {title}
          </h2>
          <div className="mt-3 text-sm leading-6 text-slate-600">{children}</div>
          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
        <div
          className={`flex items-center gap-2 rounded-b-xl border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-7 ${
            footerStart ? 'justify-between' : 'justify-end'
          }`}
        >
          {footerStart ? <div className="flex items-center">{footerStart}</div> : null}
          <div className="flex items-center gap-2">
            <AiStoreActionButton variant="secondary" onClick={onClose} autoFocus>
              {cancelLabel}
            </AiStoreActionButton>
            <AiStoreActionButton variant={confirmVariant} onClick={onConfirm}>
              {confirmLabel}
            </AiStoreActionButton>
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}
