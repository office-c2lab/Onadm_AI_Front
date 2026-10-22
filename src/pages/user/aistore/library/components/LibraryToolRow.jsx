import { useState } from 'react';
import { Download, ExternalLink, MoreVertical, RefreshCw } from 'lucide-react';
import StoreToolIcon from '../../../../../components/tools/StoreToolIcon.jsx';
import ToolHoverPreview from '../../components/ToolHoverPreview.jsx';

export default function LibraryToolRow({
  tool,
  mode,
  downloaded = false,
  updateAvailable = false,
  onDetail,
  onDownload,
  onUpdate,
  onOpen,
  onRemove,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isFavorite = mode === 'favorites';
  const removeLabel = isFavorite ? '즐겨찾기 해제' : '다운로드 목록에서 제거';
  const category = tool.storeCategory || tool.category;

  return (
    <article
      className={`group relative flex min-h-[82px] min-w-0 flex-wrap items-center gap-4 rounded-xl border border-transparent px-3 py-3 transition hover:z-20 hover:border-slate-100 hover:bg-white hover:shadow-sm focus-within:z-20 ${menuOpen ? 'z-30 border-slate-100 bg-white shadow-sm' : ''}`}
    >
      <button
        type="button"
        onClick={() => onDetail(tool)}
        className="flex min-w-[180px] flex-1 items-center gap-4 text-left"
        aria-label={`${tool.name} 상세 보기`}
      >
        <StoreToolIcon tool={tool} small />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-semibold text-slate-900">{tool.name}</span>
          <span className="mt-1 block truncate text-sm text-slate-500">{category}</span>
        </span>
      </button>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        {isFavorite ? (
          <button
            type="button"
            onClick={() => onDownload(tool.id)}
            disabled={downloaded}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100 disabled:cursor-default disabled:bg-slate-100 disabled:text-slate-500"
            aria-label={`${tool.name} ${downloaded ? '다운로드됨' : '다운로드'}`}
          >
            <Download size={15} aria-hidden="true" />
            {downloaded ? '다운로드됨' : '다운로드'}
          </button>
        ) : updateAvailable ? (
          <button
            type="button"
            onClick={() => onUpdate(tool)}
            className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg px-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
            aria-label={`${tool.name} 업데이트`}
          >
            <RefreshCw size={14} aria-hidden="true" />
            업데이트
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onOpen(tool)}
            className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg bg-blue-50 px-2.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
            aria-label={`${tool.name} 열기`}
          >
            열기
            <ExternalLink size={13} aria-hidden="true" />
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
            <div className="absolute right-0 top-full z-30 mt-1 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
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
                onClick={() => onRemove(tool.id)}
                className="w-full rounded-md px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
              >
                {removeLabel}
              </button>
            </div>
          )}
        </div>
      </div>

      {!menuOpen && <ToolHoverPreview tool={tool} label={isFavorite ? '즐겨찾기' : '다운로드됨'} />}
    </article>
  );
}
