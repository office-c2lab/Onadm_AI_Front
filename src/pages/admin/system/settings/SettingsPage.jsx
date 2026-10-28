import { useState } from 'react';
import {
  Boxes,
  ChevronDown,
  ChevronRight,
  Globe2,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';

import { AdminDetailSection } from '../../../../layouts/admin/AdminDetailLayout.jsx';
import PageLayout from '../../control/components/PageLayout.jsx';
import '../../control/external/garim.css';

const ENGINES = [
  { name: 'Discover', version: 'v1.2.0', icon: Search },
  { name: 'Control 내부', version: 'v1.4.2', icon: ShieldCheck },
  { name: 'Control 외부', version: 'v1.3.8', icon: Globe2 },
  { name: 'Manage', version: 'v1.3.0', icon: Boxes },
];

const CHANGE_HISTORY = [
  {
    engine: 'Control 내부',
    title: 'AI Policy Engine 개선',
    description: '정책 처리 성능 개선 및 오류 수정',
    date: '2026.10.25',
    version: 'v1.4.2',
    changes: [
      '정책 우선순위 처리 속도와 요청 라우팅 성능을 개선했습니다.',
      '제공자 응답 오류에 대한 재시도 및 예외 처리를 보완했습니다.',
      '정책 저장 시 입력값 검증과 변경 로그 기록 범위를 확대했습니다.',
    ],
    issues: ['POL-142 · 정책 우선순위 충돌 수정', 'POL-138 · 일부 요청 라우팅 누락 개선'],
  },
  {
    engine: 'Manage',
    title: 'Manage 기능 업데이트',
    description: 'AI App 등록 및 관리 기능 개선',
    date: '2026.10.18',
    version: 'v1.3.0',
    changes: [
      'AI App 등록부터 심사까지의 관리 흐름을 개선했습니다.',
      '게시 상태와 심사 결과 표시 방식을 통일했습니다.',
      '관리자 변경 이력이 감사 로그에 기록되도록 보완했습니다.',
    ],
    issues: ['MNG-87 · 대용량 앱 등록 오류 수정', 'MNG-81 · 심사 상태 동기화 지연 개선'],
  },
  {
    engine: 'Discover',
    title: 'Discover 엔진 업데이트',
    description: 'AI 서비스 탐지 기능 개선',
    date: '2026.10.10',
    version: 'v1.2.0',
    changes: [
      '신규 AI 서비스 탐지 규칙과 제공자 패턴을 추가했습니다.',
      '중복 탐지 결과를 병합하는 기준을 개선했습니다.',
      '탐지 결과 검색 및 필터링 응답 속도를 최적화했습니다.',
    ],
    issues: ['DSC-64 · 중복 서비스 탐지 수정', 'DSC-59 · 일부 도메인 분류 오류 개선'],
  },
  {
    engine: 'Control 외부',
    title: '프롬프트 모니터링 개선',
    description: '외부 AI 탐지 정책 및 모니터링 수집 개선',
    date: '2026.10.23',
    version: 'v1.3.8',
    changes: [
      '외부 AI 프롬프트 탐지 규칙과 분류 기준을 보완했습니다.',
      '모니터링 데이터 수집 지연을 줄이고 재처리 흐름을 개선했습니다.',
      '탐지 결과 검색과 상세 조회 성능을 최적화했습니다.',
    ],
    issues: ['EXT-76 · 모니터링 수집 지연 개선', 'EXT-71 · 일부 탐지 결과 분류 오류 수정'],
  },
  {
    engine: 'Discover',
    title: '탐지 안정성 개선',
    description: '서비스 탐지 지연 및 중복 수집 개선',
    date: '2026.09.22',
    version: 'v1.1.8',
    changes: [
      '탐지 작업의 재시도 조건과 타임아웃 기준을 조정했습니다.',
      '동일 서비스의 중복 수집 결과를 자동 병합하도록 개선했습니다.',
    ],
    issues: ['DSC-52 · 탐지 작업 지연 수정', 'DSC-49 · 중복 서비스 수집 개선'],
  },
  {
    engine: 'Discover',
    title: '도메인 분류 규칙 업데이트',
    description: '신규 AI 서비스 도메인 및 분류 기준 추가',
    date: '2026.08.28',
    version: 'v1.1.5',
    changes: [
      '신규 AI 서비스 도메인 패턴을 탐지 목록에 추가했습니다.',
      '서비스 유형을 구분하는 분류 규칙의 정확도를 높였습니다.',
    ],
    issues: ['DSC-41 · 신규 도메인 미탐지 수정', 'DSC-38 · 서비스 유형 오분류 개선'],
  },
  {
    engine: 'Control 내부',
    title: '요청 라우팅 안정화',
    description: '내부 AI 요청 분배 및 실패 복구 개선',
    date: '2026.10.03',
    version: 'v1.4.1',
    changes: [
      '모델별 요청 분배 조건과 장애 시 대체 경로를 보완했습니다.',
      '일시적인 제공자 오류에 대한 재시도 흐름을 개선했습니다.',
    ],
    issues: ['POL-131 · 요청 라우팅 누락 수정', 'POL-126 · 재시도 중복 실행 개선'],
  },
  {
    engine: 'Control 내부',
    title: '크레딧 처리 개선',
    description: '사용량 집계와 크레딧 차감 기준 정비',
    date: '2026.09.12',
    version: 'v1.4.0',
    changes: [
      '모델별 사용량 집계와 크레딧 차감 시점을 통일했습니다.',
      '실패 요청의 크레딧 복구 처리를 자동화했습니다.',
    ],
    issues: ['POL-119 · 실패 요청 차감 오류 수정', 'POL-115 · 사용량 집계 지연 개선'],
  },
  {
    engine: 'Control 외부',
    title: '모니터링 수집 안정화',
    description: '외부 AI 이벤트 수집 지연 및 재처리 개선',
    date: '2026.09.29',
    version: 'v1.3.7',
    changes: [
      '수집 실패 이벤트의 자동 재처리 주기를 단축했습니다.',
      '대량 이벤트 유입 시 처리 순서를 안정화했습니다.',
    ],
    issues: ['EXT-63 · 이벤트 수집 지연 수정', 'EXT-60 · 재처리 누락 개선'],
  },
  {
    engine: 'Control 외부',
    title: '탐지 결과 분류 개선',
    description: '위험도 및 정책 위반 유형 분류 기준 개선',
    date: '2026.09.05',
    version: 'v1.3.5',
    changes: [
      '정책 위반 유형별 분류 조건을 세분화했습니다.',
      '낮은 신뢰도의 탐지 결과에 대한 검토 기준을 추가했습니다.',
    ],
    issues: ['EXT-54 · 위험도 오분류 수정', 'EXT-48 · 탐지 결과 중복 표시 개선'],
  },
  {
    engine: 'Manage',
    title: '심사 워크플로 개선',
    description: '앱 심사 단계와 보완 요청 흐름 개선',
    date: '2026.10.02',
    version: 'v1.2.9',
    changes: [
      '심사 단계별 상태와 처리 결과 표시를 정리했습니다.',
      '보완 요청 후 재심사 흐름을 단순화했습니다.',
    ],
    issues: ['MNG-76 · 재심사 상태 오류 수정', 'MNG-72 · 보완 요청 알림 누락 개선'],
  },
  {
    engine: 'Manage',
    title: '게시 상태 동기화 개선',
    description: '등록 앱의 게시 및 노출 상태 동기화 안정화',
    date: '2026.09.16',
    version: 'v1.2.7',
    changes: [
      '게시 설정 변경 시 스토어 노출 상태를 즉시 반영하도록 개선했습니다.',
      '비공개 전환 후 남아 있던 캐시 데이터를 자동 정리하도록 보완했습니다.',
    ],
    issues: ['MNG-65 · 게시 상태 동기화 오류 수정', 'MNG-61 · 비공개 앱 노출 문제 개선'],
  },
];

function SystemStatusPanel() {
  const [openEngine, setOpenEngine] = useState(null);

  return (
    <div className="grid gap-3">
      {ENGINES.map(engine => {
        const EngineIcon = engine.icon;
        const isOpen = openEngine === engine.name;
        const historyId = `engine-history-${engine.name.replaceAll(' ', '-')}`;
        const engineHistory = CHANGE_HISTORY.filter(item => item.engine === engine.name);

        return (
          <article
            key={engine.name}
            className={`group min-w-0 overflow-hidden rounded-xl border transition hover:z-20 hover:shadow-sm ${
              isOpen
                ? 'border-slate-200 bg-[#f5f5f5] shadow-sm'
                : 'border-transparent hover:border-slate-100 hover:bg-[#f5f5f5]'
            }`}
          >
            <button
              type="button"
              className="flex min-h-16 w-full min-w-0 flex-wrap items-center gap-x-4 gap-y-2 px-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
              aria-expanded={isOpen}
              aria-controls={historyId}
              onClick={() =>
                setOpenEngine(current => (current === engine.name ? null : engine.name))
              }
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <EngineIcon size={24} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <strong className="min-w-0 flex-1 truncate text-base font-semibold text-slate-900">
                {engine.name}
              </strong>
              <span className="shrink-0 text-sm text-slate-500">
                엔진 버전 ·{' '}
                <strong className="font-semibold text-blue-600">{engine.version}</strong>
              </span>
              <span className="min-w-12 text-right text-[clamp(0.86rem,1vw,0.94rem)] font-semibold whitespace-nowrap text-emerald-600">
                정상
              </span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {isOpen ? (
              <div id={historyId} className="border-t border-slate-200 bg-transparent">
                <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
                  <h4 className="text-base font-semibold text-slate-950">변경 이력</h4>
                  <span className="text-xs text-slate-400">{engineHistory.length}건</span>
                </div>
                <ChangeHistoryPanel items={engineHistory} />
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function PlatformInfoPanel() {
  const platformItems = [
    ['플랫폼 명', 'ONDAM AI'],
    ['플랫폼 버전', 'v1.4.2'],
    ['시스템 환경', 'Production'],
    ['배포 채널', 'Stable'],
    ['배포 유형', 'Cloud / On-premise'],
    ['운영 리전', 'Seoul · ap-northeast-2'],
    ['최근 업데이트', '2026.10.25 09:00'],
    ['마지막 상태 확인', '2026.10.28 14:30'],
  ];

  return (
    <div className="overflow-hidden">
      <table className="w-full table-fixed border-collapse text-left text-sm">
        <tbody className="divide-y divide-slate-100">
          {platformItems.map(([label, value]) => (
            <tr key={label}>
              <th scope="row" className="px-0 py-3 font-normal text-slate-800">
                {label}
              </th>
              <td className="px-0 py-3 text-slate-700">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChangeHistoryPanel({ items }) {
  const [openVersion, setOpenVersion] = useState(null);

  return (
    <section className="divide-y divide-slate-100 border-t border-slate-100">
      {items.map(item => {
        const isOpen = openVersion === item.version;
        const detailId = `change-history-${item.engine.replaceAll(' ', '-')}-${item.version.replaceAll('.', '-')}`;

        return (
          <article key={`${item.title}-${item.version}`}>
            <button
              type="button"
              className="flex min-h-[76px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 sm:px-6"
              aria-expanded={isOpen}
              aria-controls={detailId}
              onClick={() =>
                setOpenVersion(current => (current === item.version ? null : item.version))
              }
            >
              {isOpen ? (
                <ChevronDown size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
              ) : (
                <ChevronRight size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
              )}
             
              <span className="min-w-0 flex-1">
                <strong className="block text-sm font-semibold text-slate-900">{item.title}</strong>
                <span className="mt-1 block text-sm text-slate-500">{item.description}</span>
              </span>
              <span className="w-16 shrink-0 text-right text-sm font-semibold text-blue-600">
                {item.version}
              </span>
              <time className="w-24 shrink-0 text-right text-sm text-slate-500">{item.date}</time>
            </button>

            {isOpen ? (
              <div
                id={detailId}
                className="border-t border-slate-100 bg-slate-50/80 px-4 py-4 sm:px-14"
              >
                <div className="grid gap-7">
                  <section>
                    <h4 className="text-sm font-semibold text-slate-900">상세 변경 내역</h4>
                    <ul className="mt-3 space-y-2.5 text-sm leading-6 text-slate-600">
                      {item.changes.map(change => (
                        <li key={change} className="flex gap-2.5">
                          <span className="mt-2.5 size-1 shrink-0 rounded-full bg-blue-500" />
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h4 className="text-sm font-semibold text-slate-900">관련 이슈</h4>
                    <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200 text-sm text-slate-600">
                      {item.issues.map(issue => (
                        <li key={issue} className="py-3">
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}

export default function SettingsPage() {
  return (
    <div className="garim-external-root min-h-full bg-white text-[#111827]">
      <PageLayout gapClassName="gap-0" topPaddingClassName="pt-6">
        <div className="mx-auto w-full max-w-4xl pb-10 text-slate-900">
          <header className="pb-8 sm:pb-10">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl">
              엔진 및 모듈 상태
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">
              관리자 플랫폼을 구성하는 엔진의 운영 상태와 버전, 배포 정보를 확인합니다.
            </p>
          </header>

          <AdminDetailSection
            title="시스템 상태"
            description="Discover, Control 내부·외부, Manage 엔진의 현재 상태와 버전을 확인합니다."
          >
            <SystemStatusPanel />
          </AdminDetailSection>

          <AdminDetailSection
            title="플랫폼 정보"
            description="현재 운영 환경과 플랫폼의 기본 정보를 확인합니다."
          >
            <PlatformInfoPanel />
          </AdminDetailSection>
        </div>
      </PageLayout>
    </div>
  );
}
