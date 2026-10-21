import { useMemo, useState } from 'react';
import { GripVertical, Megaphone, Star } from 'lucide-react';
import { SearchField, StatusBadge, ToolAvatar, cardClass } from '../components.jsx';
import { catalogItems } from '../data.js';

const collections = [
  {
    name: '이번 주 추천',
    description: '업무에 바로 활용할 수 있는 추천 도구',
    count: 4,
    active: true,
  },
  { name: '문서 업무 자동화', description: '작성, 요약, 번역을 돕는 도구', count: 7, active: true },
  { name: '신규 등록 도구', description: '최근 승인된 앱과 에이전트', count: 5, active: true },
];

export default function CatalogPage() {
  const [tab, setTab] = useState('게시 관리');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState(catalogItems);
  const [notice, setNotice] = useState('');
  const rows = useMemo(
    () => items.filter(item => item.name.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  );

  const togglePublish = id => {
    setItems(current =>
      current.map(item =>
        item.id === id
          ? { ...item, publication: item.publication === '게시 중' ? '숨김' : '게시 중' }
          : item
      )
    );
    setNotice('스토어 노출 상태를 변경했습니다.');
  };

  return (
    <div className="space-y-5">
      {notice ? (
        <div
          role="status"
          className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {notice}
        </div>
      ) : null}
      {tab === '게시 관리' ? (
        <div className="sticky top-0 z-20 -mx-4 bg-[#f9f9f9]/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
          <div className="mx-auto flex max-w-xl items-center">
            <SearchField value={query} onChange={setQuery} placeholder="게시 가능한 앱 검색" />
          </div>
        </div>
      ) : null}
      <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {['게시 관리', '추천·컬렉션', '카테고리·태그'].map(item => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors ${tab === item ? 'bg-[#ededed] font-medium text-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === '게시 관리' ? (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-slate-900">승인된 도구</h2>
            <span className="text-xs text-slate-400">{rows.length}개</span>
          </div>
          <div className="grid gap-2">
            {rows.map(item => (
              <div
                key={item.id}
                className="group flex min-h-[82px] flex-col gap-4 rounded-xl border border-transparent px-3 py-3 transition hover:border-slate-100 hover:bg-white hover:shadow-sm sm:flex-row sm:items-center"
              >
                <ToolAvatar type={item.type} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <StatusBadge>{item.publication}</StatusBadge>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">{item.summary}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {item.category} · {item.visibility} 공개 · v{item.version}
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-3">
                  <span className="text-xs font-medium text-slate-500">스토어 노출</span>
                  <input
                    className="peer sr-only"
                    type="checkbox"
                    checked={item.publication === '게시 중'}
                    onChange={() => togglePublish(item.id)}
                  />
                  <span className="relative h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-blue-600 after:absolute after:top-1 after:left-1 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
                </label>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {tab === '추천·컬렉션' ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {collections.map((item, index) => (
            <article
              key={item.name}
              className={`${cardClass} p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`grid size-10 place-items-center rounded-xl ${index === 0 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}
                >
                  {index === 0 ? <Star size={18} /> : <Megaphone size={18} />}
                </span>
                <button className="text-slate-300">
                  <GripVertical size={18} />
                </button>
              </div>
              <h2 className="mt-5 font-bold text-slate-900">{item.name}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-400">도구 {item.count}개</span>
                <StatusBadge>{item.active ? '게시 중' : '숨김'}</StatusBadge>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {tab === '카테고리·태그' ? (
        <section className={`${cardClass} overflow-hidden`}>
          <div className="grid divide-y divide-slate-100">
            {[
              ['문서·생산성', 12, '문서 작성, 회의·요약, 번역'],
              ['업무 자동화', 8, '워크플로, 파일·정산, 사내 업무'],
              ['데이터·분석', 7, '데이터 분석, 시각화, 리포트'],
              ['개발·IT', 6, '코드 리뷰, 개발 도구, 운영'],
              ['고객·지원', 5, '고객 지원, 문의 분류, 상담'],
            ].map(([name, count, tags]) => (
              <div key={name} className="flex items-center gap-4 px-5 py-4">
                <GripVertical size={17} className="text-slate-300" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">{name}</p>
                  <p className="mt-1 truncate text-xs text-slate-400">{tags}</p>
                </div>
                <span className="text-xs text-slate-500">{count}개</span>
                <button className="text-xs font-semibold text-blue-600">편집</button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
