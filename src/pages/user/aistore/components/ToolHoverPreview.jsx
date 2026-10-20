import { useLayoutEffect, useRef, useState } from 'react';
import StoreToolIcon from './StoreToolIcon.jsx';

function getPlacement(card, previewHeight) {
  const spaceBelow = window.innerHeight - card.getBoundingClientRect().bottom - 8;
  return spaceBelow >= previewHeight ? 'bottom' : 'top';
}

export default function ToolHoverPreview({ tool, label, align = 'left' }) {
  const anchorRef = useRef(null);
  const previewRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [placement, setPlacement] = useState('bottom');
  const category = tool.storeCategory || tool.category;

  useLayoutEffect(() => {
    const card = anchorRef.current?.parentElement;
    if (!card) return undefined;

    const updatePlacement = () => {
      setPlacement(getPlacement(card, previewRef.current?.offsetHeight || 220));
    };
    const show = () => {
      updatePlacement();
      setVisible(true);
    };
    const hide = () => setVisible(false);
    const hideWhenFocusLeaves = event => {
      if (!card.contains(event.relatedTarget)) hide();
    };

    card.addEventListener('mouseenter', show);
    card.addEventListener('mouseleave', hide);
    card.addEventListener('focusin', show);
    card.addEventListener('focusout', hideWhenFocusLeaves);

    if (visible) {
      updatePlacement();
      window.addEventListener('scroll', updatePlacement, true);
      window.addEventListener('resize', updatePlacement);
    }

    return () => {
      card.removeEventListener('mouseenter', show);
      card.removeEventListener('mouseleave', hide);
      card.removeEventListener('focusin', show);
      card.removeEventListener('focusout', hideWhenFocusLeaves);
      window.removeEventListener('scroll', updatePlacement, true);
      window.removeEventListener('resize', updatePlacement);
    };
  }, [visible]);

  return (
    <>
      <span ref={anchorRef} className="hidden" aria-hidden="true" />
      {visible && (
        <div
          ref={previewRef}
          className={`pointer-events-none absolute z-30 w-[min(24rem,calc(100vw-3rem))] overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-xl shadow-slate-900/10 ${placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} ${align === 'right' ? 'right-0' : 'left-0'}`}
          aria-hidden="true"
        >
          <div className="flex items-center gap-4 px-4 py-4">
            <StoreToolIcon tool={tool} featured />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{tool.name}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{category}</p>
            </div>
            {label && (
              <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                {label}
              </span>
            )}
          </div>
          <p className="border-t border-slate-100 px-4 py-3 text-sm leading-6 text-slate-600">
            {tool.summary}
          </p>
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-500">
            <span className="truncate">{tool.maker}</span>
            <span className="shrink-0">v{tool.version}</span>
          </div>
        </div>
      )}
    </>
  );
}
