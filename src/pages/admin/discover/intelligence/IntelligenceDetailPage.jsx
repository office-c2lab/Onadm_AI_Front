import { ArrowLeft, Globe2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import AiStoreActionButton from '../../../user/aistore/components/AiStoreActionButton.jsx';
import AiStoreConfirmModal from '../../../user/aistore/components/AiStoreConfirmModal.jsx';
import { services } from './IntelligencePage.jsx';
import {
  deleteIntelligenceService,
  loadIntelligenceServices,
  saveIntelligenceService,
} from './intelligenceStore.js';

function formatRecordTime(date) {
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}. ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function IntelligenceDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const service =
    location.state?.service ??
    loadIntelligenceServices(services).find(item => String(item.id) === String(serviceId));
  const [status, setStatus] = useState(service?.status ?? '결정 대기');
  const [pendingAction, setPendingAction] = useState(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [policyHistory, setPolicyHistory] = useState(service?.policyHistory ?? []);
  const [recordUpdatedAt, setRecordUpdatedAt] = useState(
    service?.updatedAt ?? service?.lastAnalyzed ?? '—'
  );

  if (!service) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">서비스 정보를 찾을 수 없습니다.</h1>
        <Link
          to="/admin/discover/intelligence"
          className="mt-6 inline-flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const registeredAt = service.registeredAt ?? service.lastAnalyzed;
  const sourceAnalysisId =
    service.sourceAnalysisId ?? service.analysisId ?? `analysis-${service.id}`;
  const decisionHistoryItems = policyHistory.length
    ? [...policyHistory]
        .reverse()
        .map(entry => [`서비스 ${entry.to}`, entry.changedAt, `${entry.actor} · ${entry.reason}`])
    : [
        [
          status === '결정 대기' ? '운영 정책 결정 대기' : `서비스 ${status}`,
          status === '결정 대기' ? '현재' : recordUpdatedAt,
          status === '결정 대기'
            ? '관리자의 허용 또는 차단 결정 필요'
            : '기존 운영 정책에 따라 적용 중',
        ],
      ];
  const historyItems = [
    ['URL 분석 완료', service.lastAnalyzed, `${service.type} 서비스로 식별됨`],
    ['Intelligence DB 등록', registeredAt, '운영 정책 결정을 위한 서비스 정보 등록'],
    ...decisionHistoryItems,
  ];

  return (
    <>
      <Link
        to="/admin/discover/intelligence"
        className="inline-flex h-9 items-center gap-2 rounded-lg pr-3 text-sm font-medium text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} /> Intelligence DB로 돌아가기
      </Link>
      <header className="py-8 sm:py-10">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Globe2 size={26} />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-slate-950 sm:text-3xl">
                {service.domain}
              </h1>
              <p className="mt-2 truncate text-sm text-slate-500">{service.url}</p>
              <p className="mt-1 text-xs font-medium text-slate-400">
                Intelligence URL 레코드 · {service.id}
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${status === '허용' ? 'bg-emerald-50 text-emerald-600' : status === '차단' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}
          >
            {status}
          </span>
        </div>
      </header>

      <div className="grid border-b border-slate-200 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['서비스 유형', service.type],
          ['위험도', service.risk],
          ['식별 신뢰도', service.confidence ? `${service.confidence}%` : '—'],
          ['최근 분석', service.lastAnalyzed],
        ].map(([label, value]) => (
          <div
            key={label}
            className="border-b border-slate-100 px-1 py-5 last:border-0 sm:px-5 lg:border-r lg:border-b-0 lg:first:pl-1"
          >
            <p className="text-xs font-medium text-slate-400">{label}</p>
            <p className="mt-1.5 text-base font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <section id="service-info" className="scroll-mt-20 py-9 sm:py-10">
        <h2 className="text-lg font-bold text-slate-900">DB 등록 정보</h2>
        <p className="mt-2 text-sm text-slate-500">
          AI Service Analysis에서 등록된 URL 레코드의 식별 정보와 현재 운영 상태입니다.
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-600">{service.summary}</p>
        <dl className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
          {[
            ['Intelligence ID', service.id],
            ['DB 등록일', registeredAt],
            ['최종 수정일', recordUpdatedAt],
            ['원본 분석 ID', sourceAnalysisId],
          ].map(([label, value]) => (
            <div
              key={label}
              className="grid gap-1 px-1 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6"
            >
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="text-[15px] font-semibold text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="network" className="scroll-mt-20 border-t border-slate-200 py-9 sm:py-10">
        <h2 className="text-lg font-bold text-slate-900">URL 및 네트워크 정보</h2>
        <p className="mt-2 text-sm text-slate-500">
          마지막 분석 시점에 확인된 URL과 접속 정보입니다.
        </p>
        <dl className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
          {[
            ['요청 URL', service.url],
            ['프로토콜', 'HTTPS'],
            ['확인된 접속 IP', `${service.ips.length}개`],
            ['DNS 상태', service.ips.length ? '정상 확인' : '확인 필요'],
            ['마지막 조회', service.lastAnalyzed],
          ].map(([label, value]) => (
            <div
              key={label}
              className="grid gap-1 px-1 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6"
            >
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="break-all text-[15px] font-semibold text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          {service.ips.length ? (
            service.ips.map(ip => (
              <code key={ip} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                {ip}
              </code>
            ))
          ) : (
            <span className="text-sm text-slate-500">확인된 IP가 없습니다.</span>
          )}
        </div>
      </section>

      <section id="policy" className="scroll-mt-20 border-t border-slate-200 py-9 sm:py-10">
        <h2 className="text-lg font-bold text-slate-900">운영 정책 정보</h2>
        <p className="mt-2 text-sm text-slate-500">이 URL에 현재 적용 중인 접근 정책입니다.</p>
        <dl className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
          {[
            ['현재 결정', status],
            [
              '적용 범위',
              status === '허용'
                ? '전사 사용자'
                : status === '차단'
                  ? '전사 접근 차단'
                  : '결정 전 접근 제한',
            ],
            ['결정 주체', status === '결정 대기' ? '미지정' : 'AI 서비스 관리자'],
          ].map(([label, value]) => (
            <div
              key={label}
              className="grid gap-1 px-1 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6"
            >
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="text-[15px] font-semibold text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="history" className="scroll-mt-20 border-t border-slate-200 py-9 sm:py-10">
        <h2 className="text-lg font-bold text-slate-900">등록 및 운영 이력</h2>
        <p className="mt-2 text-sm text-slate-500">최초 분석, DB 등록, 운영 결정의 기록입니다.</p>
        <ol className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
          {historyItems.map(([title, date, description]) => (
            <li key={`${title}-${date}`} className="px-1 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                <time className="text-xs text-slate-400">{date}</time>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="sticky bottom-0 z-20 flex min-h-[72px] items-center justify-between gap-3 border-t border-slate-200 bg-white/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={() => {
            setDecisionReason('');
            setPendingAction('삭제');
          }}
          className="inline-flex h-10 items-center rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          DB에서 삭제
        </button>
        <div className="flex items-center gap-2">
          {status === '결정 대기' && (
            <AiStoreActionButton
              variant="success"
              onClick={() => {
                setDecisionReason('');
                setPendingAction('허용');
              }}
            >
              서비스 허용
            </AiStoreActionButton>
          )}
          <AiStoreActionButton
            variant={status === '차단' ? 'secondary' : 'danger'}
            onClick={() => {
              setDecisionReason('');
              setPendingAction(status === '차단' ? '허용' : '차단');
            }}
          >
            {status === '차단' ? '차단 해제' : '서비스 차단'}
          </AiStoreActionButton>
        </div>
      </div>

      <AiStoreConfirmModal
        open={Boolean(pendingAction)}
        title={
          pendingAction === '삭제'
            ? 'Intelligence DB에서 삭제할까요?'
            : `서비스를 ${pendingAction === '차단' ? '차단' : '허용'}할까요?`
        }
        confirmLabel={
          pendingAction === '삭제'
            ? 'DB에서 삭제'
            : pendingAction === '차단'
              ? '서비스 차단'
              : '서비스 허용'
        }
        confirmVariant={pendingAction === '삭제' || pendingAction === '차단' ? 'danger' : 'success'}
        onClose={() => {
          setPendingAction(null);
          setDecisionReason('');
        }}
        onConfirm={() => {
          if (pendingAction === '삭제') {
            deleteIntelligenceService(service.id);
            navigate('/admin/discover/intelligence', { replace: true });
            return;
          }
          const changedAt = formatRecordTime(new Date());
          const historyEntry = {
            from: status,
            to: pendingAction,
            changedAt,
            actor: 'AI 서비스 관리자',
            reason: decisionReason.trim() || '운영 정책 검토 후 관리자 결정',
          };
          const nextPolicyHistory = [historyEntry, ...policyHistory];
          setStatus(pendingAction);
          setPolicyHistory(nextPolicyHistory);
          setRecordUpdatedAt(changedAt);
          saveIntelligenceService({
            ...service,
            status: pendingAction,
            updatedAt: changedAt,
            policyHistory: nextPolicyHistory,
          });
          setPendingAction(null);
          setDecisionReason('');
        }}
      >
        {pendingAction === '삭제' ? (
          <>
            <strong className="font-semibold text-slate-900">{service.domain}</strong>과 관련된 운영
            정보와 운영 결정 이력이 Intelligence DB에서 제거됩니다.
          </>
        ) : (
          <div>
            <strong className="font-semibold text-slate-900">{service.domain}</strong>의 운영 상태를
            변경합니다.
            <label
              htmlFor="decision-reason"
              className="mt-4 block text-sm font-semibold text-slate-900"
            >
              변경 사유
            </label>
            <textarea
              id="decision-reason"
              value={decisionReason}
              onChange={event => setDecisionReason(event.target.value)}
              rows={3}
              placeholder="운영 정책 변경 사유를 입력하세요."
              className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-xs text-slate-400">
              입력하지 않으면 기본 사유로 이력에 기록됩니다.
            </p>
          </div>
        )}
      </AiStoreConfirmModal>
    </>
  );
}
