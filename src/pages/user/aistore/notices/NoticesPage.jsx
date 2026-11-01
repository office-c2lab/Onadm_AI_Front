import { useMemo, useState } from 'react';

import SearchHeader from '../../../../components/search/SearchHeader.jsx';
import { readOperationNotices } from '../../../../data/operationNotices.js';

const CATEGORY_TONE = {
  긴급: 'border-red-600 bg-red-600 text-white',
  '시스템 업데이트': 'border-blue-600 bg-blue-600 text-white',
  '점검 안내': 'border-amber-500 bg-amber-500 text-white',
  '운영 안내': 'border-slate-600 bg-slate-600 text-white',
};

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
      `${notice.category} ${notice.title} ${notice.description}`
        .toLowerCase()
        .includes(normalizedKeyword)
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
                <div className="flex min-w-0 items-center gap-2.5">
                  <h3 className="truncate text-[15px] font-semibold text-slate-900">
                    {notice.title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium ${CATEGORY_TONE[notice.category] ?? CATEGORY_TONE['운영 안내']}`}
                  >
                    {notice.category}
                  </span>
                </div>
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
