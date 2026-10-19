import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomDropdown from '../../../../components/dropdown/CustomDropdown.jsx';
import SearchHeader from '../../../../components/search/SearchHeader.jsx';

import { useMyTools } from '../data/manageStore.js';

import { ManageToolCard, ToolDetailModal } from '../components/ManageToolCard/ManageToolCard.jsx';

const statuses = [
  '전체 상태',
  '승인 완료',
  '검사 대기',
  '검사 중',
  '검토 대기',
  '보완 필요',
  '반려',
];

export default function MyToolsPage() {
  const { myTools } = useMyTools();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('전체 상태');
  const [selected, setSelected] = useState(null);

  // 검색 및 상태 필터
  const rows = useMemo(() => {
    return myTools.filter(tool => {
      const matchesStatus = status === '전체 상태' || tool.status === status;

      const matchesSearch = `${tool.name} ${tool.summary}`
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [myTools, search, status]);

  // 상단 통계
  const summaries = [
    {
      label: '등록된 도구',
      value: myTools.length,
    },
    {
      label: '승인 완료',
      value: myTools.filter(tool => tool.status === '승인 완료').length,
    },
    {
      label: '검사 진행·대기',
      value: myTools.filter(tool => ['검사 중', '검사 대기'].includes(tool.status)).length,
    },
    {
      label: '검토·보완',
      value: myTools.filter(tool => ['검토 대기', '보완 필요', '반려'].includes(tool.status))
        .length,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-6 md:px-8">
      {/* 페이지 헤더 */}
  
      <SearchHeader
        title="내 도구"
        description="등록한 도구의 검사 결과와 승인 상태를 확인하고 관리해 보세요."
        value={search}
        onSearchChange={setSearch}
        placeholder="내 도구 검색"
        ariaLabel="내 도구 검색"
      />

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/user/aistore/register')}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={17} />새 도구 등록
        </button>
      </div>

      {/* 등록 완료 안내 */}
      {location.state?.registered && (
        <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          도구가 임시 등록되었습니다. 실제 보안검사와 관리자 승인은 API 연결 후 진행됩니다.
        </div>
      )}

      {/* 상태 요약 */}
      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summaries.map(item => (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs text-slate-500">{item.label}</p>

            <strong className="mt-3 block text-2xl font-semibold text-slate-900">
              {item.value}
              <small className="ml-1 text-xs font-normal text-slate-500">개</small>
            </strong>
          </div>
        ))}
      </div>

      {/* 도구 목록 */}
      <section className="mt-7">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">등록된 도구</h2>

          <p className="mt-1 text-sm text-slate-500">본인이 등록한 도구와 진행 상태입니다.</p>

          {/* 상태 필터 */}
          <div className="mt-5 flex justify-end">
            <CustomDropdown
              value={status}
              onChange={setStatus}
              options={statuses}
              ariaLabel="진행 상태 필터"
              className="w-40"
            />
          </div>
        </div>

        {rows.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map(tool => (
              <ManageToolCard key={tool.id} tool={tool} onDetail={setSelected} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white p-14 text-center text-sm text-slate-500">
            조건에 맞는 도구가 없습니다.
          </div>
        )}

        <p className="mt-4 text-right text-xs text-slate-500">총 {rows.length}개 표시</p>
      </section>

      {/* 상세 모달 */}
      <ToolDetailModal tool={selected} mine onClose={() => setSelected(null)} />
    </main>
  );
}
