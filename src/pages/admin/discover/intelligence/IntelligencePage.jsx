import { useMemo, useState } from 'react';
import { ChevronRight, Globe2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchHeader from '../../../../components/search/SearchHeader.jsx';
import { loadIntelligenceServices } from './intelligenceStore.js';

// Shared mock records let detail routes recover after a direct visit or refresh.
// eslint-disable-next-line react-refresh/only-export-components
export const services = [
  {
    id: 'intel-001',
    domain: 'writerflow.ai',
    url: 'https://writerflow.ai/',
    ips: ['203.0.113.24', '2001:db8::24'],
    ai: 'AI 서비스',
    type: '생성형 AI',
    status: '차단',
    risk: '높음',
    confidence: 92,
    lastAnalyzed: '2026. 10. 20. 11:21',
    summary: 'AI 기반 문서 작성과 콘텐츠 생성을 제공하는 외부 서비스입니다.',
    risks: [
      '입력 데이터 외부 전송',
      '생성 결과의 저작권 검토 필요',
      '계정별 데이터 보관 정책 확인 필요',
    ],
  },
  {
    id: 'intel-002',
    domain: 'claude.ai',
    url: 'https://claude.ai/',
    ips: ['198.51.100.42', '198.51.100.43'],
    ai: 'AI 서비스',
    type: '생성형 AI',
    status: '허용',
    risk: '보통',
    confidence: 99,
    lastAnalyzed: '2026. 10. 20. 10:48',
    summary: '대화형 텍스트 생성과 문서 분석 기능을 제공하는 AI 서비스입니다.',
    risks: ['민감정보 입력 주의', '외부 파일 업로드 정책 확인'],
  },
  {
    id: 'intel-003',
    domain: 'newai.example',
    url: 'https://newai.example/',
    ips: [],
    ai: '판단 불가',
    type: '—',
    status: '검토 필요',
    risk: '미확인',
    confidence: null,
    lastAnalyzed: '2026. 10. 20. 10:35',
    summary: '공개 정보와 접속 결과가 충분하지 않아 추가 검토가 필요한 서비스입니다.',
    risks: ['웹사이트 접속 실패', '서비스 운영 주체 확인 필요'],
  },
  {
    id: 'intel-004',
    domain: 'perplexity.ai',
    url: 'https://perplexity.ai/',
    ips: ['198.51.100.57', '2001:db8::57'],
    ai: 'AI 서비스',
    type: 'AI 검색',
    status: '허용',
    risk: '보통',
    confidence: 98,
    lastAnalyzed: '2026. 10. 20. 09:43',
    summary: '웹 검색 결과를 기반으로 답변과 출처를 제공하는 AI 검색 서비스입니다.',
    risks: ['검색 질의 외부 전송', '답변 출처 검증 필요'],
  },
  {
    id: 'intel-006',
    domain: 'midjourney.com',
    url: 'https://midjourney.com/',
    ips: ['192.0.2.81'],
    ai: 'AI 서비스',
    type: '이미지 생성',
    status: '결정 대기',
    risk: '미확인',
    confidence: 99,
    lastAnalyzed: '2026. 10. 19. 16:03',
    summary: '텍스트 프롬프트를 기반으로 이미지를 생성하는 AI 서비스입니다.',
    risks: ['생성 이미지 저작권 정책 검토', '프롬프트 외부 전송 여부 확인'],
  },
  {
    id: 'intel-005',
    domain: 'portal.example',
    url: 'https://portal.example/',
    ips: ['192.0.2.18'],
    ai: '비AI 서비스',
    type: '일반 웹사이트',
    status: '허용',
    risk: '낮음',
    confidence: 96,
    lastAnalyzed: '2026. 10. 19. 17:12',
    summary: '일반적인 정보 조회 기능을 제공하며 핵심 AI 기능은 확인되지 않았습니다.',
    risks: ['일반 외부 웹사이트 접근 정책 적용'],
  },
];

const tabs = ['전체', '결정 대기', '허용', '차단'];

function ServiceStatus({ status }) {
  const color =
    status === '허용' ? 'text-emerald-600' : status === '차단' ? 'text-red-600' : 'text-amber-600';
  return <span className={`text-sm font-semibold whitespace-nowrap ${color}`}>{status}</span>;
}

function ServiceCard({ service, onOpen }) {
  return (
    <article className="group relative min-w-0 rounded-xl border border-transparent transition hover:z-20 hover:border-slate-100 hover:bg-[#f5f5f5] hover:shadow-sm focus-within:z-20">
      <button
        type="button"
        onClick={() => onOpen(service)}
        className="flex min-h-[82px] w-full cursor-pointer items-center gap-4 rounded-xl px-3 py-3 text-left"
        aria-label={`${service.domain} Intelligence 상세 보기`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
            {service.status === '결정 대기' ? (
              <ShieldAlert size={23} strokeWidth={1.8} />
            ) : (
              <Globe2 size={23} strokeWidth={1.8} />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 items-center gap-2">
              <strong className="min-w-0 truncate text-base font-semibold text-slate-900">
                {service.domain}
              </strong>
            </span>
            <span className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
              <span className="truncate">{service.url}</span>
              <span className="shrink-0 text-slate-300">·</span>
              <span className="shrink-0">{service.type}</span>
            </span>
          </span>
        </span>
        <span className="mr-4 hidden w-44 shrink-0 text-right text-sm text-slate-500 md:inline">
          <span className="sr-only">DB 등록일 </span>
          {service.registeredAt ?? service.lastAnalyzed}
        </span>
        <span className="flex w-28 shrink-0 items-center justify-end gap-3">
          <ServiceStatus status={service.status} />
          <ChevronRight size={19} className="shrink-0 text-slate-500" />
        </span>
      </button>
    </article>
  );
}

export default function IntelligencePage() {
  const navigate = useNavigate();
  const [allServices] = useState(() => loadIntelligenceServices(services));
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('전체');
  const keyword = search.trim().toLowerCase();
  const tabCounts = Object.fromEntries(
    tabs.map(tab => [
      tab,
      tab === '전체'
        ? allServices.length
        : allServices.filter(service => service.status === tab).length,
    ])
  );
  const visibleServices = useMemo(
    () =>
      allServices.filter(
        service =>
          (activeTab === '전체' || service.status === activeTab) &&
          `${service.domain} ${service.url} ${service.ai} ${service.type} ${service.status}`
            .toLowerCase()
            .includes(keyword)
      ),
    [activeTab, allServices, keyword]
  );

  return (
    <div className="w-full">
      <SearchHeader
        value={search}
        onSearchChange={setSearch}
        placeholder="도메인, URL, 서비스 유형 또는 상태 검색"
        ariaLabel="Intelligence DB 검색"
      />
      <nav className="mt-5 flex flex-wrap items-center gap-1" aria-label="Intelligence DB 상태">
        {tabs.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            aria-pressed={activeTab === tab}
            className={`inline-flex h-8 items-center rounded-full px-4 text-sm transition-colors ${activeTab === tab ? 'bg-[#ededed] font-medium text-[#333]' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
          >
            {tab}
            <span className="ml-1.5 text-xs tabular-nums text-slate-400">{tabCounts[tab]}</span>
          </button>
        ))}
      </nav>
      <section className="mt-5" aria-label="Intelligence 서비스 목록">
        {visibleServices.length ? (
          <div className="grid gap-2">
            {visibleServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onOpen={item =>
                  navigate(`/admin/discover/intelligence/${item.id}`, { state: { service: item } })
                }
              />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-slate-500">조건에 맞는 서비스가 없습니다.</p>
        )}
      </section>
    </div>
  );
}
