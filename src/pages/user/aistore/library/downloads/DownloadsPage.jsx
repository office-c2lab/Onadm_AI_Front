import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { publishedTools, useDownloads } from '../../data/manageStore.js';
import LibraryToolRow from '../components/LibraryToolRow.jsx';

export default function DownloadsPage() {
  const navigate = useNavigate();
  const { keyword } = useOutletContext();
  const { downloads, installedVersions, removeDownload, updateDownload } = useDownloads();
  const [actionMessage, setActionMessage] = useState('');
  const openDetail = tool => navigate(`/user/aistore/store/${tool.id}`);

  const openTool = tool => {
    if (tool.launchUrl) {
      window.open(tool.launchUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    setActionMessage(`${tool.name}의 실행 주소가 아직 연결되지 않았습니다.`);
  };

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
        {actionMessage && (
          <p role="status" className="mb-3 rounded-lg bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
            {actionMessage}
          </p>
        )}

        {downloadedTools.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-2">
            {downloadedTools.map(tool => (
              <LibraryToolRow
                key={tool.id}
                tool={tool}
                mode="downloads"
                updateAvailable={Boolean(
                  installedVersions[tool.id] && installedVersions[tool.id] !== tool.version
                )}
                onDetail={openDetail}
                onUpdate={tool => {
                  updateDownload(tool);
                  setActionMessage(
                    `${tool.name}의 버전 상태를 최신으로 표시했습니다. 실제 업데이트는 아직 연결되지 않았습니다.`
                  );
                }}
                onOpen={openTool}
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
    </>
  );
}
