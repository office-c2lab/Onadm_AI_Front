import { useNavigate } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  FileArchive,
  FileCheck2,
  LayoutGrid,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  UploadCloud,
} from 'lucide-react';
import AiStoreActionButton from '../components/AiStoreActionButton.jsx';

const ROUTES = {
  store: '/user/aistore/store',
  library: '/user/aistore/library/downloads',
  myTools: '/user/aistore/mytools',
  register: '/user/aistore/register',
  newTool: '/user/aistore/register/new',
};

const SECTIONS = [
  { id: 'start', label: '빠른 시작' },
  { id: 'use', label: '도구 사용하기' },
  { id: 'publish', label: '등록 및 심사' },
  { id: 'manage', label: '운영·업데이트' },
  { id: 'faq', label: '자주 묻는 질문' },
];

const QUICK_START = [
  {
    title: '필요한 도구 찾기',
    description: '카테고리와 검색을 이용해 업무에 맞는 도구를 찾아보세요.',
    action: '스토어 둘러보기',
    icon: Store,
    route: ROUTES.store,
    tone: 'bg-blue-50 text-blue-600',
  },
  {
    title: '다운로드 관리하기',
    description: '받아 둔 도구와 즐겨찾기를 라이브러리에서 관리하세요.',
    action: '라이브러리 열기',
    icon: Bookmark,
    route: ROUTES.library,
    tone: 'bg-violet-50 text-violet-600',
  },
  {
    title: '직접 만든 도구 공유하기',
    description: 'ZIP 파일과 도구 정보를 등록하고 사내 배포를 요청하세요.',
    action: '새 도구 등록',
    icon: UploadCloud,
    route: ROUTES.newTool,
    tone: 'bg-emerald-50 text-emerald-600',
  },
];

const USE_FLOW = [
  {
    icon: Search,
    title: '찾기',
    description: '검색하거나 카테고리를 선택해 필요한 도구를 찾습니다.',
  },
  {
    icon: FileCheck2,
    title: '확인하기',
    description: '기능, 사용 방법, 지원 환경과 최신 업데이트 내용을 확인합니다.',
  },
  {
    icon: ArrowDownToLine,
    title: '다운로드',
    description: '도구를 다운로드하면 라이브러리에 자동으로 추가됩니다.',
  },
  {
    icon: RefreshCw,
    title: '최신 상태 유지',
    description: '새 버전이 나오면 라이브러리에서 바로 업데이트할 수 있습니다.',
  },
];

const PUBLISH_FLOW = [
  {
    step: '01',
    title: 'ZIP 파일 준비',
    description: '배포할 도구를 하나의 ZIP 파일로 준비합니다. ZIP 파일은 필수입니다.',
  },
  {
    step: '02',
    title: '상세 정보 작성',
    description: '설명, 주요 기능, 사용 방법, 지원 환경과 버전을 입력합니다.',
  },
  {
    step: '03',
    title: '검사 및 관리자 심사',
    description: '파일 검사가 끝나면 관리자가 운영 적합성과 데이터 접근 범위를 검토합니다.',
  },
  {
    step: '04',
    title: '승인 후 운영',
    description: '승인된 도구는 내 도구에 게시되며 사내 사용자에게 제공됩니다.',
  },
];

const STATUSES = [
  {
    name: '검사 대기',
    description: '요청이 접수되어 자동 검사를 기다리고 있습니다.',
    color: 'bg-slate-100 text-slate-600',
  },
  {
    name: '심사 진행중',
    description: '자동 검사 또는 관리자 검토가 진행 중입니다.',
    color: 'bg-blue-50 text-blue-700',
  },
  {
    name: '승인 완료',
    description: '모든 검토를 통과해 내 도구에 반영되었습니다.',
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    name: '반려',
    description: '반려 사유를 확인하고 수정 후 다시 요청할 수 있습니다.',
    color: 'bg-red-50 text-red-700',
  },
];

const FAQS = [
  {
    question: 'AI를 사용하지 않는 일반 업무 도구도 등록할 수 있나요?',
    answer:
      '네. AI App, AI Agent뿐 아니라 자동화 도구와 일반 업무 도구도 동일한 절차로 등록할 수 있습니다.',
  },
  {
    question: '등록할 때 반드시 준비해야 하는 파일은 무엇인가요?',
    answer:
      '실행에 필요한 파일을 묶은 ZIP 파일은 필수입니다. 도구 아이콘과 화면 이미지는 도구를 더 쉽게 이해하도록 돕는 정보로 함께 등록할 수 있습니다.',
  },
  {
    question: '심사가 진행 중일 때 요청을 취소할 수 있나요?',
    answer:
      '검사 대기 또는 심사 진행중인 요청은 진행 내역 하단의 검사 취소 버튼으로 취소할 수 있습니다. 취소한 업데이트는 다시 요청할 수 있습니다.',
  },
  {
    question: '반려된 도구는 처음부터 다시 작성해야 하나요?',
    answer:
      '아니요. 수정 후 다시 요청을 선택하면 기존 정보가 입력된 상태로 수정 페이지가 열립니다. 반려 사유를 보완하고 ZIP 파일만 다시 첨부해 주세요.',
  },
  {
    question: '운영 중인 도구를 업데이트하려면 어떻게 하나요?',
    answer:
      '내 도구에서 해당 도구의 상세페이지를 열고 업데이트 버튼을 선택하세요. 새 버전과 변경 사항을 입력해 승인 요청을 보낼 수 있습니다.',
  },
  {
    question: '즐겨찾기와 다운로드한 도구는 어디에서 확인하나요?',
    answer:
      '라이브러리의 다운로드한 도구 및 즐겨찾기 탭에서 각각 확인할 수 있습니다. 새 버전이 있는 도구에는 업데이트 버튼이 표시됩니다.',
  },
];

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-10 max-w-2xl sm:mb-12">
      <div aria-hidden="true" style={{ height: 'clamp(5rem, 7vw, 7rem)' }} />
      <p className="text-xs font-semibold tracking-[0.14em] text-blue-600">{eyebrow}</p>
      <h2 className="mt-3 text-[22px] font-bold tracking-tight text-slate-950 sm:text-2xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-[15px] leading-7 text-slate-600">{description}</p>}
    </div>
  );
}

function PageLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
    >
      {children}
      <ArrowRight
        size={15}
        className="transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </button>
  );
}

export default function GuidePage() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-w-0 pb-16 pt-6 text-slate-900">
      <div className="grid items-start gap-14 xl:grid-cols-[minmax(0,1fr)_210px] xl:gap-16">
        <main className="min-w-0">
          <section className="relative overflow-hidden rounded-3xl bg-[#f3f7ff] px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-28 h-80 w-80 rounded-full border-[52px] border-white/70"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-24 right-32 h-52 w-52 rounded-full bg-blue-200/25 blur-3xl"
            />

            <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-sm shadow-blue-900/5">
                  <Sparkles size={14} aria-hidden="true" /> AI APP STORE GUIDE
                </span>
                <h1 className="mt-5 max-w-xl text-3xl font-bold leading-[1.25] tracking-tight text-slate-950 sm:text-[40px]">
                  찾고, 내려받고,
                  <br />
                  안전하게 공유하세요.
                </h1>
                <p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-600">
                  사내 도구를 사용하는 방법부터 직접 만든 도구를 등록하고 업데이트하는 과정까지,
                  필요한 흐름만 빠르게 확인할 수 있습니다.
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                  <AiStoreActionButton to={ROUTES.store} icon={Store}>
                    스토어 둘러보기
                  </AiStoreActionButton>
                  <AiStoreActionButton to={ROUTES.newTool} variant="secondary" icon={UploadCloud}>
                    새 도구 등록
                  </AiStoreActionButton>
                </div>
              </div>

              <div className="relative rounded-2xl border border-white/80 bg-white/85 p-5 shadow-xl shadow-blue-900/5 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">등록부터 운영까지</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      안전한 도구 배포 흐름
                    </p>
                  </div>
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">
                    <ShieldCheck size={19} aria-hidden="true" />
                  </span>
                </div>
                <ol className="mt-5 space-y-1">
                  {['ZIP 파일 등록', '자동 검사', '관리자 검토', '승인 및 운영'].map(
                    (label, index) => (
                      <li key={label} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                        <span
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold ${index < 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                        >
                          {index < 2 ? <Check size={14} aria-hidden="true" /> : index + 1}
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-medium text-slate-700">
                          {label}
                        </span>
                        <span
                          className={`text-xs ${index === 2 ? 'font-semibold text-blue-600' : 'text-slate-400'}`}
                        >
                          {index < 2 ? '완료' : index === 2 ? '진행 중' : '대기'}
                        </span>
                      </li>
                    )
                  )}
                </ol>
              </div>
            </div>
          </section>

          <section id="start" className="scroll-mt-24">
            <SectionHeader
              eyebrow="QUICK START"
              title="무엇을 하려는지부터 선택하세요"
              description="사용 목적에 맞는 메뉴로 바로 이동할 수 있습니다."
            />
            <div className="grid gap-3 md:grid-cols-3">
              {QUICK_START.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => navigate(item.route)}
                    className="group flex min-h-52 flex-col items-start rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5"
                  >
                    <span className={`grid h-11 w-11 place-items-center rounded-xl ${item.tone}`}>
                      <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <strong className="mt-5 text-base font-semibold text-slate-950">
                      {item.title}
                    </strong>
                    <span className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                      {item.description}
                    </span>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                      {item.action}
                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section id="use" className="scroll-mt-24">
            <SectionHeader
              eyebrow="FOR EVERYONE"
              title="도구를 찾고 사용하는 방법"
              description="스토어에서 상세 정보를 확인하고 다운로드하면 이후 관리는 라이브러리에서 이어집니다."
            />
            <ol className="grid gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-4">
              {USE_FLOW.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.title}
                    className={`relative p-5 ${index !== USE_FLOW.length - 1 ? 'border-b border-slate-100 md:border-b-0 md:border-r' : ''}`}
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-slate-700">
                      <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <p className="mt-5 text-xs font-semibold text-blue-600">0{index + 1}</p>
                    <h3 className="mt-1 text-sm font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </li>
                );
              })}
            </ol>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-slate-900">
                  <Bookmark size={17} className="text-blue-600" aria-hidden="true" />
                  <h3 className="text-sm font-semibold">나중에 다시 보고 싶다면</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  카드의 북마크 아이콘을 누르세요. 즐겨찾기한 도구는 라이브러리에 계속 보관됩니다.
                </p>
              </div>
              <div className="rounded-2xl bg-blue-50/70 p-5">
                <div className="flex items-center gap-2 text-slate-900">
                  <RefreshCw size={17} className="text-blue-600" aria-hidden="true" />
                  <h3 className="text-sm font-semibold">새 버전이 나왔다면</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  업데이트 버튼을 누르면 변경 사항을 먼저 확인한 뒤 최신 버전으로 바꿀 수 있습니다.
                </p>
              </div>
            </div>
            <div className="mt-8">
              <PageLink onClick={() => navigate(ROUTES.library)}>내 라이브러리 확인하기</PageLink>
            </div>
          </section>

          <section id="publish" className="scroll-mt-24">
            <SectionHeader
              eyebrow="FOR MAKERS"
              title="새 도구 등록과 심사 흐름"
              description="도구 파일과 상세 정보를 한 번에 제출하면 검사와 관리자 검토가 순서대로 진행됩니다."
            />

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
              <ol className="relative space-y-0">
                {PUBLISH_FLOW.map((item, index) => (
                  <li key={item.step} className="relative flex gap-5 pb-8 last:pb-0">
                    {index !== PUBLISH_FLOW.length - 1 && (
                      <span className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-px bg-slate-200" />
                    )}
                    <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-xs font-semibold text-white shadow-sm shadow-blue-600/20">
                      {item.step}
                    </span>
                    <div className="pt-1.5">
                      <h3 className="text-[15px] font-semibold text-slate-950">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <aside className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                <div className="flex items-center gap-2">
                  <FileArchive size={18} className="text-blue-600" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-slate-950">등록 전 준비 사항</h3>
                </div>
                <ul className="mt-5 space-y-3.5">
                  {[
                    '배포할 도구 ZIP 파일',
                    '도구 이름과 요약 설명',
                    '주요 기능과 사용 방법',
                    '지원 환경과 새 버전',
                    '도구 아이콘과 화면 이미지',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <Check
                        size={15}
                        className="mt-0.5 shrink-0 text-blue-600"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-blue-100 pt-4 text-xs leading-5 text-slate-500">
                  ZIP 파일은 필수이며 아이콘과 화면 이미지는 필요에 따라 등록할 수 있습니다.
                </p>
              </aside>
            </div>

            <div className="mt-12 sm:mt-14">
              <h3 className="text-base font-semibold text-slate-950">
                심사 상태는 이렇게 읽으세요
              </h3>
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                {STATUSES.map((item, index) => (
                  <div
                    key={item.name}
                    className={`grid gap-3 bg-white px-5 py-4 sm:grid-cols-[8.5rem_1fr] sm:items-center ${index !== STATUSES.length - 1 ? 'border-b border-slate-100' : ''}`}
                  >
                    <span
                      className={`w-fit rounded-md px-2.5 py-1 text-xs font-medium ${item.color}`}
                    >
                      {item.name}
                    </span>
                    <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <AiStoreActionButton to={ROUTES.newTool} icon={UploadCloud}>
                새 도구 등록
              </AiStoreActionButton>
              <AiStoreActionButton to={ROUTES.register} variant="secondary" icon={ClipboardCheck}>
                심사 진행 내역
              </AiStoreActionButton>
            </div>
          </section>

          <section id="manage" className="scroll-mt-24">
            <SectionHeader
              eyebrow="KEEP IT CURRENT"
              title="운영 중인 도구를 관리하는 방법"
              description="승인된 도구는 내 도구에서 관리하고, 변경이 필요할 때 상세페이지에서 업데이트를 시작합니다."
            />

            <div className="grid gap-3 md:grid-cols-3">
              {[
                {
                  icon: LayoutGrid,
                  title: '운영 현황 확인',
                  description: '버전, 등록일과 다운로드 횟수를 한눈에 확인합니다.',
                },
                {
                  icon: RefreshCw,
                  title: '업데이트 요청',
                  description: '새 ZIP 파일, 버전과 변경 사항을 입력해 심사를 요청합니다.',
                },
                {
                  icon: ShieldCheck,
                  title: '기존 버전 유지',
                  description: '업데이트가 승인되기 전까지 현재 운영 버전은 그대로 유지됩니다.',
                },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <Icon
                      size={20}
                      className="text-blue-600"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    <h3 className="mt-4 text-sm font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 px-5 py-4">
              <CircleHelp size={18} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  업데이트 심사 중에는 중복 요청할 수 없습니다.
                </p>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">
                  내 도구의 상태 배지나 업데이트 심사 보기 버튼을 선택하면 현재 진행 내역으로 바로
                  이동합니다.
                </p>
              </div>
            </div>
            <div className="mt-8">
              <PageLink onClick={() => navigate(ROUTES.myTools)}>운영 중인 내 도구 보기</PageLink>
            </div>
          </section>

          <section id="faq" className="scroll-mt-24">
            <SectionHeader
              eyebrow="FAQ"
              title="자주 묻는 질문"
              description="등록과 이용 과정에서 자주 확인하는 내용을 모았습니다."
            />
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {FAQS.map((faq, index) => (
                <details
                  key={faq.question}
                  className={`group ${index !== FAQS.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 sm:px-6 [&::-webkit-details-marker]:hidden">
                    <span className="flex min-w-0 items-start gap-3">
                      <span className="shrink-0 text-sm font-semibold text-blue-600">Q.</span>
                      <span className="text-sm font-semibold leading-6 text-slate-800">
                        {faq.question}
                      </span>
                    </span>
                    <ChevronDown
                      size={17}
                      className="shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="px-5 pb-6 pl-11 sm:px-6 sm:pl-12">
                    <p className="text-sm leading-7 text-slate-600">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-24 overflow-hidden rounded-3xl bg-slate-950 px-6 py-9 text-white sm:mt-28 sm:px-9 sm:py-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-blue-300">
                  READY TO START
                </p>
                <h2 className="mt-2 text-xl font-bold tracking-tight">
                  이제 필요한 도구를 찾아보세요.
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  다운로드부터 직접 만든 도구의 사내 배포까지 한곳에서 이어집니다.
                </p>
              </div>
              <AiStoreActionButton
                to={ROUTES.store}
                icon={ArrowRight}
                className="self-start sm:self-auto"
              >
                스토어로 이동
              </AiStoreActionButton>
            </div>
          </section>
        </main>

        <aside className="hidden xl:block">
          <nav aria-label="이용 가이드 목차" className="sticky top-8">
            <p className="px-3 text-xs font-semibold text-slate-900">이 페이지에서</p>
            <div className="mt-3 space-y-1 border-l border-slate-200 pl-2">
              {SECTIONS.map(section => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-blue-600"
                >
                  {section.label}
                </a>
              ))}
            </div>
            <div className="mt-7 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <CircleHelp size={16} className="text-slate-600" aria-hidden="true" />
                <p className="text-xs font-semibold text-slate-800">추가 도움이 필요하신가요?</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                사내 서비스 담당자에게 도구 이름과 현재 상태를 함께 알려주세요.
              </p>
            </div>
          </nav>
        </aside>
      </div>
    </div>
  );
}
