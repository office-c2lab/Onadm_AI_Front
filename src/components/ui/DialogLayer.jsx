import { useEffect, useId, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const openDialogs = [];
const dialogAnchors = new WeakMap();
let previousOverflow;
const focusableSelector =
  'button:not(:disabled), a[href], input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

// Portals prevent page stacking contexts from covering a modal or clipping its backdrop.
export default function DialogLayer({ onClose, children, className = '', ...props }) {
  const rootRef = useRef(null);
  const anchorRef = useRef(null);
  const closeRef = useRef(onClose);
  const id = useId();

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useLayoutEffect(() => {
    const inheritTheme = () => {
      const source = anchorRef.current?.parentElement;
      const root = rootRef.current;
      if (!source || !root) return;
      const inherited = getComputedStyle(source);
      root.style.fontSize = inherited.fontSize;
      root.style.fontFamily = inherited.fontFamily;
      root.style.color = inherited.color;
      for (const name of inherited) {
        if (name.startsWith('--app-'))
          root.style.setProperty(name, inherited.getPropertyValue(name));
      }
    };
    inheritTheme();
    window.addEventListener('resize', inheritTheme);
    return () => window.removeEventListener('resize', inheritTheme);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const panel = root.querySelector('[role="dialog"]') || root.querySelector('.app-modal-panel');
    if (!panel) return;
    const previousFocus = document.activeElement;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    if (!panel.hasAttribute('tabindex')) panel.tabIndex = -1;
    if (!panel.hasAttribute('aria-label') && !panel.hasAttribute('aria-labelledby')) {
      const title = panel.querySelector('h1, h2, h3');
      if (title) {
        if (!title.id) title.id = `dialog-title-${id}`;
        panel.setAttribute('aria-labelledby', title.id);
      }
    }
    if (openDialogs.length === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    dialogAnchors.set(root, anchorRef.current);
    const descendantIndex = openDialogs.findIndex(dialog =>
      root.contains(dialogAnchors.get(dialog))
    );
    if (descendantIndex < 0) openDialogs.push(root);
    else openDialogs.splice(descendantIndex, 0, root);
    const isTopmost = () => openDialogs.at(-1) === root;
    const getFocusable = () =>
      [...panel.querySelectorAll(focusableSelector)].filter(
        element =>
          element.tabIndex >= 0 &&
          !element.closest('[hidden], [inert]') &&
          element.getClientRects().length > 0
      );
    const focusFirst = () => (getFocusable()[0] || panel).focus({ preventScroll: true });
    const onKeyDown = event => {
      if (!isTopmost()) return;
      if (event.key === 'Escape' && !event.isComposing) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeRef.current?.();
      } else if (event.key === 'Tab') {
        const elements = getFocusable();
        const first = elements[0];
        const last = elements.at(-1);
        if (!first) {
          event.preventDefault();
          panel.focus();
        } else if (
          event.shiftKey &&
          (document.activeElement === first || document.activeElement === panel)
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last || document.activeElement === panel)
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const onFocusIn = event => {
      if (isTopmost() && !panel.contains(event.target)) focusFirst();
    };
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('focusin', onFocusIn);
    if (isTopmost()) focusFirst();
    return () => {
      const wasTopmost = isTopmost();
      openDialogs.splice(openDialogs.indexOf(root), 1);
      dialogAnchors.delete(root);
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('focusin', onFocusIn);
      if (openDialogs.length === 0) document.body.style.overflow = previousOverflow;
      if (wasTopmost && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [id]);

  return (
    <>
      <span ref={anchorRef} hidden aria-hidden="true" />
      {createPortal(
        <div
          {...props}
          ref={rootRef}
          className={className}
          onMouseDown={event => {
            if (event.target === event.currentTarget) onClose?.();
          }}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  );
}
