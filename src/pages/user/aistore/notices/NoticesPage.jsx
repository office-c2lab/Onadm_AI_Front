import { useMemo, useState } from 'react';

import SearchHeader from '../../../../components/search/SearchHeader.jsx';
import { readOperationNotices } from '../../../../data/operationNotices.js';

function formatPublishedDate(value) {
  return value ? value.slice(0, 10).replaceAll('-', '.') : '—';
}

export default function NoticesPage() {
  const [keyword, setKeyword] = useState('');
  const [notices] = useState(readOperationNotices);
  const [currentTime] = useState(() => Date.now());
  const visibleNotices = useMemo(() => {
    return notices.filter(
      notice =>
        notice.status === '게시 중' &&
        new Date(notice.startAt).getTime() <= currentTime &&
        currentTime <= new Date(notice.endAt).getTime()
    );
  }, [currentTime, notices]);
  const filteredNotices = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return visibleNotices;

    return visibleNotices.filter(notice =>
      `${notice.title} ${notice.description}`.toLowerCase().includes(normalizedKeyword)
    );
  }, [keyword, visibleNotices]);

  return (
    <div className="w-full min-w-0 pb-16 text-slate-900">
      <SearchHeader
        value={keyword}
        onSearchChange={setKeyword}
        placeholder="공지사항 검색"
        ariaLabel="공지사항 검색"
      />

      <section className="mt-6">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">공지 목록</h2>
          <span className="text-sm font-medium text-slate-400">{filteredNotices.length}건</span>
        </div>

        <div className="divide-y divide-slate-100 border-y border-slate-200">
          {filteredNotices.map(notice => (
            <article
              key={notice.id}
              className="flex min-h-[92px] items-center px-2 py-5 transition-colors hover:bg-slate-50 sm:px-4"
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[15px] font-semibold text-slate-900">
                  {notice.title}
                </h3>
                <p className="mt-1.5 truncate text-sm text-slate-500">{notice.description}</p>
              </div>
              <time className="w-24 shrink-0 text-right text-sm text-slate-500">
                {formatPublishedDate(notice.startAt)}
              </time>
            </article>
          ))}

          {!filteredNotices.length ? (
            <div className="py-20 text-center">
              <p className="text-sm font-semibold text-slate-700">검색 결과가 없습니다.</p>
              <p className="mt-1 text-sm text-slate-400">다른 검색어를 입력해 보세요.</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
