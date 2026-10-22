import { Check, Sparkles } from 'lucide-react';
import StoreToolIcon from './StoreToolIcon.jsx';

export const storePreviewTabs = ['시작 화면', '작업 설정', '결과 확인'];

export function StoreToolPreviewScreen({ tool, activeIndex }) {
  const tags = tool.storeTags?.slice(0, 3) ?? [tool.category];

  return (
    <div className="flex min-h-[250px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 sm:min-h-[330px]">
      <div className="hidden w-32 shrink-0 border-r border-slate-100 bg-slate-50/80 p-3 sm:block">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
          <StoreToolIcon tool={tool} small />
          <span className="truncate text-[10px] font-bold text-slate-800">{tool.name}</span>
        </div>
        <div className="mt-5 space-y-2">
          {storePreviewTabs.map((tab, index) => (
            <div
              key={tab}
              className={`rounded-md px-2 py-2 text-[10px] font-medium ${index === activeIndex ? 'bg-blue-100 text-blue-700' : 'text-slate-400'}`}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1 p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[10px] font-semibold text-blue-600">{tool.type}</p>
            <h3 className="mt-1 text-sm font-bold text-slate-900 sm:text-base">
              {storePreviewTabs[activeIndex]}
            </h3>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-600">
            {tool.storeCategory || tool.category}
          </span>
        </div>

        {activeIndex === 0 ? (
          <div className="grid gap-4 pt-6 sm:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-xl border border-slate-200 p-5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
                <Sparkles size={18} />
              </span>
              <p className="mt-4 text-sm font-semibold text-slate-900">{tool.name}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{tool.summary}</p>
              <div className="mt-6 h-8 w-28 rounded-lg bg-blue-600" />
            </div>
            <div className="space-y-3">
              {tags.map(tag => (
                <div key={tag} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="h-2 w-1/3 rounded bg-blue-200" />
                  <p className="mt-2 text-[11px] font-medium text-slate-700">{tag}</p>
                </div>
              ))}
            </div>
          </div>
        ) : activeIndex === 1 ? (
          <div className="pt-6">
            <p className="text-xs font-semibold text-slate-800">작업 정보 입력</p>
            <div className="mt-4 space-y-3">
              <div className="h-9 rounded-lg border border-slate-200 bg-slate-50" />
              <div className="h-9 rounded-lg border border-slate-200 bg-slate-50" />
              <div className="h-20 rounded-lg border border-slate-200 bg-slate-50" />
            </div>
            <div className="mt-4 h-8 w-24 rounded-lg bg-blue-600" />
          </div>
        ) : (
          <div className="pt-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <Check size={16} /> 작업 결과가 준비되었습니다
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="h-2 w-1/3 rounded bg-blue-200" />
              <div className="mt-5 h-2 w-full rounded bg-slate-200" />
              <div className="mt-3 h-2 w-11/12 rounded bg-slate-200" />
              <div className="mt-3 h-2 w-4/5 rounded bg-slate-200" />
              <div className="mt-6 flex gap-2">
                <div className="h-7 w-20 rounded-md bg-blue-600" />
                <div className="h-7 w-20 rounded-md border border-slate-200 bg-white" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
