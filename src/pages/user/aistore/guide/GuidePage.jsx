import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  ClipboardCheck,
  FilePlus2,
  HelpCircle,
  LayoutGrid,
  Search,
  ShieldCheck,
  Store,
} from 'lucide-react';

// 기존 라우트에 맞춰 필요한 경우 수정
const ROUTES = {
  store: '/user/aistore/store',
  myTools: '/user/aistore/mytools',
  favorites: '/user/aistore/library/favorites',
  register: '/user/aistore/register',
};

const SECTIONS = [
  { id: 'start', label: '시작하기' },
  { id: 'browse', label: '도구 둘러보기' },
  { id: 'register', label: '새 도구 등록' },
  { id: 'review', label: '보안검사 및 승인' },
  { id: 'faq', label: '자주 묻는 질문' },
];

const QUICK_MENUS = [
  {
    title: '도구 둘러보기',
    description: '사내에서 사용할 수 있는 도구를 찾아보세요.',
    icon: Store,
    route: ROUTES.store,
  },
  {
    title: '내 도구',
    description: '등록한 도구와 진행 상태를 확인하세요.',
    icon: LayoutGrid,
    route: ROUTES.myTools,
  },
  {
    title: '새 도구 등록',
    description: '직접 만든 도구를 등록하고 검토를 요청하세요.',
    icon: FilePlus2,
    route: ROUTES.register,
  },
];

const BROWSE_STEPS = [
  {
    number: '01',
    title: '도구 검색',
    description: '이름이나 기능을 검색하고, 카테고리와 유형으로 원하는 도구를 찾아보세요.',
  },
  {
    number: '02',
    title: '도구 정보 확인',
    description: '도구의 소개, 주요 기능, 제작자, 버전 등 상세 정보를 확인하세요.',
  },
  {
    number: '03',
    title: '도구 이용',
    description: '사용 가능한 도구를 실행하거나 즐겨찾기에 저장해 편리하게 접근하세요.',
  },
];

const REGISTER_STEPS = [
  {
    number: '01',
    title: '기본 정보 입력',
    description: '도구 유형, 이름, 카테고리, 버전 및 주요 기능을 입력합니다.',
  },
  {
    number: '02',
    title: '실행 정보 등록',
    description: '소스코드 저장소, 실행 주소, 사용 방법 등 필요한 정보를 등록합니다.',
  },
  {
    number: '03',
    title: '등록 요청',
    description: '입력한 내용을 검토하고 등록 요청을 완료합니다.',
  },
];

const TOOL_TYPES = [
  {
    name: 'AI App',
    description: 'AI 기능을 활용하는 업무용 애플리케이션',
  },
  {
    name: 'AI Agent',
    description: '업무를 자동으로 수행하는 AI 기반 에이전트',
  },
  {
    name: '자동화 도구',
    description: '반복적인 업무를 자동으로 처리하는 도구',
  },
  {
    name: '일반 업무 도구',
    description: '업무 생산성을 높이는 일반 애플리케이션',
  },
];

const REVIEW_STEPS = [
  {
    number: '01',
    title: '도구 등록',
    description: '사용자가 도구 정보를 등록합니다.',
  },
  {
    number: '02',
    title: '자동 보안검사',
    description: '소스코드와 보안 위험 요소를 검사합니다.',
  },
  {
    number: '03',
    title: '관리자 검토',
    description: '검사 결과를 바탕으로 관리자가 검토합니다.',
  },
  {
    number: '04',
    title: '승인 및 배포',
    description: '승인된 도구를 사내 사용자에게 제공합니다.',
  },
];

const STATUSES = [
  {
    name: '검사 대기',
    description: '등록이 완료되어 보안검사를 기다리는 상태',
    className: 'bg-slate-100 text-slate-600',
  },
  {
    name: '검사 중',
    description: '자동 보안검사가 진행되고 있는 상태',
    className: 'bg-blue-50 text-blue-700',
  },
  {
    name: '검토 대기',
    description: '보안검사를 마치고 관리자 검토를 기다리는 상태',
    className: 'bg-amber-50 text-amber-700',
  },
  {
    name: '보완 필요',
    description: '추가 수정이나 보안 개선이 필요한 상태',
    className: 'bg-orange-50 text-orange-700',
  },
  {
    name: '승인 완료',
    description: '관리자가 도구 등록을 승인한 상태',
    className: 'bg-emerald-50 text-emerald-700',
  },
  {
    name: '반려',
    description: '관리자가 등록 요청을 반려한 상태',
    className: 'bg-red-50 text-red-700',
  },
];

const FAQS = [
  {
    question: 'AI를 사용하지 않는 도구도 등록할 수 있나요?',
    answer:
      '네. AI App과 AI Agent뿐 아니라 업무 자동화 도구, 일반 업무 도구도 등록할 수 있도록 구성되어 있습니다.',
  },
  {
    question: '도구를 등록하면 바로 사용할 수 있나요?',
    answer:
      '등록된 도구는 보안검사와 관리자 검토를 거쳐야 합니다. 승인 이후 배포가 완료되면 허용된 사용자에게 제공됩니다.',
  },
  {
    question: '보안검사에서 문제가 발견되면 어떻게 하나요?',
    answer:
      '내 도구 페이지에서 검사 결과와 개선이 필요한 항목을 확인할 수 있도록 할 예정입니다. 문제를 수정한 후 재검사를 요청하는 절차를 지원할 수 있습니다.',
  },
  {
    question: '내가 등록한 도구는 어디에서 확인하나요?',
    answer:
      '사이드바의 내 도구 메뉴에서 등록한 도구 목록과 검사 및 승인 상태를 확인할 수 있습니다.',
  },
  {
    question: '즐겨찾기는 어떻게 사용하나요?',
    answer:
      '도구 목록의 즐겨찾기 아이콘을 선택하면 저장할 수 있습니다. 저장한 도구는 라이브러리의 즐겨찾기 탭에서 확인할 수 있습니다.',
  },
  {
    question: '승인된 도구는 모든 직원이 볼 수 있나요?',
    answer:
      '도구의 공개 범위와 회사의 권한 정책에 따라 달라집니다. 전체 공개 도구는 사내 사용자에게, 제한된 도구는 허용된 사용자에게만 제공하도록 설계할 수 있습니다.',
  },
];

// 공통 섹션 제목
function SectionHeader({ number, title, description }) {
  return (
    <div className="mb-7">
      <span className="text-xs font-semibold tracking-wide text-blue-600">{number}</span>

      <h2 className="mt-2 text-metric font-bold tracking-tight text-slate-900">{title}</h2>

      {description && <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>}
    </div>
  );
}

// 사용 방법 단계
function StepList({ items }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {items.map((item, index) => (
        <div
          key={item.number}
          className={`flex gap-5 px-6 py-5 ${
            index !== items.length - 1 ? 'border-b border-slate-100' : ''
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-semibold text-blue-600">
            {item.number}
          </div>

          <div className="min-w-0 pt-0.5">
            <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// 하단 연결 버튼
function PageLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      {children}
      <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

export default function GuidePage() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-w-0">
      <div className="pt-3">
        <div className="grid items-start gap-12 xl:grid-cols-[minmax(0,1fr)_210px] xl:gap-16">
          {/* 본문 */}
          <div className="min-w-0">
            {/* 페이지 제목 */}
            <header>
              <p className="text-xs font-semibold tracking-wide text-blue-600">MANAGE</p>

              <h1 className="mt-2 text-display-sm font-bold tracking-tight text-slate-900">
                이용 가이드
              </h1>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                온담AI Manage를 처음 사용하시나요?
                <br />
                도구 탐색부터 등록, 보안검사와 승인까지 이용 방법을 안내합니다.
              </p>
            </header>

            {/* 가이드 소개 */}
            <div className="relative mt-8 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-palette-blue-12 via-surface-hover to-white p-7 md:p-9">
              <div className="relative z-10 max-w-lg">
                <span className="text-xs font-semibold tracking-wider text-blue-600">
                  GETTING STARTED
                </span>

                <h2 className="mt-4 text-2xl font-bold leading-snug tracking-tight text-slate-900">
                  업무에 필요한 도구,
                  <br />
                  온담에서 안전하게 활용하세요.
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  사내에 등록된 도구를 찾아 사용하고, 직접 만든 도구를 등록해 동료와 공유할 수
                  있습니다.
                </p>

                <button
                  type="button"
                  onClick={() => navigate(ROUTES.store)}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  도구 둘러보기
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* 단순 장식 */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-28 -right-16 h-72 w-72 rounded-full border-[40px] border-blue-100/50"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-6 top-3 h-28 w-28 rounded-full bg-blue-100/30 blur-3xl"
              />
            </div>

            {/* 01 시작하기 */}
            <section id="start" className="mt-16 scroll-mt-10">
              <SectionHeader
                number="01"
                title="시작하기"
                description="Manage에서는 업무에 필요한 도구를 사용하거나 직접 등록하고 관리할 수 있습니다."
              />

              <div className="grid gap-4 md:grid-cols-3">
                {QUICK_MENUS.map(menu => {
                  const Icon = menu.icon;

                  return (
                    <button
                      key={menu.title}
                      type="button"
                      onClick={() => navigate(menu.route)}
                      className="group flex flex-col items-start rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-blue-200 hover:shadow-sm"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600">
                        <Icon size={19} strokeWidth={1.7} />
                      </div>

                      <h3 className="mt-5 text-sm font-semibold text-slate-900">{menu.title}</h3>

                      <p className="mt-2 min-h-12 text-xs leading-6 text-slate-500">
                        {menu.description}
                      </p>

                      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600">
                        바로가기
                        <ArrowRight size={13} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 02 도구 둘러보기 */}
            <section id="browse" className="mt-20 scroll-mt-10">
              <SectionHeader
                number="02"
                title="도구 둘러보기"
                description="업무에 필요한 도구를 검색하고, 상세 정보를 확인한 후 사용할 수 있습니다."
              />

              <StepList items={BROWSE_STEPS} />

              {/* 기능 설명 */}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-5">
                  <div className="flex items-center gap-2">
                    <Search size={17} className="text-slate-600" />
                    <h3 className="text-sm font-semibold text-slate-900">검색 및 필터</h3>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    도구의 이름과 기능으로 검색하거나 유형, 카테고리를 선택하여 원하는 도구를 찾을
                    수 있습니다.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-5">
                  <div className="flex items-center gap-2">
                    <Bookmark size={17} className="text-slate-600" />
                    <h3 className="text-sm font-semibold text-slate-900">즐겨찾기</h3>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    자주 사용하는 도구를 즐겨찾기에 추가해 별도의 검색 없이 빠르게 찾아볼 수
                    있습니다.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <PageLink onClick={() => navigate(ROUTES.store)}>도구 둘러보기</PageLink>
              </div>
            </section>

            {/* 03 도구 등록 */}
            <section id="register" className="mt-20 scroll-mt-10">
              <SectionHeader
                number="03"
                title="새 도구 등록"
                description="직접 제작한 도구를 온담AI에 등록하고 보안검사 및 관리자 검토를 요청할 수 있습니다."
              />

              <h3 className="mb-4 text-sm font-semibold text-slate-900">등록할 수 있는 도구</h3>

              <div className="grid gap-3 sm:grid-cols-2">
                {TOOL_TYPES.map(item => (
                  <div key={item.name} className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <h4 className="text-sm font-semibold text-slate-900">{item.name}</h4>
                    </div>

                    <p className="mt-3 text-xs leading-6 text-slate-500">{item.description}</p>
                  </div>
                ))}
              </div>

              <h3 className="mb-4 mt-9 text-sm font-semibold text-slate-900">도구 등록 방법</h3>

              <StepList items={REGISTER_STEPS} />

              {/* 준비 사항 */}
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/60 p-6">
                <h3 className="text-sm font-semibold text-slate-900">등록 전 준비 사항</h3>

                <p className="mt-2 text-xs leading-6 text-slate-500">
                  등록을 시작하기 전에 다음 정보를 준비해 주세요.
                </p>

                <div className="mt-5 space-y-3">
                  {[
                    '도구 이름과 주요 기능 설명',
                    '도구 유형 및 카테고리',
                    '소스코드 또는 저장소 관련 정보',
                    '실행 주소 및 사용 방법 (해당하는 경우)',
                  ].map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <Check size={15} className="mt-0.5 shrink-0 text-blue-600" />
                      <span className="text-sm text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <PageLink onClick={() => navigate(ROUTES.register)}>새 도구 등록하기</PageLink>
              </div>
            </section>

            {/* 04 보안검사 및 승인 */}
            <section id="review" className="mt-20 scroll-mt-10">
              <SectionHeader
                number="04"
                title="보안검사 및 승인"
                description="등록한 도구는 보안검사와 관리자 검토 절차를 거쳐 사내에 배포됩니다."
              />

              {/* 처리 흐름 */}
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-6 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-600" />
                  <h3 className="text-sm font-semibold text-slate-900">등록부터 배포까지</h3>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {REVIEW_STEPS.map(item => (
                    <div
                      key={item.number}
                      className="rounded-lg border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <span className="text-xs font-semibold text-blue-600">
                        STEP {item.number}
                      </span>

                      <h4 className="mt-2 text-sm font-semibold text-slate-900">{item.title}</h4>

                      <p className="mt-2 text-xs leading-6 text-slate-500">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <h3 className="mb-4 mt-9 text-sm font-semibold text-slate-900">진행 상태 안내</h3>

              {/* 상태별 설명 */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {STATUSES.map((item, index) => (
                  <div
                    key={item.name}
                    className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center ${
                      index !== STATUSES.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <div className="w-28 shrink-0">
                      <span
                        className={`inline-block rounded-md px-2.5 py-1.5 text-xs font-medium ${item.className}`}
                      >
                        {item.name}
                      </span>
                    </div>

                    <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>

              {/* 안내 */}
              <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50/60 px-5 py-4">
                <div className="flex items-start gap-3">
                  <ClipboardCheck size={18} className="mt-0.5 shrink-0 text-blue-600" />

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      검사 결과는 어디에서 확인하나요?
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      내 도구 페이지에서 검사 진행 상태와 검토 결과, 개선이 필요한 항목을 확인할 수
                      있도록 구성합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <PageLink onClick={() => navigate(ROUTES.myTools)}>내 도구 확인하기</PageLink>
              </div>
            </section>

            {/* 05 FAQ */}
            <section id="faq" className="mt-20 scroll-mt-10">
              <SectionHeader
                number="05"
                title="자주 묻는 질문"
                description="Manage 이용 중 궁금할 수 있는 내용을 확인해 보세요."
              />

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {FAQS.map((faq, index) => (
                  <details
                    key={faq.question}
                    className={`group ${
                      index !== FAQS.length - 1 ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="shrink-0 text-sm font-semibold text-blue-600">Q.</span>

                        <span className="text-sm font-medium leading-6 text-slate-800">
                          {faq.question}
                        </span>
                      </div>

                      <ChevronDown
                        size={17}
                        className="shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                      />
                    </summary>

                    <div className="px-6 pb-6 pl-12">
                      <p className="text-sm leading-7 text-slate-600">{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>

            {/* 페이지 하단 */}
            <div className="mt-16 border-t border-slate-200 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    이제 온담AI를 시작해 보세요.
                  </h3>

                  <p className="mt-2 text-xs text-slate-500">
                    업무에 필요한 도구를 찾아보고 활용해 보세요.
                  </p>
                </div>

                <PageLink onClick={() => navigate(ROUTES.store)}>도구 둘러보기</PageLink>
              </div>
            </div>
          </div>

          {/* 우측 페이지 목차 */}
          <aside className="hidden xl:block">
            <nav
              aria-label="이용 가이드 목차"
              className="sticky top-8 border-l border-slate-200 pl-5"
            >
              <p className="mb-5 text-xs font-semibold text-slate-900">목차</p>

              <div className="space-y-1">
                {SECTIONS.map(section => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block rounded-md px-2 py-2.5 text-xs text-slate-500 transition-colors hover:bg-slate-50 hover:text-blue-600"
                  >
                    {section.label}
                  </a>
                ))}
              </div>

              <div className="mt-7 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 text-slate-600">
                  <HelpCircle size={15} />

                  <span className="text-xs font-medium">도움이 필요하신가요?</span>
                </div>

                <p className="mt-2 text-xs leading-6 text-slate-500">
                  추가 문의가 있다면 사내 서비스 담당자에게 문의해 주세요.
                </p>
              </div>
            </nav>
          </aside>
        </div>
      </div>
    </div>
  );
}
