import React from 'react';

import { Bookmark, Bot, Boxes, FileText, Workflow, X } from 'lucide-react';

const statusStyle = {
  '승인 완료': 'bg-emerald-50 text-emerald-700',
  '검사 중': 'bg-blue-50 text-blue-700',
  '검사 대기': 'bg-slate-100 text-slate-700',
  '검토 대기': 'bg-amber-50 text-amber-700',
  '보완 필요': 'bg-red-50 text-red-600',
  반려: 'bg-red-50 text-red-600',
};

function ToolGlyph({ type }) {
  if (type === '자동화 도구') {
    return <Workflow size={22} strokeWidth={1.7} />;
  }

  if (type === 'AI Agent') {
    return <Bot size={22} strokeWidth={1.7} />;
  }

  if (type === '일반 업무 도구') {
    return <Boxes size={22} strokeWidth={1.7} />;
  }

  return <FileText size={22} strokeWidth={1.7} />;
}

export function ToolAvatar({ type }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#2463D3]">
      <ToolGlyph type={type} />
    </div>
  );
}

export function ToolCard({ tool, favorite, onToggleFavorite, onDetail }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <ToolAvatar type={tool.type} />

        <button
          type="button"
          onClick={() => onToggleFavorite(tool.id)}
          title={favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          aria-label={`${tool.name} 즐겨찾기 ${favorite ? '해제' : '추가'}`}
          className={`rounded-lg p-2 ${
            favorite ? 'text-blue-600' : 'text-slate-400 hover:bg-slate-100'
          }`}
        >
          <Bookmark size={19} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <h3 className="mt-4 text-[15px] font-semibold text-slate-900">{tool.name}</h3>

      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{tool.summary}</p>

      <div className="mt-4 flex flex-wrap gap-1.5 text-xs text-slate-600">
        <span className="rounded-md bg-slate-100 px-2 py-1">{tool.category}</span>

        <span className="rounded-md bg-slate-100 px-2 py-1">{tool.type}</span>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
        <span className="text-slate-500">{tool.maker}</span>

        <button
          type="button"
          onClick={() => onDetail(tool)}
          className="font-medium text-blue-600 hover:underline"
        >
          자세히 보기 →
        </button>
      </div>
    </article>
  );
}

export function ManageToolCard({ tool, onDetail }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5">
      <div className="flex items-start justify-between gap-3">
        <ToolAvatar type={tool.type} />
        <span
          className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${
            statusStyle[tool.status] || 'bg-slate-100 text-slate-600'
          }`}
        >
          {tool.status}
        </span>
      </div>

      <h3 className="mt-4 text-[15px] font-semibold text-slate-900">{tool.name}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{tool.summary}</p>

      <div className="mt-4 flex flex-wrap gap-1.5 text-xs text-slate-600">
        <span className="rounded-md bg-slate-100 px-2 py-1">{tool.category}</span>
        <span className="rounded-md bg-slate-100 px-2 py-1">{tool.type}</span>
      </div>

      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span>v{tool.version}</span>
          <span>최근 수정 {tool.updatedAt}</span>
        </div>

        <button
          type="button"
          onClick={() => onDetail(tool)}
          className="mt-4 flex w-full items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:border-blue-200 hover:bg-blue-50"
        >
          상세 보기
        </button>
      </div>
    </article>
  );
}

export function ToolDetailModal({ tool, onClose, mine = false }) {
  if (!tool) return null;

  const details = [
    ['제작자', tool.maker || '나'],
    ['버전', `v${tool.version}`],
    ...(mine ? [['진행 상태', tool.status]] : []),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${tool.name} 상세 정보`}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between">
          <span className="text-xs font-medium text-blue-600">
            {mine ? '내 도구' : '도구 상세 정보'}
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <ToolAvatar type={tool.type} />

          <div>
            <h2 className="text-xl font-semibold text-slate-900">{tool.name}</h2>

            <p className="mt-1 text-xs text-slate-500">
              {tool.type} · {tool.category}
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-slate-600">{tool.description || tool.summary}</p>

        <dl className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200 px-4 text-sm">
          {details.map(([key, value]) => (
            <div key={key} className="flex justify-between gap-4 py-3">
              <dt className="text-slate-500">{key}</dt>

              <dd className="font-medium text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 rounded-lg bg-slate-50 p-4 text-xs leading-6 text-slate-600">
          {mine
            ? tool.review
            : '현재는 프론트엔드 시안입니다. 실제 도구 실행은 배포 URL 연동 이후 제공됩니다.'}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-5 py-2 text-sm hover:bg-slate-50"
          >
            닫기
          </button>
        </div>
      </section>
    </div>
  );
}
