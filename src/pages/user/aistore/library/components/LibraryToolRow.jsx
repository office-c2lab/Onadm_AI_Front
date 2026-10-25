import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, MoreVertical, RefreshCw } from 'lucide-react';
import StoreToolIcon from '../../components/StoreToolIcon.jsx';
import ToolHoverPreview from '../../components/ToolHoverPreview.jsx';
import { getLatestVersionNotes } from '../../data/versionNotes.js';

function VersionNotesModal({ tool, onClose }) {
  useEffect(() => {
    const closeOnEscape = event => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  const versionNotes = getLatestVersionNotes(tool);
  const notes = versionNotes.length
    ? versionNotes
    : ['사용성과 안정성을 개선하고 발견된 오류를 수정했습니다.'];

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/40 p-4"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={`version-notes-${tool.id}`}
        className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <div className="px-6 py-6 sm:px-7">
          <h2
            id={`version-notes-${tool.id}`}
            className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
          >
            버전 참고사항
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <strong className="text-base font-semibold text-slate-800">{tool.name}</strong>
            <span className="text-sm font-bold text-blue-600">v{tool.version}</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
            {notes.map(note => (
              <li key={note} className="flex items-start gap-2">
                <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-slate-500" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            닫기
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

export default function LibraryToolRow({
  tool,
  mode,
  downloaded = false,
  updateAvailable = false,
  onDetail,
  onDownload,
  onUpdate,
  onRemove,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [versionNotesOpen, setVersionNotesOpen] = useState(false);
  const isFavorite = mode === 'favorites';
  const removeLabel = isFavorite ? '즐겨찾기 해제' : '목록에서 제거';
  const category = tool.storeCategory || tool.category;

  return (
    <>
      <article
        className={`group relative flex min-h-[82px] min-w-0 flex-wrap items-center gap-4 rounded-xl border border-transparent px-3 py-3 transition hover:border-slate-100 hover:bg-[#f5f5f5] hover:shadow-sm ${menuOpen ? 'z-[100] border-slate-100 bg-white shadow-sm' : 'hover:z-20 focus-within:z-20'}`}
      >
        <button
          type="button"
          onClick={() => onDetail(tool)}
          className="flex min-w-[180px] flex-1 items-center gap-4 text-left"
          aria-label={`${tool.name} 상세 보기`}
        >
          <StoreToolIcon tool={tool} small />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-base font-semibold text-slate-900">
              {tool.name}
            </span>
            <span className="mt-1 block truncate text-sm text-slate-500">{category}</span>
          </span>
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          {isFavorite ? (
            <button
              type="button"
              onClick={() => onDownload(tool.id)}
              disabled={downloaded}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-default disabled:bg-slate-100 disabled:text-slate-500 disabled:shadow-none"
              aria-label={`${tool.name} ${downloaded ? '다운로드 됨' : '다운로드'}`}
            >
              <Download size={15} aria-hidden="true" />
              {downloaded ? '다운로드 됨' : '다운로드'}
            </button>
          ) : updateAvailable ? (
            <button
              type="button"
              onClick={() => {
                onUpdate(tool);
                setVersionNotesOpen(true);
              }}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              aria-label={`${tool.name} 업데이트`}
            >
              <RefreshCw size={14} strokeWidth={2.2} aria-hidden="true" />
              업데이트
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 text-xs font-medium text-slate-500"
              aria-label={`${tool.name} 다운로드 됨`}
            >
              <Download size={15} aria-hidden="true" />
              다운로드 됨
            </button>
          )}
          <div
            className="relative"
            onBlur={event => {
              if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
            }}
          >
            <button
              type="button"
              onClick={() => setMenuOpen(open => !open)}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label={`${tool.name} 더보기`}
              aria-expanded={menuOpen}
              title="더보기"
            >
              <MoreVertical size={17} aria-hidden="true" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-[110] mt-1 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDetail(tool);
                  }}
                  className="w-full rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                >
                  상세 보기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setVersionNotesOpen(true);
                  }}
                  className="w-full rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                >
                  버전 참고 사항
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(tool.id)}
                  className="w-full rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                >
                  {removeLabel}
                </button>
              </div>
            )}
          </div>
        </div>

        {!menuOpen && (
          <ToolHoverPreview tool={tool} label={isFavorite ? '즐겨찾기' : '다운로드됨'} />
        )}
      </article>
      {versionNotesOpen && (
        <VersionNotesModal tool={tool} onClose={() => setVersionNotesOpen(false)} />
      )}
    </>
  );
}
