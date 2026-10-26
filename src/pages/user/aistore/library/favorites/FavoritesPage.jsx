import { useMemo } from 'react';
import { Bookmark } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getAvailablePublishedTools } from '../../data/manageStore.js';
import LibraryToolRow from '../components/LibraryToolRow.jsx';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { keyword, favorites, toggleFavorite, downloads, addDownload } = useOutletContext();
  const openDetail = tool => navigate(`/user/aistore/store/${tool.id}`);

  const savedTools = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return getAvailablePublishedTools().filter(tool => {
      return (
        favorites.includes(tool.id) &&
        `${tool.name} ${tool.summary} ${tool.maker} ${tool.makerPosition ?? ''} ${tool.makerName ?? ''}`
          .toLowerCase()
          .includes(query)
      );
    });
  }, [favorites, keyword]);

  return (
    <>
      <section className="pt-3">
        {savedTools.length > 0 ? (
          <div className="grid gap-x-5 md:grid-cols-2">
            {savedTools.map(tool => (
              <LibraryToolRow
                key={tool.id}
                tool={tool}
                mode="favorites"
                downloaded={downloads.includes(tool.id)}
                onDetail={openDetail}
                onDownload={addDownload}
                onRemove={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="px-4 py-16 text-center">
            <Bookmark className="mx-auto text-slate-300" size={30} />
            <p className="mt-4 font-medium text-slate-900">
              {favorites.length ? '검색 결과가 없습니다.' : '저장한 도구가 없습니다.'}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              스토어에서 마음에 드는 도구를 저장해 보세요.
            </p>
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
