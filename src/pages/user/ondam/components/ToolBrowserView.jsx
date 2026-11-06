import { Check, ChevronRight, Plus, Search, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import StoreToolIcon from '../../aistore/components/StoreToolIcon.jsx';
import {
  getAvailablePublishedTools,
  getToolDownloadCount,
  useDownloads,
} from '../../aistore/data/manageStore.js';

function ToolRow({ tool, connected, onConnect, onOpen }) {
  return (
    <div className="group flex min-w-0 items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-[#f5f5f5]">
      <button
        type="button"
        onClick={() => onOpen(tool)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <StoreToolIcon tool={tool} />
        <span className="min-w-0 flex-1">
          <strong className="block truncate text-[14px] font-medium text-[#202020]">
            {tool.name}
          </strong>
          <span className="mt-0.5 block truncate text-[12px] text-[#777]">{tool.summary}</span>
        </span>
      </button>

      <button
        type="button"
        disabled={connected}
        onClick={() => onConnect(tool.id)}
        className={`ondam-plugin-connect-button grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors ${
          connected ? 'text-[#3c7cf6]' : 'text-[#333] hover:bg-[#ececec] hover:text-[#2f6fe8]'
        }`}
        aria-label={connected ? `${tool.name} 연결됨` : `${tool.name} 연결`}
        title={connected ? '연결됨' : '연결'}
      >
        {connected ? (
          <Check className="h-[18px] w-[18px]" strokeWidth={2} />
        ) : (
          <Plus className="h-[18px] w-[18px]" strokeWidth={1.8} />
        )}
      </button>
    </div>
  );
}

function ToolSection({ title, tools, downloads, onConnect, onOpen }) {
  if (!tools.length) return null;

  return (
    <section className="mt-10" aria-labelledby={`plugin-section-${title}`}>
      <h2
        id={`plugin-section-${title}`}
        className="mb-3 flex items-center gap-1 text-[17px] font-medium text-[#171717]"
      >
        {title}
        <ChevronRight className="h-4 w-4 text-[#777]" strokeWidth={1.8} aria-hidden="true" />
      </h2>
      <div className="grid gap-x-10 gap-y-1 md:grid-cols-2">
        {tools.map(tool => (
          <ToolRow
            key={tool.id}
            tool={tool}
            connected={downloads.includes(tool.id)}
            onConnect={onConnect}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
}

export default function ToolBrowserView() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { downloads, addDownload } = useDownloads();
  const tools = useMemo(() => getAvailablePublishedTools(), []);
  const normalizedQuery = query.trim().toLocaleLowerCase('ko-KR');
  const filteredTools = useMemo(() => {
    if (!normalizedQuery) return tools;

    return tools.filter(tool =>
      [tool.name, tool.summary, tool.type, tool.category, ...(tool.storeTags ?? [])]
        .join(' ')
        .toLocaleLowerCase('ko-KR')
        .includes(normalizedQuery)
    );
  }, [normalizedQuery, tools]);
  const connectedTools = filteredTools.filter(tool => downloads.includes(tool.id));
  const availableTools = filteredTools.filter(tool => !downloads.includes(tool.id));
  const popularTools = [...availableTools]
    .sort((first, second) => getToolDownloadCount(second) - getToolDownloadCount(first))
    .slice(0, 6);
  const recommendedTools = availableTools
    .filter(tool => !popularTools.some(popularTool => popularTool.id === tool.id))
    .slice(0, 6);
  const openTool = tool => navigate(`/user/aistore/store/${tool.id}`);

  return (
    <section className="min-h-full bg-white px-5 py-10 sm:px-8" aria-label="플러그인 탐색">
      <div className="mx-auto w-full max-w-[980px]">
        <header>
          <h1 className="text-[27px] font-semibold tracking-[-0.025em] text-[#0d0d0d]">플러그인</h1>
          <p className="mt-1.5 text-[14px] text-[#666]">
            필요한 플러그인을 연결해 ONDAM AI에서 바로 활용하세요.
          </p>
        </header>

        <label className="mt-7 flex h-11 items-center gap-2.5 rounded-full border border-[#dedede] bg-white px-4 focus-within:border-[#9db9f4] focus-within:ring-2 focus-within:ring-[#eaf1ff]">
          <Search className="h-4 w-4 shrink-0 text-[#777]" strokeWidth={1.8} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="플러그인 검색"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-[#222] outline-none placeholder:text-[#999]"
            aria-label="플러그인 검색"
          />
        </label>

        {connectedTools.length > 0 && (
          <section className="mt-8" aria-labelledby="connected-tools-title">
            <h2
              id="connected-tools-title"
              className="mb-3 flex items-center gap-1 text-[17px] font-medium text-[#171717]"
            >
              연결됨
              <ChevronRight className="h-4 w-4 text-[#777]" strokeWidth={1.8} aria-hidden="true" />
            </h2>
            <div className="flex flex-wrap gap-2">
              {connectedTools.map(tool => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => openTool(tool)}
                  className="group relative rounded-xl p-1.5 transition-colors hover:bg-[#f3f3f3] focus-visible:bg-[#f3f3f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9db9f4]"
                  aria-label={tool.name}
                  aria-describedby={`connected-plugin-${tool.id}-tooltip`}
                >
                  <StoreToolIcon tool={tool} />
                  <span
                    id={`connected-plugin-${tool.id}-tooltip`}
                    role="tooltip"
                    className="ondam-connected-plugin-tooltip pointer-events-none absolute top-[calc(100%+0.5rem)] left-1/2 z-50 -translate-x-1/2 rounded-lg border border-[#B6D9FF] bg-white px-2.5 py-1.5 text-[12px] font-bold whitespace-nowrap text-[#075DF6] opacity-0 shadow-[0_10px_24px_rgba(7,93,246,0.14)] transition group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    {tool.name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <ToolSection
          title="인기 플러그인"
          tools={popularTools}
          downloads={downloads}
          onConnect={addDownload}
          onOpen={openTool}
        />
        <ToolSection
          title="새롭게 주목할 플러그인"
          tools={recommendedTools}
          downloads={downloads}
          onConnect={addDownload}
          onOpen={openTool}
        />

        {filteredTools.length === 0 && (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f3f5f8] text-[#677080]">
              <Wrench className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <p className="mt-4 text-[14px] font-medium text-[#333]">
              일치하는 플러그인이 없습니다.
            </p>
            <p className="mt-1 text-[13px] text-[#888]">다른 검색어를 입력해 보세요.</p>
          </div>
        )}
      </div>
    </section>
  );
}
