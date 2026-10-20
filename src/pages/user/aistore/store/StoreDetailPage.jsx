import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Globe2,
  Laptop,
  MemoryStick,
  MoreHorizontal,
  ShieldCheck,
  Sparkles,
  AppWindow,
} from 'lucide-react';
import StoreToolIcon from '../components/StoreToolIcon.jsx';
import { publishedTools, useDownloads, useFavorites } from '../data/manageStore.js';

const previewTabs = ['시작 화면', '작업 설정', '결과 확인'];

const supportedEnvironment = [
  { label: '사용 가능 대상', value: 'PC (사내망)', icon: Laptop },
  { label: '운영체제', value: 'Windows 10 버전 10.0 이상', icon: AppWindow },
  { label: '브라우저', value: 'Chrome, Edge (최신 버전)', icon: Globe2 },
  { label: '메모리', value: '4GB (최소), 8GB (권장)', icon: MemoryStick },
  { label: '기타', value: '별도 설치 없이 바로 사용 가능', icon: MoreHorizontal },
];

const detailContent = {
  report: {
    description: [
      '보고서 작성 도우미는 흩어져 있는 핵심 내용을 읽기 쉬운 업무 보고서나 기획안 초안으로 정리하는 도구입니다. 작성 목적과 주요 사실, 전달하고 싶은 결론을 입력하면 문서의 흐름을 잡는 데 도움을 줍니다.',
      '빈 문서에서 시작하기 어려울 때 초안을 빠르게 마련하고, 담당자가 표현과 수치를 확인하며 최종 문서를 다듬는 용도로 활용할 수 있습니다. 팀에서 사용하는 문체와 업무 맥락에 맞게 결과를 검토해 주세요.',
    ],
    usage:
      '작성하려는 문서가 업무 보고서인지 기획안인지 먼저 정하고, 읽을 대상과 전달하려는 결론을 입력해 주세요. 배경, 진행 내용, 주요 성과처럼 반드시 들어가야 할 사실은 구체적인 문장이나 메모로 제공하면 초안의 방향을 잡기 쉽습니다. 초안을 받으면 제목과 문단 순서가 목적에 맞는지 살펴보고, 날짜·수치·고유명사를 원자료와 대조해 주세요. 팀에서 쓰는 표현으로 문장을 다듬고 빠진 근거를 보완한 뒤 최종 문서에 활용할 수 있습니다.',
  },
  meeting: {
    description: [
      '회의록 정리 도우미는 회의 내용을 다시 읽기 쉬운 기록으로 정리합니다. 논의한 주제에서 핵심 요점과 결정 사항을 구분하고, 후속 작업을 한눈에 살펴보는 데 도움을 줍니다.',
      '여러 사람이 참여한 회의에서 이야기의 흐름을 놓치지 않고 공유해야 할 내용을 추려낼 때 유용합니다. 회의 후에는 담당자, 일정, 결정 사항이 원문과 일치하는지 확인해 주세요.',
    ],
    usage:
      '회의 메모나 대화 내용을 입력하고 회의 주제, 참석자, 날짜를 함께 알려 주세요. 결정 사항과 후속 작업 중 어떤 내용을 강조할지도 적어 주면 정리 방향을 잡는 데 도움이 됩니다. 결과에서는 논의 내용과 실제 결정된 내용을 구분해 확인하고, 담당자와 기한이 정확한지 원문과 대조해 주세요. 빠진 배경 설명을 보완한 뒤 참석자에게 공유할 수 있습니다.',
  },
  workflow: {
    description: [
      '업무 요청 자동 분류는 들어온 요청의 내용을 기준으로 담당 부서를 찾는 데 도움을 주는 도구입니다. 반복적으로 접수되는 요청을 유형별로 구분해 전달 대상을 판단하는 시간을 줄일 수 있습니다.',
      '요청 내용이 모호하거나 여러 부서에 걸쳐 있는 경우에는 분류 결과를 확인하고 적절한 담당자를 다시 지정해 주세요. 부서별 업무 기준이 바뀌면 분류 기준도 함께 점검하는 것이 좋습니다.',
    ],
    usage:
      '접수한 업무 요청의 제목과 본문을 입력하고, 요청 목적이나 관련 시스템처럼 담당 부서를 판단하는 데 필요한 맥락을 포함해 주세요. 분류 결과가 나오면 요청 유형과 추천된 담당 부서가 현재 업무 분장에 맞는지 확인해 주세요. 여러 부서에 걸친 요청이나 내용이 모호한 요청은 원문을 다시 살펴 담당자를 조정하고, 전달 전에 필요한 추가 정보를 요청자에게 확인할 수 있습니다.',
  },
  analysis: {
    description: [
      '데이터 분석 도우미는 표 형태의 데이터를 살펴보고 눈에 띄는 추세와 이상값을 정리하는 데 도움을 줍니다. 숫자를 하나씩 확인하기보다 변화가 큰 구간과 주요 지표를 먼저 파악하고 싶을 때 활용할 수 있습니다.',
      '분석 결과는 입력된 데이터의 범위와 품질에 영향을 받습니다. 비교 기준과 기간을 함께 알려 주고, 해석이 중요한 수치는 원본 데이터와 대조해 주세요.',
    ],
    usage:
      '분석할 표 데이터의 열 이름과 값이 의미하는 바를 확인한 뒤, 보고 싶은 지표와 비교 기간을 함께 입력해 주세요. 예를 들어 월별 증감이나 특정 항목의 이상값처럼 궁금한 점을 구체적으로 적으면 결과를 해석하기 쉽습니다. 제시된 추세와 특이 구간은 원본 수치에 다시 대조하고, 누락된 값이나 집계 기준의 차이가 있는지 확인해 주세요. 검토한 결과를 바탕으로 업무에 필요한 요약을 작성할 수 있습니다.',
  },
  review: {
    description: [
      '코드 리뷰 도우미는 코드의 가독성과 품질을 살펴보고 잠재적인 오류를 검토하는 데 도움을 줍니다. 변경한 코드가 어떤 의도로 작성되었는지 함께 제공하면 피드백의 맥락을 더 분명하게 할 수 있습니다.',
      '제안된 수정 사항은 프로젝트의 규칙과 실행 환경에 따라 적합하지 않을 수 있습니다. 적용 전에는 관련 테스트와 기존 동작을 확인하고 팀의 코드 리뷰 기준에 맞춰 판단해 주세요.',
    ],
    usage:
      '검토할 코드와 변경 목적, 기대하는 동작을 함께 입력해 주세요. 오류 가능성, 읽기 쉬운 구조, 성능처럼 특히 확인하고 싶은 관점이 있다면 명시하는 것이 좋습니다. 받은 피드백은 프로젝트의 코딩 규칙과 기존 동작에 맞는지 검토하고, 수정이 필요한 부분만 선택해 반영해 주세요. 반영한 변경은 관련 테스트와 실제 실행 결과로 다시 확인할 수 있습니다.',
  },
  expense: {
    description: [
      '정산 파일 일괄 취합은 여러 엑셀 파일의 내용을 동일한 양식으로 모으는 자동화 도구입니다. 반복해서 파일을 열고 값을 옮기는 작업을 줄여 정산 자료를 정리할 때 활용할 수 있습니다.',
      '이 도구는 AI 모델을 사용하지 않습니다. 취합 후에는 원본 파일의 열 이름과 금액, 누락된 행이 없는지 확인해 최종 정산 자료를 검토해 주세요.',
    ],
    usage:
      '취합할 정산 파일들의 열 이름, 날짜 형식, 금액 단위를 먼저 확인하고 기준이 될 양식을 준비해 주세요. 같은 항목이 파일마다 다른 이름으로 쓰였다면 어떤 열에 대응하는지 정리해 두는 것이 좋습니다. 취합 결과에서는 행이 빠지거나 중복되지 않았는지, 금액 합계가 원본과 일치하는지 확인해 주세요. 검토를 마친 자료를 정산 보고나 후속 처리에 사용할 수 있습니다.',
  },
  translate: {
    description: [
      '문서 번역 도구는 업무 문서의 내용을 다른 언어로 옮기면서 용어를 일관되게 사용하는 데 도움을 줍니다. 여러 문서에서 반복되는 사내 표현을 통일해야 할 때 활용할 수 있습니다.',
      '번역문은 문맥이나 전문 용어에 따라 다르게 해석될 수 있습니다. 대외 발송 문서나 중요한 계약 문서라면 원문과 번역문을 함께 검토해 주세요.',
    ],
    usage:
      '번역할 문서의 내용과 대상 언어를 입력하고, 유지해야 할 회사명·제품명·전문 용어가 있으면 함께 알려 주세요. 문서가 안내문인지 보고서인지처럼 용도와 원하는 말투를 적어 주면 표현을 검토하는 데 도움이 됩니다. 번역 결과에서는 숫자, 날짜, 고유명사와 중요한 업무 용어가 원문의 뜻을 유지하는지 확인해 주세요. 대외 발송이나 계약 관련 문서는 담당자의 최종 검토를 거쳐 활용할 수 있습니다.',
  },
  support: {
    description: [
      '문의 응대 에이전트는 사내에서 자주 묻는 질문을 찾아 안내하는 데 도움을 줍니다. 반복되는 문의의 답변을 빠르게 확인하고 관련 업무를 시작할 때 필요한 정보를 찾는 용도로 활용할 수 있습니다.',
      '답변은 제공된 사내 FAQ를 바탕으로 하므로 최신 정책이나 예외 상황이 반영되지 않았을 수 있습니다. 중요한 안내는 담당 부서의 공지와 함께 확인해 주세요.',
    ],
    usage:
      '궁금한 내용을 자연스러운 문장으로 입력하고, 적용 대상이나 상황을 함께 설명해 주세요. 예를 들어 어떤 업무를 진행 중인지와 필요한 기한을 알려 주면 관련 FAQ를 찾는 데 도움이 됩니다. 안내된 답변은 현재 사내 공지와 비교해 적용 가능한 내용인지 확인해 주세요. 답변에 없는 예외 사항이나 최신 정책 확인이 필요하면 관련 담당 부서에 문의할 수 있습니다.',
  },
};

function DetailSection({ title, children }) {
  return (
    <section className="border-t border-slate-200 px-5 py-7 sm:px-8">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PreviewScreen({ tool, activeIndex }) {
  const tags = tool.storeTags?.slice(0, 3) ?? [tool.category];

  return (
    <div className="flex min-h-[250px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 sm:min-h-[330px]">
      <div className="hidden w-32 shrink-0 border-r border-slate-100 bg-slate-50/80 p-3 sm:block">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
          <StoreToolIcon tool={tool} small />
          <span className="truncate text-[10px] font-bold text-slate-800">{tool.name}</span>
        </div>
        <div className="mt-5 space-y-2">
          {previewTabs.map((tab, index) => (
            <div
              key={tab}
              className={`rounded-md px-2 py-2 text-[10px] font-medium ${index === activeIndex ? 'bg-blue-100 text-blue-700' : 'text-slate-400'}`}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1 p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[10px] font-semibold text-blue-600">{tool.type}</p>
            <h3 className="mt-1 text-sm font-bold text-slate-900 sm:text-base">
              {previewTabs[activeIndex]}
            </h3>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-semibold text-blue-600">
            {tool.storeCategory || tool.category}
          </span>
        </div>

        {activeIndex === 0 ? (
          <div className="grid gap-4 pt-6 sm:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-xl border border-slate-200 p-5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
                <Sparkles size={18} />
              </span>
              <p className="mt-4 text-sm font-semibold text-slate-900">{tool.name}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{tool.summary}</p>
              <div className="mt-6 h-8 w-28 rounded-lg bg-blue-600" />
            </div>
            <div className="space-y-3">
              {tags.map(tag => (
                <div key={tag} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="h-2 w-1/3 rounded bg-blue-200" />
                  <p className="mt-2 text-[11px] font-medium text-slate-700">{tag}</p>
                </div>
              ))}
            </div>
          </div>
        ) : activeIndex === 1 ? (
          <div className="pt-6">
            <p className="text-xs font-semibold text-slate-800">작업 정보 입력</p>
            <div className="mt-4 space-y-3">
              <div className="h-9 rounded-lg border border-slate-200 bg-slate-50" />
              <div className="h-9 rounded-lg border border-slate-200 bg-slate-50" />
              <div className="h-20 rounded-lg border border-slate-200 bg-slate-50" />
            </div>
            <div className="mt-4 h-8 w-24 rounded-lg bg-blue-600" />
          </div>
        ) : (
          <div className="pt-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <Check size={16} /> 작업 결과가 준비되었습니다
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="h-2 w-1/3 rounded bg-blue-200" />
              <div className="mt-5 h-2 w-full rounded bg-slate-200" />
              <div className="mt-3 h-2 w-11/12 rounded bg-slate-200" />
              <div className="mt-3 h-2 w-4/5 rounded bg-slate-200" />
              <div className="mt-6 flex gap-2">
                <div className="h-7 w-20 rounded-md bg-blue-600" />
                <div className="h-7 w-20 rounded-md border border-slate-200 bg-white" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StoreDetailPage() {
  const { toolId } = useParams();
  const [activePreview, setActivePreview] = useState(0);
  const { favorites, toggleFavorite } = useFavorites();
  const { downloads, addDownload } = useDownloads();
  const tool = publishedTools.find(item => item.id === toolId);

  if (!tool) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-semibold text-slate-900">도구를 찾을 수 없습니다.</h1>
        <Link
          to="/user/aistore/store"
          className="mt-4 inline-block text-sm text-blue-600 hover:underline"
        >
          스토어로 돌아가기
        </Link>
      </div>
    );
  }

  const isFavorite = favorites.includes(tool.id);
  const isAdded = downloads.includes(tool.id);
  const features = [tool.summary, ...(tool.storeTags ?? []).map(tag => `${tag} 업무에 활용`)].slice(
    0,
    5
  );
  const content = detailContent[tool.id] ?? {
    description: [tool.description || tool.summary],
    usage:
      '처리하려는 업무의 목적과 필요한 내용을 구체적으로 입력해 주세요. 결과가 나오면 원본 자료와 비교해 누락되거나 잘못 해석된 부분이 없는지 확인하고, 필요한 수정을 거쳐 업무에 활용할 수 있습니다.',
  };
  const specifications = [
    ['도구 유형', tool.type],
    ['카테고리', tool.category],
    ['제작자', tool.maker],
    ['제공 위치', 'ONDAM AI App Store'],
  ];

  return (
    <div className="pb-10 pt-6 text-slate-900">
      <Link
        to="/user/aistore/store"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} /> 스토어로 돌아가기
      </Link>

      <article className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
        <header className="flex flex-col gap-5 px-5 py-7 sm:flex-row sm:items-start sm:justify-between sm:px-8">
          <div className="flex min-w-0 items-start gap-4">
            <StoreToolIcon tool={tool} featured />
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {tool.name}
              </h1>
              <p className="mt-1 text-xs font-medium text-blue-600">
                {tool.type} · {tool.storeCategory || tool.category}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{tool.summary}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <FileText size={14} /> v{tool.version}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} /> 사내 등록 도구
                </span>
                <span>{tool.maker}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => toggleFavorite(tool.id)}
              aria-label={`${tool.name} 즐겨찾기 ${isFavorite ? '해제' : '추가'}`}
              aria-pressed={isFavorite}
              className={`grid h-10 w-10 place-items-center rounded-lg border transition-colors ${isFavorite ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              <Bookmark size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              type="button"
              onClick={() => addDownload(tool.id)}
              disabled={isAdded}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-50 disabled:text-blue-700"
            >
              {isAdded ? <Check size={17} /> : <Download size={17} />}
              {isAdded ? '라이브러리에 추가됨' : '라이브러리에 추가'}
            </button>
          </div>
        </header>

        <DetailSection title="스크린샷">
          <div className="relative rounded-2xl bg-gradient-to-br from-sky-50 via-white to-indigo-100 px-5 py-7 sm:px-12 sm:py-10">
            <PreviewScreen tool={tool} activeIndex={activePreview} />
            <button
              type="button"
              onClick={() =>
                setActivePreview(current => (current + previewTabs.length - 1) % previewTabs.length)
              }
              aria-label="이전 미리보기"
              className="absolute left-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white text-blue-600 shadow-md hover:bg-blue-50 sm:left-5"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setActivePreview(current => (current + 1) % previewTabs.length)}
              aria-label="다음 미리보기"
              className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white text-blue-600 shadow-md hover:bg-blue-50 sm:right-5"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2" aria-label="미리보기 페이지">
            {previewTabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActivePreview(index)}
                aria-label={`${tab} 미리보기`}
                aria-current={activePreview === index ? 'true' : undefined}
                className={`h-2 rounded-full transition-all ${activePreview === index ? 'w-5 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-slate-400">화면 구성 예시</p>
        </DetailSection>

        <DetailSection title="설명">
          <div className="max-w-3xl space-y-3 text-sm leading-7 text-slate-600">
            {content.description.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </DetailSection>

        <DetailSection title="주요 기능">
          <ul className="space-y-2 text-sm text-slate-600">
            {features.map(feature => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                {feature}
              </li>
            ))}
          </ul>
        </DetailSection>

        <DetailSection title="사용 방법">
          <p className="max-w-3xl text-sm leading-7 text-slate-600">{content.usage}</p>
        </DetailSection>

        <DetailSection title="지원 환경">
          <dl className="max-w-3xl divide-y divide-slate-100 text-sm">
            {supportedEnvironment.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-center gap-4 py-3 sm:grid-cols-[14rem_1fr]"
              >
                <dt className="flex items-center gap-3 text-slate-600">
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                    className="shrink-0 text-slate-500"
                    aria-hidden="true"
                  />
                  {label}
                </dt>
                <dd className="font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </DetailSection>

        <DetailSection title="도구 정보">
          <dl className="max-w-3xl divide-y divide-slate-100 text-sm">
            {specifications.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[8rem_1fr] gap-4 py-2.5">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </DetailSection>

        <DetailSection title="버전 정보">
          <div className="flex max-w-3xl items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 text-sm">
            <span className="font-semibold text-blue-600">v{tool.version}</span>
            <span className="text-slate-500">현재 제공 버전</span>
          </div>
        </DetailSection>

        <div className="border-t border-slate-200 px-5 py-5 sm:px-8">
          <Link
            to="/user/aistore/store"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
          >
            다른 도구 둘러보기 <ArrowRight size={15} />
          </Link>
        </div>
      </article>
    </div>
  );
}
