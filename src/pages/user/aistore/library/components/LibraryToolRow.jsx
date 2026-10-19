import { useState } from 'react';
import { Bookmark, Download, MoreVertical } from 'lucide-react';
import StoreToolIcon from '../../components/StoreToolIcon.jsx';

export default function LibraryToolRow({ tool, mode, onDetail, onRemove }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isFavorite = mode === 'favorites';
  const ActionIcon = isFavorite ? Bookmark : Download;
  const removeLabel = isFavorite ? '즐겨찾기 해제' : '다운로드 목록에서 제거';
  const typeLabel = tool.type === '자동화 도구' ? '자동화' : tool.type;
  const typeClassName =
    tool.type === '자동화 도구' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600';

  return (
    <article
      className={`relative flex min-h-[108px] min-w-0 items-center gap-4 rounded-xl border border-transparent px-3 py-3 transition hover:border-slate-100 hover:bg-white hover:shadow-sm ${menuOpen ? 'z-20 border-slate-100 bg-white shadow-sm' : ''}`}
    >
      <button
        type="button"
        onClick={() => onDetail(tool)}
        className="flex min-w-0 flex-1 items-center gap-4 text-left"
        aria-label={`${tool.name} 상세 보기`}
      >
        <StoreToolIcon tool={tool} small />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-semibold text-slate-900">{tool.name}</span>
          <span className="mt-0.5 line-clamp-2 text-xs leading-4 text-slate-500">
            {tool.summary}
          </span>
          <span className="mt-1.5 flex flex-wrap gap-1 text-[11px] font-medium">
            <span className={`rounded-full px-2 py-0.5 ${typeClassName}`}>{typeLabel}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
              {tool.storeCategory || tool.category}
            </span>
          </span>
        </span>
      </button>

      <div className="ml-1 flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => onRemove(tool.id)}
          className="grid h-8 w-8 place-items-center rounded-lg text-blue-500 transition-colors hover:bg-blue-50"
          aria-label={`${tool.name} ${removeLabel}`}
          title={removeLabel}
        >
          <ActionIcon size={18} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
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
    </article>
  );
}
