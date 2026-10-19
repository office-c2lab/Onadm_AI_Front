import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { publishedTools, useDownloads } from '../../data/manageStore.js';
import { ToolDetailModal } from '../../components/ManageToolCard/ManageToolCard.jsx';
import LibraryToolRow from '../components/LibraryToolRow.jsx';

export default function DownloadsPage() {
  const navigate = useNavigate();
  const { keyword } = useOutletContext();
  const { downloads, removeDownload } = useDownloads();
  const [selected, setSelected] = useState(null);

  const downloadedTools = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return publishedTools.filter(tool => {
      return (
        downloads.includes(tool.id) &&
        `${tool.name} ${tool.summary} ${tool.maker}`.toLowerCase().includes(query)
      );
    });
  }, [downloads, keyword]);

  return (
    <>
      <section className="mt-7">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">다운로드한 도구</h2>

        {downloadedTools.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-2">
            {downloadedTools.map(tool => (
              <LibraryToolRow
                key={tool.id}
                tool={tool}
                mode="downloads"
                onDetail={setSelected}
                onRemove={removeDownload}
              />
            ))}
          </div>
        ) : (
          <div className="px-4 py-16 text-center">
            <Download className="mx-auto text-slate-300" size={30} />
            <p className="mt-4 font-medium text-slate-900">
              {downloads.length ? '검색 결과가 없습니다.' : '다운로드한 도구가 없습니다.'}
            </p>
            <p className="mt-2 text-sm text-slate-500">스토어에서 도구를 둘러보세요.</p>
            <button
              type="button"
              onClick={() => navigate('/user/aistore/store')}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              도구 둘러보기
            </button>
          </div>
        )}
      </section>

      <ToolDetailModal tool={selected} onClose={() => setSelected(null)} />
    </>
  );
}
